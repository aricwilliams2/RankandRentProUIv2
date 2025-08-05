import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { twilioApi } from '../services/twilioApi';
import type { PhoneNumber } from '../types';

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

  // Get available numbers
  const useAvailableNumbers = (params: {
    areaCode?: string;
    country?: string;
    limit?: number;
  }) => {
    return useQuery({
      queryKey: ['availableNumbers', params],
      queryFn: () => twilioApi.getAvailableNumbers(params),
      enabled: !!params.areaCode || !!params.country,
    });
  };

  // Get call logs
  const useCallLogs = (params: {
    page?: number;
    limit?: number;
    status?: string;
    phoneNumberId?: string;
  } = {}) => {
    return useQuery({
      queryKey: ['callLogs', params],
      queryFn: () => twilioApi.getCallLogs(params),
    });
  };

  // Get specific call log
  const useCallLog = (callSid: string) => {
    return useQuery({
      queryKey: ['callLog', callSid],
      queryFn: () => twilioApi.getCallLog(callSid),
      enabled: !!callSid,
    });
  };

  // Get recordings
  const useRecordings = (params: {
    page?: number;
    limit?: number;
    callSid?: string;
  } = {}) => {
    return useQuery({
      queryKey: ['recordings', params],
      queryFn: () => twilioApi.getRecordings(params),
    });
  };

  // Get call recordings
  const useCallRecordings = (callSid: string) => {
    return useQuery({
      queryKey: ['callRecordings', callSid],
      queryFn: () => twilioApi.getCallRecordings(callSid),
      enabled: !!callSid,
    });
  };

  // Get phone numbers
  const usePhoneNumbers = () => {
    return useQuery({
      queryKey: ['phoneNumbers'],
      queryFn: () => twilioApi.getPhoneNumbers(),
    });
  };

  // Buy number mutation
  const useBuyNumber = () => {
    return useMutation({
      mutationFn: twilioApi.buyNumber,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['availableNumbers'] });
        queryClient.invalidateQueries({ queryKey: ['phoneNumbers'] });
      },
    });
  };

  // Make call mutation
  const useMakeCall = () => {
    return useMutation({
      mutationFn: twilioApi.makeCall,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['callLogs'] });
      },
    });
  };

  // Delete recording mutation
  const useDeleteRecording = () => {
    return useMutation({
      mutationFn: twilioApi.deleteRecording,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['recordings'] });
      },
    });
  };

  // Delete phone number mutation
  const useDeletePhoneNumber = () => {
    return useMutation({
      mutationFn: twilioApi.deletePhoneNumber,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['phoneNumbers'] });
      },
    });
  };

  return {
    useAvailableNumbers,
    useCallLogs,
    useCallLog,
    useRecordings,
    useCallRecordings,
    usePhoneNumbers,
    useBuyNumber,
    useMakeCall,
    useDeleteRecording,
    useDeletePhoneNumber,
  };
}; 