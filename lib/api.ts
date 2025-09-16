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
      return (await response.json()) as T;
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

// Helper to unwrap the common { success, data } structure; returns raw data or provided fallback
function unwrap<T>(res: ApiResponseWrapper<T> | T, fallback: T): T {
  if (
    res &&
    typeof res === 'object' &&
    'success' in (res as any) &&
    'data' in (res as any)
  ) {
    return (res as ApiResponseWrapper<T>).data;
  }
  return (res as T) ?? fallback;
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
    getAll: async () =>
      unwrap(
        await apiRequest<ApiResponseWrapper<Customer[]>>('/customers'),
        []
      ),
    getById: async (id: string) =>
      unwrap(
        await apiRequest<ApiResponseWrapper<Customer>>(`/customers/${id}`),
        {} as Customer
      ),
    create: async (data: CreateCustomerRequest) =>
      unwrap(
        await apiRequest<ApiResponseWrapper<Customer>>('/customers', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
        {} as Customer
      ),
    update: async (id: string, data: UpdateCustomerRequest) =>
      unwrap(
        await apiRequest<ApiResponseWrapper<Customer>>(`/customers/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
        {} as Customer
      ),
    delete: (id: string) =>
      apiRequest<{ message: string }>(`/customers/${id}`, {
        method: 'DELETE',
      }),
  },

  // Order endpoints
  orders: {
    getAll: async () =>
      unwrap(await apiRequest<ApiResponseWrapper<Order[]>>('/orders'), []),
    getById: async (id: string) =>
      unwrap(
        await apiRequest<ApiResponseWrapper<Order>>(`/orders/${id}`),
        {} as Order
      ),
    getByCustomer: async (customerId: string) =>
      unwrap(
        await apiRequest<ApiResponseWrapper<Order[]>>(
          `/orders/customer/${customerId}`
        ),
        []
      ),
    create: async (data: CreateOrderRequest) =>
      unwrap(
        await apiRequest<ApiResponseWrapper<Order>>('/orders', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
        {} as Order
      ),
    update: async (id: string, data: UpdateOrderRequest) =>
      unwrap(
        await apiRequest<ApiResponseWrapper<Order>>(`/orders/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
        {} as Order
      ),
    delete: (id: string) =>
      apiRequest<{ message: string }>(`/orders/${id}`, {
        method: 'DELETE',
      }),
  },

  // Segment endpoints
  segments: {
    getAll: async () =>
      unwrap(await apiRequest<ApiResponseWrapper<Segment[]>>('/segments'), []),
    getById: async (id: string) =>
      unwrap(
        await apiRequest<ApiResponseWrapper<Segment>>(`/segments/${id}`),
        {} as Segment
      ),
    getCustomers: async (id: string) =>
      unwrap(
        await apiRequest<ApiResponseWrapper<Customer[]>>(
          `/segments/${id}/customers`
        ),
        []
      ),
    create: async (data: CreateSegmentRequest) =>
      unwrap(
        await apiRequest<ApiResponseWrapper<Segment>>('/segments', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
        {} as Segment
      ),
    update: async (id: string, data: UpdateSegmentRequest) =>
      unwrap(
        await apiRequest<ApiResponseWrapper<Segment>>(`/segments/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
        {} as Segment
      ),
    delete: (id: string) =>
      apiRequest<{ message: string }>(`/segments/${id}`, {
        method: 'DELETE',
      }),
    preview: async (data: { conditions: any[]; logic: 'AND' | 'OR' }) =>
      unwrap(
        await apiRequest<
          ApiResponseWrapper<{
            audienceSize: number;
            sampleCustomers: Customer[];
          }>
        >('/segments/preview', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
        { audienceSize: 0, sampleCustomers: [] }
      ),
  },

  // Campaign endpoints
  campaigns: {
    getAll: async () =>
      unwrap(
        await apiRequest<ApiResponseWrapper<Campaign[]>>('/campaigns'),
        []
      ),
    getById: async (id: string) =>
      unwrap(
        await apiRequest<ApiResponseWrapper<Campaign>>(`/campaigns/${id}`),
        {} as Campaign
      ),
    create: async (data: CreateCampaignRequest) =>
      unwrap(
        await apiRequest<ApiResponseWrapper<Campaign>>('/campaigns', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
        {} as Campaign
      ),
    // History endpoint (assuming same as getAll but already sorted by backend or not)
    getHistory: async () =>
      unwrap(
        await apiRequest<ApiResponseWrapper<Campaign[]>>('/campaigns'),
        []
      ),
    // Derive stats client-side from communications logs if backend lacks /campaigns/:id/stats
    getStats: async (id: string) => {
      // Fetch communications for campaign and compute aggregates
      const logs = await api.communications.getByCampaign(id);
      const sent = logs.filter((l) => l.deliveryStatus === 'SENT').length;
      const failed = logs.filter((l) => l.deliveryStatus === 'FAILED').length;
      const pending = logs.filter((l) => l.deliveryStatus === 'PENDING').length;
      const audienceSize = logs.length; // fallback if campaign.stats not provided
      return { sent, failed, pending, audienceSize };
    },
  },

  // Communication endpoints
  communications: {
    getAll: async () =>
      unwrap(
        await apiRequest<ApiResponseWrapper<CommunicationLog[]>>(
          '/communications'
        ),
        []
      ),
    getById: async (id: string) =>
      unwrap(
        await apiRequest<ApiResponseWrapper<CommunicationLog>>(
          `/communications/${id}`
        ),
        {} as CommunicationLog
      ),
    getByCampaign: async (campaignId: string) =>
      unwrap(
        await apiRequest<ApiResponseWrapper<CommunicationLog[]>>(
          `/communications/campaign/${campaignId}`
        ),
        []
      ),
    updateStatus: async (id: string, status: 'PENDING' | 'SENT' | 'FAILED') =>
      unwrap(
        await apiRequest<ApiResponseWrapper<CommunicationLog>>(
          `/communications/${id}/status`,
          {
            method: 'PUT',
            body: JSON.stringify({ deliveryStatus: status }),
          }
        ),
        {} as CommunicationLog
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
  // Dashboard aggregated stats (client-side composition)
  dashboard: {
    getStats: async () => {
      // Parallel fetch base collections
      const [customers, segments, campaigns, communications] =
        await Promise.all([
          api.customers.getAll(),
          api.segments.getAll(),
          api.campaigns.getAll(),
          api.communications.getAll(),
        ]);

      const totalCustomers = customers.length;
      const activeSegments = segments.length;
      const campaignsSent = campaigns.length;

      // Engagement heuristic: delivered(SENT) / total logs * 100
      const totalLogs = communications.length;
      const sentLogs = communications.filter(
        (c) => c.deliveryStatus === 'SENT'
      ).length;
      const engagementRate = totalLogs > 0 ? (sentLogs / totalLogs) * 100 : 0;

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const recentCustomers = Math.min(
        totalCustomers,
        Math.floor(totalCustomers * 0.15)
      ); // placeholder logic
      const recentSegments = segments.filter(
        (s) => new Date(s.createdAt) > weekAgo
      ).length;
      const recentCampaigns = campaigns.filter(
        (c) => new Date(c.createdAt) > monthAgo
      ).length;

      // Basic growth deltas (placeholder percentages until backend analytics provided)
      const monthlyGrowth = {
        customers: totalCustomers > 0 ? 12.5 : 0,
        segments: recentSegments > 0 ? 8.3 : 0,
        campaigns: recentCampaigns > 0 ? 15.2 : 0,
        engagement: engagementRate > 0 ? 2.1 : 0,
      };

      return {
        totalCustomers,
        activeSegments,
        campaignsSent,
        engagementRate,
        recentCustomers,
        recentSegments,
        recentCampaigns,
        avgEngagementRate: engagementRate,
        monthlyGrowth,
      };
    },
  },
};
