import { z } from "zod";

export const quoteFormSchema = z.object({
  serviceType: z.string().min(1, "Please select a service type"),
  propertyType: z.string().min(1, "Please select a property type"),
  fromPincode: z.string().max(6, "PIN code is too long").optional(),
  fromAddress: z.string().min(5, "Please enter a valid address").max(200, "Address is too long"),
  toAddress: z.string().min(5, "Please enter a valid destination address").max(200, "Address is too long"),
  toPincode: z.string().max(6, "PIN code is too long").optional(),
  moveDate: z.string().min(1, "Please select a move date"),
  rooms: z.string().min(1, "Please select number of rooms"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number is too long"),
  additionalInfo: z.string().max(1000, "Additional info is too long").optional(),
  // Service-specific fields (optional based on service type)
  vehicleType: z.string().optional(),
  numberOfVehicles: z.string().optional(),
  storageDuration: z.string().optional(),
  storageSize: z.string().optional(),
  internationalDestination: z.string().max(100, "Destination is too long").optional(),
  customsClearance: z.string().optional(),
  officeSize: z.string().optional(),
  employeeCount: z.string().optional(),
  insuranceRequired: z.string().optional(),
  packingMaterials: z.string().optional(),
});

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().max(15, "Phone number is too long").optional().or(z.literal("")),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200, "Subject is too long"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message is too long"),
});

export type QuoteFormData = z.infer<typeof quoteFormSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
