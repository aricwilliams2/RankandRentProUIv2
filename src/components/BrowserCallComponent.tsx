import React, { useState, useEffect } from 'react';
import { Device } from '@twilio/voice-sdk';
import { twilioApi } from '../services/twilioApi';
import { useUserPhoneNumbers } from '../contexts/UserPhoneNumbersContext';
import { PhoneNumber } from '../types';

const BrowserCallComponent = () => {
  const [device, setDevice] = useState<Device | null>(null);
  const [connection, setConnection] = useState<any>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState('');
  const [toNumber, setToNumber] = useState('');
  const [callStatus, setCallStatus] = useState('idle');
  const [selectedFromNumber, setSelectedFromNumber] = useState<string>('');
  
  // Get user's phone numbers
  const userPhoneNumbers = useUserPhoneNumbers();

  // Set default selected number when phone numbers load
  useEffect(() => {
    if (userPhoneNumbers.phoneNumbers.length > 0 && !selectedFromNumber) {
      const firstNumber = userPhoneNumbers.phoneNumbers[0];
      setSelectedFromNumber(firstNumber.phone_number || firstNumber.number || '');
    }
  }, [userPhoneNumbers.phoneNumbers, selectedFromNumber]);

  // Initialize Twilio Device
  useEffect(() => {
    const initDevice = async () => {
      try {
        console.log('🎫 Getting access token...');
        
        // Check if user is authenticated
        const authToken = localStorage.getItem('token');
        console.log('Auth token exists:', !!authToken);
        if (!authToken) {
          throw new Error('No authentication token found. Please log in first.');
        }
        
        const response = await twilioApi.getAccessToken();
        
        if (!response.token) {
          console.error('No token in response:', response);
          throw new Error('Failed to get access token - no token in response');
        }
        
        console.log('✅ Access token received');
        
        const dev = new Device(response.token);

        dev.on('ready', () => {
          console.log('✅ Device ready');
          setCallStatus('ready');
          setError('');
        });

        dev.on('connect', (conn) => {
          console.log('✅ Call connected');
          setConnection(conn);
          setIsConnected(true);
          setIsCalling(false);
          setCallStatus('connected');
          setError('');
        });

        dev.on('disconnect', () => {
          console.log('📞 Call ended');
          setConnection(null);
          setIsConnected(false);
          setIsCalling(false);
          setCallStatus('idle');
          setError('');
        });

        dev.on('error', (error) => {
          console.log('❌ Device error:', error);
          if (error.code === 31005 || error.message.includes('HANGUP')) {
            console.log('📞 Call ended normally (person hung up or didn\'t answer)');
            setConnection(null);
            setIsConnected(false);
            setIsCalling(false);
            setCallStatus('idle');
            setError('');
          } else {
            setError(`Device error: ${error.message}`);
            setCallStatus('error');
          }
        });

        dev.on('incoming', (connection) => {
          console.log('📞 Incoming call');
        });

        dev.on('cancel', () => {
          console.log('📞 Call cancelled');
          setIsCalling(false);
        });

        dev.on('close', () => {
          console.log('📞 Device closed');
        });

        setDevice(dev);
      } catch (error) {
        console.error('❌ Failed to initialize:', error);
        setError(`Failed to initialize: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setCallStatus('error');
      }
    };
    
    initDevice();
  }, []);

  const makeCall = async () => {
    if (!device || isCalling || isConnected) return;
    if (!toNumber.trim()) {
      setError('Please enter a phone number to call');
      return;
    }

    try {
      setIsCalling(true);
      setCallStatus('calling');
      setError('');
      
             console.log('📞 Making call to:', toNumber);
       console.log('📞 Call parameters:', {
         To: toNumber,
         From: selectedFromNumber,
         Direction: 'outbound-api'
       });
       
       // ✅ CORRECT WAY: Pass parameters as an object
       const conn = await device.connect({
         params: {
           To: toNumber,
           From: selectedFromNumber, // Use selected phone number as caller ID
           Direction: 'outbound-api' // For database tracking
         }
       });
      
      setConnection(conn);
    } catch (error: any) {
      console.error('❌ Call failed:', error);
      if (error.code === 31005 || error.message.includes('HANGUP')) {
        console.log('📞 Call ended normally');
        setError('');
        setCallStatus('idle');
      } else {
        setError(`Call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setCallStatus('error');
      }
      setIsCalling(false);
    }
  };

  const hangUp = () => {
    if (connection) {
      console.log('📞 Hanging up call');
      connection.disconnect();
    }
    setConnection(null);
    setIsConnected(false);
    setIsCalling(false);
    setCallStatus('idle');
    setError('');
  };

  const toggleMute = () => {
    if (connection) {
      const muted = !connection.isMuted();
      connection.mute(muted);
      setIsMuted(muted);
      console.log(`🎤 ${muted ? 'Muted' : 'Unmuted'}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">🎙️ Browser Call</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          ❌ {error}
        </div>
      )}
      
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <h3 className="font-medium mb-2">Status</h3>
        <div className="space-y-1 text-sm">
          <p><strong>Status:</strong> {callStatus}</p>
          <p><strong>Device Ready:</strong> {device ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Connected:</strong> {isConnected ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Muted:</strong> {isMuted ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Available Numbers:</strong> {userPhoneNumbers.phoneNumbers.length}</p>
          {selectedFromNumber && (
            <p><strong>Selected Number:</strong> {selectedFromNumber}</p>
          )}
        </div>
      </div>

      {!isConnected ? (
        <div className="space-y-4">
          {/* Call From Number Selection */}
          <div>
            <label htmlFor="fromNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Call From (Your Number):
            </label>
            <select
              id="fromNumber"
              value={selectedFromNumber}
              onChange={(e) => setSelectedFromNumber(e.target.value)}
              disabled={isCalling}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a phone number</option>
                             {userPhoneNumbers.phoneNumbers.map((number) => (
                 <option key={number.id} value={number.phone_number || number.number}>
                   {number.phone_number || number.number}
                 </option>
               ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Choose which of your phone numbers to display as the caller ID
            </p>
          </div>

          {/* Phone Number Input */}
          <div>
            <label htmlFor="toNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number to Call:
            </label>
            <input
              id="toNumber"
              type="tel"
              value={toNumber}
              onChange={(e) => setToNumber(e.target.value)}
              placeholder="+1 (555) 123-4567"
              disabled={isCalling}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the phone number you want to call (e.g., +1 (555) 123-4567)
            </p>
          </div>
          
          <button
            onClick={makeCall}
            disabled={!device || isCalling || !toNumber.trim() || !selectedFromNumber}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isCalling ? '📞 Connecting...' : '🎙️ Start Call'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-md text-center">
            <h3 className="text-lg font-medium text-green-800 mb-2">📞 Connected to {toNumber}</h3>
            {selectedFromNumber && (
              <p className="text-sm text-green-700 mb-3">From: {selectedFromNumber}</p>
            )}
            <div className="flex space-x-4 justify-center">
              <button
                onClick={toggleMute}
                className="px-4 py-2 rounded-md text-white font-medium"
                style={{
                  backgroundColor: isMuted ? '#dc3545' : '#28a745'
                }}
              >
                {isMuted ? '🔇 Unmute' : '🎤 Mute'}
              </button>
              <button
                onClick={hangUp}
                className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700"
              >
                📞 Hang Up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowserCallComponent; 