// Price formatting
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

// Ensure a value is a number
export const ensureNumber = (value: string | number): number => {
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return value;
};

// Format date to local string
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Generate random ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^01\d{9}$/;
  return phoneRegex.test(phone);
};

// Cart types and utilities
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  fileName?: string;
  stock: number;
  sellerId?: number;
}

export const sanitizeCartItem = (item: Partial<CartItem>): CartItem => {
  return {
    id: ensureNumber(item.id || 0),
    name: item.name || '',
    price: ensureNumber(item.price || 0),
    quantity: ensureNumber(item.quantity || 1),
    fileName: item.fileName || '',
    stock: ensureNumber(item.stock || 0),
    sellerId: ensureNumber(item.sellerId || 0)
  };
};

// Calculate discount price
export const calculateDiscountPrice = (price: number, discountPercentage: number): number => {
  if (!discountPercentage) return price;
  return price - (price * (discountPercentage / 100));
};

// Sort array of objects by key
export const sortByKey = <T extends object>(array: T[], key: keyof T, ascending: boolean = true): T[] => {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return ascending ? -1 : 1;
    if (a[key] > b[key]) return ascending ? 1 : -1;
    return 0;
  });
};

// Filter out falsy values from object
export const cleanObject = (obj: Record<string, any>): Record<string, any> => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value) acc[key] = value;
    return acc;
  }, {} as Record<string, any>);
};

// Deep clone an object
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};