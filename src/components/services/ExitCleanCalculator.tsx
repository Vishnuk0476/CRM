import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Home, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";

const propertyTypes = [
  { id: "studio", label: "Studio", basePrice: 2500 },
  { id: "1bhk", label: "1 BHK", basePrice: 3500 },
  { id: "2bhk", label: "2 BHK", basePrice: 5000 },
  { id: "3bhk", label: "3 BHK", basePrice: 7000 },
  { id: "4bhk", label: "4 BHK+", basePrice: 9000 },
  { id: "villa", label: "Villa/Independent", basePrice: 12000 },
];

const cleaningTypes = [
  { id: "standard", label: "Standard Exit Clean", multiplier: 1.0, description: "Basic cleaning for apartments" },
  { id: "premium", label: "Premium Exit Clean", multiplier: 1.5, description: "Deep cleaning with carpet & window" },
  { id: "complete", label: "Complete Exit Clean", multiplier: 2.0, description: "Full property transformation" },
];

const addOns = [
  { id: "carpet", label: "Carpet Steam Cleaning", price: 1500 },
  { id: "oven", label: "Oven Deep Clean", price: 500 },
  { id: "windows", label: "Windows (Inside & Out)", price: 800 },
  { id: "balcony", label: "Balcony Cleaning", price: 600 },
  { id: "garage", label: "Garage Cleaning", price: 1000 },
  { id: "paint", label: "Touch-up Painting", price: 2500 },
];

const ExitCleanCalculator = () => {
  const [propertyType, setPropertyType] = useState("2bhk");
  const [cleaningType, setCleaningType] = useState("standard");
  const [propertySize, setPropertySize] = useState([1000]);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const calculatePrice = () => {
    const property = propertyTypes.find((p) => p.id === propertyType);
    const cleaning = cleaningTypes.find((c) => c.id === cleaningType);

    if (!property || !cleaning) return 0;

    let basePrice = property.basePrice * cleaning.multiplier;

    // Adjust for size (per 100 sq ft over 500)
    const sizeAdjustment = Math.max(0, (propertySize[0] - 500) / 100) * 200;
    basePrice += sizeAdjustment;

    // Add-ons
    const addOnTotal = selectedAddOns.reduce((total, addOnId) => {
      const addOn = addOns.find((a) => a.id === addOnId);
      return total + (addOn?.price || 0);
    }, 0);

    return Math.round(basePrice + addOnTotal);
  };

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addOnId) ? prev.filter((id) => id !== addOnId) : [...prev, addOnId]
    );
  };

  const estimatedPrice = calculatePrice();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="max-w-4xl mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator Form */}
        <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Calculator className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-foreground">Price Estimator</h3>
              <p className="text-sm text-muted-foreground">Get instant pricing</p>
            </div>
          </div>

          {/* Property Type */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Property Type</Label>
            <RadioGroup value={propertyType} onValueChange={setPropertyType} className="grid grid-cols-3 gap-2">
              {propertyTypes.map((type) => (
                <div key={type.id}>
                  <RadioGroupItem value={type.id} id={type.id} className="peer sr-only" />
                  <Label
                    htmlFor={type.id}
                    className="flex items-center justify-center rounded-lg border-2 border-border bg-card p-3 text-sm font-medium cursor-pointer hover:bg-muted/50 peer-data-[state=checked]:border-secondary peer-data-[state=checked]:bg-secondary/10 transition-all"
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Property Size */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Property Size: {propertySize[0]} sq. ft.</Label>
            <Slider
              value={propertySize}
              onValueChange={setPropertySize}
              min={300}
              max={5000}
              step={100}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>300 sq. ft.</span>
              <span>5000 sq. ft.</span>
            </div>
          </div>

          {/* Cleaning Type */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Cleaning Package</Label>
            <RadioGroup value={cleaningType} onValueChange={setCleaningType} className="space-y-2">
              {cleaningTypes.map((type) => (
                <div key={type.id}>
                  <RadioGroupItem value={type.id} id={type.id} className="peer sr-only" />
                  <Label
                    htmlFor={type.id}
                    className="flex items-center justify-between rounded-lg border-2 border-border bg-card p-4 cursor-pointer hover:bg-muted/50 peer-data-[state=checked]:border-secondary peer-data-[state=checked]:bg-secondary/10 transition-all"
                  >
                    <div>
                      <span className="font-medium text-sm">{type.label}</span>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                    <span className="text-xs font-semibold text-secondary">
                      {type.multiplier === 1 ? "Base" : `${type.multiplier}x`}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Add-ons */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Add-ons (Optional)</Label>
            <div className="grid grid-cols-2 gap-2">
              {addOns.map((addOn) => (
                <button
                  key={addOn.id}
                  onClick={() => toggleAddOn(addOn.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 text-left transition-all ${
                    selectedAddOns.includes(addOn.id)
                      ? "border-secondary bg-secondary/10"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <span className="text-xs font-medium">{addOn.label}</span>
                  <span className="text-xs text-secondary font-semibold">+₹{addOn.price}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-gradient-to-br from-primary to-primary/90 rounded-2xl p-6 text-primary-foreground flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-heading font-bold">Your Estimate</h3>
              <p className="text-sm text-primary-foreground/70">Approximate pricing</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-8">
              <p className="text-sm text-primary-foreground/70 mb-2">Estimated Cost</p>
              <div className="text-5xl font-bold text-secondary mb-2">₹{estimatedPrice.toLocaleString()}</div>
              <p className="text-xs text-primary-foreground/60">*Final price may vary based on actual inspection</p>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                <span>Bond back guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                <span>Professional cleaning team</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                <span>All cleaning supplies included</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                <span>Same day service available</span>
              </div>
            </div>
          </div>

          <Link to="/quote" className="block">
            <Button variant="hero" size="lg" className="w-full gap-2">
              <Home className="w-5 h-5" />
              Book Exit Clean
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ExitCleanCalculator;
