import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiClient } from "../services/twilioApi";

type Pricing = {
    callPerMinuteUsd?: number;
    freeMinutesPerMonth?: number;
    numberMonthlyUsd?: number;
    minBalanceUsd?: number;
};

type BillingState = {
    balance: number;
    freeMinutesRemaining: number;
    hasClaimedFreeNumber: boolean;
    pricing: Pricing;
};

type BillingContextType = {
    billing: BillingState | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    startTopUpAmount: (amount: number) => Promise<string | undefined>;
    startTopUpProduct: (priceId: string) => Promise<string | undefined>;
    canMakeCalls: boolean;
    canBuyNumbers: boolean;
};

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export const BillingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [billing, setBilling] = useState<BillingState | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await apiClient.get("/api/billing/me");
            setBilling({
                balance: Number(data.balance ?? 0),
                freeMinutesRemaining: Number(data.freeMinutesRemaining ?? 0),
                hasClaimedFreeNumber: Boolean(data.hasClaimedFreeNumber),
                pricing: data.pricing || {},
            });
        } catch (err: any) {
            setError(err?.message || "Failed to load billing state");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    const startTopUpAmount = async (amount: number) => {
        const { data } = await apiClient.post("/stripe/top-up", { amount });
        return data?.url as string | undefined;
    };

    const startTopUpProduct = async (priceId: string) => {
        const { data } = await apiClient.post("/stripe/top-up-product", { priceId });
        return data?.url as string | undefined;
    };

    const canMakeCalls = Boolean(
        billing && (billing.freeMinutesRemaining > 0 || billing.balance >= 5)
    );
    const canBuyNumbers = Boolean(
        billing && (billing.hasClaimedFreeNumber === false || billing.balance >= 5)
    );

    return (
        <BillingContext.Provider
            value={{
                billing,
                loading,
                error,
                refresh,
                startTopUpAmount,
                startTopUpProduct,
                canMakeCalls,
                canBuyNumbers,
            }}
        >
            {children}
        </BillingContext.Provider>
    );
};

export const useBilling = () => {
    const ctx = useContext(BillingContext);
    if (!ctx) throw new Error("useBilling must be used within a BillingProvider");
    return ctx;
};


