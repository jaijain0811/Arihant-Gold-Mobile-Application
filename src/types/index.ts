export interface AccessCode {
  id: string;
  code: string;
  label: string;
  isActive: boolean;
  maxUsages: number;
  usageCount: number;
  expiresAt: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  accessCodeUsed?: string;
  addresses: Address[];
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  itemCount: number;
}

export interface ProductDesignVariant {
  id: string;
  code: string;
  title: string;
  image: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  title: string;
  sku: string;
  description: string;
  price: number;
  compareAtPrice: number;
  discountPercent: number;
  category: string;
  collection?: string;
  stock: number;
  inStock: boolean;
  images: string[];
  designs?: ProductDesignVariant[];
  sizes: string[];
  colors: Array<{ name: string; hex: string }>;
  specifications: Array<{ label: string; value: string }>;
  ratings: number;
  reviewCount: number;
  isBestSeller?: boolean;
  isTrending?: boolean;
  isNewArrival?: boolean;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  badgeText?: string;
  targetType: 'category' | 'product' | 'collection' | 'link';
  targetValue: string;
  isHero: boolean;
  position: number;
  isActive: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  selectedDesign?: ProductDesignVariant;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  items: Array<{
    productId: string;
    title: string;
    image: string;
    price: number;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
  }>;
  shippingAddress: Address;
  paymentMethod: 'cod' | 'qr_code' | 'pay_later';
  paymentDetails?: {
    upiTransactionId?: string;
    paymentProofUrl?: string;
    payLaterApproved?: boolean;
  };
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  trackingNumber?: string;
  courierPartner?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  storeName: string;
  storeCurrency: string;
  currencySymbol: string;
  paymentMethods: {
    cod: {
      enabled: boolean;
      minOrderAmount: number;
      instructions: string;
    };
    qrCode: {
      enabled: boolean;
      upiId: string;
      qrImageUrl: string;
      merchantName: string;
      instructions: string;
    };
    payLater: {
      enabled: boolean;
      creditLimit: number;
      terms: string;
    };
  };
  delivery: {
    shippingFee: number;
    freeShippingThreshold: number;
    estimatedDeliveryDays: string;
  };
  homepage: {
    announcementBanner: string;
    showTrendingCollection: boolean;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'order' | 'promo';
  createdAt: string;
  isRead?: boolean;
}
