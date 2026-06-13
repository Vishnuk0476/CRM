import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ClipboardList, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Building2, 
  MapPin,
  Plus,
  Minus,
  Trash2,
  Send,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
}

const defaultInventoryItems = [
  "Executive Desks",
  "Workstation Desks",
  "Office Chairs",
  "Conference Tables",
  "Filing Cabinets",
  "Cubicle Panels",
  "Desktop Computers",
  "Laptops",
  "Monitors",
  "Printers/Copiers",
  "Servers/Racks",
  "Networking Equipment",
  "Telephones/IP Phones",
  "Projectors",
  "TV/Display Screens",
  "Whiteboards",
  "Bookshelves",
  "Storage Units",
  "Reception Furniture",
  "Lounge Sofas/Chairs",
  "Pantry/Kitchen Equipment",
  "AC Units (Portable)",
  "Plants/Planters",
  "Artwork/Wall Decor"
];

const SiteSurveyBooking = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    currentAddress: "",
    newAddress: "",
    preferredDate: "",
    preferredTime: "",
    additionalNotes: ""
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(
    defaultInventoryItems.slice(0, 10).map((name, index) => ({
      id: `item-${index}`,
      name,
      quantity: 0
    }))
  );

  const [customItem, setCustomItem] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateQuantity = (id: string, delta: number) => {
    setInventory(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    );
  };

  const setQuantity = (id: string, value: number) => {
    setInventory(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(0, value) }
          : item
      )
    );
  };

  const addCustomItem = () => {
    if (customItem.trim()) {
      setInventory(prev => [
        ...prev,
        { id: `custom-${Date.now()}`, name: customItem.trim(), quantity: 1 }
      ]);
      setCustomItem("");
    }
  };

  const removeItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.company) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    toast({
      title: "Survey Scheduled!",
      description: "Our team will contact you within 24 hours to confirm your site survey appointment.",
    });
  };

  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const itemsWithQuantity = inventory.filter(item => item.quantity > 0);

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-secondary" />
        </motion.div>
        <h3 className="font-heading text-2xl font-bold text-foreground mb-4">
          Survey Request Submitted!
        </h3>
        <p className="text-muted-foreground mb-6">
          Thank you for your interest. Our workspace relocation specialist will contact you within 24 hours to confirm your site survey appointment.
        </p>
        <div className="bg-muted/50 rounded-xl p-4 text-left mb-6">
          <h4 className="font-semibold text-foreground mb-2">Your Inventory Summary:</h4>
          <p className="text-sm text-muted-foreground">
            {itemsWithQuantity.length > 0 
              ? `${totalItems} items across ${itemsWithQuantity.length} categories`
              : "No items listed yet - we'll help you inventory during the survey"
            }
          </p>
        </div>
        <Button 
          onClick={() => {
            setIsSubmitted(false);
            setFormData({
              name: "",
              email: "",
              phone: "",
              company: "",
              currentAddress: "",
              newAddress: "",
              preferredDate: "",
              preferredTime: "",
              additionalNotes: ""
            });
          }}
          variant="outline"
        >
          Schedule Another Survey
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-primary p-6">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList className="w-6 h-6 text-secondary" />
          <h3 className="font-heading text-xl font-bold text-primary-foreground">
            Book Free Site Survey
          </h3>
        </div>
        <p className="text-primary-foreground/80 text-sm">
          Our experts will visit your location to assess and plan your workspace relocation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Contact Information */}
        <div>
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-secondary" />
            Contact Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <Label htmlFor="company">Company Name *</Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="ABC Corporation"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@company.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div>
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-secondary" />
            Location Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentAddress">Current Office Address</Label>
              <Input
                id="currentAddress"
                name="currentAddress"
                value={formData.currentAddress}
                onChange={handleInputChange}
                placeholder="Current office location"
              />
            </div>
            <div>
              <Label htmlFor="newAddress">New Office Address (if known)</Label>
              <Input
                id="newAddress"
                name="newAddress"
                value={formData.newAddress}
                onChange={handleInputChange}
                placeholder="New office location"
              />
            </div>
          </div>
        </div>

        {/* Preferred Schedule */}
        <div>
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-secondary" />
            Preferred Survey Schedule
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preferredDate">Preferred Date</Label>
              <Input
                id="preferredDate"
                name="preferredDate"
                type="date"
                value={formData.preferredDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="preferredTime">Preferred Time</Label>
              <Input
                id="preferredTime"
                name="preferredTime"
                type="time"
                value={formData.preferredTime}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Inventory Checklist */}
        <div>
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-secondary" />
            Pre-Move Inventory Checklist
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            Help us prepare by listing your office items. You can modify this during the survey.
          </p>
          
          <div className="bg-muted/30 rounded-xl p-4 max-h-[300px] overflow-y-auto">
            <div className="space-y-2">
              {inventory.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-background hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm text-foreground flex-1 truncate">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => setQuantity(item.id, parseInt(e.target.value) || 0)}
                      className="w-14 h-7 text-center text-sm p-1"
                      min="0"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    {item.id.startsWith('custom-') && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Custom Item */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Input
                placeholder="Add custom item..."
                value={customItem}
                onChange={(e) => setCustomItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomItem())}
                className="flex-1"
              />
              <Button type="button" variant="secondary" onClick={addCustomItem}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-4 p-3 bg-secondary/10 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Items Listed:</span>
              <span className="font-semibold text-secondary">{totalItems}</span>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <Label htmlFor="additionalNotes">Additional Notes</Label>
          <Textarea
            id="additionalNotes"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleInputChange}
            placeholder="Any specific requirements, concerns, or questions..."
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full" 
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2"
              />
              Scheduling...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Schedule Free Site Survey
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          By submitting, you agree to be contacted by our team. No obligation, completely free.
        </p>
      </form>
    </div>
  );
};

export default SiteSurveyBooking;
