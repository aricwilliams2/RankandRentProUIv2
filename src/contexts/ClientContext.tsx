import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react";
import { Client, ClientContextType, SortField, SortDirection } from "../types";

const ClientContext = createContext<ClientContextType | undefined>(undefined);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchClientsAPI = async (): Promise<Client[]> => {
  const response = await fetch(`${API_BASE_URL}/clients`);
  const json = await response.json();
  return json.data.map((client: any) => ({
    ...client,
    contacted: client.contacted === 1 || client.contacted === true || client.contacted === "1",
    createdAt: new Date(client.created_at),
    updatedAt: new Date(client.updated_at),
    websites: client.websites || [],
    communicationHistory: client.communicationHistory || [],
  }));
};

const updateClientAPI = async (client: Client, fieldsToUpdate?: string[]): Promise<Client> => {
  const data: any = {
    name: client.name,
    email: client.email,
    phone: client.phone,
    city: client.city || null,
    reviews: client.reviews || 0,
    website: client.website || null,
    contacted: client.contacted || false,
    follow_up_at: client.follow_up_at || null,
    notes: client.notes || null,
  };

  if (fieldsToUpdate && fieldsToUpdate.length > 0) {
    const filteredData: any = {};
    fieldsToUpdate.forEach((field) => {
      if (data.hasOwnProperty(field)) {
        filteredData[field] = data[field];
      }
    });
    Object.assign(data, filteredData);
  }

  const response = await fetch(`${API_BASE_URL}/clients/${client.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const updated = await response.json();
  return {
    ...updated,
    createdAt: new Date(updated.created_at),
    updatedAt: new Date(updated.updated_at),
    websites: updated.websites || [],
    communicationHistory: updated.communicationHistory || [],
  };
};

const createClientAPI = async (clientData: Partial<Client>): Promise<Client> => {
  const data = {
    name: clientData.name,
    email: clientData.email,
    phone: clientData.phone,
    city: clientData.city || null,
    reviews: clientData.reviews || 0,
    website: clientData.website || null,
    contacted: clientData.contacted || false,
    follow_up_at: clientData.follow_up_at || null,
    notes: clientData.notes || null,
  };

  const response = await fetch(`${API_BASE_URL}/clients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const client = await response.json();
  return {
    ...client,
    createdAt: new Date(client.created_at),
    updatedAt: new Date(client.updated_at),
    websites: client.websites || [],
    communicationHistory: client.communicationHistory || [],
  };
};

const deleteClientAPI = async (id: string) => {
  await fetch(`${API_BASE_URL}/clients/${id}`, { method: "DELETE" });
};

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [sortField, setSortField] = useState<SortField | null>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshClients = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchClientsAPI();
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients");
      throw err;
    }
  }, []);

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchClientsAPI();
        setClients(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load clients");
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, []);

  const createClient = async (data: Partial<Client>) => {
    try {
      setError(null);
      const newClient = await createClientAPI(data);
      setClients((prev) => [...prev, newClient]);
      return newClient;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client");
      throw err;
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      setError(null);
      const client = clients.find((c) => c.id === id);
      if (!client) throw new Error("Client not found");

      const updated = await updateClientAPI({ ...client, ...updates });
      setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update client");
      throw err;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      setError(null);
      await deleteClientAPI(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete client");
      throw err;
    }
  };

  const toggleContactStatus = async (id: string) => {
    try {
      setError(null);
      const client = clients.find((c) => c.id === id);
      if (!client) return;

      const updated = { ...client, contacted: !client.contacted };
      await updateClientAPI(updated, ["contacted"]);
      setClients((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update contact status");
      throw err;
    }
  };

  const sortedClients = useMemo(() => {
    const sorted = [...clients];
    if (sortField) {
      sorted.sort((a, b) => {
        let valA: any = a[sortField as keyof Client];
        let valB: any = b[sortField as keyof Client];

        if (valA === null || valA === undefined) valA = "";
        if (valB === null || valB === undefined) valB = "";

        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();

        return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }
    return sorted;
  }, [clients, sortField, sortDirection]);

  const value = useMemo(
    () => ({
      clients: sortedClients,
      createClient,
      updateClient,
      deleteClient,
      toggleContactStatus,
      refreshClients,
      loading,
      error,
      sortField,
      sortDirection,
      setSortField,
      setSortDirection,
    }),
    [sortedClients, createClient, updateClient, deleteClient, toggleContactStatus, refreshClients, loading, error, sortField, sortDirection]
  );

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
};

export const useClientContext = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error("useClientContext must be used within a ClientProvider");
  }
  return context;
};
