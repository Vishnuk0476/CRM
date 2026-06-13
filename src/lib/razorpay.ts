/**
 * Razorpay Payment Integration — Panya Global
 * ─────────────────────────────────────────────
 * Supports: UPI, Cards, Net Banking, Wallets, EMI
 *
 * Setup:
 * 1. Sign up at razorpay.com (free account)
 * 2. Get Key ID + Key Secret from Dashboard → Settings → API Keys
 * 3. Add to .env:
 *    VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx  (test) or rzp_live_xxxxx (production)
 *
 * Note: Key Secret is server-side only. For order creation,
 * we use Supabase Edge Function (coming soon) or direct checkout.
 */

// ─── Types ────────────────────────────────────────────────────
export interface RazorpayOptions {
  amount: number;         // In PAISE (₹1 = 100 paise)
  currency?: string;      // 'INR' default
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: { color?: string };
  orderId?: string;       // From server (optional for basic integration)
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
}

// ─── Load Razorpay Script ─────────────────────────────────────
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// ─── Razorpay Service ─────────────────────────────────────────
class RazorpayService {
  private readonly keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

  /**
   * Open Razorpay Payment Modal
   * Handles the full checkout flow
   */
  async openCheckout(options: RazorpayOptions): Promise<PaymentResult> {
    if (!this.keyId) {
      console.error('[Razorpay] VITE_RAZORPAY_KEY_ID not set in .env');
      return { success: false, error: 'Payment gateway not configured.' };
    }

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      return { success: false, error: 'Failed to load payment gateway. Check your internet connection.' };
    }

    return new Promise((resolve) => {
      const rzp = new (window as any).Razorpay({
        key: this.keyId,
        amount: options.amount,
        currency: options.currency || 'INR',
        name: options.name || 'Panya Global Relocation',
        description: options.description || 'Relocation Service Payment',
        image: 'https://panyaglobal.in/assets/logo-black.webp',
        order_id: options.orderId,
        prefill: {
          name: options.prefill?.name || '',
          email: options.prefill?.email || '',
          contact: options.prefill?.contact || '',
        },
        notes: options.notes || {},
        theme: {
          color: options.theme?.color || '#EF4444', // Panya Global red
        },
        modal: {
          ondismiss: () => resolve({ success: false, error: 'Payment cancelled by user.' }),
        },
        handler: (response: unknown) => {
          resolve({
            success: true,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
          });
        },
      });

      rzp.on('payment.failed', (response: unknown) => {
        resolve({
          success: false,
          error: response.error?.description || 'Payment failed. Please try again.',
        });
      });

      rzp.open();
    });
  }

  /**
   * Quick payment for booking deposit
   */
  async payBookingDeposit(params: {
    amount: number;          // In ₹ (will be converted to paise)
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    lrNumber?: string;
    referenceNumber?: string;
  }): Promise<PaymentResult> {
    return this.openCheckout({
      amount: params.amount * 100, // Convert ₹ to paise
      description: params.lrNumber
        ? `Booking deposit for LR: ${params.lrNumber}`
        : `Payment for Ref: ${params.referenceNumber}`,
      prefill: {
        name: params.customerName,
        email: params.customerEmail,
        contact: params.customerPhone,
      },
      notes: {
        lr_number: params.lrNumber || '',
        reference: params.referenceNumber || '',
        customer: params.customerName,
      },
    });
  }

  /**
   * Full payment for service
   */
  async payServiceFull(params: {
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    serviceType: string;
    invoiceNumber?: string;
  }): Promise<PaymentResult> {
    return this.openCheckout({
      amount: params.amount * 100,
      description: `${params.serviceType} — ${params.invoiceNumber || 'Panya Global'}`,
      prefill: {
        name: params.customerName,
        email: params.customerEmail,
        contact: params.customerPhone,
      },
      notes: {
        service: params.serviceType,
        invoice: params.invoiceNumber || '',
      },
    });
  }

  /**
   * Format amount display
   */
  formatAmount(amountInPaise: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amountInPaise / 100);
  }
}

// ─── Singleton export ─────────────────────────────────────────
export const razorpayService = new RazorpayService();

// ─── React Hook ───────────────────────────────────────────────
import { useState } from 'react';

export function useRazorpay() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

  const initiatePayment = async (options: RazorpayOptions): Promise<PaymentResult> => {
    setIsProcessing(true);
    setPaymentResult(null);
    try {
      const result = await razorpayService.openCheckout(options);
      setPaymentResult(result);
      return result;
    } finally {
      setIsProcessing(false);
    }
  };

  const payDeposit = async (params: Parameters<typeof razorpayService.payBookingDeposit>[0]) => {
    setIsProcessing(true);
    try {
      const result = await razorpayService.payBookingDeposit(params);
      setPaymentResult(result);
      return result;
    } finally {
      setIsProcessing(false);
    }
  };

  return { initiatePayment, payDeposit, isProcessing, paymentResult };
}
