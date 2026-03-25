import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Utensils, Clock, CheckCircle, Truck, Package, TrendingUp, Heart,
  Phone, MapPin, User, ChevronRight, LogOut, Loader2, Home, Hotel,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

type DonationStatus = "pending" | "accepted" | "picked_up" | "delivered";

interface Donation {
  id: string;
  food_item: string;
  description: string;
  quantity: string;
  expiry_time: string;
  pickup_address: string;
  city: string;
  status: DonationStatus;
  created_at: string;
  ngo_id: string | null;
  volunteer_id: string | null;
  accepted_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  food_source: string | null;
}

interface ProfileInfo {
  full_name: string;
  phone: string | null;
  city: string | null;
}

const statusConfig: Record<DonationStatus, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-800 border-amber-200", icon: Clock },
  accepted: { label: "Accepted", color: "bg-sky-100 text-sky-800 border-sky-200", icon: CheckCircle },
  picked_up: { label: "Picked Up", color: "bg-violet-100 text-violet-800 border-violet-200", icon: Truck },
  delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: Package },
};

const DonorDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [ngoProfiles, setNgoProfiles] = useState<Record<string, ProfileInfo>>({});
  const [volunteerProfiles, setVolunteerProfiles] = useState<Record<string, ProfileInfo>>({});

  const fetchDonations = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .eq("donor_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setDonations(data as Donation[]);
      const ngoIds = [...new Set(data.filter(d => d.ngo_id).map(d => d.ngo_id!))];
      const volIds = [...new Set(data.filter(d => d.volunteer_id).map(d => d.volunteer_id!))];

      if (ngoIds.length > 0) {
        const { data: ngoData } = await supabase.from("profiles").select("user_id, full_name, phone, city").in("user_id", ngoIds);
        if (ngoData) {
          const map: Record<string, ProfileInfo> = {};
          ngoData.forEach(p => { map[p.user_id] = p; });
          setNgoProfiles(map);
        }
      }
      if (volIds.length > 0) {
        const { data: volData } = await supabase.from("profiles").select("user_id, full_name, phone, city").in("user_id", volIds);
        if (volData) {
          const map: Record<string, ProfileInfo> = {};
          volData.forEach(p => { map[p.user_id] = p; });
          setVolunteerProfiles(map);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDonations();
    const channel = supabase
      .channel("donor-donations")
      .on("postgres_changes", { event: "*", schema: "public", table: "donations", filter: `donor_id=eq.${user?.id}` }, () => {
        fetchDonations();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const totalDonations = donations.length;
  const deliveredCount = donations.filter(d => d.status === "delivered").length;
  const totalServings = donations.reduce((sum, d) => sum + (parseInt(d.quantity) || 0), 0);

  const stats = [
    { icon: Utensils, value: totalDonations, label: "Total Donations", gradient: "from-orange-500 to-amber-500" },
    { icon: Heart, value: totalServings, label: "Servings Shared", gradient: "from-rose-500 to-pink-500" },
    { icon: CheckCircle, value: deliveredCount, label: "Delivered", gradient: "from-emerald-500 to-teal-500" },
    { icon: TrendingUp, value: totalDonations > 0 ? `${Math.round((deliveredCount / totalDonations) * 100)}%` : "0%", label: "Success Rate", gradient: "from-blue-500 to-indigo-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/30 to-background">
      {/* Header */}
      <header className="border-b border-orange-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Welcome, {profile?.full_name || "Donor"} 👋</h1>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                  🍽️ Donor Dashboard
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="hero" asChild>
              <Link to="/donate"><Plus className="w-4 h-4 mr-2" /> Donate Food</Link>
            </Button>
            <Button variant="outline" asChild><Link to="/">Home</Link></Button>
            <Button variant="ghost" size="icon" onClick={signOut}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100/50 hover:shadow-md transition-shadow">
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

        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-orange-500" /> My Donations
        </h2>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
        ) : donations.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-orange-100/50 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
              <Utensils className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No donations yet</h3>
            <p className="text-muted-foreground mb-6">Start sharing food to make an impact!</p>
            <Button variant="hero" asChild><Link to="/donate">Donate Now</Link></Button>
          </div>
        ) : (
          <div className="space-y-4">
            {donations.map((donation, index) => {
              const config = statusConfig[donation.status];
              const StatusIcon = config.icon;
              const isExpanded = expandedId === donation.id;
              const ngo = donation.ngo_id ? ngoProfiles[donation.ngo_id] : null;
              const volunteer = donation.volunteer_id ? volunteerProfiles[donation.volunteer_id] : null;

              return (
                <motion.div
                  key={donation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-sm border border-orange-100/50 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-5 cursor-pointer hover:bg-orange-50/30 transition-colors" onClick={() => setExpandedId(isExpanded ? null : donation.id)}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
                          <Utensils className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{donation.food_item}</h3>
                          <p className="text-sm text-muted-foreground">
                            {donation.quantity} • {format(new Date(donation.created_at), "MMM d, h:mm a")}
                            {donation.food_source && (
                              <span className="ml-2">{donation.food_source === "hotel" ? "🏨 Hotel" : "🏠 Home"}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />{config.label}
                        </span>
                        <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="border-t border-orange-100/50 px-5 pb-5 pt-4 space-y-4">
                      <div className="grid sm:grid-cols-3 gap-3 text-sm">
                        <div className="bg-orange-50/50 rounded-lg p-3">
                          <span className="text-muted-foreground">Pickup Address</span>
                          <p className="font-medium text-foreground">{donation.pickup_address}</p>
                        </div>
                        <div className="bg-orange-50/50 rounded-lg p-3">
                          <span className="text-muted-foreground">Expires</span>
                          <p className="font-medium text-foreground">{format(new Date(donation.expiry_time), "MMM d, h:mm a")}</p>
                        </div>
                        <div className="bg-orange-50/50 rounded-lg p-3">
                          <span className="text-muted-foreground">City</span>
                          <p className="font-medium text-foreground">{donation.city || "N/A"}</p>
                        </div>
                      </div>

                      {ngo && (
                        <div className="bg-sky-50 rounded-xl p-4 border border-sky-100">
                          <h4 className="text-sm font-semibold text-sky-700 mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Accepted by NGO</h4>
                          <div className="space-y-1 text-sm">
                            <p className="flex items-center gap-2 text-foreground"><User className="w-4 h-4 text-muted-foreground" /> {ngo.full_name}</p>
                            {ngo.phone && <p className="flex items-center gap-2 text-foreground"><Phone className="w-4 h-4 text-muted-foreground" /> {ngo.phone}</p>}
                          </div>
                        </div>
                      )}

                      {volunteer && (
                        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                          <h4 className="text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-2"><Truck className="w-4 h-4" /> Volunteer Assigned</h4>
                          <div className="space-y-1 text-sm">
                            <p className="flex items-center gap-2 text-foreground"><User className="w-4 h-4 text-muted-foreground" /> {volunteer.full_name}</p>
                            {volunteer.phone && <p className="flex items-center gap-2 text-foreground"><Phone className="w-4 h-4 text-muted-foreground" /> {volunteer.phone}</p>}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;
