/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  User,
  Customer,
  Order,
  Segment,
  Campaign,
  CommunicationLog,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CreateOrderRequest,
  UpdateOrderRequest,
  CreateSegmentRequest,
  UpdateSegmentRequest,
  CreateCampaignRequest,
  ApiResponseWrapper,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new ApiError(
        response.status,
        `HTTP error! status: ${response.status}`
      );
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return {} as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      0,
      `Network error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

// API endpoints based on OpenAPI spec
export const api = {
  // Auth endpoints
  auth: {
    getUser: async () => {
      const response = await fetch(`${API_BASE_URL}/auth/user`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data: { success: boolean; user?: User } = await response.json();
        if (data.success && data.user) {
          return data.user;
        }
      }

      throw new ApiError(response.status, 'User not authenticated');
    },
    logout: () => apiRequest<{ message: string }>('/auth/logout'),
    initiateLogin: () => {
      window.location.href = `${API_BASE_URL}/auth/google`;
    },
  },

  // Customer endpoints
  customers: {
    getAll: () => apiRequest<ApiResponseWrapper<Customer[]>>('/customers'),
    getById: (id: string) =>
      apiRequest<ApiResponseWrapper<Customer>>(`/customers/${id}`),
    create: (data: CreateCustomerRequest) =>
      apiRequest<ApiResponseWrapper<Customer>>('/customers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: UpdateCustomerRequest) =>
      apiRequest<ApiResponseWrapper<Customer>>(`/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<{ message: string }>(`/customers/${id}`, {
        method: 'DELETE',
      }),
  },

  // Order endpoints
  orders: {
    getAll: () => apiRequest<ApiResponseWrapper<Order[]>>('/orders'),
    getById: (id: string) =>
      apiRequest<ApiResponseWrapper<Order[]>>(`/orders/${id}`),
    getByCustomer: (customerId: string) =>
      apiRequest<ApiResponseWrapper<Order[]>>(`/orders/customer/${customerId}`),
    create: (data: CreateOrderRequest) =>
      apiRequest<ApiResponseWrapper<Order>>('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: UpdateOrderRequest) =>
      apiRequest<ApiResponseWrapper<Order>>(`/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<{ message: string }>(`/orders/${id}`, {
        method: 'DELETE',
      }),
  },

  // Segment endpoints
  segments: {
    getAll: () => apiRequest<ApiResponseWrapper<Segment[]>>('/segments'),
    getById: (id: string) =>
      apiRequest<ApiResponseWrapper<Segment>>(`/segments/${id}`),
    getCustomers: (id: string) =>
      apiRequest<ApiResponseWrapper<Customer[]>>(`/segments/${id}/customers`),
    create: (data: CreateSegmentRequest) =>
      apiRequest<ApiResponseWrapper<Segment>>('/segments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: UpdateSegmentRequest) =>
      apiRequest<ApiResponseWrapper<Segment>>(`/segments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<{ message: string }>(`/segments/${id}`, {
        method: 'DELETE',
      }),
    preview: (data: { conditions: any[]; logic: 'AND' | 'OR' }) =>
      apiRequest<
        ApiResponseWrapper<{
          audienceSize: number;
          sampleCustomers: Customer[];
        }>
      >('/segments/preview', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Campaign endpoints
  campaigns: {
    getAll: () => apiRequest<ApiResponseWrapper<Campaign[]>>('/campaigns'),
    getById: (id: string) =>
      apiRequest<ApiResponseWrapper<Campaign[]>>(`/campaigns/${id}`),
    create: (data: CreateCampaignRequest) =>
      apiRequest<ApiResponseWrapper<Campaign>>('/campaigns', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Communication endpoints
  communications: {
    getAll: () =>
      apiRequest<ApiResponseWrapper<CommunicationLog[]>>('/communications'),
    getById: (id: string) =>
      apiRequest<ApiResponseWrapper<CommunicationLog>>(`/communications/${id}`),
    getByCampaign: (campaignId: string) =>
      apiRequest<ApiResponseWrapper<CommunicationLog[]>>(
        `/communications/campaign/${campaignId}`
      ),
    updateStatus: (id: string, status: 'PENDING' | 'SENT' | 'FAILED') =>
      apiRequest<ApiResponseWrapper<CommunicationLog>>(
        `/communications/${id}/status`,
        {
          method: 'PUT',
          body: JSON.stringify({ deliveryStatus: status }),
        }
      ),
    deliveryReceipt: (data: {
      messageId: string;
      status: 'SENT' | 'FAILED';
      timestamp: string;
    }) =>
      apiRequest<{ message: string }>('/communications/delivery-receipt', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};
