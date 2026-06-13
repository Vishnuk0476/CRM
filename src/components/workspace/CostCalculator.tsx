import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, Building2, Users, Package, Monitor, Truck, Shield, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

interface ServiceOption {
  id: string;
  label: string;
  icon: React.ElementType;
  basePrice: number;
  perSqFtPrice: number;
}

const services: ServiceOption[] = [
  { id: "furniture", label: "Furniture Moving", icon: Package, basePrice: 5000, perSqFtPrice: 3 },
  { id: "it", label: "IT Equipment & Servers", icon: Monitor, basePrice: 15000, perSqFtPrice: 8 },
  { id: "packing", label: "Professional Packing", icon: Package, basePrice: 8000, perSqFtPrice: 5 },
  { id: "insurance", label: "Full Insurance Coverage", icon: Shield, basePrice: 3000, perSqFtPrice: 2 },
  { id: "weekend", label: "Weekend/After-Hours Move", icon: Clock, basePrice: 10000, perSqFtPrice: 0 },
  { id: "storage", label: "Temporary Storage", icon: Truck, basePrice: 5000, perSqFtPrice: 4 },
];

const CostCalculator = () => {
  const [officeSize, setOfficeSize] = useState([2000]);
  const [employees, setEmployees] = useState([50]);
  const [distance, setDistance] = useState([10]);
  const [selectedServices, setSelectedServices] = useState<string[]>(["furniture", "packing"]);

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const estimatedCost = useMemo(() => {
    const size = officeSize[0];
    const emp = employees[0];
    const dist = distance[0];

    // Base calculation
    let total = 0;

    // Per employee base cost
    total += emp * 500;

    // Distance factor
    total += dist * 200;

    // Selected services
    selectedServices.forEach(serviceId => {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        total += service.basePrice + (size * service.perSqFtPrice);
      }
    });

    // Size multiplier for larger offices
    if (size > 5000) {
      total *= 1.1;
    }
    if (size > 10000) {
      total *= 1.15;
    }

    return Math.round(total);
  }, [officeSize, employees, distance, selectedServices]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="border-border/50 bg-card shadow-lg">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-secondary" />
          </div>
          Cost Calculator
        </CardTitle>
        <p className="text-muted-foreground text-sm mt-2">
          Get an instant estimate for your workspace relocation. Final quote may vary based on specific requirements.
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        {/* Office Size */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Building2 className="w-4 h-4 text-secondary" />
              Office Size
            </Label>
            <span className="text-lg font-bold text-secondary">{officeSize[0].toLocaleString()} sq ft</span>
          </div>
          <Slider
            value={officeSize}
            onValueChange={setOfficeSize}
            min={500}
            max={50000}
            step={500}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>500 sq ft</span>
            <span>50,000 sq ft</span>
          </div>
        </div>

        {/* Number of Employees */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Users className="w-4 h-4 text-secondary" />
              Number of Employees
            </Label>
            <span className="text-lg font-bold text-secondary">{employees[0]}</span>
          </div>
          <Slider
            value={employees}
            onValueChange={setEmployees}
            min={5}
            max={500}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5 employees</span>
            <span>500 employees</span>
          </div>
        </div>

        {/* Distance */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Truck className="w-4 h-4 text-secondary" />
              Relocation Distance
            </Label>
            <span className="text-lg font-bold text-secondary">{distance[0]} km</span>
          </div>
          <Slider
            value={distance}
            onValueChange={setDistance}
            min={1}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 km (Intra-city)</span>
            <span>100+ km (Inter-city)</span>
          </div>
        </div>

        {/* Services Selection */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Select Services Required</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((service) => (
              <motion.div
                key={service.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleService(service.id)}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  selectedServices.includes(service.id)
                    ? 'border-secondary bg-secondary/10'
                    : 'border-border hover:border-secondary/50'
                }`}
              >
                <Checkbox
                  checked={selectedServices.includes(service.id)}
                  onCheckedChange={() => toggleService(service.id)}
                  className="pointer-events-none"
                />
                <service.icon className={`w-5 h-5 ${
                  selectedServices.includes(service.id) ? 'text-secondary' : 'text-muted-foreground'
                }`} />
                <span className={`text-sm font-medium ${
                  selectedServices.includes(service.id) ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {service.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Estimated Cost */}
        <motion.div
          className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-2xl p-6 border border-secondary/20"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={estimatedCost}
        >
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Estimated Cost</p>
            <motion.p
              className="text-4xl md:text-5xl font-bold text-secondary"
              key={estimatedCost}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {formatCurrency(estimatedCost)}
            </motion.p>
            <p className="text-xs text-muted-foreground mt-2">
              *This is an estimate. Contact us for an accurate quote.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1" size="lg">
            <Link to="/quote">
              Get Detailed Quote
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1" size="lg">
            <a href="tel:+911142321118">
              Talk to Expert
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostCalculator;
