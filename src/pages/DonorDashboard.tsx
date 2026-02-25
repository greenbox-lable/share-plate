import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Utensils,
  Clock,
  CheckCircle,
  Truck,
  Package,
  TrendingUp,
  Heart,
  Phone,
  MapPin,
  User,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

type DonationStatus = "pending" | "accepted" | "picked" | "delivered" | "expired";

interface Donation {
  id: number;
  foodType: string;
  description: string;
  quantity: number;
  preparedAt: string;
  expiresIn: string;
  status: DonationStatus;
  createdAt: string;
  acceptedBy?: { name: string; phone: string; address: string };
  deliveredBy?: { name: string; phone: string };
}

const mockDonations: Donation[] = [
  {
    id: 1,
    foodType: "veg",
    description: "Veg Biryani and Raita",
    quantity: 50,
    preparedAt: "12:00 PM",
    expiresIn: "2 hours",
    status: "delivered",
    createdAt: "Today, 11:45 AM",
    acceptedBy: { name: "Hope Foundation", phone: "+91 98765 43210", address: "45 Church Street, Delhi" },
    deliveredBy: { name: "Amit Sharma", phone: "+91 97654 32100" },
  },
  {
    id: 2,
    foodType: "nonveg",
    description: "Chicken Curry with Rice",
    quantity: 30,
    preparedAt: "1:00 PM",
    expiresIn: "1.5 hours",
    status: "picked",
    createdAt: "Today, 12:50 PM",
    acceptedBy: { name: "Seva Ashram", phone: "+91 87654 32109", address: "12 Temple Road, Mumbai" },
    deliveredBy: { name: "Ravi Kumar", phone: "+91 96543 21098" },
  },
  {
    id: 3,
    foodType: "veg",
    description: "Dal, Roti, Sabzi",
    quantity: 100,
    preparedAt: "11:30 AM",
    expiresIn: "3 hours",
    status: "accepted",
    createdAt: "Today, 11:20 AM",
    acceptedBy: { name: "Annapurna Trust", phone: "+91 76543 21098", address: "HSR Layout, Bangalore" },
  },
  {
    id: 4,
    foodType: "veg",
    description: "Mixed Fruits and Salad",
    quantity: 25,
    preparedAt: "10:00 AM",
    expiresIn: "5 hours",
    status: "pending",
    createdAt: "Today, 9:55 AM",
  },
];

const statusConfig: Record<DonationStatus, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  accepted: { label: "Accepted", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  picked: { label: "Picked Up", color: "bg-orange-100 text-orange-700", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700", icon: Package },
  expired: { label: "Expired", color: "bg-red-100 text-red-700", icon: Clock },
};

const stats = [
  { icon: Utensils, value: 12, label: "Total Donations" },
  { icon: Heart, value: 850, label: "Meals Shared" },
  { icon: CheckCircle, value: 10, label: "Delivered" },
  { icon: TrendingUp, value: "92%", label: "Success Rate" },
];

const DonorDashboard = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Welcome, Rajesh 👋</h1>
            <p className="text-sm text-muted-foreground">Donor Dashboard</p>
          </div>
          <div className="flex gap-2">
            <Button variant="hero" asChild>
              <Link to="/donate">
                <Plus className="w-4 h-4 mr-2" />
                Donate Food
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, i) => (
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

        {/* My Donations */}
        <h2 className="text-lg font-bold text-foreground mb-4">My Donations</h2>
        <div className="space-y-4">
          {mockDonations.map((donation, index) => {
            const config = statusConfig[donation.status];
            const StatusIcon = config.icon;
            const isExpanded = expandedId === donation.id;

            return (
              <motion.div
                key={donation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-2xl shadow-soft border border-border overflow-hidden"
              >
                <div
                  className="p-5 cursor-pointer hover:bg-accent/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : donation.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${donation.foodType === "veg" ? "bg-green-50" : "bg-orange-50"}`}>
                        <Utensils className={`w-6 h-6 ${donation.foodType === "veg" ? "text-green-600" : "text-orange-600"}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{donation.description}</h3>
                        <p className="text-sm text-muted-foreground">{donation.quantity} servings • {donation.createdAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {config.label}
                      </span>
                      <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border-t border-border px-5 pb-5 pt-4 space-y-4"
                  >
                    <div className="grid sm:grid-cols-3 gap-3 text-sm">
                      <div className="bg-accent/50 rounded-lg p-3">
                        <span className="text-muted-foreground">Food Type</span>
                        <p className="font-medium text-foreground">{donation.foodType === "veg" ? "🥬 Vegetarian" : "🍗 Non-Veg"}</p>
                      </div>
                      <div className="bg-accent/50 rounded-lg p-3">
                        <span className="text-muted-foreground">Prepared At</span>
                        <p className="font-medium text-foreground">{donation.preparedAt}</p>
                      </div>
                      <div className="bg-accent/50 rounded-lg p-3">
                        <span className="text-muted-foreground">Expires In</span>
                        <p className="font-medium text-foreground">{donation.expiresIn}</p>
                      </div>
                    </div>

                    {donation.acceptedBy && (
                      <div className="bg-blue-50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Accepted by NGO
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p className="flex items-center gap-2 text-foreground">
                            <User className="w-4 h-4 text-muted-foreground" /> {donation.acceptedBy.name}
                          </p>
                          <p className="flex items-center gap-2 text-foreground">
                            <Phone className="w-4 h-4 text-muted-foreground" /> {donation.acceptedBy.phone}
                          </p>
                          <p className="flex items-center gap-2 text-foreground">
                            <MapPin className="w-4 h-4 text-muted-foreground" /> {donation.acceptedBy.address}
                          </p>
                        </div>
                      </div>
                    )}

                    {donation.deliveredBy && (
                      <div className="bg-green-50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                          <Truck className="w-4 h-4" /> Delivered by Volunteer
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p className="flex items-center gap-2 text-foreground">
                            <User className="w-4 h-4 text-muted-foreground" /> {donation.deliveredBy.name}
                          </p>
                          <p className="flex items-center gap-2 text-foreground">
                            <Phone className="w-4 h-4 text-muted-foreground" /> {donation.deliveredBy.phone}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
