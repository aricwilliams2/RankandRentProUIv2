import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    CallForwarding,
    CallForwardingFormData,
    CallForwardingContextType,
    CallForwardingApiResponse
} from '../types';
import { twilioApi } from '../services/twilioApi';
import { useAuth } from './AuthContext';

const CallForwardingContext = createContext<CallForwardingContextType | undefined>(undefined);

export const CallForwardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [callForwardings, setCallForwardings] = useState<CallForwarding[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load call forwardings on mount and auth change
    useEffect(() => {
        if (isAuthenticated && user) {
            getCallForwardings();
        } else {
            setCallForwardings([]);
        }
    }, [isAuthenticated, user]);

    const getCallForwardings = async () => {
        if (!isAuthenticated) return;

        setLoading(true);
        setError(null);
        try {
            console.log('Fetching call forwardings...');
            const response: CallForwardingApiResponse = await twilioApi.getCallForwardings();
            console.log('Call forwardings response:', response);

            if (response.success && (response.callForwardings || response.data)) {
                // Handle both response formats: callForwardings (expected) and data (actual backend response)
                const rawForwardings = response.callForwardings || response.data || [];

                // Transform backend data to frontend format
                const forwardings = rawForwardings.map((cf: any) => ({
                    ...cf,
                    id: String(cf.id), // Convert number to string
                    user_id: String(cf.user_id), // Convert number to string
                    phone_number_id: String(cf.phone_number_id), // Convert number to string
                    is_active: Boolean(cf.is_active), // Convert 1/0 to boolean
                }));

                console.log('Setting call forwardings:', forwardings);
                setCallForwardings(forwardings);
            } else {
                console.log('No call forwardings found or response not successful');
                setCallForwardings([]);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch call forwarding settings';
            setError(errorMessage);
            console.error('Error fetching call forwarding settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const createCallForwarding = async (data: CallForwardingFormData): Promise<CallForwarding> => {
        if (!isAuthenticated) throw new Error('User must be authenticated');

        setLoading(true);
        setError(null);
        try {
            // Convert phone_number_id from string to number for backend compatibility
            const apiData = {
                ...data,
                phone_number_id: parseInt(data.phone_number_id, 10)
            };

            console.log('Creating call forwarding with data:', apiData);
            const response: CallForwardingApiResponse = await twilioApi.createCallForwarding(apiData);
            console.log('Create call forwarding response:', response);

            if (response.success && response.callForwarding) {
                setCallForwardings(prev => [...prev, response.callForwarding!]);
                return response.callForwarding;
            } else {
                // Handle the specific error case where call forwarding already exists
                const errorMsg = response.message || response.error || 'Failed to create call forwarding setting';
                if (errorMsg.includes('already exists')) {
                    // Refresh the call forwardings list to show the existing one
                    console.log('Call forwarding already exists, refreshing list...');
                    await getCallForwardings();
                    throw new Error(errorMsg);
                }
                throw new Error(errorMsg);
            }
        } catch (err) {
            console.error('Create call forwarding error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to create call forwarding setting';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateCallForwarding = async (id: string, updates: Partial<CallForwarding>): Promise<CallForwarding> => {
        if (!isAuthenticated) throw new Error('User must be authenticated');

        setLoading(true);
        setError(null);
        try {
            // Convert phone_number_id from string to number if it exists in updates
            const apiUpdates: any = { ...updates };
            if (apiUpdates.phone_number_id && typeof apiUpdates.phone_number_id === 'string') {
                apiUpdates.phone_number_id = parseInt(apiUpdates.phone_number_id, 10);
            }

            const response: CallForwardingApiResponse = await twilioApi.updateCallForwarding(id, apiUpdates);

            if (response.success && response.callForwarding) {
                setCallForwardings(prev =>
                    prev.map(cf => cf.id === id ? response.callForwarding! : cf)
                );
                return response.callForwarding;
            } else {
                throw new Error(response.message || 'Failed to update call forwarding setting');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update call forwarding setting';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const toggleCallForwarding = async (id: string, isActive: boolean) => {
        if (!isAuthenticated) throw new Error('User must be authenticated');

        setLoading(true);
        setError(null);
        try {
            const response: CallForwardingApiResponse = await twilioApi.toggleCallForwarding(id, isActive);

            if (response.success && response.callForwarding) {
                setCallForwardings(prev =>
                    prev.map(cf => cf.id === id ? response.callForwarding! : cf)
                );
            } else {
                throw new Error(response.message || 'Failed to toggle call forwarding setting');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to toggle call forwarding setting';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteCallForwarding = async (id: string) => {
        if (!isAuthenticated) throw new Error('User must be authenticated');

        setLoading(true);
        setError(null);
        try {
            const response: CallForwardingApiResponse = await twilioApi.deleteCallForwarding(id);

            if (response.success) {
                setCallForwardings(prev => prev.filter(cf => cf.id !== id));
            } else {
                throw new Error(response.message || 'Failed to delete call forwarding setting');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete call forwarding setting';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getCallForwardingByPhoneNumber = (phoneNumberId: string): CallForwarding | undefined => {
        return callForwardings.find(cf => cf.phone_number_id === phoneNumberId);
    };

    const contextValue: CallForwardingContextType = {
        callForwardings,
        loading,
        error,
        getCallForwardings,
        createCallForwarding,
        updateCallForwarding,
        toggleCallForwarding,
        deleteCallForwarding,
        getCallForwardingByPhoneNumber,
    };

    return (
        <CallForwardingContext.Provider value={contextValue}>
            {children}
        </CallForwardingContext.Provider>
    );
};

export const useCallForwarding = () => {
    const context = useContext(CallForwardingContext);
    if (context === undefined) {
        throw new Error('useCallForwarding must be used within a CallForwardingProvider');
    }
    return context;
};
