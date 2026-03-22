let isAuthorized = false;
let ws = null;
let requestId = 1;
const pendingRequests = new Map();
const APP_ID = process.env.REACT_APP_DERIV_APP_ID || '105603';

// Try multiple WebSocket endpoints
const WS_ENDPOINTS = [
  `wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`,
  `wss://ws.deriv.com/websockets/v3?app_id=${APP_ID}`,
  `wss://blue.deriv.ws/websockets/v3?app_id=${APP_ID}`,
];

// Generate unique request ID
const getRequestId = () => requestId++;

// Initialize Deriv API connection with retry logic
export const connectDeriv = async (token, maxRetries = 3) => {
  console.log('=== Starting Deriv API Connection ===');
  console.log('Token received:', token ? 'Yes (length: ' + token.length + ')' : 'No');
  console.log('App ID:', APP_ID);
  
  let lastError = null;
  
  // Try each endpoint
  for (let attempt = 0; attempt < WS_ENDPOINTS.length; attempt++) {
    const wsUrl = WS_ENDPOINTS[attempt];
    console.log(`Attempt ${attempt + 1}: Connecting to ${wsUrl}`);
    
    try {
      const result = await attemptConnection(wsUrl, token);
      return result;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error.message);
      lastError = error;
      
      // If this is not a network error, don't retry
      if (!error.message.includes('WebSocket') && !error.message.includes('connection')) {
        throw error;
      }
    }
  }
  
  // All attempts failed
  throw lastError || new Error('Failed to connect to Deriv API');
};

// Single connection attempt
const attemptConnection = (wsUrl, token) => {
  return new Promise((resolve, reject) => {
    // Close existing connection if any
    if (ws && ws.readyState !== WebSocket.CLOSED) {
      ws.close();
    }

    // Reset authorization state
    isAuthorized = false;
    
    console.log('Connecting to:', wsUrl);
    
    // Set a timeout for the connection
    const timeoutId = setTimeout(() => {
      if (!isAuthorized) {
        console.error('Connection timeout');
        reject(new Error('Connection timeout - please try again'));
      }
    }, 15000); // 15 second timeout
    
    try {
      ws = new WebSocket(wsUrl);
    } catch (e) {
      console.error('Failed to create WebSocket:', e);
      clearTimeout(timeoutId);
      reject(new Error('Failed to create WebSocket connection'));
      return;
    }

    ws.onopen = () => {
      console.log('WebSocket opened');
      // Wait a bit to ensure connection is fully ready
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          const reqId = getRequestId();
          pendingRequests.set(reqId, { resolve, reject });
          
          ws.send(JSON.stringify({ 
            authorize: token,
            req_id: reqId
          }));
          console.log('Authorization request sent');
        } else {
          clearTimeout(timeoutId);
          reject(new Error('WebSocket not ready'));
        }
      }, 100);
    };

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        console.log('WebSocket message received:', data.msg_type);
        
        // Handle response with req_id
        if (data.req_id && pendingRequests.has(data.req_id)) {
          const pending = pendingRequests.get(data.req_id);
          const { resolve, reject } = pending;
          pendingRequests.delete(data.req_id);
          
          if (data.error) {
            console.error('Error in response:', data.error);
            clearTimeout(timeoutId);
            reject(data.error);
          } else {
            if (data.msg_type === 'authorize') {
              isAuthorized = true;
              console.log('Authorization successful');
              clearTimeout(timeoutId);
            }
            resolve(data);
          }
        }
      } catch (e) {
        console.error('Error parsing message:', e);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      // Don't reject immediately - wait for onclose
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      clearTimeout(timeoutId);
      
      if (isAuthorized) {
        isAuthorized = false;
      }
      
      // Only reject if we haven't resolved yet
      if (!isAuthorized && pendingRequests.size > 0) {
        pendingRequests.forEach(({ reject }) => {
          reject(new Error('Connection closed'));
        });
        pendingRequests.clear();
      }
    };
  });
};

// Get commission statistics
export const getCommission = async (date_from, date_to) => {
  console.log('getCommission called', { date_from, date_to, isAuthorized, wsState: ws?.readyState });
  
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    throw new Error('WebSocket not connected');
  }

  if (!isAuthorized) {
    throw new Error('Not authorized');
  }

  return new Promise((resolve, reject) => {
    const reqId = getRequestId();
    pendingRequests.set(reqId, { resolve, reject });

    ws.send(JSON.stringify({
      app_markup_statistics: 1,
      date_from,
      date_to,
      req_id: reqId
    }));
  });
};

// Get app list
export const getAppList = async () => {
  console.log('getAppList called', { isAuthorized, wsState: ws?.readyState });
  
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    throw new Error('WebSocket not connected');
  }

  if (!isAuthorized) {
    throw new Error('Not authorized');
  }

  return new Promise((resolve, reject) => {
    const reqId = getRequestId();
    pendingRequests.set(reqId, { resolve, reject });

    ws.send(JSON.stringify({
      app_list: 1,
      req_id: reqId
    }));
  });
};

// Get app details by ID
export const getAppDetails = async (app_id, date_from, date_to) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    throw new Error('WebSocket not connected');
  }

  if (!isAuthorized) {
    throw new Error('Not authorized');
  }

  return new Promise((resolve, reject) => {
    const reqId = getRequestId();
    pendingRequests.set(reqId, { resolve, reject });

    ws.send(JSON.stringify({
      app_markup_details: {
        app_id,
        date_from,
        date_to
      },
      req_id: reqId
    }));
  });
};

// Disconnect and cleanup
export const disconnectDeriv = () => {
  console.log('disconnectDeriv called');
  if (ws) {
    ws.close();
  }
  ws = null;
  isAuthorized = false;
  pendingRequests.clear();
};

// Check if connected and authorized
export const isConnected = () => {
  return isAuthorized && ws !== null && ws.readyState === WebSocket.OPEN;
};

// Get current authorization status
export const getAuthStatus = () => {
  return {
    isConnected: isAuthorized,
    hasWS: ws !== null && ws.readyState === WebSocket.OPEN
  };
};
