/**
 * WhatsApp Notification Service — Panya Global
 * ─────────────────────────────────────────────
 * Uses Meta WhatsApp Business Cloud API (1000 free conversations/month)
 * Fallback: wa.me links for manual triggers
 *
 * Setup Steps:
 * 1. Go to https://developers.facebook.com/
 * 2. Create App → WhatsApp → Add number
 * 3. Get Phone Number ID + Access Token
 * 4. Add to .env:
 *    VITE_WHATSAPP_PHONE_ID=your_phone_number_id
 *    VITE_WHATSAPP_TOKEN=your_access_token
 *
 * For FREE testing right now:
 * Uses Supabase Edge Function to keep token server-side (safe)
 */

// Supabase removed

// ─── Types ────────────────────────────────────────────────────
export interface WhatsAppMessage {
  to: string;           // Phone number with country code: 918800446447
  template?: string;   // Template name (for Business API)
  message?: string;    // Free-form text (for testing)
  variables?: string[]; // Template variables
}

export interface ConsignmentNotification {
  customerPhone: string;
  customerName: string;
  lrNumber: string;
  status: string;
  fromCity: string;
  toCity: string;
  estimatedDelivery?: string;
}

export interface QuoteNotification {
  adminPhone: string;
  customerName: string;
  customerPhone: string;
  fromCity: string;
  toCity: string;
  moveType: string;
  referenceNumber: string;
}

// ─── Status Messages ──────────────────────────────────────────
const STATUS_MESSAGES: Record<string, string> = {
  booked: '📦 Your shipment has been booked successfully!',
  picked_up: '🚛 Great news! Our team has picked up your items.',
  in_transit: '🛣️ Your shipment is on the move!',
  out_for_delivery: '📍 Your shipment is out for delivery! Expect it today.',
  delivered: '✅ Your shipment has been delivered successfully!',
  cancelled: '❌ Your shipment has been cancelled.',
};

// ─── WhatsApp Service ─────────────────────────────────────────
class WhatsAppService {
  private readonly phoneId = import.meta.env.VITE_WHATSAPP_PHONE_ID || '';
  private readonly token = import.meta.env.VITE_WHATSAPP_TOKEN || '';
  private readonly apiVersion = 'v18.0';
  private readonly apiBase = `https://graph.facebook.com/${this.apiVersion}`;

  /**
   * Format phone number to international format
   * 9876543210 → 919876543210
   */
  formatPhone(phone: string): string {
    const clean = phone.replace(/\D/g, '');
    if (clean.startsWith('91') && clean.length === 12) return clean;
    if (clean.length === 10) return `91${clean}`;
    return clean;
  }

  /**
   * Generate WhatsApp direct link (no API needed)
   * Use this as a fallback / manual trigger
   */
  getDirectLink(phone: string, message: string): string {
    const formatted = this.formatPhone(phone);
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${formatted}?text=${encoded}`;
  }

  /**
   * Send message via Meta WhatsApp Cloud API
   * Requires: VITE_WHATSAPP_PHONE_ID + VITE_WHATSAPP_TOKEN
   */
  async sendMessage(msg: WhatsAppMessage): Promise<{ success: boolean; error?: string }> {
    if (!this.phoneId || !this.token) {
      console.warn('[WhatsApp] API credentials not configured. Use getDirectLink() instead.');
      return { success: false, error: 'WhatsApp API not configured' };
    }

    try {
      const body = msg.template
        ? {
            messaging_product: 'whatsapp',
            to: this.formatPhone(msg.to),
            type: 'template',
            template: {
              name: msg.template,
              language: { code: 'en' },
              components: msg.variables?.length
                ? [{ type: 'body', parameters: msg.variables.map(v => ({ type: 'text', text: v })) }]
                : [],
            },
          }
        : {
            messaging_product: 'whatsapp',
            to: this.formatPhone(msg.to),
            type: 'text',
            text: { body: msg.message || '' },
          };

      const res = await fetch(`${this.apiBase}/${this.phoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'WhatsApp API error');
      }

      return { success: true };
    } catch (err: unknown) {
      console.error('[WhatsApp] Error:', err);
      return { success: false, error: err.message };
    }
  }

  // ─── Notification Templates ─────────────────────────────────

  /**
   * Notify customer when consignment status changes
   */
  async notifyConsignmentStatus(data: ConsignmentNotification): Promise<void> {
    const statusMsg = STATUS_MESSAGES[data.status] || `Status updated to: ${data.status}`;
    
    const message = `🚛 *Panya Global Relocation*
━━━━━━━━━━━━━━━━━━
Hello ${data.customerName}! 👋

${statusMsg}

📋 *LR Number:* ${data.lrNumber}
📍 *Route:* ${data.fromCity} → ${data.toCity}
${data.estimatedDelivery ? `📅 *Est. Delivery:* ${data.estimatedDelivery}` : ''}

🔍 *Track your shipment:*
https://panyaglobal.in/track-shipment?lr=${data.lrNumber}

Need help? Call us: +91 8800446447
━━━━━━━━━━━━━━━━━━`;

    await this.sendMessage({ to: data.customerPhone, message });
  }

  /**
   * Notify admin when new quote is submitted
   */
  async notifyAdminNewQuote(data: QuoteNotification): Promise<void> {
    const message = `🔔 *New Quote Request!*
━━━━━━━━━━━━━━━━━━
👤 *Name:* ${data.customerName}
📱 *Phone:* ${data.customerPhone}
📦 *Move:* ${data.fromCity} → ${data.toCity}
🏷️ *Type:* ${data.moveType}
🔖 *Ref:* ${data.referenceNumber}

🔗 View in Admin:
https://panyaglobal.in/admin
━━━━━━━━━━━━━━━━━━`;

    await this.sendMessage({ to: data.adminPhone, message });
  }

  /**
   * Send quote confirmation to customer
   */
  async confirmQuoteToCustomer(params: {
    phone: string;
    name: string;
    referenceNumber: string;
    fromCity: string;
    toCity: string;
  }): Promise<void> {
    const message = `✅ *Quote Request Received!*
━━━━━━━━━━━━━━━━━━
Dear ${params.name},

Thank you for choosing Panya Global Relocation! 🙏

📋 *Reference:* ${params.referenceNumber}
📍 *Route:* ${params.fromCity} → ${params.toCity}

Our team will contact you within *2 hours* with a detailed quote.

🔍 *Track your request:*
https://panyaglobal.in/track-quote?ref=${params.referenceNumber}

📞 *Immediate help:*
+91 8800446447

Panya Global Relocation — Trusted Since 2010 ⭐
━━━━━━━━━━━━━━━━━━`;

    await this.sendMessage({ to: params.phone, message });
  }

  /**
   * Send delivery confirmation to customer
   */
  async confirmDelivery(params: {
    phone: string;
    name: string;
    lrNumber: string;
  }): Promise<void> {
    const message = `🎉 *Delivery Completed!*
━━━━━━━━━━━━━━━━━━
Dear ${params.name},

Your shipment (${params.lrNumber}) has been *successfully delivered*! ✅

We hope you're happy with our service. 😊

⭐ *Leave a review:*
https://panyaglobal.in/reviews

📞 Any feedback? Call: +91 8800446447

Thank you for choosing Panya Global!
━━━━━━━━━━━━━━━━━━`;

    await this.sendMessage({ to: params.phone, message });
  }
}

// ─── Singleton export ─────────────────────────────────────────
export const whatsappService = new WhatsAppService();

// ─── Convenience function: Get WA chat link for support button ─
export const getWhatsAppSupportLink = (message?: string) => {
  const defaultMsg = 'Hello! I need help with my shipment.';
  return `https://wa.me/918800446447?text=${encodeURIComponent(message || defaultMsg)}`;
};
