import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  MapPin,
  Clock,
  Users,
  Utensils,
  ChevronRight,
  CheckCircle,
  Package,
  TrendingUp,
  Building,
  Truck,
  Phone,
  User,
  LogOut,
  Loader2,
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
  accepted: "bg-blue-100 text-blue-700",
  picked_up: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
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

    // Fetch pending donations
    const { data: pending } = await supabase
      .from("donations")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    // Fetch my accepted donations
    const { data: mine } = await supabase
      .from("donations")
      .select("*")
      .eq("ngo_id", user.id)
      .order("created_at", { ascending: false });

    const allDonations = [...(pending || []), ...(mine || [])];
    setPendingDonations((pending || []) as DonationRow[]);
    setMyDonations((mine || []) as DonationRow[]);

    // Fetch donor profiles
    const donorIds = [...new Set(allDonations.map(d => d.donor_id))];
    if (donorIds.length > 0) {
      const { data: donors } = await supabase.from("profiles").select("user_id, full_name, phone, city").in("user_id", donorIds);
      if (donors) {
        const map: Record<string, ProfileInfo> = {};
        donors.forEach(p => { map[p.user_id] = p; });
        setDonorProfiles(map);
      }
    }

    // Fetch volunteer profiles
    const volIds = [...new Set(allDonations.filter(d => d.volunteer_id).map(d => d.volunteer_id!))];
    if (volIds.length > 0) {
      const { data: vols } = await supabase.from("profiles").select("user_id, full_name, phone, city").in("user_id", volIds);
      if (vols) {
        const map: Record<string, ProfileInfo> = {};
        vols.forEach(p => { map[p.user_id] = p; });
        setVolunteerProfiles(map);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchDonations();

    const channel = supabase
      .channel("ngo-donations")
      .on("postgres_changes", { event: "*", schema: "public", table: "donations" }, () => {
        fetchDonations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleAccept = async (donationId: string) => {
    if (!user) return;
    setAccepting(donationId);
    try {
      const { error } = await supabase
        .from("donations")
        .update({ ngo_id: user.id, status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", donationId)
        .eq("status", "pending");

      if (error) throw error;

      toast({ title: "Donation Accepted! ✅", description: "A volunteer will be assigned for pickup soon." });
      fetchDonations();
    } catch (error: any) {
      toast({ title: "Failed to accept", description: error.message, variant: "destructive" });
    } finally {
      setAccepting(null);
    }
  };

  const filtered = pendingDonations.filter(
    (d) => d.food_item.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (donorProfiles[d.donor_id]?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalReceived = myDonations.length;
  const deliveredCount = myDonations.filter(d => d.status === "delivered").length;

  const ngoStats = [
    { icon: Package, value: totalReceived, label: "Donations Received" },
    { icon: CheckCircle, value: deliveredCount, label: "Delivered" },
    { icon: TrendingUp, value: pendingDonations.length, label: "Available Now" },
    { icon: Building, value: profile?.city || "—", label: "City" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Welcome, {profile?.full_name || "Receiver"} 👋</h1>
            <p className="text-sm text-muted-foreground">NGO Dashboard</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild><Link to="/">Home</Link></Button>
            <Button variant="ghost" size="icon" onClick={signOut}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {ngoStats.map((stat, i) => (
            <div key={i} className="bg-card rounded-xl p-4 shadow-soft border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="flex gap-2 mb-6">
          <Button variant={activeTab === "nearby" ? "hero" : "soft"} onClick={() => setActiveTab("nearby")}>Available Donations</Button>
          <Button variant={activeTab === "accepted" ? "hero" : "soft"} onClick={() => setActiveTab("accepted")}>My Accepted</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : activeTab === "nearby" ? (
          <>
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by food or donor..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-card rounded-2xl p-12 text-center border border-border">
                <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
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
                      className="bg-card rounded-2xl p-5 shadow-soft border border-border hover:shadow-elevated transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10">
                            <Utensils className="w-6 h-6 text-primary" />
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
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className="text-sm text-muted-foreground truncate max-w-[60%]">📍 {donation.pickup_address}</span>
                        <Button variant="hero" size="sm" onClick={() => handleAccept(donation.id)} disabled={accepting === donation.id}>
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
              <div className="bg-card rounded-2xl p-12 text-center border border-border">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
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
                    className="bg-card rounded-2xl p-5 shadow-soft border border-border"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{donation.food_item}</h3>
                        <p className="text-sm text-muted-foreground">From: {donor?.full_name || "Donor"} • {donation.quantity}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusColors[donation.status] || "bg-muted text-muted-foreground"}`}>
                        {donation.status === "delivered" && <CheckCircle className="w-3.5 h-3.5" />}
                        {donation.status === "picked_up" && <Truck className="w-3.5 h-3.5" />}
                        {donation.status === "accepted" && <Clock className="w-3.5 h-3.5" />}
                        {donation.status.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </div>

                    {volunteer && (
                      <div className="bg-accent/50 rounded-xl p-3 mt-3">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Volunteer Assigned</h4>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-foreground"><User className="w-4 h-4 text-muted-foreground" /> {volunteer.full_name}</span>
                          {volunteer.phone && <a href={`tel:${volunteer.phone}`} className="flex items-center gap-1 text-primary"><Phone className="w-4 h-4" /> {volunteer.phone}</a>}
                        </div>
                      </div>
                    )}

                    {!volunteer && donation.status === "accepted" && (
                      <div className="bg-yellow-50 rounded-xl p-3 mt-3 flex items-center gap-2 text-sm text-yellow-700">
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
