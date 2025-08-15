import { useState, useEffect } from 'react';
import { Device } from '@twilio/voice-sdk';
import { twilioApi } from '../services/twilioApi';
import { useUserPhoneNumbers } from '../contexts/UserPhoneNumbersContext';
import { PhoneNumber } from '../types';

const BrowserCallComponent = () => {
  const [device, setDevice] = useState<Device | null>(null);
  const [connection, setConnection] = useState<any>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  // const [isMuted, setIsMuted] = useState(false);
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
        // Get access token from your backend
        console.log('Attempting to get access token...');

        // Check if user is authenticated
        const authToken = localStorage.getItem('token');
        console.log('Auth token exists:', !!authToken);
        if (!authToken) {
          throw new Error('No authentication token found. Please log in first.');
        }

        const response = await twilioApi.getAccessToken();

        console.log('Access token response:', response);

        // Handle both possible response formats
        const token = response.token || (response.success && response.token);

        if (!token) {
          console.error('No token in response:', response);
          throw new Error('Failed to get access token - no token in response');
        }

        // Initialize device
        const dev = new Device(token);

        // Set up event listeners
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
        dev.on('incoming', () => {
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

  // Helper function to format phone numbers
  const formatPhoneNumber = (number: string): string => {
    // Remove all non-digit characters except +
    let cleaned = number.replace(/[^\d+]/g, '');

    // If it doesn't start with +, add +1 for US numbers
    if (!cleaned.startsWith('+')) {
      cleaned = '+1' + cleaned;
    }

    return cleaned;
  };

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

      // Format the phone numbers properly
      const formattedToNumber = formatPhoneNumber(toNumber.trim());
      const formattedFromNumber = formatPhoneNumber(selectedFromNumber.trim());

      // Validate phone number format
      if (!formattedToNumber.match(/^\+[1-9]\d{1,14}$/)) {
        throw new Error('Invalid phone number format. Please use format: +1 (555) 123-4567');
      }

      console.log('Making call with params:', {
        To: formattedToNumber,
        From: formattedFromNumber
      });

      // Try different call configurations
      let conn;
      try {
        // First try with both To and From parameters
        conn = await device.connect({
          params: {
            To: formattedToNumber,
            From: formattedFromNumber
          }
        });
      } catch (firstError) {
        console.log('First attempt failed, trying without From parameter:', firstError);
        try {
          // Try without the From parameter (let Twilio use the default)
          conn = await device.connect({
            params: {
              To: formattedToNumber
            }
          });
        } catch (secondError) {
          console.log('Second attempt failed, trying with minimal params:', secondError);
          // Try with minimal parameters
          conn = await device.connect({
            params: {
              To: formattedToNumber
            }
          });
        }
      }

      setConnection(conn);

    } catch (error) {
      console.error('Call error details:', error);
      setError(`Call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsCalling(false);
    }
  };

  const hangUp = () => {
    try {
      if (connection) {
        connection.disconnect();
      } else if (device && (device as any).disconnectAll) {
        (device as any).disconnectAll();
      }
    } catch { }
    setConnection(null);
    setIsConnected(false);
    setIsCalling(false);
    window.location.reload();
  };

  // Mute functionality is no longer exposed in the UI; keep for potential future use
  // const toggleMute = () => {
  //   if (connection) {
  //     const muted = !connection.isMuted();
  //     connection.mute(muted);
  //     setIsMuted(muted);
  //   }
  // };

  // Test call function for debugging
  const testCall = async () => {
    if (!device) return;

    try {
      console.log('Testing call with Twilio test number...');
      const conn = await device.connect({
        params: {
          To: '+15551234567' // Twilio test number
        }
      });
      setConnection(conn);
      setIsConnected(true);
      setIsCalling(false);
    } catch (error) {
      console.error('Test call failed:', error);
      setError(`Test call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

      {!(isCalling || isConnected) ? (
        // Call Setup
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
              <option value="">Select your phone number</option>
              {userPhoneNumbers.phoneNumbers.map((phoneNumber: PhoneNumber) => (
                <option key={phoneNumber.id} value={phoneNumber.number || phoneNumber.phone_number}>
                  {phoneNumber.number || phoneNumber.phone_number}
                  {phoneNumber.websiteId && ` (${phoneNumber.websiteId})`}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Choose which of your phone numbers to display as the caller ID
            </p>
          </div>

          {/* To Number Input */}
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

          {/* Test Call Button */}
          <button
            onClick={testCall}
            disabled={!device || isCalling}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed mt-2"
          >
            🧪 Test Call (+15551234567)
          </button>
        </div>
      ) : (
        // Active/Dialing - show only Hang Up
        <div className="space-y-4">
          <p className="text-lg font-medium">
            {isConnected ? '📞 Call in progress' : '📲 Dialing...'}
          </p>
          <button
            onClick={hangUp}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
          >
            📞 Hang Up
          </button>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="font-medium mb-2">Status</h3>
        <div className="space-y-1 text-sm">
          <p>Device Ready: {device ? '✅ Yes' : '❌ No'}</p>
          <p>Connected: {isConnected ? '✅ Yes' : '❌ No'}</p>
          <p>Selected Number: {selectedFromNumber || 'None selected'}</p>
          <p>Available Numbers: {userPhoneNumbers.phoneNumbers.length}</p>
        </div>
      )}
      </div>
      );
};

      export default BrowserCallComponent; 