import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Shield, CheckCircle, Phone, Mail, Building2, User, FileText, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";
import { useRazorpay } from "@/lib/razorpay";

const paymentMethods = [
  { id: "upi", name: "UPI / QR Code", icon: "📱", description: "Pay using any UPI app" },
  { id: "netbanking", name: "Net Banking", icon: "🏦", description: "All major banks supported" },
  { id: "card", name: "Credit/Debit Card", icon: "💳", description: "Visa, Mastercard, RuPay" },
  { id: "neft", name: "NEFT/RTGS", icon: "🏛️", description: "Direct bank transfer" },
];

const PayOnline = () => {
  const { toast } = useToast();
  const { initiatePayment, isProcessing } = useRazorpay();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    name: "",
    email: "",
    phone: "",
    amount: "",
    paymentMethod: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleMethodSelect = (methodId: string) => {
    setFormData((prev) => ({ ...prev, paymentMethod: methodId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.paymentMethod === "neft") {
      toast({
        title: "NEFT / RTGS Details Shown",
        description: "Please transfer the amount to the HDFC Bank account below and share the receipt with us on WhatsApp or Email.",
        duration: 8000,
      });
      setStep(3);
      return;
    }

    try {
      const amountInPaise = Math.round(parseFloat(formData.amount) * 100);
      if (isNaN(amountInPaise) || amountInPaise <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid payment amount.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Initializing Payment",
        description: "Opening secure checkout modal...",
      });

      const result = await initiatePayment({
        amount: amountInPaise,
        name: "Panya Global Relocation",
        description: `Payment for Invoice/Booking ${formData.invoiceNumber}`,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          invoice_number: formData.invoiceNumber,
          payment_method: formData.paymentMethod,
        },
      });

      if (result.success) {
        toast({
          title: "Payment Successful!",
          description: `Transaction ID: ${result.paymentId}. Thank you for your payment!`,
        });
        setStep(3);
      } else {
        toast({
          title: "Payment Failed",
          description: result.error || "Payment could not be completed.",
          variant: "destructive",
        });
      }
    } catch (err: unknown) {
      toast({
        title: "Payment Error",
        description: err.message || "An unexpected error occurred during payment.",
        variant: "destructive",
      });
    }
  };

  const canProceed = () => {
    if (step === 1) {
      return formData.invoiceNumber && formData.name && formData.email && formData.phone && formData.amount;
    }
    return formData.paymentMethod !== "";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-16 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-50" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-2 mb-6">
                <Shield className="w-4 h-4 text-secondary" />
                <span className="text-primary-foreground text-sm font-medium">Secure Payment Gateway</span>
              </div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
                Pay <span className="text-secondary">Online</span>
              </h1>
              <p className="text-lg text-primary-foreground/80">
                Make secure payments for your relocation services with multiple payment options
              </p>
            </motion.div>
          </div>
        </section>

        {/* Progress */}
        {step < 3 && (
          <section className="py-8 bg-background border-b border-border">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
                {[1, 2].map((s) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                        s === step
                          ? "bg-secondary text-secondary-foreground"
                          : s < step
                          ? "bg-secondary/20 text-secondary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s < step ? <CheckCircle className="w-5 h-5" /> : s}
                    </div>
                    {s < 2 && (
                      <div
                        className={`w-24 md:w-32 h-1 mx-2 rounded ${
                          s < step ? "bg-secondary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Step {step} of 2: {step === 1 ? "Payment Details" : "Payment Method"}
              </p>
            </div>
          </section>
        )}

        {/* Payment Form */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <motion.form
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="bg-card rounded-2xl p-8 shadow-lg border border-border"
              >
                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
                      Payment Details
                    </h2>
                    
                    <div>
                      <label htmlFor="invoiceNumber" className="block text-sm font-medium text-foreground mb-2">
                        <FileText className="w-4 h-4 inline mr-2" />
                        Invoice / Booking Number *
                      </label>
                      <Input
                        id="invoiceNumber"
                        name="invoiceNumber"
                        value={formData.invoiceNumber}
                        onChange={handleChange}
                        placeholder="e.g., INV-2025-001234"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                          Phone Number *
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 XXXXX XXXXX"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-2">
                        <IndianRupee className="w-4 h-4 inline mr-2" />
                        Amount (INR) *
                      </label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="Enter amount"
                        required
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
                      Select Payment Method
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => handleMethodSelect(method.id)}
                          className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                            formData.paymentMethod === method.id
                              ? "border-secondary bg-secondary/10"
                              : "border-border hover:border-secondary/50"
                          }`}
                        >
                          <span className="text-3xl mb-3 block">{method.icon}</span>
                          <span className="font-semibold text-foreground block">{method.name}</span>
                          <span className="text-sm text-muted-foreground">{method.description}</span>
                        </button>
                      ))}
                    </div>

                    {/* Bank Details for NEFT */}
                    {formData.paymentMethod === "neft" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-8 p-6 bg-muted/50 rounded-xl"
                      >
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Building2 className="w-5 h-5" />
                          Bank Details for NEFT/RTGS
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-muted-foreground">Account Name:</span> <span className="text-foreground font-medium">Panya Global Relocation Pvt. Ltd.</span></p>
                          <p><span className="text-muted-foreground">Bank:</span> <span className="text-foreground font-medium">HDFC Bank</span></p>
                          <p><span className="text-muted-foreground">Account No:</span> <span className="text-foreground font-medium">50200012345678</span></p>
                          <p><span className="text-muted-foreground">IFSC Code:</span> <span className="text-foreground font-medium">HDFC0001234</span></p>
                          <p><span className="text-muted-foreground">Branch:</span> <span className="text-foreground font-medium">Connaught Place, New Delhi</span></p>
                        </div>
                      </motion.div>
                    )}

                    {/* Payment Summary */}
                    <div className="mt-8 p-6 bg-secondary/5 rounded-xl border border-secondary/20">
                      <h3 className="font-semibold text-foreground mb-4">Payment Summary</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Invoice: {formData.invoiceNumber}</span>
                        <span className="text-2xl font-bold text-foreground">₹{formData.amount || "0"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="text-center py-8 space-y-6 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-2">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <h2 className="font-heading text-3xl font-bold text-foreground">
                      Payment {formData.paymentMethod === "neft" ? "Initiated" : "Successful"}!
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {formData.paymentMethod === "neft"
                        ? "Your manual bank transfer details are ready. Please transfer the funds using the details below and share the receipt."
                        : `Thank you, ${formData.name}. We have successfully received your payment of ₹${formData.amount} for Invoice/Booking ${formData.invoiceNumber}.`}
                    </p>
                    <div className="p-6 bg-muted/50 rounded-xl text-left max-w-sm mx-auto space-y-2 text-sm border border-border">
                      <p><span className="text-muted-foreground">Invoice/Booking:</span> <span className="font-semibold text-foreground">{formData.invoiceNumber}</span></p>
                      <p><span className="text-muted-foreground">Amount:</span> <span className="font-semibold text-foreground">₹{formData.amount}</span></p>
                      <p><span className="text-muted-foreground">Status:</span> <span className="font-semibold text-green-600">{formData.paymentMethod === "neft" ? "Awaiting Transfer" : "Paid ✓"}</span></p>
                    </div>
                    <div className="pt-4">
                      <Button type="button" onClick={() => {
                        setStep(1);
                        setFormData({
                          invoiceNumber: "",
                          name: "",
                          email: "",
                          phone: "",
                          amount: "",
                          paymentMethod: "",
                        });
                      }}>
                        Make Another Payment
                      </Button>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                {step < 3 && (
                  <div className="flex justify-between mt-8 pt-6 border-t border-border">
                    {step > 1 ? (
                      <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={isProcessing}>
                        Back
                      </Button>
                    ) : (
                      <div />
                    )}
                    
                    {step === 1 ? (
                      <Button
                        type="button"
                        onClick={() => setStep(2)}
                        disabled={!canProceed()}
                      >
                        Continue to Payment
                      </Button>
                    ) : (
                      <Button type="submit" disabled={!canProceed() || isProcessing} className="gap-2">
                        {isProcessing ? (
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                        Pay ₹{formData.amount || "0"}
                      </Button>
                    )}
                  </div>
                )}
              </motion.form>

              {/* Security Badge */}
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-secondary" />
                  <span>Secured by 256-bit SSL encryption</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Help */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
                Payment Issues?
              </h2>
              <p className="text-muted-foreground mb-6">
                Contact our accounts team for any payment-related queries.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="tel:+911142321118">
                  <Button variant="outline" className="gap-2">
                    <Phone className="w-4 h-4" />
                    +91 11 42321118
                  </Button>
                </a>
                <a href="mailto:accounts@panyaglobal.in">
                  <Button variant="outline" className="gap-2">
                    <Mail className="w-4 h-4" />
                    accounts@panyaglobal.in
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <CityWiseLinks />
      <Footer />
    </div>
  );
};

export default PayOnline;
