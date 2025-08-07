import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { twilioApi } from '../services/twilioApi';
import { useUserPhoneNumbers } from '../contexts/UserPhoneNumbersContext';
import type { PhoneNumber, TwilioCall, TwilioRecording } from '../types';

interface Call {
  id: string;
  call_sid: string;
  phoneNumberId: string;
  duration: number;
  status: 'completed' | 'missed' | 'voicemail' | 'failed' | 'busy' | 'no-answer';
  callerNumber: string;
  timestamp: Date;
  recording?: string;
  transcription?: string;
  price?: number;
}

interface AvailableNumber {
  phoneNumber: string;
  locality: string;
  region: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
  };
}

interface CallLogsResponse {
  callLogs: Call[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

interface RecordingsResponse {
  recordings: any[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export const useTwilio = () => {
  const queryClient = useQueryClient();
  const userPhoneNumbers = useUserPhoneNumbers();

  // Get available numbers
  const useAvailableNumbers = (params: {
    areaCode?: string;
    country?: string;
    limit?: number;
  }) => {
    return useQuery({
      queryKey: ['availableNumbers', params],
      queryFn: () => userPhoneNumbers.searchAvailableNumbers(params),
      enabled: !!params.areaCode || !!params.country,
    });
  };

  // Get call logs (now uses context data)
  const useCallLogs = (params: {
    page?: number;
    limit?: number;
    status?: string;
    phoneNumberId?: string;
  } = {}) => {
    return {
      data: {
        callLogs: userPhoneNumbers.calls.filter(call => {
          if (params.phoneNumberId && call.phoneNumberId !== params.phoneNumberId) return false;
          if (params.status && call.status !== params.status) return false;
          return true;
        }).slice(0, params.limit || 50)
      },
      isLoading: userPhoneNumbers.loading,
      error: userPhoneNumbers.error ? new Error(userPhoneNumbers.error) : null
    };
  };

  // Get specific call log
  const useCallLog = (callSid: string) => {
    const call = userPhoneNumbers.calls.find(c => c.callSid === callSid);
    return {
      data: call ? { call } : null,
      isLoading: userPhoneNumbers.loading,
      error: userPhoneNumbers.error ? new Error(userPhoneNumbers.error) : null
    };
  };

  // Get recordings (now uses context data)
  const useRecordings = (params: {
    page?: number;
    limit?: number;
    callSid?: string;
    phoneNumberId?: string;
  } = {}) => {
    return {
      data: {
        recordings: userPhoneNumbers.recordings.filter(recording => {
          if (params.callSid && recording.callSid !== params.callSid) return false;
          if (params.phoneNumberId && recording.phoneNumberId !== params.phoneNumberId) return false;
          return true;
        }).slice(0, params.limit || 50)
      },
      isLoading: userPhoneNumbers.loading,
      error: userPhoneNumbers.error ? new Error(userPhoneNumbers.error) : null
    };
  };

  // Get call recordings
  const useCallRecordings = (callSid: string) => {
    const recordings = userPhoneNumbers.recordings.filter(r => r.callSid === callSid);
    return {
      data: { recordings },
      isLoading: userPhoneNumbers.loading,
      error: userPhoneNumbers.error ? new Error(userPhoneNumbers.error) : null
    };
  };

  // Get phone numbers (now uses context data)
  const usePhoneNumbers = () => {
    return {
      data: userPhoneNumbers.phoneNumbers,
      isLoading: userPhoneNumbers.loading,
      error: userPhoneNumbers.error ? new Error(userPhoneNumbers.error) : null
    };
  };

  // Buy number mutation (now uses context)
  const useBuyNumber = () => {
    return {
      mutateAsync: userPhoneNumbers.buyPhoneNumber,
      isPending: userPhoneNumbers.loading,
      error: userPhoneNumbers.error ? new Error(userPhoneNumbers.error) : null
    };
  };



  // Delete recording mutation (now uses context)
  const useDeleteRecording = () => {
    return {
      mutateAsync: userPhoneNumbers.deleteRecording,
      isPending: userPhoneNumbers.loading,
      error: userPhoneNumbers.error ? new Error(userPhoneNumbers.error) : null
    };
  };

  // Delete phone number mutation (now uses context)
  const useDeletePhoneNumber = () => {
    return {
      mutateAsync: userPhoneNumbers.releasePhoneNumber,
      isPending: userPhoneNumbers.loading,
      error: userPhoneNumbers.error ? new Error(userPhoneNumbers.error) : null
    };
  };

  return {
    useAvailableNumbers,
    useCallLogs,
    useCallLog,
    useRecordings,
    useCallRecordings,
    usePhoneNumbers,
    useBuyNumber,
    useDeleteRecording,
    useDeletePhoneNumber,
  };
}; 