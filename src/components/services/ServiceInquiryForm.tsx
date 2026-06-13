import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Send, User, Mail, Phone, Calendar, MessageSquare, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

import { z } from "zod";

interface FormField {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "select" | "textarea" | "date";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

interface ServiceInquiryFormProps {
  serviceName: string;
  serviceType: string;
  fields: FormField[];
  additionalInfo?: string[];
}

// Validation schema
const baseSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().max(20, "Phone must be less than 20 characters").optional(),
});

const ServiceInquiryForm = ({ serviceName, serviceType, fields, additionalInfo }: ServiceInquiryFormProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const { toast } = useToast();

  const handleChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate base fields
      const baseData = {
        name: formData.name || "",
        email: formData.email || "",
        phone: formData.phone || "",
      };

      const validationResult = baseSchema.safeParse(baseData);
      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare form data (excluding base fields)
      const additionalFormData = { ...formData };
      delete additionalFormData.name;
      delete additionalFormData.email;
      delete additionalFormData.phone;

      // Make API call to the PHP backend
      const res = await fetch("/api/service-inquiries/submit.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_name: serviceName,
          service_type: serviceType,
          name: baseData.name,
          email: baseData.email,
          phone: baseData.phone || null,
          form_data: additionalFormData,
        }),
      });

      const json = await res.json();
      
      if (!res.ok || !json.success) {
        console.error("API error:", json);
        throw new Error(json.message || "Failed to submit inquiry. Please try again.");
      }

      const refNumber = json.data?.reference_number;
      if (!refNumber) {
        throw new Error("Failed to generate reference number.");
      }
      setReferenceNumber(refNumber);

      // Email notification is handled server-side by PHP API

      setIsSubmitted(true);
      toast({
        title: "Inquiry Submitted!",
        description: `Your reference number is ${refNumber}. We'll contact you within 24 hours.`,
      });
    } catch (error: unknown) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "email":
        return Mail;
      case "tel":
        return Phone;
      case "date":
        return Calendar;
      case "textarea":
        return MessageSquare;
      default:
        return User;
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl border border-border p-8 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-secondary" />
        </div>
        <h3 className="font-heading text-2xl font-bold text-foreground mb-4">Thank You!</h3>
        <p className="text-muted-foreground mb-4">
          Your inquiry for {serviceName} has been submitted successfully.
        </p>
        <div className="bg-muted/30 rounded-xl p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-1">Your Reference Number</p>
          <p className="text-2xl font-bold text-secondary">{referenceNumber}</p>
          <p className="text-xs text-muted-foreground mt-2">Please save this for future reference</p>
        </div>
        <Link 
          to="/track-inquiry" 
          className="inline-flex items-center gap-2 text-secondary hover:underline mb-4"
        >
          <ExternalLink className="w-4 h-4" />
          Track your inquiry status
        </Link>
        <p className="text-muted-foreground mb-6">
          Our team will contact you within 24 hours.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setIsSubmitted(false);
            setFormData({});
            setReferenceNumber("");
          }}
        >
          Submit Another Inquiry
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-card rounded-2xl border border-border p-6 md:p-8"
    >
      <div className="mb-6">
        <h3 className="font-heading text-xl font-bold text-foreground mb-2">
          Inquire About {serviceName}
        </h3>
        <p className="text-sm text-muted-foreground">
          Fill out the form below and our {serviceType} specialists will get in touch.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fields.map((field) => {
            const Icon = getIcon(field.type);

            if (field.type === "textarea") {
              return (
                <div key={field.id} className="md:col-span-2 space-y-2">
                  <Label htmlFor={field.id} className="text-sm font-medium">
                    {field.label} {field.required && <span className="text-destructive">*</span>}
                  </Label>
                  <div className="relative">
                    <Textarea
                      id={field.id}
                      placeholder={field.placeholder}
                      required={field.required}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="min-h-[100px] resize-none"
                      maxLength={2000}
                    />
                  </div>
                </div>
              );
            }

            if (field.type === "select" && field.options) {
              return (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id} className="text-sm font-medium">
                    {field.label} {field.required && <span className="text-destructive">*</span>}
                  </Label>
                  <Select
                    value={formData[field.id] || ""}
                    onValueChange={(value) => handleChange(field.id, value)}
                    required={field.required}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder || "Select an option"} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            }

            return (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id} className="text-sm font-medium">
                  {field.label} {field.required && <span className="text-destructive">*</span>}
                </Label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                    required={field.required}
                    value={formData[field.id] || ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="pl-10"
                    maxLength={field.type === "email" ? 255 : field.type === "tel" ? 20 : 200}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {additionalInfo && additionalInfo.length > 0 && (
          <div className="bg-muted/30 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-foreground mb-2">What we'll help you with:</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {additionalInfo.map((info, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                  {info}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button type="submit" size="lg" className="w-full gap-2" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Inquiry
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
};

export default ServiceInquiryForm;
