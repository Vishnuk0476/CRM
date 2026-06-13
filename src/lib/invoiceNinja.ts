/**
 * Invoice Ninja Integration — Panya Global
 * ─────────────────────────────────────────────
 * Auto-create professional invoices when consignments are booked.
 *
 * Options:
 * A) Invoice Ninja Cloud (invoiceninja.com) — hosted, free for small teams
 * B) Invoice Ninja Self-hosted — on your own server
 *
 * Setup:
 * 1. Sign up at https://app.invoicing.co OR self-host
 * 2. Go to Settings → API Tokens → Create Token
 * 3. Add to .env:
 *    VITE_INVOICE_NINJA_URL=https://app.invoicing.co
 *    VITE_INVOICE_NINJA_TOKEN=your_api_token
 *
 * Note: For production, make API calls from Supabase Edge Function
 * to keep the token server-side. This client-side version is for
 * development/testing only.
 */

const IN_URL = (import.meta.env.VITE_INVOICE_NINJA_URL || '').replace(/\/$/, '');
const IN_TOKEN = import.meta.env.VITE_INVOICE_NINJA_TOKEN || '';

export interface InvoiceItem {
  product_key: string;      // Service name
  notes: string;            // Description
  cost: number;             // Unit price in INR
  quantity: number;
  tax_name1?: string;
  tax_rate1?: number;       // GST percentage e.g. 18
}

export interface CreateInvoiceParams {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  lrNumber?: string;
  consignmentId?: string;
  items: InvoiceItem[];
  notes?: string;
  dueDate?: string;         // ISO date string
  poNumber?: string;        // LR number as PO
}

export interface InvoiceResult {
  success: boolean;
  invoiceId?: string;
  invoiceNumber?: string;
  invoiceUrl?: string;      // PDF download URL
  viewUrl?: string;         // Customer view URL
  error?: string;
}

/**
 * Create a client in Invoice Ninja or find existing by email
 */
async function findOrCreateClient(email: string, name: string, phone: string, address?: string): Promise<string | null> {
  if (!IN_URL || !IN_TOKEN) return null;

  try {
    // Search for existing client
    const searchRes = await fetch(`${IN_URL}/api/v1/clients?filter=${encodeURIComponent(email)}`, {
      headers: { 'X-API-TOKEN': IN_TOKEN, 'Content-Type': 'application/json' },
    });
    const searchData = await searchRes.json();
    if (searchData.data?.length > 0) {
      return searchData.data[0].id;
    }

    // Create new client
    const createRes = await fetch(`${IN_URL}/api/v1/clients`, {
      method: 'POST',
      headers: { 'X-API-TOKEN': IN_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        contacts: [{ email, first_name: name.split(' ')[0], last_name: name.split(' ').slice(1).join(' '), phone }],
        address1: address || '',
        country_id: '356', // India
        currency_id: '66', // INR
        phone,
      }),
    });
    const createData = await createRes.json();
    return createData.data?.id || null;
  } catch (err: unknown) {
    console.error('[InvoiceNinja] Client lookup/create failed:', err);
    return null;
  }
}

/**
 * Create a professional invoice in Invoice Ninja
 */
export async function createInvoice(params: CreateInvoiceParams): Promise<InvoiceResult> {
  if (!IN_URL || !IN_TOKEN) {
    console.warn('[InvoiceNinja] API not configured. Set VITE_INVOICE_NINJA_URL and VITE_INVOICE_NINJA_TOKEN');
    return { success: false, error: 'Invoice Ninja not configured' };
  }

  try {
    // Get or create the client
    const clientId = await findOrCreateClient(
      params.customerEmail,
      params.customerName,
      params.customerPhone,
      params.customerAddress
    );

    if (!clientId) {
      return { success: false, error: 'Could not create client' };
    }

    // Build invoice line items
    const lineItems = params.items.map(item => ({
      product_key: item.product_key,
      notes: item.notes,
      cost: item.cost,
      quantity: item.quantity,
      tax_name1: item.tax_name1 || 'GST',
      tax_rate1: item.tax_rate1 ?? 18,
    }));

    // Due date: 7 days from now if not specified
    const dueDate = params.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    // Create the invoice
    const res = await fetch(`${IN_URL}/api/v1/invoices`, {
      method: 'POST',
      headers: { 'X-API-TOKEN': IN_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        po_number: params.lrNumber || params.poNumber || '',
        public_notes: params.notes || `LR Number: ${params.lrNumber || 'N/A'}\nThank you for choosing Panya Global Relocation!`,
        line_items: lineItems,
        due_date: dueDate,
        currency_id: '66', // INR
        footer: 'Panya Global Relocation Pvt. Ltd. | panyaglobal.in | +91 8800446447',
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `HTTP ${res.status}`);
    }

    const invoiceId = data.data?.id;
    const invNumber = data.data?.number;
    const invisionId = data.data?.invitations?.[0]?.key;
    const viewUrl = invisionId ? `${IN_URL}/client/invoices/${invisionId}` : undefined;

    return {
      success: true,
      invoiceId,
      invoiceNumber: invNumber,
      viewUrl,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invoice creation failed';
    console.error('[InvoiceNinja] Error:', err);
    return { success: false, error: msg };
  }
}

/**
 * Quick helper: Create invoice for a consignment booking
 */
export async function createConsignmentInvoice(params: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  lrNumber: string;
  serviceType: string;
  amount: number;           // In INR
  origin: string;
  destination: string;
}): Promise<InvoiceResult> {
  return createInvoice({
    customerName: params.customerName,
    customerEmail: params.customerEmail,
    customerPhone: params.customerPhone,
    customerAddress: params.customerAddress,
    lrNumber: params.lrNumber,
    items: [
      {
        product_key: params.serviceType,
        notes: `Relocation service from ${params.origin} to ${params.destination}\nLR Number: ${params.lrNumber}`,
        cost: params.amount,
        quantity: 1,
        tax_name1: 'GST',
        tax_rate1: 18,
      },
    ],
    notes: `Thank you for booking with Panya Global Relocation!\nYour LR Number: ${params.lrNumber}`,
  });
}

/**
 * Send invoice to customer via Invoice Ninja's built-in email
 */
export async function sendInvoiceEmail(invoiceId: string): Promise<boolean> {
  if (!IN_URL || !IN_TOKEN || !invoiceId) return false;
  try {
    const res = await fetch(`${IN_URL}/api/v1/emails`, {
      method: 'POST',
      headers: { 'X-API-TOKEN': IN_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity: 'invoice', entity_id: invoiceId, template: 'email_template_invoice' }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
