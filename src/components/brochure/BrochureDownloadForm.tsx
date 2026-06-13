import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, User, Mail, Phone, Building,
  Loader2, CheckCircle, RefreshCw, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Props {
  isOpen: boolean;
  onClose: () => void;
  brochureTitle: string;
  brochureLink: string;
}

// ── Math captcha ───────────────────────────────────────────────────────────────
const generateCaptcha = () => {
  const a   = Math.floor(Math.random() * 10) + 1;
  const b   = Math.floor(Math.random() * 10) + 1;
  const ops = ['+', '-', '×'] as const;
  const op  = ops[Math.floor(Math.random() * 3)];
  let ans: number;
  if (op === '+')      { ans = a + b; return { question: `${a} + ${b}`, answer: String(ans) }; }
  else if (op === '-') { ans = Math.max(a,b) - Math.min(a,b); return { question: `${Math.max(a,b)} - ${Math.min(a,b)}`, answer: String(ans) }; }
  else                 { ans = a * b; return { question: `${a} × ${b}`, answer: String(ans) }; }
};

// ── Validation schema ──────────────────────────────────────────────────────────
const schema = z.object({
  name:    z.string().min(2, "Name must be at least 2 characters").max(100),
  email:   z.string().email("Please enter a valid email").max(255),
  phone:   z.string().min(10, "Phone must be at least 10 digits").max(20),
  company: z.string().max(100).optional(),
});

// ── Component ─────────────────────────────────────────────────────────────────
export const BrochureDownloadForm = ({ isOpen, onClose, brochureTitle, brochureLink }: Props) => {
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess,    setIsSuccess]    = useState(false);
  const [captcha,      setCaptcha]      = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [errors,       setErrors]       = useState<Record<string, string>>({});
  const [formData,     setFormData]     = useState({ name: "", email: "", phone: "", company: "" });

  // Reset when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: "", email: "", phone: "", company: "" });
      setCaptchaInput(""); setCaptcha(generateCaptcha());
      setErrors({}); setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const refreshCaptcha = () => { setCaptcha(generateCaptcha()); setCaptchaInput(""); };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation
    const result = schema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(err => { if (err.path[0]) newErrors[err.path[0] as string] = err.message; });
      setErrors(newErrors);
      return;
    }

    // Captcha check
    if (captchaInput.trim() !== captcha.answer) {
      setErrors({ captcha: "Incorrect answer. Please try again." });
      refreshCaptcha();
      return;
    }

    setIsSubmitting(true);
    try {
      const res  = await fetch("/api/brochure-downloads/submit.php", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:    formData.name.trim(),
          email:   formData.email.trim().toLowerCase(),
          phone:   formData.phone.trim(),
          company: formData.company?.trim() || null,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Submission failed.");

      // ✅ Success — trigger download
      setIsSuccess(true);
      setTimeout(() => {
        const link = document.createElement("a");
        link.href     = brochureLink;
        link.download = brochureTitle + ".pdf";
        link.target   = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 800);

      toast({ title: "Success!", description: "Your download will begin shortly." });

    } catch (err: unknown) {
      toast({ title: "Error", description: err.message || "Failed to process. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render (custom modal, no Dialog component needed) ──────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 26 } }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
          >
            {/* Header gradient */}
            <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-white text-lg leading-tight">Download Brochure</h2>
                  <p className="text-white/70 text-xs">{brochureTitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 transition-colors flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {isSuccess ? (
                /* ── Success state ── */
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-foreground mb-2">Thank You!</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Your download is starting…{" "}
                    <a href={brochureLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                      Click here
                    </a>{" "}
                    if it doesn't begin automatically.
                  </p>
                  <Button onClick={onClose} variant="outline" className="px-8">Close</Button>
                </motion.div>
              ) : (
                /* ── Form state ── */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Please fill in your details to access the download.
                  </p>

                  {/* Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="flex items-center gap-1.5 text-sm">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input id="name" name="name" value={formData.name}
                      onChange={handleChange} placeholder="Enter your full name" autoFocus />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="flex items-center gap-1.5 text-sm">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <Input id="email" name="email" type="email" value={formData.email}
                      onChange={handleChange} placeholder="Enter your email address" />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="flex items-center gap-1.5 text-sm">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone}
                      onChange={handleChange} placeholder="Enter your phone number" />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                  </div>

                  {/* Company (Optional) */}
                  <div className="space-y-1.5">
                    <Label htmlFor="company" className="flex items-center gap-1.5 text-sm">
                      <Building className="w-3.5 h-3.5 text-muted-foreground" />
                      Company <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
                    </Label>
                    <Input id="company" name="company" value={formData.company}
                      onChange={handleChange} placeholder="Your company name" />
                  </div>

                  {/* Math CAPTCHA */}
                  <div className="space-y-1.5">
                    <Label className="flex items-center justify-between text-sm">
                      <span>Security Check <span className="text-destructive">*</span></span>
                      <button type="button" onClick={refreshCaptcha}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <RefreshCw className="w-3 h-3" /> New question
                      </button>
                    </Label>
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2.5 bg-muted/60 rounded-xl font-mono text-lg font-bold text-foreground select-none">
                        {captcha.question} = ?
                      </div>
                      <Input
                        id="captcha"
                        value={captchaInput}
                        onChange={e => { setCaptchaInput(e.target.value); if (errors.captcha) setErrors(p => ({ ...p, captcha: "" })); }}
                        placeholder="Answer"
                        className="w-24 text-center font-mono text-lg"
                        inputMode="numeric"
                      />
                    </div>
                    {errors.captcha && <p className="text-xs text-destructive">{errors.captcha}</p>}
                  </div>

                  {/* Submit */}
                  <Button type="submit" className="w-full gap-2 mt-2" disabled={isSubmitting} size="lg">
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                    ) : (
                      <><Download className="w-4 h-4" /> Download Brochure</>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center leading-relaxed">
                    By downloading you agree to receive updates. We respect your privacy.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
