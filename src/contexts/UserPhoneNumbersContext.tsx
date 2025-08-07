import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PhoneNumber, TwilioCall, TwilioRecording, UserPhoneNumbersContextType, PhoneNumbersApiResponse, BuyNumberResponse, CallHistoryApiResponse, RecordingsApiResponse } from '../types';
import { twilioApi } from '../services/twilioApi';
import { useAuth } from './AuthContext';

const UserPhoneNumbersContext = createContext<UserPhoneNumbersContextType | undefined>(undefined);

export const UserPhoneNumbersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
    const [calls, setCalls] = useState<TwilioCall[]>([]);
    const [recordings, setRecordings] = useState<TwilioRecording[]>([]);
    const [phoneNumberStats, setPhoneNumberStats] = useState<{
        total_numbers: number;
        active_numbers: number;
        total_purchase_cost: string;
        total_monthly_cost: string;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Helper function to transform backend phone number data to frontend format
    const transformPhoneNumber = (backendNumber: any): PhoneNumber => ({
        id: String(backendNumber.id),
        number: backendNumber.phone_number,
        phone_number: backendNumber.phone_number,
        userId: String(backendNumber.user_id),
        user_id: backendNumber.user_id,
        twilioSid: backendNumber.twilio_sid,
        twilio_sid: backendNumber.twilio_sid,
        friendly_name: backendNumber.friendly_name,
        provider: 'twilio',
        monthlyFee: parseFloat(backendNumber.monthly_cost || '1.00'),
        monthly_cost: backendNumber.monthly_cost,
        callCount: 0, // This would come from call logs
        status: backendNumber.is_active === 1 ? 'active' : 'inactive',
        is_active: backendNumber.is_active,
        country: backendNumber.country,
        region: backendNumber.region,
        locality: backendNumber.locality,
        purchase_price: backendNumber.purchase_price,
        purchase_price_unit: backendNumber.purchase_price_unit,
        capabilities: {
            voice: backendNumber.capabilities?.voice !== false, // Default to true
            sms: backendNumber.capabilities?.sms !== false, // Default to true
            ...backendNumber.capabilities
        },
        createdAt: new Date(backendNumber.created_at),
        updatedAt: new Date(backendNumber.updated_at),
        created_at: backendNumber.created_at,
        updated_at: backendNumber.updated_at,
    });

    // Helper function to transform backend call data to frontend format
    const transformCall = (backendCall: any): TwilioCall | null => {
        // Return null if the call data is invalid
        if (!backendCall || !backendCall.id) {
            console.warn('Invalid call data received:', backendCall);
            return null;
        }

        try {
            return {
                id: String(backendCall.id),
                callSid: backendCall.call_sid,
                call_sid: backendCall.call_sid,
                userId: String(backendCall.user_id || ''),
                user_id: backendCall.user_id,
                phoneNumberId: String(backendCall.phone_number_id || ''),
                phone_number_id: backendCall.phone_number_id,
                to: backendCall.to_number,
                from: backendCall.from_number,
                to_number: backendCall.to_number,
                from_number: backendCall.from_number,
                direction: backendCall.direction || 'outbound',
                status: backendCall.status || 'unknown',
                duration: backendCall.duration || 0,
                price: backendCall.price,
                price_unit: backendCall.price_unit,
                priceUnit: backendCall.price_unit,
                recordingUrl: backendCall.recording_url,
                recording_url: backendCall.recording_url,
                recordingSid: backendCall.recording_sid,
                recording_sid: backendCall.recording_sid,
                recording_duration: backendCall.recording_duration,
                recording_status: backendCall.recording_status,
                transcription: backendCall.transcription,
                startTime: backendCall.start_time ? new Date(backendCall.start_time) : new Date(backendCall.created_at || Date.now()),
                start_time: backendCall.start_time,
                endTime: backendCall.end_time ? new Date(backendCall.end_time) : undefined,
                end_time: backendCall.end_time,
                createdAt: new Date(backendCall.created_at || Date.now()),
                created_at: backendCall.created_at,
                updatedAt: new Date(backendCall.updated_at || backendCall.created_at || Date.now()),
                updated_at: backendCall.updated_at,
            };
        } catch (error) {
            console.error('Error transforming call data:', error, backendCall);
            return null;
        }
    };

    // Helper function to transform backend recording data to frontend format
    const transformRecording = (backendRecording: any): TwilioRecording | null => {
        // Return null if the recording data is invalid
        if (!backendRecording || !backendRecording.id) {
            console.warn('Invalid recording data received:', backendRecording);
            return null;
        }

        try {
            return {
                id: String(backendRecording.id),
                recordingSid: backendRecording.recordingSid || backendRecording.recording_sid || '',
                userId: String(backendRecording.userId || backendRecording.user_id || ''),
                callSid: backendRecording.callSid || backendRecording.call_sid || '',
                phoneNumberId: String(backendRecording.phoneNumberId || backendRecording.phone_number_id || ''),
                duration: parseInt(backendRecording.duration) || 0,
                channels: backendRecording.channels || 1,
                status: backendRecording.status || 'completed',
                // Use the new proxy mediaUrl if available, fallback to original
                mediaUrl: backendRecording.mediaUrl || backendRecording.media_url || backendRecording.recording_url || '',
                price: backendRecording.price,
                priceUnit: backendRecording.priceUnit || backendRecording.price_unit || 'USD',
                createdAt: new Date(backendRecording.createdAt || backendRecording.created_at || Date.now()),
                updatedAt: new Date(backendRecording.updatedAt || backendRecording.updated_at || backendRecording.created_at || Date.now()),
                // New fields from enhanced API response
                fromNumber: backendRecording.fromNumber,
                toNumber: backendRecording.toNumber,
                callDuration: backendRecording.callDuration,
                callStatus: backendRecording.callStatus,
            };
        } catch (error) {
            console.error('Error transforming recording data:', error, backendRecording);
            return null;
        }
    };

    // Load user's phone numbers on mount and auth change
    useEffect(() => {
        if (isAuthenticated && user) {
            getMyNumbers();
        } else {
            // Clear data when user logs out
            setPhoneNumbers([]);
            setCalls([]);
            setRecordings([]);
        }
    }, [isAuthenticated, user]);

    // === PHONE NUMBER MANAGEMENT ===

    const getMyNumbers = async () => {
        if (!isAuthenticated) return;

        setLoading(true);
        setError(null);
        try {
            const response: PhoneNumbersApiResponse = await twilioApi.getMyNumbers();

            if (response.success && response.phoneNumbers) {
                const transformedNumbers = response.phoneNumbers.map(transformPhoneNumber);
                setPhoneNumbers(transformedNumbers);
                setPhoneNumberStats(response.stats);
            } else {
                setPhoneNumbers([]);
                setPhoneNumberStats(null);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch phone numbers';
            setError(errorMessage);
            console.error('Error fetching phone numbers:', err);
        } finally {
            setLoading(false);
        }
    };

    const searchAvailableNumbers = async (params: {
        areaCode?: string;
        country?: string;
        limit?: number
    }) => {
        if (!isAuthenticated) throw new Error('User must be authenticated');

        setLoading(true);
        setError(null);
        try {
            const response = await twilioApi.getAvailableNumbers(params);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to search available numbers';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const buyPhoneNumber = async (data: {
        phoneNumber: string;
        country?: string;
        areaCode?: string;
        websiteId?: string
    }): Promise<BuyNumberResponse> => {
        if (!isAuthenticated || !user) throw new Error('User must be authenticated');

        setLoading(true);
        setError(null);
        try {
            const response: BuyNumberResponse = await twilioApi.buyNumber(data);

            if (response.success && response.phoneNumber) {
                const transformedNumber = transformPhoneNumber(response.phoneNumber);

                // Add to local state
                setPhoneNumbers(prev => [...prev, transformedNumber]);

                // Return the full response with isDifferentNumber info
                return {
                    ...response,
                    phoneNumber: transformedNumber
                };
            } else {
                throw new Error(response.message || 'Failed to purchase phone number');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to purchase phone number';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updatePhoneNumber = async (id: string, updates: Partial<PhoneNumber>): Promise<PhoneNumber> => {
        if (!isAuthenticated) throw new Error('User must be authenticated');

        setLoading(true);
        setError(null);
        try {
            const response = await twilioApi.updatePhoneNumber(id, updates);
            const updatedNumber = response.phoneNumber;

            // Update local state
            setPhoneNumbers(prev =>
                prev.map(num => num.id === id ? updatedNumber : num)
            );

            return updatedNumber;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update phone number';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const releasePhoneNumber = async (id: string) => {
        if (!isAuthenticated) throw new Error('User must be authenticated');

        setLoading(true);
        setError(null);
        try {
            await twilioApi.releasePhoneNumber(id);

            // Remove from local state
            setPhoneNumbers(prev => prev.filter(num => num.id !== id));

            // Also remove associated calls and recordings
            setCalls(prev => prev.filter(call => call.phoneNumberId !== id));
            setRecordings(prev => prev.filter(rec => rec.phoneNumberId !== id));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to release phone number';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // === CALLING FUNCTIONALITY ===

    const makeCall = async (data: {
        to: string;
        from: string;
        record?: boolean;
        websiteId?: string
    }): Promise<TwilioCall> => {
        if (!isAuthenticated || !user) throw new Error('User must be authenticated');

        console.log('makeCall called with data:', data);
        console.log('Available phone numbers:', phoneNumbers);

        // Verify user owns the "from" number - check both number and phone_number fields
        const ownedNumber = phoneNumbers.find(num => 
            num.number === data.from || 
            num.phone_number === data.from
        );
        
        console.log('Found owned number:', ownedNumber);
        
        if (!ownedNumber) {
            throw new Error('You can only make calls from phone numbers you own');
        }

        if (ownedNumber.status !== 'active') {
            throw new Error('Cannot make calls from inactive phone numbers');
        }

        setLoading(true);
        setError(null);
        try {
            console.log('Making API call to twilioApi.makeCall');
            const response = await twilioApi.makeCall(data);
            console.log('API response:', response);
            
            // Handle the actual API response structure where callSid is at root level
            const newCall: TwilioCall = {
                id: response.callSid || 'temp-' + Date.now(), // Use callSid as id, fallback to timestamp
                callSid: response.callSid,
                call_sid: response.callSid, // Backend compatibility
                from: response.from,
                to: response.to,
                direction: 'outbound-api',
                status: response.status || 'queued',
                duration: 0,
                startTime: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            console.log('New call object:', newCall);

            // Add to local state
            setCalls(prev => [newCall, ...prev]);

            return newCall;
        } catch (err) {
            console.error('Error in makeCall:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to make call';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getCallHistory = async (params?: {
        phoneNumberId?: string;
        limit?: number;
        page?: number;
        status?: string;
    }) => {
        if (!isAuthenticated) return;

        setLoading(true);
        setError(null);
        try {
            const response: CallHistoryApiResponse = await twilioApi.getCallLogs(params || {});

            if (response.success && response.callLogs) {
                // Filter out null/undefined entries and transform valid calls
                const validCallLogs = (response.callLogs || []).filter(Boolean);
                const transformedCalls = validCallLogs.map(transformCall).filter((call): call is TwilioCall => call !== null);
                setCalls(transformedCalls);
            } else {
                setCalls([]);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch call history';
            setError(errorMessage);
            console.error('Error fetching call history:', err);
        } finally {
            setLoading(false);
        }
    };

    const getCallDetails = async (callSid: string): Promise<TwilioCall> => {
        if (!isAuthenticated) throw new Error('User must be authenticated');

        setLoading(true);
        setError(null);
        try {
            const response = await twilioApi.getCallLog(callSid);
            const callDetails = response.call;

            // Update local state if call exists
            setCalls(prev =>
                prev.map(call => call.callSid === callSid ? callDetails : call)
            );

            return callDetails;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch call details';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // === RECORDING MANAGEMENT ===

    const getRecordings = async (params?: {
        callSid?: string;
        phoneNumberId?: string;
        limit?: number;
        page?: number
    }) => {
        if (!isAuthenticated) return;

        setLoading(true);
        setError(null);
        try {
            const response: RecordingsApiResponse = await twilioApi.getRecordings(params || {});

            if (response.success && response.recordings) {
                // Filter out null/undefined entries and transform valid recordings
                const validRecordings = (response.recordings || []).filter(Boolean);
                const transformedRecordings = validRecordings.map(transformRecording).filter((recording): recording is TwilioRecording => recording !== null);
                setRecordings(transformedRecordings);
            } else {
                setRecordings([]);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recordings';
            setError(errorMessage);
            console.error('Error fetching recordings:', err);
        } finally {
            setLoading(false);
        }
    };

    const deleteRecording = async (recordingSid: string) => {
        if (!isAuthenticated) throw new Error('User must be authenticated');

        setLoading(true);
        setError(null);
        try {
            await twilioApi.deleteRecording(recordingSid);

            // Remove from local state
            setRecordings(prev => prev.filter(rec => rec.recordingSid !== recordingSid));

            // Also remove recording reference from calls
            setCalls(prev =>
                prev.map(call =>
                    call.recordingSid === recordingSid
                        ? { ...call, recordingSid: undefined, recordingUrl: undefined }
                        : call
                )
            );
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete recording';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const contextValue: UserPhoneNumbersContextType = {
        phoneNumbers,
        calls,
        recordings,
        phoneNumberStats,
        loading,
        error,

        // Phone number management
        getMyNumbers,
        searchAvailableNumbers,
        buyPhoneNumber,
        updatePhoneNumber,
        releasePhoneNumber,

        // Calling functionality
        makeCall,
        getCallHistory,
        getCallDetails,

        // Recording management
        getRecordings,
        deleteRecording,
    };

    return (
        <UserPhoneNumbersContext.Provider value={contextValue}>
            {children}
        </UserPhoneNumbersContext.Provider>
    );
};

export const useUserPhoneNumbers = () => {
    const context = useContext(UserPhoneNumbersContext);
    if (context === undefined) {
        throw new Error('useUserPhoneNumbers must be used within a UserPhoneNumbersProvider');
    }
    return context;
};