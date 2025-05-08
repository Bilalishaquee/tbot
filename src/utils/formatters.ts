/**
 * Format a number to a specified number of decimal places
 */
export const formatNumber = (value: number, decimals = 2): string => {
  return value.toFixed(decimals);
};

/**
 * Format a timestamp to a readable time string (HH:MM:SS)
 */
export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};

/**
 * Format a timestamp to a readable date string (YYYY-MM-DD)
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString();
};

/**
 * Format a timestamp to a full date and time string
 */
export const formatDateTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

/**
 * Format a percentage value
 */
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

/**
 * Calculate time remaining until expiry in seconds
 */
export const calculateTimeRemaining = (expiryTime: number): number => {
  const now = Date.now();
  return Math.max(0, Math.floor((expiryTime - now) / 1000));
};

/**
 * Format seconds to MM:SS
 */
export const formatTimeRemaining = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Convert confidence score to string representation
 */
export const confidenceToString = (confidence: number): string => {
  if (confidence >= 0.8) return 'Very High';
  if (confidence >= 0.6) return 'High';
  if (confidence >= 0.4) return 'Medium';
  if (confidence >= 0.2) return 'Low';
  return 'Very Low';
};