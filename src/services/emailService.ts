import { toast } from '@/hooks/use-toast';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface TestEmailData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

class EmailService {
  private readonly API_BASE = 'https://api.brevo.com/v3';
  private readonly API_KEY = import.meta.env.VITE_BREVO_API_KEY || '';
  
  // Free alternative email service
  private readonly FREE_EMAIL_API = 'https://formsubmit.co/ajax';

  /**
   * Send email using Brevo (Sendinblue) API
   */
  async sendEmail(data: EmailData): Promise<boolean> {
    if (!this.API_KEY) {
      console.warn('Brevo API key not configured, using fallback email service');
      return this.sendEmailFallback(data);
    }

    try {
      const response = await fetch(`${this.API_BASE}/smtp/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.API_KEY,
        },
        body: JSON.stringify({
          sender: {
            email: 'noreply@panyaglobal.in',
            name: 'Panya Global Relocation'
          },
          to: [{ email: data.to }],
          subject: data.subject,
          htmlContent: data.html,
          textContent: data.text || this.htmlToText(data.html)
        })
      });

      if (!response.ok) {
        throw new Error(`Email API error: ${response.status}`);
      }

      const result = await response.json();
// console.log removed by production cleanup
      return true;
    } catch (error: unknown) {
      console.error('Failed to send email via Brevo:', error);
      return this.sendEmailFallback(data);
    }
  }

  /**
   * Fallback email service using FormSubmit (free)
   */
  async sendEmailFallback(data: EmailData): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append('_form', 'panyaglobal-contact');
      formData.append('_captcha', 'false');
      formData.append('_autoresponse', 'Thank you for contacting Panya Global Relocation!');
      formData.append('to', data.to);
      formData.append('subject', data.subject);
      formData.append('message', data.html);
      formData.append('_template', 'table');

      const response = await fetch(`${this.FREE_EMAIL_API}/panyaglobal.in`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
// console.log removed by production cleanup
        return true;
      } else {
        throw new Error(`Fallback email service error: ${response.status}`);
      }
    } catch (error: unknown) {
      console.error('Failed to send email via fallback:', error);
      return false;
    }
  }

  /**
   * Send test email with sample data
   */
  async sendTestEmail(data: TestEmailData): Promise<boolean> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Email - Panya Global Relocation</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #3b82f6; margin-bottom: 10px; }
          .content { margin-bottom: 30px; }
          .highlight { background: #f8fafc; padding: 20px; border-left: 4px solid #3b82f6; margin: 20px 0; }
          .details { background: #f8fafc; padding: 20px; border-radius: 4px; margin: 20px 0; }
          .detail-item { margin-bottom: 10px; }
          .label { font-weight: bold; color: #666; }
          .value { color: #333; margin-left: 5px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
          .btn { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          .btn:hover { background: #2563eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🚀 Panya Global Relocation</div>
            <h2>Test Email Successfully Sent!</h2>
          </div>
          
          <div class="content">
            <p>Dear <strong>${data.name}</strong>,</p>
            
            <p>Thank you for testing our email system! This email confirms that our contact form and email functionality are working correctly.</p>
            
            <div class="highlight">
              <h3>📧 Test Details</h3>
              <p><strong>Form submitted successfully</strong> at <span style="color: #3b82f6;">${new Date().toLocaleString()}</span></p>
            </div>
            
            <div class="details">
              <h3>📋 Submitted Information:</h3>
              <div class="detail-item">
                <span class="label">Name:</span>
                <span class="value">${data.name}</span>
              </div>
              <div class="detail-item">
                <span class="label">Email:</span>
                <span class="value">${data.email}</span>
              </div>
              <div class="detail-item">
                <span class="label">Phone:</span>
                <span class="value">${data.phone}</span>
              </div>
              <div class="detail-item">
                <span class="label">Message:</span>
                <span class="value">${data.message}</span>
              </div>
            </div>
            
            <div class="highlight">
              <h3>✅ What's Working:</h3>
              <ul>
                <li>Email sending functionality</li>
                <li>Form data processing</li>
                <li>HTML email formatting</li>
                <li>Mobile-responsive design</li>
                <li>Contact form integration</li>
              </ul>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>✅ Test the contact form on your website</li>
              <li>✅ Verify email delivery to ${data.email}</li>
              <li>✅ Check spam folder if not in inbox</li>
              <li>✅ Test with different email providers</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="mailto:${data.email}" class="btn">Reply to This Email</a>
            <a href="https://www.panyaglobal.in" class="btn" style="background: #10b981;">Visit Our Website</a>
          </div>
          
          <div class="footer">
            <p><strong>Panya Global Relocation Pvt. Ltd.</strong></p>
            <p>Since 2010 • ISO 9001:2015, 14001:2015, 45001:2018 Certified</p>
            <p>📞 +91 8800446447 | 📧 info@panyaglobal.in</p>
            <p style="margin-top: 15px; font-size: 11px; color: #999;">
              This is a test email. If you received this by mistake, please ignore it.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await this.sendEmail({
      to: data.email,
      subject: `🚀 Test Email - Panya Global Relocation (${new Date().toLocaleDateString()})`,
      html: htmlContent,
      text: `Test email sent to ${data.email} at ${new Date().toLocaleString()}`
    });

    if (result) {
      toast({
        title: "✅ Test Email Sent!",
        description: `A test email has been sent to ${data.email}. Please check your inbox (and spam folder).`,
        duration: 5000,
      });
    } else {
      toast({
        title: "❌ Email Failed",
        description: "Unable to send test email. Please check your email configuration.",
        variant: "destructive",
        duration: 5000,
      });
    }

    return result;
  }

  /**
   * Send contact form email
   */
  async sendContactEmail(data: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }): Promise<boolean> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #3b82f6; margin-bottom: 10px; }
          .content { margin-bottom: 30px; }
          .details { background: #f8fafc; padding: 20px; border-radius: 4px; margin: 20px 0; }
          .detail-item { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
          .detail-item:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #666; display: block; margin-bottom: 5px; }
          .value { color: #333; font-size: 16px; }
          .urgent { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">📞 New Contact Form Submission</div>
            <h2>${data.subject}</h2>
          </div>
          
          <div class="content">
            <p><strong>New message received at:</strong> ${new Date().toLocaleString()}</p>
            
            <div class="details">
              <div class="detail-item">
                <span class="label">👤 Customer Name</span>
                <span class="value">${data.name}</span>
              </div>
              <div class="detail-item">
                <span class="label">📧 Email Address</span>
                <span class="value"><a href="mailto:${data.email}">${data.email}</a></span>
              </div>
              <div class="detail-item">
                <span class="label">📱 Phone Number</span>
                <span class="value"><a href="tel:${data.phone}">${data.phone}</a></span>
              </div>
              <div class="detail-item">
                <span class="label">📝 Subject</span>
                <span class="value">${data.subject}</span>
              </div>
              <div class="detail-item">
                <span class="label">💬 Message</span>
                <span class="value">${data.message}</span>
              </div>
            </div>
            
            <div class="urgent">
              <h3 style="margin-top: 0; color: #ef4444;">⚡ Action Required</h3>
              <p>Please respond to this inquiry within 24 hours for best customer service.</p>
              <p><strong>Recommended Actions:</strong></p>
              <ul>
                <li>Reply to ${data.email} with acknowledgment</li>
                <li>Call ${data.phone} to discuss requirements</li>
                <li>Prepare quote based on inquiry details</li>
                <li>Follow up within 24 hours</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Panya Global Relocation Pvt. Ltd.</strong></p>
            <p>Since 2010 • ISO 9001:2015, 14001:2015, 45001:2018 Certified</p>
            <p>📞 +91 8800446447 | 📧 info@panyaglobal.in</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to admin
    const adminResult = await this.sendEmail({
      to: 'vishnu.kumar@panyaglobal.in',
      subject: `📞 New Contact: ${data.subject} - ${data.name}`,
      html: htmlContent,
    });

    // Send acknowledgment to customer
    const customerHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You - Panya Global Relocation</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #3b82f6; margin-bottom: 10px; }
          .success { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0; }
          .steps { background: #f8fafc; padding: 20px; border-radius: 4px; margin: 20px 0; }
          .step { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
          .step:last-child { border-bottom: none; }
          .step-number { background: #3b82f6; color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 10px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">✅ Thank You!</div>
            <h2>We've Received Your Message</h2>
          </div>
          
          <div class="success">
            <h3>📧 Message Successfully Sent</h3>
            <p>Dear <strong>${data.name}</strong>,</p>
            <p>Thank you for contacting Panya Global Relocation! We've received your message and will get back to you within 24 hours.</p>
          </div>
          
          <div class="steps">
            <h3>📋 What Happens Next:</h3>
            <div class="step">
              <span class="step-number">1</span>
              <strong>Immediate Acknowledgment</strong><br>
              You've received this confirmation email
            </div>
            <div class="step">
              <span class="step-number">2</span>
              <strong>Team Review</strong><br>
              Our team will review your inquiry within 2 hours
            </div>
            <div class="step">
              <span class="step-number">3</span>
              <strong>Personalized Response</strong><br>
              You'll receive a detailed response within 24 hours
            </div>
            <div class="step">
              <span class="step-number">4</span>
              <strong>Free Quote</strong><br>
              We'll provide a personalized quote based on your needs
            </div>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #d97706;">⚡ Need Immediate Assistance?</h3>
            <p><strong>Call us directly:</strong> <a href="tel:+918800446447">+91 8800446447</a></p>
            <p><strong>Business Hours:</strong> Monday-Saturday, 9 AM - 6 PM IST</p>
          </div>
          
          <div class="footer">
            <p><strong>Panya Global Relocation Pvt. Ltd.</strong></p>
            <p>Since 2010 • ISO 9001:2015, 14001:2015, 45001:2018 Certified</p>
            <p>📞 +91 8800446447 | 📧 info@panyaglobal.in</p>
            <p style="margin-top: 15px; font-size: 11px; color: #999;">
              We look forward to helping you with your relocation needs!
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const customerResult = await this.sendEmail({
      to: data.email,
      subject: `✅ Thank You for Contacting Panya Global Relocation!`,
      html: customerHtml,
    });

    return adminResult && customerResult;
  }

  /**
   * Convert HTML to plain text
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Test email configuration
   */
  async testConfiguration(): Promise<boolean> {
    try {
      // Test with a simple API call or configuration check
      if (!this.API_KEY && !import.meta.env.VITE_BREVO_API_KEY) {
        console.warn('No email API key configured');
        return false;
      }
      return true;
    } catch (error: unknown) {
      console.error('Email configuration test failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();