import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Search, MapPin, Clock, Users, Utensils, ChevronRight, CheckCircle, Package,
  TrendingUp, Building, Truck, Phone, User, LogOut, Loader2,
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
  accepted_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
}

interface ProfileInfo {
  full_name: string;
  phone: string | null;
  city: string | null;
}

const statusColors: Record<string, string> = {
  accepted: "bg-sky-100 text-sky-700 border-sky-200",
  picked_up: "bg-violet-100 text-violet-700 border-violet-200",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const ReceiverDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"nearby" | "accepted">("nearby");
  const { toast } = useToast();
  const [pendingDonations, setPendingDonations] = useState<DonationRow[]>([]);
  const [myDonations, setMyDonations] = useState<DonationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [donorProfiles, setDonorProfiles] = useState<Record<string, ProfileInfo>>({});
  const [volunteerProfiles, setVolunteerProfiles] = useState<Record<string, ProfileInfo>>({});

  const fetchDonations = async () => {
    if (!user) return;
    const { data: pending } = await supabase.from("donations").select("*").eq("status", "pending").order("created_at", { ascending: false });
    const { data: mine } = await supabase.from("donations").select("*").eq("ngo_id", user.id).order("created_at", { ascending: false });

    const allDonations = [...(pending || []), ...(mine || [])];
    setPendingDonations((pending || []) as DonationRow[]);
    setMyDonations((mine || []) as DonationRow[]);

    const donorIds = [...new Set(allDonations.map(d => d.donor_id))];
    if (donorIds.length > 0) {
      const { data: donors } = await supabase.from("profiles").select("user_id, full_name, phone, city").in("user_id", donorIds);
      if (donors) { const map: Record<string, ProfileInfo> = {}; donors.forEach(p => { map[p.user_id] = p; }); setDonorProfiles(map); }
    }

    const volIds = [...new Set(allDonations.filter(d => d.volunteer_id).map(d => d.volunteer_id!))];
    if (volIds.length > 0) {
      const { data: vols } = await supabase.from("profiles").select("user_id, full_name, phone, city").in("user_id", volIds);
      if (vols) { const map: Record<string, ProfileInfo> = {}; vols.forEach(p => { map[p.user_id] = p; }); setVolunteerProfiles(map); }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDonations();
    const channel = supabase.channel("ngo-donations").on("postgres_changes", { event: "*", schema: "public", table: "donations" }, () => { fetchDonations(); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleAccept = async (donationId: string) => {
    if (!user) return;
    setAccepting(donationId);
    try {
      const { error } = await supabase.from("donations").update({ ngo_id: user.id, status: "accepted", accepted_at: new Date().toISOString() }).eq("id", donationId).eq("status", "pending");
      if (error) throw error;
      toast({ title: "Donation Accepted! ✅", description: "A volunteer will be assigned for pickup soon." });
      fetchDonations();
    } catch (error: any) {
      toast({ title: "Failed to accept", description: error.message, variant: "destructive" });
    } finally { setAccepting(null); }
  };

  const filtered = pendingDonations.filter(
    (d) => d.food_item.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (donorProfiles[d.donor_id]?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalReceived = myDonations.length;
  const deliveredCount = myDonations.filter(d => d.status === "delivered").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-background">
      {/* Header */}
      <header className="border-b border-indigo-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Welcome, {profile?.full_name || "Receiver"} 👋</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                🏢 NGO / Receiver Dashboard
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild><Link to="/">Home</Link></Button>
            <Button variant="ghost" size="icon" onClick={signOut}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Package, value: totalReceived, label: "Donations Received", gradient: "from-indigo-500 to-purple-500" },
            { icon: CheckCircle, value: deliveredCount, label: "Delivered", gradient: "from-emerald-500 to-green-500" },
            { icon: TrendingUp, value: pendingDonations.length, label: "Available Now", gradient: "from-amber-500 to-orange-500" },
            { icon: Building, value: profile?.city || "—", label: "City", gradient: "from-rose-500 to-pink-500" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-100/50 hover:shadow-md transition-shadow">
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "nearby" ? "default" : "outline"}
            onClick={() => setActiveTab("nearby")}
            className={activeTab === "nearby" ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0" : ""}
          >
            Available Donations
          </Button>
          <Button
            variant={activeTab === "accepted" ? "default" : "outline"}
            onClick={() => setActiveTab("accepted")}
            className={activeTab === "accepted" ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0" : ""}
          >
            My Accepted
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
        ) : activeTab === "nearby" ? (
          <>
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by food or donor..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-indigo-100/50">
                <Utensils className="w-12 h-12 text-indigo-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No available donations</h3>
                <p className="text-muted-foreground">Check back soon — donors post new food regularly!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filtered.map((donation, index) => {
                  const donor = donorProfiles[donation.donor_id];
                  return (
                    <motion.div
                      key={donation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-100/50 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                            <Utensils className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{donation.food_item}</h3>
                            <p className="text-sm text-muted-foreground">{donor?.full_name || "Donor"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {donation.quantity}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {donation.city || "N/A"}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Expires {format(new Date(donation.expiry_time), "h:mm a")}</span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-indigo-100/50">
                        <span className="text-sm text-muted-foreground truncate max-w-[60%]">📍 {donation.pickup_address}</span>
                        <Button size="sm" onClick={() => handleAccept(donation.id)} disabled={accepting === donation.id} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0">
                          {accepting === donation.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Accept <ChevronRight className="w-4 h-4" /></>}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            {myDonations.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-indigo-100/50">
                <Package className="w-12 h-12 text-indigo-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No accepted donations yet</h3>
                <p className="text-muted-foreground">Accept available donations to get started!</p>
              </div>
            ) : (
              myDonations.map((donation, index) => {
                const volunteer = donation.volunteer_id ? volunteerProfiles[donation.volunteer_id] : null;
                const donor = donorProfiles[donation.donor_id];
                return (
                  <motion.div
                    key={donation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-100/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{donation.food_item}</h3>
                        <p className="text-sm text-muted-foreground">From: {donor?.full_name || "Donor"} • {donation.quantity}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[donation.status] || "bg-muted text-muted-foreground"}`}>
                        {donation.status === "delivered" && <CheckCircle className="w-3.5 h-3.5" />}
                        {donation.status === "picked_up" && <Truck className="w-3.5 h-3.5" />}
                        {donation.status === "accepted" && <Clock className="w-3.5 h-3.5" />}
                        {donation.status.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </div>

                    {volunteer && (
                      <div className="bg-indigo-50 rounded-xl p-3 mt-3 border border-indigo-100">
                        <h4 className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">Volunteer Assigned</h4>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-foreground"><User className="w-4 h-4 text-muted-foreground" /> {volunteer.full_name}</span>
                          {volunteer.phone && <a href={`tel:${volunteer.phone}`} className="flex items-center gap-1 text-indigo-600"><Phone className="w-4 h-4" /> {volunteer.phone}</a>}
                        </div>
                      </div>
                    )}

                    {!volunteer && donation.status === "accepted" && (
                      <div className="bg-amber-50 rounded-xl p-3 mt-3 flex items-center gap-2 text-sm text-amber-700 border border-amber-100">
                        <Clock className="w-4 h-4" />
                        Waiting for a volunteer to accept pickup...
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiverDashboard;
