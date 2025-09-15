/* eslint-disable @typescript-eslint/no-explicit-any */
// API configuration and utilities
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // Include cookies for authentication
    ...options,
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      throw new ApiError(response.status, `HTTP error! status: ${response.status}`)
    }

    // Handle empty responses
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      return await response.json()
    }

    return {} as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// API endpoints based on OpenAPI spec
export const api = {
  // Auth endpoints
  auth: {
    getUser: () => apiRequest<any>("/auth/user"),
    logout: () => apiRequest<any>("/auth/logout"),
  },

  // Customer endpoints
  customers: {
    getAll: () => apiRequest<any[]>("/customers"),
    getById: (id: string) => apiRequest<any>(`/customers/${id}`),
    create: (data: any) =>
      apiRequest<any>("/customers", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      apiRequest<any>(`/customers/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<any>(`/customers/${id}`, {
        method: "DELETE",
      }),
  },

  // Segment endpoints
  segments: {
    getAll: () => apiRequest<any[]>("/segments"),
    getById: (id: string) => apiRequest<any>(`/segments/${id}`),
    create: (data: any) =>
      apiRequest<any>("/segments", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      apiRequest<any>(`/segments/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<any>(`/segments/${id}`, {
        method: "DELETE",
      }),
    getAudience: (id: string) => apiRequest<any[]>(`/segments/${id}/audience`),
  },

  // Campaign endpoints
  campaigns: {
    getAll: () => apiRequest<any[]>("/campaigns"),
    getById: (id: string) => apiRequest<any>(`/campaigns/${id}`),
    getHistory: () => apiRequest<any[]>("/campaigns/history"),
    getStats: (id: string) => apiRequest<any>(`/campaigns/${id}/stats`),
    create: (data: any) =>
      apiRequest<any>("/campaigns", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      apiRequest<any>(`/campaigns/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<any>(`/campaigns/${id}`, {
        method: "DELETE",
      }),
  },

  // Communication endpoints
  communications: {
    getAll: () => apiRequest<any[]>("/communications"),
    getById: (id: string) => apiRequest<any>(`/communications/${id}`),
    getByCampaign: (campaignId: string) => apiRequest<any[]>(`/communications/campaign/${campaignId}`),
  },

  // Order endpoints
  orders: {
    getAll: () => apiRequest<any[]>("/orders"),
    getById: (id: string) => apiRequest<any>(`/orders/${id}`),
    getByCustomer: (customerId: string) => apiRequest<any[]>(`/orders/customer/${customerId}`),
    create: (data: any) =>
      apiRequest<any>("/orders", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      apiRequest<any>(`/orders/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<any>(`/orders/${id}`, {
        method: "DELETE",
      }),
  },
}
