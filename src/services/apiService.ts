/**
 * apiService.ts
 * Centralised data-access layer for Panya Global using PHP backend.
 * This directly replaces supabaseService.ts to seamlessly revert to PHP/MySQL.
 */

// A generic service result matching Supabase's signature so UI code barely changes.
export type ServiceResult<T> = {
  data: T | null;
  error: Error | null;
};

// Generic fetch wrapper
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ServiceResult<T>> {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    
    // For FormData (file uploads), remove Content-Type to let browser set it with boundary
    if (options.body instanceof FormData) {
      delete (headers as Record<string, string>)['Content-Type'];
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    const response = await fetch(`${baseUrl}/${endpoint}`, { 
      ...options, 
      headers,
      credentials: 'include' // Always send HttpOnly cookies
    });
    
    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      throw new Error(errData?.error || `API Error: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Handle paginated list responses from PHP backend
    if (result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
      // It might be { quotes: [], pagination: {} } or { total: x, items: [] }
      const dataObj = result.data;
      const arrayKey = Object.keys(dataObj).find(k => Array.isArray(dataObj[k]));
      
      if (arrayKey && (dataObj.pagination || dataObj.total !== undefined || Object.keys(dataObj).length <= 2)) {
        return { data: dataObj[arrayKey], error: null };
      }
    }
    
    return { data: result.data || result, error: null };
  } catch (err: unknown) {
    return { data: null, error: err instanceof Error ? err : new Error(err.message || 'Unknown error') };
  }
}

// ============================================================================
// DOMAIN INTERFACES (Same as before)
// ============================================================================
export interface QuoteSubmission {
  id?: string;
  reference_number?: string;
  name: string;
  email: string;
  phone: string;
  service_type: string;
  origin_city?: string;
  destination_city?: string;
  move_date?: string;
  property_size?: string;
  special_requirements?: string;
  status?: 'new' | 'contacted' | 'quoted' | 'converted' | 'closed';
  admin_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceInquiry {
  id?: string;
  reference_number?: string;
  name: string;
  email: string;
  phone: string;
  service_type: string;
  details?: string;
  status?: 'new' | 'in_progress' | 'resolved' | 'closed';
  admin_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TrackingStep {
  status: string;
  location: string;
  date: string;
  time: string;
  note?: string;
  completed: boolean;
}

export interface Consignment {
  id?: string;
  consignment_number: string;
  lr_number?: string;
  sender_name?: string;
  sender_phone?: string;
  receiver_name?: string;
  receiver_phone?: string;
  origin_city?: string;
  destination_city?: string;
  goods_description?: string;
  expected_delivery?: string;
  status?: string;
  tracking_events?: TrackingStep[];
  admin_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read?: boolean;
  admin_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Admin {
  id?: string;
  name: string;
  email: string;
  role?: 'admin' | 'manager';
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Testimonial {
  id?: string;
  name: string;
  role?: string;
  content: string;
  rating?: number;
  image_url?: string;
  video_url?: string;
  is_approved?: boolean;
  created_at?: string;
}

// ============================================================================
// SERVICES
// ============================================================================
interface ServiceOptions<T> {
  endpoints?: {
    list?: string;
    create?: string;
    update?: string;
    delete?: string;
  };
  beforeUpdate?: (updates: Partial<T>) => Partial<T>;
}

function createGenericService<T>(base: string, opts?: ServiceOptions<T>) {
  const ep = {
    list: opts?.endpoints?.list || `${base}/list.php`,
    create: opts?.endpoints?.create || `${base}/create.php`,
    update: opts?.endpoints?.update || `${base}/update.php`,
    delete: opts?.endpoints?.delete || `${base}/delete.php`,
  };

  return {
    async list(filters?: Record<string, any>): Promise<ServiceResult<T[]>> {
      let url = ep.list;
      if (filters) {
        const query = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== undefined && v !== null) {
            query.append(k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v));
          }
        });
        const qs = query.toString();
        if (qs) url += (url.includes('?') ? '&' : '?') + qs;
      }
      return fetchApi<T[]>(url);
    },
    async get(id: string): Promise<ServiceResult<T>> {
      const res = await fetchApi<T[]>(`${ep.list}${ep.list.includes('?') ? '&' : '?'}id=${encodeURIComponent(id)}`);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        return { data: res.data[0] as T, error: res.error };
      }
      return res;
    },
    async create(data: Partial<T>): Promise<ServiceResult<T>> {
      return fetchApi<T>(ep.create, { method: 'POST', body: JSON.stringify(data) });
    },
    async update(id: string, updates: Partial<T>): Promise<ServiceResult<T>> {
      const finalUpdates = opts?.beforeUpdate ? opts.beforeUpdate({ ...updates }) : { ...updates };
      return fetchApi<T>(ep.update, {
        method: 'POST',
        body: JSON.stringify({ ...finalUpdates, id })
      });
    },
    async delete(id: string): Promise<ServiceResult<void>> {
      return fetchApi<void>(`${ep.delete}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    }
  };
}

export const quoteService = createGenericService<QuoteSubmission>('quote-submissions');
export const inquiryService = createGenericService<ServiceInquiry>('service-inquiries');
export const contactService = createGenericService<ContactMessage>('contact-messages');
export const adminService = createGenericService<Admin>('admins');
export const testimonialService = createGenericService<Testimonial>('testimonials');

const baseConsignment = createGenericService<Consignment>('consignments', {
  endpoints: { create: 'consignments/book.php' },
  beforeUpdate: (updates) => {
    if (updates.status === 'storage') updates.status = 'in_storage';
    if (updates.status === 'in_storage') updates.status = 'in_storage';
    return updates;
  }
});

export const consignmentService = {
  ...baseConsignment,
  book: baseConsignment.create, // Alias to support existing calls to .book()
  async getByTracking(trackingNumber: string): Promise<ServiceResult<Consignment>> {
    return fetchApi<Consignment>(`consignments/list.php?consignment_number=${encodeURIComponent(trackingNumber)}`);
  }
};

// ============================================================================
// DASHBOARD & LEADS SERVICE
// ============================================================================
export interface DashboardStats {
  totalEvents: number;
  totalVisits: number;
  topPages: string[];
}

export const dashboardService = {
  async getStats(): Promise<ServiceResult<DashboardStats>> {
    return fetchApi<DashboardStats>('dashboard-stats.php');
  }
};

export type Lead = (QuoteSubmission | ServiceInquiry) & { lead_type: 'quote' | 'inquiry' };
export const leadsService = {
  async listAll(filters?: { status?: string; limit?: number; offset?: number }): Promise<ServiceResult<Lead[]>> {
    return fetchApi<Lead[]>(`leads-list.php?status=${filters?.status || ''}`);
  },
  async updateLead(id: string, leadType: 'quote' | 'inquiry', updates: Partial<QuoteSubmission | ServiceInquiry>): Promise<ServiceResult<QuoteSubmission | ServiceInquiry>> {
    if (leadType === 'quote') return quoteService.update(id, updates as Partial<QuoteSubmission>);
    return inquiryService.update(id, updates as Partial<ServiceInquiry>);
  }
};

export const analyticsService = {
  async getStats(days = 30): Promise<ServiceResult<DashboardStats>> {
    return { data: { totalEvents: 0, totalVisits: 0, topPages: [] }, error: null }; // Mocked or implement later
  }
};
