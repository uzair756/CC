// utils/networkUtils.js
import DeviceInfo from 'react-native-device-info';

export const getApiBaseUrl = async () => {
  const ipAddress = await DeviceInfo.getIpAddress();
  return `http://${ipAddress}:3002`;
};