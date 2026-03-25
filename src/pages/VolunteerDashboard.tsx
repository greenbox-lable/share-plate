import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin, Clock, Navigation, Phone, Package, TrendingUp, Award, Bike,
  CheckCircle, AlertCircle, LogOut, Loader2, User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface DonationRow {
  id: string;
  food_item: string;
  description: string | null;
  quantity: string;
  expiry_time: string;
  pickup_address: string;
  city: string;
  status: string;
  donor_id: string;
  ngo_id: string | null;
  volunteer_id: string | null;
  created_at: string;
}

interface ProfileInfo {
  full_name: string;
  phone: string | null;
  city: string | null;
}

const VolunteerDashboard = () => {
  const { user, profile, signOut, updateActiveStatus } = useAuth();
  const [isActive, setIsActive] = useState(profile?.is_active || false);
  const { toast } = useToast();
  const [availablePickups, setAvailablePickups] = useState<DonationRow[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<DonationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [delivering, setDelivering] = useState<string | null>(null);
  const [donorProfiles, setDonorProfiles] = useState<Record<string, ProfileInfo>>({});
  const [ngoProfiles, setNgoProfiles] = useState<Record<string, ProfileInfo>>({});

  const handleToggle = async (checked: boolean) => {
    setIsActive(checked);
    try {
      await updateActiveStatus(checked);
      toast({
        title: checked ? "You're now Active! 🟢" : "You're now Inactive",
        description: checked ? "You'll start receiving pickup requests." : "You won't receive new requests.",
      });
    } catch {
      setIsActive(!checked);
    }
  };

  const fetchData = async () => {
    if (!user) return;
    const { data: available } = await supabase.from("donations").select("*").eq("status", "accepted").is("volunteer_id", null).order("created_at", { ascending: false });
    const { data: mine } = await supabase.from("donations").select("*").eq("volunteer_id", user.id).order("created_at", { ascending: false });

    const allDonations = [...(available || []), ...(mine || [])];
    setAvailablePickups((available || []) as DonationRow[]);
    setMyDeliveries((mine || []) as DonationRow[]);

    const donorIds = [...new Set(allDonations.map(d => d.donor_id))];
    const ngoIds = [...new Set(allDonations.filter(d => d.ngo_id).map(d => d.ngo_id!))];

    if (donorIds.length > 0) {
      const { data } = await supabase.from("profiles").select("user_id, full_name, phone, city").in("user_id", donorIds);
      if (data) { const map: Record<string, ProfileInfo> = {}; data.forEach(p => { map[p.user_id] = p; }); setDonorProfiles(map); }
    }
    if (ngoIds.length > 0) {
      const { data } = await supabase.from("profiles").select("user_id, full_name, phone, city").in("user_id", ngoIds);
      if (data) { const map: Record<string, ProfileInfo> = {}; data.forEach(p => { map[p.user_id] = p; }); setNgoProfiles(map); }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase.channel("volunteer-donations").on("postgres_changes", { event: "*", schema: "public", table: "donations" }, () => { fetchData(); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleClaimPickup = async (donationId: string) => {
    if (!user) return;
    setClaiming(donationId);
    try {
      const { error } = await supabase.from("donations").update({ volunteer_id: user.id, status: "picked_up", picked_up_at: new Date().toISOString() }).eq("id", donationId).eq("status", "accepted");
      if (error) throw error;
      toast({ title: "Pickup Accepted! 🚴", description: "Navigate to the pickup location to collect the food." });
      fetchData();
    } catch (error: any) {
      toast({ title: "Failed to claim", description: error.message, variant: "destructive" });
    } finally { setClaiming(null); }
  };

  const handleMarkDelivered = async (donationId: string) => {
    if (!user) return;
    setDelivering(donationId);
    try {
      const { error } = await supabase.from("donations").update({ status: "delivered", delivered_at: new Date().toISOString() }).eq("id", donationId).eq("volunteer_id", user.id);
      if (error) throw error;
      toast({ title: "Delivery Complete! 🎉", description: "Thank you for making a difference!" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    } finally { setDelivering(null); }
  };

  const deliveredCount = myDeliveries.filter(d => d.status === "delivered").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50/30 to-background">
      {/* Header */}
      <header className="border-b border-teal-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Bike className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Welcome, {profile?.full_name || "Volunteer"} 👋</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                🚴 Volunteer Dashboard
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-sm border border-teal-100">
              <div className={`w-2.5 h-2.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
              <Label htmlFor="active-toggle" className="text-sm font-medium cursor-pointer">{isActive ? "Active" : "Inactive"}</Label>
              <Switch id="active-toggle" checked={isActive} onCheckedChange={handleToggle} />
            </div>
            <Button variant="outline" asChild><Link to="/">Home</Link></Button>
            <Button variant="ghost" size="icon" onClick={signOut}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Package, value: myDeliveries.length, label: "Total Pickups", gradient: "from-teal-500 to-cyan-500" },
            { icon: TrendingUp, value: deliveredCount, label: "Delivered", gradient: "from-emerald-500 to-green-500" },
            { icon: Bike, value: availablePickups.length, label: "Available Now", gradient: "from-blue-500 to-indigo-500" },
            { icon: Award, value: profile?.city || "—", label: "City", gradient: "from-purple-500 to-violet-500" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-teal-100/50 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {!isActive ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-12 shadow-sm border border-teal-100/50 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-teal-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">You are currently Inactive</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Turn on the Active toggle to start receiving live pickup requests — just like Swiggy or Zomato!
            </p>
            <Button variant="hero" size="lg" onClick={() => handleToggle(true)}>
              <Bike className="w-5 h-5 mr-2" /> Go Active Now
            </Button>
          </motion.div>
        ) : loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
        ) : (
          <>
            {/* My Active Deliveries */}
            {myDeliveries.filter(d => d.status === "picked_up").length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Bike className="w-5 h-5 text-teal-500" /> My Active Deliveries
                </h2>
                <div className="space-y-4">
                  {myDeliveries.filter(d => d.status === "picked_up").map((order) => {
                    const donor = donorProfiles[order.donor_id];
                    const ngo = order.ngo_id ? ngoProfiles[order.ngo_id] : null;
                    return (
                      <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-sm border border-teal-100/50 border-l-4 border-l-teal-500">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-foreground text-lg">{order.food_item}</h3>
                            <p className="text-sm text-muted-foreground">{order.quantity}</p>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-medium border border-violet-200">In Transit</span>
                        </div>
                        <div className="space-y-3 mb-5">
                          <div className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-teal-500" /></div>
                              <div className="w-0.5 h-10 bg-teal-200" />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground uppercase tracking-wide">Pickup — {donor?.full_name || "Donor"}</div>
                              <div className="font-medium text-foreground">{order.pickup_address}</div>
                              {donor?.phone && <a href={`tel:${donor.phone}`} className="text-sm text-teal-600 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {donor.phone}</a>}
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-7 h-7 rounded-full bg-cyan-100 flex items-center justify-center"><MapPin className="w-3.5 h-3.5 text-cyan-600" /></div>
                            <div>
                              <div className="text-xs text-muted-foreground uppercase tracking-wide">Dropoff — {ngo?.full_name || "NGO"}</div>
                              <div className="font-medium text-foreground">{ngo?.city || order.city}</div>
                              {ngo?.phone && <a href={`tel:${ngo.phone}`} className="text-sm text-teal-600 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {ngo.phone}</a>}
                            </div>
                          </div>
                        </div>
                        <Button variant="hero" className="w-full" onClick={() => handleMarkDelivered(order.id)} disabled={delivering === order.id}>
                          {delivering === order.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                          Mark as Delivered
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Available Pickups */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-lg font-bold text-foreground">Available Pickups</h2>
              <span className="text-sm text-muted-foreground">({availablePickups.length} nearby)</span>
            </div>

            {availablePickups.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-teal-100/50">
                <Package className="w-12 h-12 text-teal-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No pickups available</h3>
                <p className="text-muted-foreground">Stay active — new requests come in as NGOs accept donations!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availablePickups.map((order, index) => {
                  const donor = donorProfiles[order.donor_id];
                  const ngo = order.ngo_id ? ngoProfiles[order.ngo_id] : null;
                  return (
                    <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white rounded-2xl p-6 shadow-sm border border-teal-100/50 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">{donor?.full_name || "Donor"}</h3>
                          <p className="text-sm text-muted-foreground">{order.food_item} • {order.quantity}</p>
                        </div>
                        <div className="flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-medium border border-amber-200">
                          <Clock className="w-3.5 h-3.5" />
                          Expires {format(new Date(order.expiry_time), "h:mm a")}
                        </div>
                      </div>

                      <div className="space-y-3 mb-5">
                        <div className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-teal-500" /></div>
                            <div className="w-0.5 h-10 bg-teal-200" />
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wide">Pickup</div>
                            <div className="font-medium text-foreground">{order.pickup_address}</div>
                            {donor?.phone && <a href={`tel:${donor.phone}`} className="text-sm text-teal-600 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {donor.phone}</a>}
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-7 h-7 rounded-full bg-cyan-100 flex items-center justify-center"><MapPin className="w-3.5 h-3.5 text-cyan-600" /></div>
                          <div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wide">Dropoff — {ngo?.full_name || "NGO"}</div>
                            <div className="font-medium text-foreground">{ngo?.city || order.city}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-teal-100/50">
                        <span className="text-sm text-muted-foreground">{order.city}</span>
                        <Button variant="hero" onClick={() => handleClaimPickup(order.id)} disabled={claiming === order.id}>
                          {claiming === order.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                          Accept Pickup
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VolunteerDashboard;
