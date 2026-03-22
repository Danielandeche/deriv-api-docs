import apiManager from '@site/src/configs/websocket';
import { TSocketResponse } from '@site/src/configs/websocket/types';

// Get commission statistics
export const getCommission = async (date_from: string, date_to: string) => {
  if (!apiManager?.api) {
    throw new Error('WebSocket not connected');
  }

  const response = (await apiManager.api.send({
    app_markup_statistics: 1,
    date_from,
    date_to,
  })) as TSocketResponse<'app_markup_statistics'>;

  return response;
};

// Get app list
export const getAppList = async () => {
  if (!apiManager?.api) {
    throw new Error('WebSocket not connected');
  }

  const response = (await apiManager.api.send({
    app_list: 1,
  })) as TSocketResponse<'app_list'>;

  return response;
};

// Get app details by ID
export const getAppDetails = async (app_id: number, date_from: string, date_to: string) => {
  if (!apiManager?.api) {
    throw new Error('WebSocket not connected');
  }

  const response = (await apiManager.api.send({
    app_markup_details: {
      app_id,
      date_from,
      date_to,
    },
  })) as TSocketResponse<'app_markup_details'>;

  return response;
};
