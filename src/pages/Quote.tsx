import { useState } from "react";
import { motion } from "framer-motion";
import {
  Truck,
  Car,
  MapPin,
  Calendar,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Home,
  Building2,
  Globe,
  Warehouse,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityWiseLinks from "@/components/layout/CityWiseLinks";

import { quoteFormSchema, QuoteFormData } from "@/lib/validations";
import { z } from "zod";
import { whatsappService } from "@/lib/whatsapp";


const serviceTypes = [
  { id: "local", icon: Truck, label: "Local Relocations", description: "Within city moves" },
  { id: "domestic", icon: MapPin, label: "Domestic Relocations", description: "Pan-India moves" },
  { id: "international", icon: Globe, label: "International Relocations", description: "Global moves" },
  { id: "workspace", icon: Building2, label: "Workspace Relocation", description: "Office & commercial moves" },
  { id: "vehicle", icon: Car, label: "Vehicle Transportation", description: "Car & bike transport" },
  { id: "storage", icon: Warehouse, label: "Storage Services", description: "Secure warehousing" },
];

const propertyTypes = [
  { id: "apartment", icon: Building2, label: "Apartment" },
  { id: "house", icon: Home, label: "House" },
  { id: "warehouse", icon: Warehouse, label: "Warehouse" },
];

const Quote = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<QuoteFormData>({
    serviceType: "",
    propertyType: "",
    fromAddress: "",
    fromPincode: "",
    toAddress: "",
    toPincode: "",
    moveDate: "",
    rooms: "",
    name: "",
    email: "",
    phone: "",
    additionalInfo: "",
    vehicleType: "",
    numberOfVehicles: "1",
    storageDuration: "",
    storageSize: "",
    internationalDestination: "",
    customsClearance: "yes",
    officeSize: "",
    employeeCount: "",
    insuranceRequired: "yes",
    packingMaterials: "standard",
  });

  const handleServiceSelect = (serviceId: string) => {
    setFormData((prev) => ({ ...prev, serviceType: serviceId }));
    setErrors((prev) => ({ ...prev, serviceType: "" }));
  };

  const handlePropertySelect = (propertyId: string) => {
    // Reset rooms selection when switching property types since the options might be different
    setFormData((prev) => ({ ...prev, propertyType: propertyId, rooms: "" }));
    setErrors((prev) => ({ ...prev, propertyType: "", rooms: "" }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePincodeChange = async (type: 'from' | 'to', val: string) => {
    setFormData((prev) => ({ ...prev, [`${type}Pincode`]: val }));
    
    if (val.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await res.json();
        
        if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const po = data[0].PostOffice[0];
          const addressString = `${po.Name}, ${po.District}, ${po.State}`;
          setFormData((prev) => ({ ...prev, [`${type}Address`]: addressString }));
          toast({
            title: "Address Auto-filled",
            description: `Fetched details for ${val}`,
          });
        }
      } catch (err: unknown) {
        console.error("Pincode fetch error:", err);
      }
    }
  };

  const validateStep = (currentStep: number): boolean => {
    let fieldsToValidate: (keyof QuoteFormData)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ["serviceType"];
    } else if (currentStep === 2) {
      if (formData.serviceType === "vehicle") {
        fieldsToValidate = ["vehicleType", "numberOfVehicles"];
      } else if (formData.serviceType === "storage") {
        fieldsToValidate = ["storageDuration", "storageSize"];
      } else if (formData.serviceType === "workspace") {
        fieldsToValidate = ["officeSize", "employeeCount"];
      } else {
        fieldsToValidate = ["propertyType", "rooms"];
      }
    } else if (currentStep === 3) {
      fieldsToValidate = ["fromAddress", "toAddress", "moveDate"];
    } else if (currentStep === 4) {
      fieldsToValidate = ["name", "email", "phone"];
    }

    const stepSchema = quoteFormSchema.pick(Object.fromEntries(fieldsToValidate.map((f) => [f, true])) as any);

    try {
      stepSchema.parse(formData);
      return true;
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const nextStep = () => {
    if (validateStep(step) && step < 4) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check all 4 steps to be sure
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
       toast({
         title: "Validation Error",
         description: "Please check the form for missed details",
         variant: "destructive",
       });
       return;
    }

    setIsSubmitting(true);

    try {
      // Map specialized service details cleanly into the classic backend struct so emails and DB don't fail
      let mappedPropertyType = formData.propertyType;
      let mappedRooms = formData.rooms;
      
      if (formData.serviceType === "vehicle") {
        mappedPropertyType = `Vehicle: ${formData.vehicleType || "Auto"}`;
        mappedRooms = formData.numberOfVehicles || "1";
      } else if (formData.serviceType === "storage") {
        mappedPropertyType = `Storage: ${formData.storageDuration || "Temp"}`;
        mappedRooms = formData.storageSize || "N/A";
      } else if (formData.serviceType === "workspace") {
        mappedPropertyType = `Workspace: ${formData.officeSize || "Office"}`;
        mappedRooms = formData.employeeCount || "N/A";
      } else if (!mappedPropertyType) {
        mappedPropertyType = "Apartment";
      }

      const res = await fetch("/api/quote-submissions/submit.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service_type: formData.serviceType,
          property_type: mappedPropertyType,
          from_address: `${formData.fromAddress} ${formData.fromPincode ? `(${formData.fromPincode})` : ''}`.trim(),
          to_address: `${formData.toAddress} ${formData.toPincode ? `(${formData.toPincode})` : ''}`.trim(),
          move_date: formData.moveDate,
          rooms: mappedRooms,
          additional_info: formData.additionalInfo || null,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Submission failed");
      const referenceNumber = json.data?.reference_number || "N/A";

      // Send WhatsApp notifications (fails silently or logs warning if credentials not set)
      try {
        await whatsappService.confirmQuoteToCustomer({
          phone: formData.phone,
          name: formData.name,
          referenceNumber: referenceNumber,
          fromCity: formData.fromAddress,
          toCity: formData.toAddress,
        });

        const adminPhone = import.meta.env.VITE_ADMIN_WHATSAPP_PHONE || "918800446447";
        await whatsappService.notifyAdminNewQuote({
          adminPhone,
          customerName: formData.name,
          customerPhone: formData.phone,
          fromCity: formData.fromAddress,
          toCity: formData.toAddress,
          moveType: formData.serviceType,
          referenceNumber: referenceNumber,
        });
      } catch (waError) {
        console.warn("WhatsApp notification error:", waError);
      }

      toast({
        title: "Quote Request Submitted!",
        description: `Your reference number is ${referenceNumber}. We'll contact you within 2 hours.`,
        duration: 10000,
      });

      // Reset
      setStep(1);
      setFormData({
        serviceType: "", propertyType: "", fromAddress: "", fromPincode: "", toAddress: "", toPincode: "", moveDate: "",
        rooms: "", name: "", email: "", phone: "", additionalInfo: "", vehicleType: "",
        numberOfVehicles: "1", storageDuration: "", storageSize: "", internationalDestination: "",
        customsClearance: "yes", officeSize: "", employeeCount: "", insuranceRequired: "yes", packingMaterials: "standard",
      });
      setErrors({});
    } catch (error: unknown) {
      console.error("Error submitting quote:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly at +91 11 42321118",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.serviceType !== "";
      case 2:
        if (formData.serviceType === "vehicle") return formData.vehicleType !== "" && formData.numberOfVehicles !== "";
        if (formData.serviceType === "storage") return formData.storageDuration !== "" && formData.storageSize !== "";
        if (formData.serviceType === "workspace") return formData.officeSize !== "" && formData.employeeCount !== "";
        return formData.propertyType !== "" && formData.rooms !== "";
      case 3:
        return formData.fromAddress !== "" && formData.toAddress !== "" && formData.moveDate !== "";
      case 4:
        return formData.name !== "" && formData.email !== "" && formData.phone !== "";
      default:
        return false;
    }
  };

  const renderError = (field: string) => {
    if (!errors[field]) return null;
    return (
      <p className="text-destructive text-xs mt-1 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {errors[field]}
      </p>
    );
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="pt-24 sm:pt-32 pb-8 sm:pb-12 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-50" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <span className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary-foreground/10 text-primary-foreground text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
                Free Quote
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-4 sm:mb-6">
                Get Your <span className="text-secondary">Free Quote</span>
              </h1>
              <p className="text-base sm:text-lg text-primary-foreground/80 px-4">
                Fill out the form below and receive a detailed quote within 2 hours.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Progress Steps */}
        <section className="py-4 sm:py-8 bg-background border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-2 sm:gap-4 max-w-2xl mx-auto">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold transition-colors text-sm sm:text-base ${
                      s === step
                        ? "bg-secondary text-secondary-foreground"
                        : s < step
                          ? "bg-secondary/20 text-secondary"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s < step ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : s}
                  </div>
                  {s < 4 && (
                    <div
                      className={`w-6 sm:w-12 md:w-24 h-1 mx-1 sm:mx-2 rounded ${
                        s < step ? "bg-secondary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-3 sm:mt-4">
              <span className="text-xs sm:text-sm text-muted-foreground text-center">
                Step {step} of 4:{" "}
                {step === 1
                  ? "Service Type"
                  : step === 2
                    ? (formData.serviceType === "vehicle" ? "Vehicle Details" : formData.serviceType === "storage" ? "Storage Details" : formData.serviceType === "workspace" ? "Office Details" : "Property Details")
                    : step === 3
                      ? "Move Details"
                      : "Contact Info"}
              </span>
            </div>
          </div>
        </section>

        {/* Form Steps */}
        <section className="py-8 sm:py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <motion.form
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-lg border border-border"
              >
                {/* Step 1: Service Type */}
                {step === 1 && (
                  <div>
                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                      What service do you need?
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                      {serviceTypes.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => handleServiceSelect(service.id)}
                          className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-1 sm:gap-2 ${
                            formData.serviceType === service.id
                              ? "border-secondary bg-secondary/10"
                              : "border-border hover:border-secondary/50"
                          }`}
                        >
                          <service.icon
                            className={`w-6 h-6 sm:w-8 sm:h-8 ${formData.serviceType === service.id ? "text-secondary" : "text-muted-foreground"}`}
                          />
                          <span className="font-semibold text-foreground text-xs sm:text-sm text-center">
                            {service.label}
                          </span>
                          <span className="text-muted-foreground text-xs text-center hidden sm:block">
                            {service.description}
                          </span>
                        </button>
                      ))}
                    </div>
                    {renderError("serviceType")}
                  </div>
                )}

                {/* Step 2: Adaptive/Dynamic Details */}
                {step === 2 && (
                  <div>
                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                       {formData.serviceType === "vehicle" ? "Tell us about your vehicle" 
                       : formData.serviceType === "storage" ? "Tell us about your storage needs"
                       : formData.serviceType === "workspace" ? "Tell us about your office"
                       : "Tell us about your property"}
                    </h2>
                    
                    {formData.serviceType === "vehicle" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="vehicleType" className="block text-sm font-medium text-foreground mb-2">
                            Vehicle Type
                          </label>
                          <select
                            id="vehicleType"
                            name="vehicleType"
                            value={formData.vehicleType}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                          >
                            <option value="">Select type</option>
                            <option value="car">Car</option>
                            <option value="suv">SUV / Truck</option>
                            <option value="bike">Bike / Motorcycle</option>
                            <option value="luxury">Luxury / Vintage</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="numberOfVehicles" className="block text-sm font-medium text-foreground mb-2">
                            Number of Vehicles
                          </label>
                          <select
                            id="numberOfVehicles"
                            name="numberOfVehicles"
                            value={formData.numberOfVehicles}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                          >
                            {[1, 2, 3, 4, 5].map((num) => (
                              <option key={num} value={num}>
                                {num} {num === 1 ? "Vehicle" : "Vehicles"}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : formData.serviceType === "storage" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="storageDuration" className="block text-sm font-medium text-foreground mb-2">
                            Storage Duration
                          </label>
                          <select
                            id="storageDuration"
                            name="storageDuration"
                            value={formData.storageDuration}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                          >
                            <option value="">Select duration</option>
                            <option value="1-month">1 Month</option>
                            <option value="3-months">3 Months</option>
                            <option value="6-months">6 Months</option>
                            <option value="1-year">1 Year</option>
                            <option value="long-term">Long Term</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="storageSize" className="block text-sm font-medium text-foreground mb-2">
                            Storage Size Needed
                          </label>
                          <select
                            id="storageSize"
                            name="storageSize"
                            value={formData.storageSize}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                          >
                            <option value="">Select size</option>
                            <option value="small">Small (50-100 sq ft)</option>
                            <option value="medium">Medium (100-200 sq ft)</option>
                            <option value="large">Large (200-400 sq ft)</option>
                            <option value="extra-large">Extra Large (400+ sq ft)</option>
                          </select>
                        </div>
                      </div>
                    ) : formData.serviceType === "workspace" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="officeSize" className="block text-sm font-medium text-foreground mb-2">
                            Office Space Scale
                          </label>
                          <select
                            id="officeSize"
                            name="officeSize"
                            value={formData.officeSize}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                          >
                            <option value="">Select size</option>
                            <option value="small">Small (up to 1000 sq ft)</option>
                            <option value="medium">Medium (1000-3000 sq ft)</option>
                            <option value="large">Large (3000-10000 sq ft)</option>
                            <option value="enterprise">Enterprise (10000+ sq ft)</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="employeeCount" className="block text-sm font-medium text-foreground mb-2">
                            Number of Workstations
                          </label>
                          <select
                            id="employeeCount"
                            name="employeeCount"
                            value={formData.employeeCount}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                          >
                            <option value="">Select count</option>
                            <option value="1-10">1-10 Desks</option>
                            <option value="11-25">11-25 Desks</option>
                            <option value="26-50">26-50 Desks</option>
                            <option value="51-100">51-100 Desks</option>
                            <option value="100+">100+ Desks</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 sm:space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2 sm:mb-3">Property Type</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                            {propertyTypes.map((property) => (
                              <button
                                key={property.id}
                                type="button"
                                onClick={() => handlePropertySelect(property.id)}
                                className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-1 sm:gap-2 ${
                                  formData.propertyType === property.id
                                    ? "border-secondary bg-secondary/10"
                                    : "border-border hover:border-secondary/50"
                                }`}
                              >
                                <property.icon
                                  className={`w-6 h-6 sm:w-8 sm:h-8 ${formData.propertyType === property.id ? "text-secondary" : "text-muted-foreground"}`}
                                />
                                <span className="text-xs sm:text-sm font-medium text-foreground">{property.label}</span>
                              </button>
                            ))}
                          </div>
                          {renderError("propertyType")}
                        </div>
                        <div>
                          {formData.propertyType === "warehouse" ? (
                            <>
                              <label htmlFor="rooms" className="block text-sm font-medium text-foreground mb-2">
                                Warehouse Size
                              </label>
                              <select
                                id="rooms"
                                name="rooms"
                                value={formData.rooms}
                                onChange={handleChange}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary text-sm sm:text-base"
                              >
                                <option value="">Select size</option>
                                <option value="Small (< 1000 sq ft)">Small (&lt; 1000 sq ft)</option>
                                <option value="Medium (1000 - 5000 sq ft)">Medium (1000 - 5000 sq ft)</option>
                                <option value="Large (5000+ sq ft)">Large (5000+ sq ft)</option>
                              </select>
                            </>
                          ) : (
                            <>
                              <label htmlFor="rooms" className="block text-sm font-medium text-foreground mb-2">
                                Number of Rooms
                              </label>
                              <select
                                id="rooms"
                                name="rooms"
                                value={formData.rooms}
                                onChange={handleChange}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary text-sm sm:text-base"
                              >
                                <option value="">Select number of rooms</option>
                                {[1, 2, 3, 4, 5, "6+"].map((num) => (
                                  <option key={num} value={num}>
                                    {num} {num === 1 ? "Room" : "Rooms"}
                                  </option>
                                ))}
                              </select>
                            </>
                          )}
                          {renderError("rooms")}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Move Details */}
                {step === 3 && (
                  <div>
                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                      Move details
                    </h2>
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <label htmlFor="fromPincode" className="block text-sm font-medium text-foreground mb-2 mt-4">
                          <MapPin className="w-4 h-4 inline mr-1 sm:mr-2" />
                          Pickup PIN Code
                        </label>
                        <Input
                          id="fromPincode"
                          name="fromPincode"
                          value={formData.fromPincode}
                          onChange={(e) => handlePincodeChange('from', e.target.value)}
                          placeholder="e.g. 110001"
                          maxLength={6}
                          className="text-sm sm:text-base mb-3"
                        />
                        <label htmlFor="fromAddress" className="block text-sm font-medium text-foreground mb-2">
                          {formData.serviceType === "storage" ? "Pickup Location" : "Moving From (Address/City)"}
                        </label>
                        <Input
                          id="fromAddress"
                          name="fromAddress"
                          value={formData.fromAddress}
                          onChange={handleChange}
                          placeholder="Current address or city"
                          className={`text-sm sm:text-base ${errors.fromAddress ? "border-destructive" : ""}`}
                        />
                        {renderError("fromAddress")}
                      </div>
                      <div>
                        <label htmlFor="toPincode" className="block text-sm font-medium text-foreground mb-2">
                          <MapPin className="w-4 h-4 inline mr-1 sm:mr-2" />
                          Destination PIN Code
                        </label>
                        <Input
                          id="toPincode"
                          name="toPincode"
                          value={formData.toPincode}
                          onChange={(e) => handlePincodeChange('to', e.target.value)}
                          placeholder="e.g. 400001"
                          maxLength={6}
                          className="text-sm sm:text-base mb-3"
                        />
                        <label htmlFor="toAddress" className="block text-sm font-medium text-foreground mb-2">
                          {formData.serviceType === "storage" ? "Desired Storage City" : "Moving To (Address/City)"}
                        </label>
                        <Input
                          id="toAddress"
                          name="toAddress"
                          value={formData.toAddress}
                          onChange={handleChange}
                          placeholder="Destination address or city"
                          className={`text-sm sm:text-base ${errors.toAddress ? "border-destructive" : ""}`}
                        />
                        {renderError("toAddress")}
                      </div>
                      <div>
                        <label htmlFor="moveDate" className="block text-sm font-medium text-foreground mb-2">
                          <Calendar className="w-4 h-4 inline mr-1 sm:mr-2" />
                          {formData.serviceType === "storage" ? "Expected Check-in Date" : "Preferred Move Date"}
                        </label>
                        <Input
                          id="moveDate"
                          name="moveDate"
                          type="date"
                          value={formData.moveDate}
                          onChange={handleChange}
                          className={`text-sm sm:text-base ${errors.moveDate ? "border-destructive" : ""}`}
                        />
                        {renderError("moveDate")}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Contact Info */}
                {step === 4 && (
                  <div>
                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
                      Your contact information
                    </h2>
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                          Full Name *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className={`text-sm sm:text-base ${errors.name ? "border-destructive" : ""}`}
                        />
                        {renderError("name")}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                            placeholder="john@example.com"
                            className={`text-sm sm:text-base ${errors.email ? "border-destructive" : ""}`}
                          />
                          {renderError("email")}
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
                            placeholder="+91 98765 43210"
                            className={`text-sm sm:text-base ${errors.phone ? "border-destructive" : ""}`}
                          />
                          {renderError("phone")}
                        </div>
                      </div>
                      <div>
                        <label htmlFor="additionalInfo" className="block text-sm font-medium text-foreground mb-2">
                          Additional Information
                        </label>
                        <Textarea
                          id="additionalInfo"
                          name="additionalInfo"
                          value={formData.additionalInfo}
                          onChange={handleChange}
                          placeholder="Any special requirements or items that need extra care..."
                          rows={4}
                          className="text-sm sm:text-base"
                        />
                        {renderError("additionalInfo")}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border">
                  {step > 1 ? (
                    <Button type="button" variant="outline" onClick={prevStep} className="order-2 sm:order-1">
                      <ArrowLeft className="w-4 h-4" />
                      Previous
                    </Button>
                  ) : (
                    <div className="hidden sm:block" />
                  )}

                  {step < 4 ? (
                    <Button
                      type="button"
                      variant="hero"
                      onClick={nextStep}
                      disabled={!canProceed()}
                      className="order-1 sm:order-2"
                    >
                      Next Step
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="hero"
                      disabled={!canProceed() || isSubmitting}
                      className="order-1 sm:order-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Get My Free Quote
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </motion.form>
            </div>
          </div>
        </section>
      </main>

      <CityWiseLinks />
      <Footer />
    </div>
  );
};

export default Quote;
