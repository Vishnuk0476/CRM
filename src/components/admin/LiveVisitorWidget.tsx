import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Smartphone, Monitor, Tablet, MapPin, Eye, RefreshCw, Wifi, Clock } from 'lucide-react';
// supabase removed
import { Button } from '@/components/ui/button';

interface VisitorLog {
  id: string;
  ip_address: string;
  country: string;
  country_code: string;
  city: string;
  device: string;
  browser: string;
  current_url: string;
  created_at: string;
}

export default function LiveVisitorWidget() {
  const [visitors, setVisitors] = useState<VisitorLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todayCount, setTodayCount] = useState(0);

  const fetchVisitors = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch('/api/visitors/log.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ limit: 50 })
      });
      
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch live visitors');
      
      const mappedVisitors = (json.data || []).map((e: unknown) => ({
        id: e.id,
        ip_address: e.ip_address,
        country: e.ip_country,
        country_code: null,
        city: e.ip_city,
        device: e.device_type,
        browser: e.browser,
        current_url: e.page_visited,
        created_at: e.visited_at
      }));

      setVisitors(mappedVisitors);
      
      // Get count for today by looking at all data (or we could request from backend, but log.php gives 50)
      // Since log.php gives limited data, we'll just show the count in the current set if it's from today
      const todayStart = new Date();
      todayStart.setHours(0,0,0,0);
      const todayMs = todayStart.getTime();
      
      const todayCount = mappedVisitors.filter((v: any) => new Date(v.created_at).getTime() >= todayMs).length;
      setTodayCount(todayCount);

    } catch (err: unknown) {
      console.error('Failed to fetch live visitors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
    
    // Refresh fully every 15s since we don't have websockets anymore
    const interval = setInterval(fetchVisitors, 15000);
    
    return () => clearInterval(interval);
  }, []);

  const getDeviceIcon = (device: string) => {
    if (device === 'mobile') return <Smartphone className="w-4 h-4" />;
    if (device === 'tablet') return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const getFlagEmoji = (code: string | null) => {
    if (!code || code.length !== 2) return '🌐';
    const codePoints = code
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const timeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Mask IP for privacy (e.g. 192.168.1.1 -> 192.168.*.*)
  const maskIp = (ip: string) => {
    if (!ip || ip === 'unknown') return 'Unknown';
    const parts = ip.split('.');
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.*.*`;
    return 'Hidden';
  };

  // Simple Page path (e.g. http://localhost/about -> /about)
  const getPagePath = (url: string) => {
    if (!url) return '/';
    try {
      const u = new URL(url);
      return u.pathname;
    } catch {
      return url.split('?')[0].replace(/^https?:\/\/[^/]+/, '') || '/';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[500px]">
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Globe className="w-5 h-5 text-emerald-500" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">Live Visitors (IPstack)</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {todayCount} visitors today
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchVisitors} className="h-8 w-8" disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-muted-foreground' : 'text-foreground'}`} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-0">
        {visitors.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
            <Eye className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">No visitors yet today</p>
            <p className="text-xs mt-1">Visit your public pages to see live tracking</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {visitors.map((v, i) => (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                key={v.id || i}
                className="flex items-center gap-4 p-3 hover:bg-muted/50 transition-colors text-sm"
              >
                <div className="text-2xl" title={v.country}>{getFlagEmoji(v.country_code)}</div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-medium text-foreground truncate mr-2">
                      {v.city && v.city !== 'Unknown' ? `${v.city}, ${v.country}` : v.country || 'Unknown Location'}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {timeAgo(v.created_at)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 text-primary max-w-[150px] truncate" title={v.current_url}>
                      <MapPin className="w-3 h-3" /> {getPagePath(v.current_url)}
                    </span>
                    <span className="flex items-center gap-1">
                      {getDeviceIcon(v.device)} {v.device}
                    </span>
                    <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded ml-auto">
                      {maskIp(v.ip_address)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <div className="p-2 border-t border-border bg-muted/20 text-center">
        <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
          <Wifi className="w-3 h-3" /> Powered by IPstack API Geo-Tracking
        </p>
      </div>
    </div>
  );
}
