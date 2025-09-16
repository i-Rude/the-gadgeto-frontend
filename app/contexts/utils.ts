// Utility functions for data type conversion and validation

export interface CartItem {
  id: number;
  name: string;
  price: number;
  stock: number;
  image?: string;
  quantity: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  fileName?: string;
  discount: number;
  isActive: boolean;
  category?: {
    id: number;
    name: string;
  };
  seller?: {
    id: string;
    businessName: string;
  };
}

/**
 * Ensures a value is converted to a number, handling string inputs
 */
export const ensureNumber = (value: string | number): number => {
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return typeof value === 'number' ? value : 0;
};

/**
 * Sanitizes cart item data to ensure proper types
 */
export const sanitizeCartItem = (item: any): CartItem => {
  return {
    id: ensureNumber(item.id),
    name: item.name || '',
    price: ensureNumber(item.price),
    stock: ensureNumber(item.stock),
    image: item.image,
    quantity: ensureNumber(item.quantity)
  };
};

/**
 * Sanitizes product data to ensure proper types
 */
export const sanitizeProduct = (product: any): Product => {
  return {
    id: ensureNumber(product.id),
    name: product.name || '',
    description: product.description,
    price: ensureNumber(product.price),
    stock: ensureNumber(product.stock),
    fileName: product.fileName,
    discount: ensureNumber(product.discount),
    isActive: Boolean(product.isActive),
    category: product.category,
    seller: product.seller
  };
};

/**
 * Formats price for display with Bangladeshi Taka currency
 * Adds comma separation for better readability of larger amounts
 */
export const formatPrice = (price: string | number): string => {
  const numPrice = ensureNumber(price);
  // Format with commas for thousands separation
  const formattedNumber = numPrice.toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `৳${formattedNumber}`;
};
