import { useState, useEffect, useMemo } from "react";
import { Package, Search, Check, X, Loader2, Save, RotateCcw, CheckCheck, Plus, Minus, ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

// ─── Predefined Items by Category ─────────────────────────────
const PACKING_CATEGORIES: Record<string, { color: string; bg: string; emoji: string; items: string[] }> = {
  "Bedroom": {
    color: "#8B5CF6", bg: "bg-violet-50 text-violet-700 border-violet-200", emoji: "🛏️",
    items: ["Mattress", "Bed Frame", "Wardrobe", "Dressing Table", "Pillows", "Bed Sheets", "Blankets", "Jewellery Box", "Side Table", "Lamp", "Mirror", "Curtains", "Hangers", "Clock"],
  },
  "Kitchen": {
    color: "#F59E0B", bg: "bg-amber-50 text-amber-700 border-amber-200", emoji: "🍳",
    items: ["Refrigerator", "Microwave", "Mixer Grinder", "Gas Stove", "Cookware Set", "Crockery", "Glasses", "Water Purifier", "Rice Cooker", "Toaster", "Pressure Cooker", "Utensils", "Spice Rack", "Cutting Board"],
  },
  "Living Room": {
    color: "#10B981", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", emoji: "🛋️",
    items: ["Sofa Set", "TV Unit", "Television", "Center Table", "Bookshelf", "Books", "Décor Items", "Wall Clock", "Paintings", "Carpet", "Cushions", "Side Table", "Sound System", "Shoe Rack"],
  },
  "Documents": {
    color: "#EF4444", bg: "bg-red-50 text-red-700 border-red-200", emoji: "📄",
    items: ["Aadhaar Card", "PAN Card", "Passport", "Property Papers", "Insurance Papers", "Bank Documents", "Education Certificates", "Medical Records", "Vehicle RC", "Bills & Receipts"],
  },
  "Electronics": {
    color: "#3B82F6", bg: "bg-blue-50 text-blue-700 border-blue-200", emoji: "💻",
    items: ["Laptop", "Desktop PC", "Monitor", "Chargers & Cables", "WiFi Router", "Printer", "Hard Drives", "Camera", "Tablet", "Power Bank", "Extension Cords", "Stabilizer", "UPS"],
  },
  "Clothing": {
    color: "#EC4899", bg: "bg-pink-50 text-pink-700 border-pink-200", emoji: "👔",
    items: ["Daily Wear", "Formal Wear", "Winter Clothes", "Summer Clothes", "Ethnic Wear", "Shoes", "Hangers", "Ironing Board", "Suitcases", "Belts & Accessories", "Sarees", "Kids Clothes"],
  },
  "Bathroom": {
    color: "#06B6D4", bg: "bg-cyan-50 text-cyan-700 border-cyan-200", emoji: "🚿",
    items: ["Washing Machine", "Geyser", "Towels", "Toiletries", "Bucket & Mug", "Soap Stand", "Mirror", "Bathroom Mat", "Medicine Cabinet", "Hair Dryer"],
  },
  "Kids": {
    color: "#F97316", bg: "bg-orange-50 text-orange-700 border-orange-200", emoji: "🧸",
    items: ["Toys", "School Supplies", "Baby Cot", "Stroller", "Bicycle", "Sports Equipment", "Board Games", "Art Supplies", "School Bag", "Baby Gear"],
  },
  "Outdoor / Misc": {
    color: "#6366F1", bg: "bg-indigo-50 text-indigo-700 border-indigo-200", emoji: "🧰",
    items: ["Tool Kit", "Gym Equipment", "Suitcases", "Bags", "Zip Packs", "Gardening Tools", "Folding Chairs", "Cooler", "Tarpaulin", "Rope & Tags", "Packing Material"],
  },
};

interface PackingItem {
  id: string;
  name: string;
  category: string;
  packed: boolean;
  quantity: number;
}

interface DigitalPackingListProps {
  orderId: number;
  orderNumber: string;
  onClose: () => void;
}

const DigitalPackingList = ({ orderId, orderNumber, onClose }: DigitalPackingListProps) => {
  const { toast } = useToast();
  const [items, setItems] = useState<PackingItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customName, setCustomName] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Initialize with all predefined items
  const initializeItems = (): PackingItem[] => {
    const allItems: PackingItem[] = [];
    Object.entries(PACKING_CATEGORIES).forEach(([category, { items: categoryItems }]) => {
      categoryItems.forEach(name => {
        allItems.push({ id: `${category}__${name}`, name, category, packed: false, quantity: 1 });
      });
    });
    return allItems;
  };

  // Fetch existing packing list from backend
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/crm/packing-lists.php?order_id=${orderId}`, { credentials: "include" });
        const json = await res.json();
        if (json.success && json.data.packing_list) {
          const saved = json.data.packing_list.items as PackingItem[];
          const defaults = initializeItems();
          const savedMap = new Map(saved.map((s: any) => [s.id, s]));
          const merged = defaults.map(d => savedMap.has(d.id) ? { ...d, ...savedMap.get(d.id)! } : d);
          saved.forEach((s: any) => { if (!defaults.find(d => d.id === s.id)) merged.push(s); });
          setItems(merged);
        } else {
          setItems(initializeItems());
        }
      } catch {
        setItems(initializeItems());
      } finally { setLoading(false); }
    })();
  }, [orderId]);

  const togglePacked = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, packed: !item.packed } : item));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const newQty = Math.max(1, item.quantity + delta);
      return { ...item, quantity: newQty };
    }));
  };

  const setQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    setItems(prev => prev.map(item => item.id === id ? { ...item, quantity: qty } : item));
  };

  const addCustomItem = () => {
    if (!customName.trim()) return;
    const cat = activeCategory !== "All" ? activeCategory : "Outdoor / Misc";
    const id = `${cat}__custom_${Date.now()}`;
    setItems(prev => [{ id, name: customName.trim(), category: cat, packed: false, quantity: 1 }, ...prev]);
    setCustomName("");
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const markAllPacked = () => setItems(prev => prev.map(i => ({ ...i, packed: true })));
  const clearAll = () => setItems(prev => prev.map(i => ({ ...i, packed: false, quantity: 1 })));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/crm/packing-lists.php", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, items }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast({ title: "Saved successfully", description: `Packing list updated. ${json.data.packed_count}/${json.data.total_items} items packed.`, className: "bg-emerald-50 text-emerald-900 border-emerald-200" });
    } catch (e: unknown) {
      toast({ title: "Save Failed", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  // Stats
  const totalItems = items.length;
  const packedItems = items.filter(i => i.packed).length;
  const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);
  const packedQuantity = items.filter(i => i.packed).reduce((s, i) => s + i.quantity, 0);
  const progressPct = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  // Category stats
  const categoryStats = useMemo(() => {
    const stats: Record<string, { packed: number; total: number; qty: number; packedQty: number }> = {};
    Object.keys(PACKING_CATEGORIES).forEach(cat => {
      const catItems = items.filter(i => i.category === cat);
      stats[cat] = {
        total: catItems.length,
        packed: catItems.filter(i => i.packed).length,
        qty: catItems.reduce((s, i) => s + i.quantity, 0),
        packedQty: catItems.filter(i => i.packed).reduce((s, i) => s + i.quantity, 0),
      };
    });
    return stats;
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    let filtered = items;
    if (activeCategory !== "All") filtered = filtered.filter(i => i.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(i => i.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [items, activeCategory, search]);

  // Group filtered items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, PackingItem[]> = {};
    filteredItems.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 flex flex-col items-center shadow-2xl border border-gray-100">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
          <p className="text-gray-900 font-bold font-outfit text-lg">Loading packing list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-gray-50 rounded-[2rem] w-full max-w-5xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100"
      >
        {/* ─── Header ─── */}
        <div className="px-6 py-5 bg-white border-b border-gray-100 flex items-center justify-between z-10 shadow-sm relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 font-outfit">Digital Packing List</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                  {orderNumber}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button size="lg" onClick={handleSave} disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-6 font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95 hidden sm:flex">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Save Changes
            </Button>
            <Button variant="outline" size="icon" onClick={onClose} className="w-11 h-11 rounded-xl border-gray-200 text-gray-500 hover:bg-gray-100">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* ─── Body Content ─── */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative z-0">
          
          {/* Sidebar / Stats / Filters */}
          <div className="w-full md:w-72 lg:w-80 bg-white border-r border-gray-100 flex flex-col z-10 shrink-0">
            {/* Progress Section */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-end justify-between mb-2">
                <div>
                  <p className="text-4xl font-bold text-gray-900 font-outfit tracking-tight leading-none">{progressPct}%</p>
                  <p className="text-sm font-medium text-gray-500 mt-1">Packed</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{packedItems} <span className="text-gray-400 font-medium">/ {totalItems} items</span></p>
                  <p className="text-xs text-gray-500">{packedQuantity} / {totalQuantity} qty</p>
                </div>
              </div>
              <div className="h-3 rounded-full bg-gray-100 overflow-hidden mt-4">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${progressPct === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-indigo-400'}`} 
                  style={{ width: `${progressPct}%` }} 
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button onClick={markAllPacked} className="h-9 text-xs rounded-xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1 border border-emerald-100">
                  <CheckCheck className="w-3.5 h-3.5" /> Mark All
                </button>
                <button onClick={clearAll} className="h-9 text-xs rounded-xl bg-gray-50 text-gray-600 font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-1 border border-gray-200">
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              <button
                onClick={() => setActiveCategory("All")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeCategory === "All"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-transparent text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">📦</span>
                  <span>All Items</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${activeCategory === "All" ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>
                  {packedItems}/{totalItems}
                </span>
              </button>
              
              {Object.keys(PACKING_CATEGORIES).map(cat => {
                const catData = PACKING_CATEGORIES[cat];
                const stats = categoryStats[cat];
                const isActive = activeCategory === cat;
                const isComplete = stats.total > 0 && stats.packed === stats.total;
                
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all group border border-transparent ${
                      isActive
                        ? `${catData.bg} shadow-sm border-${catData.bg.split(' ')[2].split('-')[2]}` // Extract border color
                        : "bg-transparent text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg grayscale-0 group-hover:grayscale-0 transition-all">{catData.emoji}</span>
                      <span className={isComplete && !isActive ? "text-emerald-600" : ""}>{cat}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isComplete && <Check className={`w-3.5 h-3.5 ${isActive ? "" : "text-emerald-500"}`} />}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isActive 
                          ? "bg-white/50 mix-blend-multiply" 
                          : isComplete 
                            ? "bg-emerald-50 text-emerald-600" 
                            : "bg-gray-100 text-gray-500"
                      }`}>
                        {stats.packed}/{stats.total}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main List Area */}
          <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden relative z-0">
            {/* Search & Add Custom */}
            <div className="p-4 sm:p-6 pb-2 border-b border-gray-100 bg-white/50 backdrop-blur-md sticky top-0 z-10 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input 
                  placeholder="Search items..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  className="pl-12 h-12 bg-white rounded-xl border-gray-200 focus-visible:ring-indigo-500 shadow-sm" 
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Input
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="Add custom item..."
                  className="h-12 text-sm bg-white border-gray-200 rounded-xl focus-visible:ring-indigo-500 flex-1 shadow-sm"
                  onKeyDown={e => e.key === "Enter" && addCustomItem()}
                />
                <Button size="icon" onClick={addCustomItem} disabled={!customName.trim()}
                  className="h-12 w-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shrink-0">
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {Object.entries(groupedItems).map(([category, catItems]) => {
                const catData = PACKING_CATEGORIES[category] || PACKING_CATEGORIES["Outdoor / Misc"];
                const isExpanded = expandedCategory === null || expandedCategory === category || activeCategory !== "All";
                const catPacked = catItems.filter(i => i.packed).length;
                const catQty = catItems.reduce((s, i) => s + i.quantity, 0);

                return (
                  <div key={category} className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Category Header (only in All view) */}
                    {activeCategory === "All" && (
                      <button
                        onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                        className={`w-full flex items-center justify-between px-5 py-4 transition-colors cursor-pointer group ${isExpanded ? "border-b border-gray-100 bg-gray-50/50" : "hover:bg-gray-50/50"}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{catData.emoji}</span>
                          <span className="text-base font-bold text-gray-900 font-outfit">{category}</span>
                          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                            {catPacked}/{catItems.length}
                          </span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                    )}

                    {/* Items */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="divide-y divide-gray-50"
                        >
                          {catItems.map(item => {
                            const isPacked = item.packed;
                            return (
                              <div
                                key={item.id}
                                className={`flex items-center gap-4 px-5 py-3.5 transition-all group ${
                                  isPacked
                                    ? "bg-emerald-50/30"
                                    : "hover:bg-gray-50/50"
                                }`}
                              >
                                {/* Checkbox */}
                                <button
                                  onClick={() => togglePacked(item.id)}
                                  className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                                    isPacked
                                      ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                                      : "border-gray-300 bg-white hover:border-indigo-400"
                                  }`}
                                >
                                  <motion.div initial={false} animate={{ scale: isPacked ? 1 : 0 }}>
                                    <Check className="w-4 h-4" strokeWidth={3} />
                                  </motion.div>
                                </button>

                                {/* Name */}
                                <div className="flex-1 min-w-0 flex flex-col">
                                  <span className={`text-base font-bold transition-all ${isPacked ? "line-through text-gray-400" : "text-gray-900"}`}>
                                    {item.name}
                                  </span>
                                  {item.id.includes('_custom_') && (
                                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Custom Item</span>
                                  )}
                                </div>

                                {/* Quantity Controls */}
                                <div className={`flex items-center gap-0 flex-shrink-0 transition-opacity ${isPacked ? 'opacity-50 pointer-events-none' : ''}`}>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }}
                                    className="w-9 h-9 rounded-l-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center cursor-pointer transition-colors"
                                  >
                                    <Minus className="w-4 h-4 text-gray-500" />
                                  </button>
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={e => setQuantity(item.id, parseInt(e.target.value) || 1)}
                                    className="w-12 h-9 text-center text-sm font-bold border-y border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none z-10 relative"
                                    min={1}
                                  />
                                  <button
                                    onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }}
                                    className="w-9 h-9 rounded-r-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center cursor-pointer transition-colors"
                                  >
                                    <Plus className="w-4 h-4 text-gray-500" />
                                  </button>
                                </div>
                                
                                <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity -mr-2">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {Object.keys(groupedItems).length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-3xl border border-gray-100 shadow-sm border-dashed">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-lg font-medium text-gray-500">No items found</p>
                  <p className="text-sm">Try adjusting your search filters.</p>
                </div>
              )}
            </div>
            
            {/* Mobile Save Button */}
            <div className="p-4 bg-white border-t border-gray-100 sm:hidden z-20 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
              <Button size="lg" onClick={handleSave} disabled={saving} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 font-bold shadow-md shadow-indigo-600/20">
                {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />} Save Changes
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DigitalPackingList;
