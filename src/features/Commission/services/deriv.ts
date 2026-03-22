import apiManager from '@site/src/configs/websocket';

let isAuthorized = false;

// Get commission statistics
export const getCommission = async (date_from: string, date_to: string) => {
  if (!apiManager) {
    throw new Error('WebSocket not connected');
  }

  const response = await apiManager.augmentedSend({
    app_markup_statistics: 1,
    date_from,
    date_to,
  });

  return response;
};

// Get app list
export const getAppList = async () => {
  if (!apiManager) {
    throw new Error('WebSocket not connected');
  }

  const response = await apiManager.augmentedSend({
    app_list: 1,
  });

  return response;
};

// Get app details by ID
export const getAppDetails = async (app_id: number, date_from: string, date_to: string) => {
  if (!apiManager) {
    throw new Error('WebSocket not connected');
  }

  const response = await apiManager.augmentedSend({
    app_markup_details: {
      app_id,
      date_from,
      date_to,
    },
  });

  return response;
};
