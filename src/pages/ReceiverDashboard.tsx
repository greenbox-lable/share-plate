import { useState } from "react";
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
  Filter,
} from "lucide-react";
import { Link } from "react-router-dom";

const ngoStats = [
  { icon: Package, value: 28, label: "Donations Received" },
  { icon: Users, value: 2100, label: "People Fed" },
  { icon: TrendingUp, value: 15, label: "This Month" },
  { icon: Building, value: "4.8 ⭐", label: "Trust Score" },
];

interface NearbyDonation {
  id: number;
  foodType: string;
  description: string;
  quantity: number;
  donor: string;
  distance: string;
  expiresIn: string;
  address: string;
}

const nearbyDonations: NearbyDonation[] = [
  { id: 1, foodType: "veg", description: "Fresh Biryani and Raita", quantity: 50, donor: "Hotel Grand Palace", distance: "1.2 km", expiresIn: "2 hours", address: "Koramangala, Bangalore" },
  { id: 2, foodType: "veg", description: "Dal, Rice, Chapati", quantity: 100, donor: "Wedding Caterers", distance: "2.5 km", expiresIn: "3 hours", address: "Indiranagar, Bangalore" },
  { id: 3, foodType: "nonveg", description: "Chicken Curry with Rice", quantity: 30, donor: "Corporate Cafe", distance: "0.8 km", expiresIn: "1.5 hours", address: "HSR Layout, Bangalore" },
];

interface AcceptedDonation {
  id: number;
  description: string;
  quantity: number;
  donor: string;
  status: "accepted" | "picked" | "delivered";
  volunteer?: { name: string; phone: string };
}

const acceptedDonations: AcceptedDonation[] = [
  { id: 101, description: "Veg Thali - 80 servings", quantity: 80, donor: "Sharma Caterers", status: "delivered", volunteer: { name: "Amit Sharma", phone: "+91 97654 32100" } },
  { id: 102, description: "Fruits and Juice", quantity: 40, donor: "Fresh Mart", status: "picked", volunteer: { name: "Ravi Kumar", phone: "+91 96543 21098" } },
  { id: 103, description: "Paneer Curry, Rice", quantity: 60, donor: "Restaurant Hub", status: "accepted" },
];

const statusColors = {
  accepted: "bg-blue-100 text-blue-700",
  picked: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
};

const ReceiverDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"nearby" | "accepted">("nearby");
  const { toast } = useToast();

  const filtered = nearbyDonations.filter(
    (d) => d.description.toLowerCase().includes(searchQuery.toLowerCase()) || d.donor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAccept = (id: number) => {
    toast({
      title: "Donation Accepted! ✅",
      description: "A volunteer will be assigned for pickup soon.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Welcome, Seva Foundation 👋</h1>
            <p className="text-sm text-muted-foreground">NGO Dashboard</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/">Home</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button variant={activeTab === "nearby" ? "hero" : "soft"} onClick={() => setActiveTab("nearby")}>
            Nearby Donations
          </Button>
          <Button variant={activeTab === "accepted" ? "hero" : "soft"} onClick={() => setActiveTab("accepted")}>
            My Accepted
          </Button>
        </div>

        {activeTab === "nearby" ? (
          <>
            {/* Search */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by food or donor..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((donation, index) => (
                <motion.div
                  key={donation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-5 shadow-soft border border-border hover:shadow-elevated transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${donation.foodType === "veg" ? "bg-green-50" : "bg-orange-50"}`}>
                        <Utensils className={`w-6 h-6 ${donation.foodType === "veg" ? "text-green-600" : "text-orange-600"}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{donation.description}</h3>
                        <p className="text-sm text-muted-foreground">{donation.donor}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {donation.quantity} servings</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {donation.distance}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {donation.expiresIn}</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-sm text-muted-foreground">📍 {donation.address}</span>
                    <Button variant="hero" size="sm" onClick={() => handleAccept(donation.id)}>
                      Accept <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {acceptedDonations.map((donation, index) => (
              <motion.div
                key={donation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-2xl p-5 shadow-soft border border-border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{donation.description}</h3>
                    <p className="text-sm text-muted-foreground">From: {donation.donor}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusColors[donation.status]}`}>
                    {donation.status === "delivered" && <CheckCircle className="w-3.5 h-3.5" />}
                    {donation.status === "picked" && <Truck className="w-3.5 h-3.5" />}
                    {donation.status === "accepted" && <Clock className="w-3.5 h-3.5" />}
                    {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                  </span>
                </div>

                {donation.volunteer && (
                  <div className="bg-accent/50 rounded-xl p-3 mt-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Volunteer Assigned</h4>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-foreground"><User className="w-4 h-4 text-muted-foreground" /> {donation.volunteer.name}</span>
                      <a href={`tel:${donation.volunteer.phone}`} className="flex items-center gap-1 text-primary"><Phone className="w-4 h-4" /> {donation.volunteer.phone}</a>
                    </div>
                  </div>
                )}

                {!donation.volunteer && donation.status === "accepted" && (
                  <div className="bg-yellow-50 rounded-xl p-3 mt-3 flex items-center gap-2 text-sm text-yellow-700">
                    <Clock className="w-4 h-4" />
                    Waiting for a volunteer to accept pickup...
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiverDashboard;
