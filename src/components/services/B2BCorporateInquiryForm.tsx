import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Send, User, Mail, Phone, Building2, Users, MessageSquare, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

import { z } from "zod";

interface B2BCorporateInquiryFormProps {
  onSuccess?: () => void;
}

const serviceOptions = [
  { id: "packing_moving", label: "Packing & Moving", description: "Household goods shifting" },
  { id: "house_search", label: "House Search", description: "Rental & housing assistance" },
  { id: "school_search", label: "School Search", description: "School admission support" },
  { id: "car_rental", label: "Car Rental", description: "Short-term mobility solutions" },
  { id: "storage", label: "Storage Services", description: "Temporary storage solutions" },
  { id: "pet_relocation", label: "Pet Relocation", description: "Safe pet movement" },
  { id: "temporary_accommodation", label: "Temporary Accommodation", description: "Short-term housing" },
  { id: "settling_in", label: "Settling-In Services", description: "Utilities & registrations" },
  { id: "handyman", label: "Handyman Support", description: "Post-move home setup" },
  { id: "visa_immigration", label: "Visa & Immigration", description: "Work permit support" },
];

const industryOptions = [
  { value: "it_technology", label: "IT & Technology" },
  { value: "banking_finance", label: "Banking & Financial Services" },
  { value: "manufacturing", label: "Manufacturing & Industrial" },
  { value: "pharma_healthcare", label: "Pharma & Healthcare" },
  { value: "consulting", label: "Consulting & Professional Services" },
  { value: "ecommerce_logistics", label: "E-commerce & Logistics" },
  { value: "other", label: "Other" },
];

const employeeCountOptions = [
  { value: "1-10", label: "1-10 relocations/year" },
  { value: "11-50", label: "11-50 relocations/year" },
  { value: "51-100", label: "51-100 relocations/year" },
  { value: "100+", label: "100+ relocations/year" },
];

// Validation schema
const formSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().min(1, "Phone is required").max(20, "Phone must be less than 20 characters"),
  company: z.string().trim().min(1, "Company name is required").max(200, "Company name must be less than 200 characters"),
  designation: z.string().trim().max(100, "Designation must be less than 100 characters").optional(),
  industry: z.string().min(1, "Please select your industry"),
  employeeCount: z.string().min(1, "Please select relocation volume"),
  services: z.array(z.string()).min(1, "Please select at least one service"),
});

const B2BCorporateInquiryForm = ({ onSuccess }: B2BCorporateInquiryFormProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const { toast } = useToast();

  const handleChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    setSelectedServices((prev) =>
      checked ? [...prev, serviceId] : prev.filter((id) => id !== serviceId)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dataToValidate = {
        name: formData.name || "",
        email: formData.email || "",
        phone: formData.phone || "",
        company: formData.company || "",
        designation: formData.designation || "",
        industry: formData.industry || "",
        employeeCount: formData.employeeCount || "",
        services: selectedServices,
      };

      const validationResult = formSchema.safeParse(dataToValidate);
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

      // Get service labels for storage
      const selectedServiceLabels = serviceOptions
        .filter((s) => selectedServices.includes(s.id))
        .map((s) => s.label);

      // Prepare form data for database
      const additionalFormData = {
        company: formData.company,
        designation: formData.designation,
        industry: industryOptions.find((i) => i.value === formData.industry)?.label || formData.industry,
        employeeCount: formData.employeeCount,
        selectedServices: selectedServiceLabels,
      };

      // Insert via PHP API
      const res = await fetch("/api/service-inquiries/submit.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_name: "B2B Corporate Services",
          service_type: "corporate",
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          form_data: additionalFormData,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to submit inquiry. Please try again.");
      }

      const refNumber = json.data?.reference_number;
      if (!refNumber) {
        throw new Error("Failed to generate reference number.");
      }
      setReferenceNumber(refNumber);

      setIsSubmitted(true);
      toast({
        title: "Inquiry Submitted!",
        description: `Your reference number is ${refNumber}. Our corporate team will contact you within 24 hours.`,
      });
      onSuccess?.();
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
          Your B2B Corporate inquiry has been submitted successfully.
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
          Our corporate relocation team will contact you within 24 hours.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setIsSubmitted(false);
            setFormData({});
            setSelectedServices([]);
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
          Corporate Relocation Inquiry
        </h3>
        <p className="text-sm text-muted-foreground">
          Fill out the form below and our corporate mobility team will contact you within 24 hours.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                required
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                className="pl-10"
                maxLength={100}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Work Email <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                required
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                className="pl-10"
                maxLength={255}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                required
                value={formData.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="pl-10"
                maxLength={20}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium">
              Company Name <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="company"
                type="text"
                placeholder="Your company name"
                required
                value={formData.company || ""}
                onChange={(e) => handleChange("company", e.target.value)}
                className="pl-10"
                maxLength={200}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="designation" className="text-sm font-medium">
              Designation
            </Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="designation"
                type="text"
                placeholder="HR Manager, Admin, etc."
                value={formData.designation || ""}
                onChange={(e) => handleChange("designation", e.target.value)}
                className="pl-10"
                maxLength={100}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry" className="text-sm font-medium">
              Industry <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.industry || ""}
              onValueChange={(value) => handleChange("industry", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                {industryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="employeeCount" className="text-sm font-medium">
              Estimated Annual Relocations <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.employeeCount || ""}
              onValueChange={(value) => handleChange("employeeCount", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select relocation volume" />
              </SelectTrigger>
              <SelectContent>
                {employeeCountOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Services Selection */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">
            Services Required <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground">
            Select all the services you need for your employee relocations
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {serviceOptions.map((service) => (
              <div
                key={service.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedServices.includes(service.id)
                    ? "border-secondary bg-secondary/5"
                    : "border-border hover:border-secondary/50"
                }`}
                onClick={() =>
                  handleServiceToggle(service.id, !selectedServices.includes(service.id))
                }
              >
                <Checkbox
                  id={service.id}
                  checked={selectedServices.includes(service.id)}
                  onCheckedChange={(checked) => handleServiceToggle(service.id, !!checked)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <label
                    htmlFor={service.id}
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    {service.label}
                  </label>
                  <p className="text-xs text-muted-foreground">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium">
            Additional Requirements
          </Label>
          <div className="relative">
            <Textarea
              id="notes"
              placeholder="Tell us about your specific relocation needs, timelines, or any special requirements..."
              value={formData.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={2000}
            />
          </div>
        </div>

        {/* What you get */}
        <div className="bg-muted/30 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-foreground mb-2">What you'll get:</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "Dedicated Corporate Account Manager",
              "Volume-Based Pricing (Up to 40% discount)",
              "Priority Service Scheduling",
              "24/7 Emergency Support",
              "Customized SLA Agreements",
              "Quarterly Business Reviews",
            ].map((item, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Button type="submit" size="lg" className="w-full gap-2" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Corporate Inquiry
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
};

export default B2BCorporateInquiryForm;
