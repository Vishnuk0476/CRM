import { useEffect, useState } from "react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package, FileText, Truck, Calendar, MapPin, CheckCircle2, LogOut, Clock, Activity } from "lucide-react";

export default function PortalDashboard() {
  const { customer, token, logout } = useCustomerAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchDashboard = async () => {
      try {
        const res = await fetchApi('/api/customer/dashboard.php', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.success) {
          setData(res.data);
        } else {
          toast.error(res.error || "Failed to load dashboard data");
        }
      } catch (err: unknown) {
        toast.error(err.message || "An error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  if (!customer) return null;

  const ongoingMoves = data?.consignments?.length || 0;
  const totalHistory = data?.quotes?.length || 0;
  
  // Try to find if any quotes are 'accepted' but not yet in consignments (upcoming)
  const upcomingMoves = data?.quotes?.filter((q: any) => q.status === 'accepted').length || 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-outfit relative">
      {/* Background ambient glowing spheres */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none -z-10" />
      <div className="fixed -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-secondary/10 blur-[120px] pointer-events-none -z-10" />
      
      <Navbar />
      
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
        
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-2xl rounded-3xl p-8 mb-8 shadow-sm border border-white/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Welcome back, {customer.name.split(' ')[0]}!
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              {customer.designation}{customer.company ? ` at ${customer.company}` : ''}
            </p>
          </div>
          
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors bg-white/80 px-5 py-2.5 rounded-full border border-slate-200 shadow-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Quick Stats Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <Card className="bg-white/80 backdrop-blur-md border-white/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Activity className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Ongoing Moves</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-1">{ongoingMoves}</h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-white/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Upcoming</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-1">{upcomingMoves}</h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-white/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total History</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-1">{totalHistory}</h3>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Dashboard Tabs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Tabs defaultValue="shipments" className="w-full">
                <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-white/70 backdrop-blur-md p-1 border border-white/60 shadow-sm mb-6">
                  <TabsTrigger 
                    value="shipments" 
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md gap-2"
                  >
                    <Truck className="w-4 h-4" />
                    Active Shipments
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Past Quotes & History
                  </TabsTrigger>
                </TabsList>

                {/* ACTIVE SHIPMENTS */}
                <TabsContent value="shipments" className="space-y-6 outline-none">
                  {ongoingMoves === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/60 shadow-sm">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                        <Package className="w-10 h-10 text-slate-300" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900">No Ongoing Shipments</h3>
                      <p className="text-slate-500 mt-2 max-w-sm text-center">You don't have any consignments currently in transit. Relax, we've got you covered when you're ready.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {data?.consignments?.map((consignment: any) => (
                        <Card key={consignment.id} className="border-white/60 bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
                          <div className="h-2 bg-gradient-to-r from-primary to-secondary w-full" />
                          <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardDescription className="font-semibold text-primary/80 uppercase tracking-widest text-xs mb-1">
                                  {consignment.service_type}
                                </CardDescription>
                                <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
                                  <Truck className="w-5 h-5" />
                                  {consignment.consignment_number}
                                </CardTitle>
                              </div>
                              <Badge className="capitalize px-3 py-1 font-medium tracking-wide shadow-sm" variant={consignment.status === 'delivered' ? 'default' : 'secondary'}>
                                {consignment.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-6 pb-6">
                            <div className="relative">
                              <div className="absolute top-5 left-3 w-0.5 h-10 bg-slate-200" />
                              <div className="flex gap-4 items-start relative z-10">
                                <div className="w-6 h-6 rounded-full bg-white border-4 border-primary flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Pickup</p>
                                  <p className="font-semibold text-slate-800">{consignment.origin}</p>
                                </div>
                              </div>
                              <div className="flex gap-4 items-start relative z-10 mt-6">
                                <div className="w-6 h-6 rounded-full bg-white border-4 border-secondary flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Drop-off</p>
                                  <p className="font-semibold text-slate-800">{consignment.destination}</p>
                                </div>
                              </div>
                            </div>
                            
                            {consignment.estimated_delivery && (
                              <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-100 p-4 rounded-xl flex items-center gap-4">
                                <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center">
                                  <Calendar className="w-5 h-5 text-slate-500" />
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Estimated Arrival</p>
                                  <p className="font-bold text-slate-900">{format(new Date(consignment.estimated_delivery), 'MMMM do, yyyy')}</p>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* PAST HISTORY */}
                <TabsContent value="history" className="space-y-6 outline-none">
                  {totalHistory === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/60 shadow-sm">
                      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                        <FileText className="w-10 h-10 text-slate-300" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900">No Past History</h3>
                      <p className="text-slate-500 mt-2 max-w-sm text-center">You haven't requested any quotes or moves yet.</p>
                    </div>
                  ) : (
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-white/60 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50/90 text-slate-500 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="px-6 py-5 whitespace-nowrap">Reference #</th>
                              <th className="px-6 py-5 whitespace-nowrap">Service Details</th>
                              <th className="px-6 py-5 whitespace-nowrap">Route</th>
                              <th className="px-6 py-5 whitespace-nowrap">Date</th>
                              <th className="px-6 py-5 whitespace-nowrap">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {data?.quotes?.map((quote: any) => (
                              <tr key={quote.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-5 font-bold text-slate-900">
                                  {quote.quotation_number || `REF-${quote.id}`}
                                </td>
                                <td className="px-6 py-5">
                                  <p className="font-semibold text-slate-800">{quote.relocation_type || 'General Service'}</p>
                                  <p className="text-xs text-slate-500 mt-1">{quote.property_type}</p>
                                </td>
                                <td className="px-6 py-5">
                                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                                    <span>{quote.origin_city || 'N/A'}</span>
                                    <span className="text-slate-300">→</span>
                                    <span>{quote.destination_city || 'N/A'}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-5 text-slate-600 font-medium">
                                  {quote.move_date ? format(new Date(quote.move_date), 'MMM dd, yyyy') : 'TBD'}
                                </td>
                                <td className="px-6 py-5">
                                  <Badge 
                                    variant={quote.status === 'accepted' ? 'default' : quote.status === 'rejected' ? 'destructive' : 'secondary'}
                                    className="capitalize font-semibold shadow-sm px-3"
                                  >
                                    {quote.status || 'Draft'}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
