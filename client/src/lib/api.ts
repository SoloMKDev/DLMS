import { Patient, Doctor, Test, Order, User } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const response = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    this.setToken(response.token);
    return response;
  }

  async getCurrentUser() {
    return this.request<User>('/auth/me');
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.clearToken();
  }

  // Patient endpoints
  async getPatients(params?: { search?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    return this.request<{
      patients: Patient[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/patients?${searchParams}`);
  }

  async getPatient(id: string) {
    return this.request<Patient>(`/patients/${id}`);
  }

  async createPatient(data: Omit<Patient, 'id' | 'patientCode' | 'createdAt'>) {
    return this.request<Patient>('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePatient(id: string, data: Partial<Patient>) {
    return this.request<Patient>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePatient(id: string) {
    return this.request(`/patients/${id}`, { method: 'DELETE' });
  }

  // Doctor endpoints
  async getDoctors(params?: { search?: string; active?: boolean; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.active !== undefined) searchParams.append('active', params.active.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    return this.request<{
      doctors: Doctor[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/doctors?${searchParams}`);
  }

  async createDoctor(data: Omit<Doctor, 'id' | 'isActive'>) {
    return this.request<Doctor>('/doctors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDoctor(id: string, data: Partial<Doctor>) {
    return this.request<Doctor>(`/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleDoctor(id: string) {
    return this.request<Doctor>(`/doctors/${id}/toggle`, { method: 'PATCH' });
  }

  async deleteDoctor(id: string) {
    return this.request(`/doctors/${id}`, { method: 'DELETE' });
  }

  // Test endpoints
  async getTests(params?: { search?: string; category?: string; active?: boolean; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.active !== undefined) searchParams.append('active', params.active.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    return this.request<{
      tests: Test[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/tests?${searchParams}`);
  }

  async getTestCategories() {
    return this.request<string[]>('/tests/categories');
  }

  async createTest(data: Omit<Test, 'id' | 'isActive'>) {
    return this.request<Test>('/tests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTest(id: string, data: Partial<Test>) {
    return this.request<Test>(`/tests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleTest(id: string) {
    return this.request<Test>(`/tests/${id}/toggle`, { method: 'PATCH' });
  }

  async deleteTest(id: string) {
    return this.request(`/tests/${id}`, { method: 'DELETE' });
  }

  // Order endpoints
  async getOrders(params?: { search?: string; status?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    return this.request<{
      orders: Order[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/orders?${searchParams}`);
  }

  async getOrder(id: string) {
    return this.request<Order>(`/orders/${id}`);
  }

  async createOrder(data: { patientId: string; testIds: string[]; referredBy?: string }) {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async updateTestResults(id: string, results: Array<{ testId: string; result: string; notes?: string }>) {
    return this.request<Order>(`/orders/${id}/results`, {
      method: 'PATCH',
      body: JSON.stringify({ results }),
    });
  }

  async deleteOrder(id: string) {
    return this.request(`/orders/${id}`, { method: 'DELETE' });
  }

  // User endpoints
  async getUsers(params?: { search?: string; role?: string; active?: boolean; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.role) searchParams.append('role', params.role);
    if (params?.active !== undefined) searchParams.append('active', params.active.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    return this.request<{
      users: User[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/users?${searchParams}`);
  }

  async createUser(data: Omit<User, 'id' | 'isActive' | 'lastLogin' | 'createdAt'> & { password: string }) {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: Partial<User>) {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    return this.request(`/users/${id}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async toggleUser(id: string) {
    return this.request<User>(`/users/${id}/toggle`, { method: 'PATCH' });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, { method: 'DELETE' });
  }

  // Analytics endpoints
  async getDashboardAnalytics() {
    return this.request<{
      summary: {
        totalPatients: number;
        totalOrders: number;
        todayOrders: number;
        weekOrders: number;
        monthOrders: number;
        totalRevenue: number;
        monthRevenue: number;
      };
      statusDistribution: Array<{ status: string; count: number; color: string }>;
      dailyOrders: Array<{ date: string; orders: number }>;
      topTests: Array<{ name: string; code: string; count: number }>;
      recentOrders: Order[];
    }>('/analytics/dashboard');
  }

  async getRevenueAnalytics(period: 'week' | 'month' | 'year' = 'month') {
    return this.request<Array<{ date: string; revenue: number }>>(`/analytics/revenue?period=${period}`);
  }
}

export const apiClient = new ApiClient();