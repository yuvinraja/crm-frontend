/* eslint-disable @typescript-eslint/no-explicit-any */
// TypeScript interfaces based on the backend API schemas

export interface User {
  _id: string;
  name: string;
  email: string;
  googleId?: string;
  provider: 'google' | 'local';
  avatar?: string;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  totalSpending: number;
  lastVisit?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  customerId: string;
  orderAmount: number;
  orderDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SegmentCondition {
  field: string;
  operator: string;
  value: any;
}

export interface Segment {
  _id: string;
  name: string;
  conditions: SegmentCondition[];
  logic: 'AND' | 'OR';
  audienceSize?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  _id: string;
  name: string;
  segmentId: string;
  message: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorResponse {
  messageId?: string;
  timestamp?: string;
  errorMessage?: string;
}

export interface CommunicationLog {
  _id: string;
  customerId: string;
  campaignId: string;
  deliveryStatus: 'PENDING' | 'SENT' | 'FAILED';
  vendorResponse?: VendorResponse;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
}

// Request types for creating/updating entities
export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  email?: string;
  phone?: string;
}

export interface CreateOrderRequest {
  customerId: string;
  orderAmount: number;
  orderDate?: string;
}

export interface UpdateOrderRequest {
  customerId?: string;
  orderAmount?: number;
  orderDate?: string;
}

export interface CreateSegmentRequest {
  name: string;
  conditions: SegmentCondition[];
  logic: 'AND' | 'OR';
}

export interface UpdateSegmentRequest {
  name?: string;
  conditions?: SegmentCondition[];
  logic?: 'AND' | 'OR';
}

export interface CreateCampaignRequest {
  name: string;
  segmentId: string;
  message: string;
}

export interface UpdateCampaignRequest {
  name?: string;
  segmentId?: string;
  message?: string;
}

// Stats and analytics types
export interface CampaignStats {
  totalMessages: number;
  sentMessages: number;
  failedMessages: number;
  pendingMessages: number;
  deliveryRate: number;
  // Additional properties used in the UI
  audienceSize: number;
  sent: number;
  failed: number;
  pending: number;
}

export interface CampaignHistory extends Campaign {
  stats: CampaignStats;
  segment: Segment;
  // Additional properties used in UI
  audienceSize: number;
  sent: number;
  failed: number;
  segmentName?: string;
}
