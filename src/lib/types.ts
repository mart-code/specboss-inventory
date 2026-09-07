export type { Timestamp } from "firebase/firestore";

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface State {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: number;
}

export interface DeliveryCompany {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: number;
}

export interface Inventory {
  id: string;
  productId: string;
  stateId: string;
  deliveryCompanyId: string;
  quantity: number;
  updatedAt: number;
}

export type OrderStatus = "pending" | "successful" | "cancelled";

export interface Order {
  id: string;
  orderNumber: string;
  productId: string;
  stateId: string;
  deliveryCompanyId: string;
  quantity: number;
  salePrice: number;
  deliveryCost: number;
  subtotal: number;
  total: number;
  status: OrderStatus;
  orderDate: number;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
}

export interface DashboardMetrics {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
  totalOrders: number;
  unitsSold: number;
  currentStock: number;
  lowStockItems: number;
}

export interface SalesByState {
  stateName: string;
  orders: number;
  unitsSold: number;
  revenue: number;
}

export interface SalesByCompany {
  companyName: string;
  orders: number;
  unitsSold: number;
  revenue: number;
}
