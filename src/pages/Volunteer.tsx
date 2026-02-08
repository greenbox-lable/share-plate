import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Navigation,
  CheckCircle,
  Phone,
  Package,
  TrendingUp,
  Award,
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for pickup requests
const mockPickups = [
  {
    id: 1,
    status: "pending",
    pickup: {
      name: "Hotel Grand Palace",
      address: "123 MG Road, Koramangala",
      phone: "+91 98765 43210",
    },
    dropoff: {
      name: "Hope Foundation NGO",
      address: "45 Church Street, JP Nagar",
      phone: "+91 87654 32109",
    },
    food: "Biryani and Raita - 50 servings",
    distance: "4.2 km",
    eta: "25 mins",
    expiresIn: "2 hours",
  },
  {
    id: 2,
    status: "in_progress",
    pickup: {
      name: "Corporate Cafe",
      address: "Tech Park, Whitefield",
      phone: "+91 76543 21098",
    },
    dropoff: {
      name: "Seva Ashram",
      address: "12 Temple Road, Indiranagar",
      phone: "+91 65432 10987",
    },
    food: "Lunch Thali - 30 servings",
    distance: "6.8 km",
    eta: "35 mins",
    expiresIn: "1.5 hours",
  },
];

const volunteerStats = {
  totalDeliveries: 47,
  mealsDelivered: 1250,
  hoursVolunteered: 32,
  rating: 4.9,
};

const Volunteer = () => {
  const [activeTab, setActiveTab] = useState<"available" | "active">("available");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Volunteer Hub</h1>
            <p className="text-sm text-muted-foreground">
              Pick up and deliver food donations
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            icon={Package}
            value={volunteerStats.totalDeliveries}
            label="Deliveries"
          />
          <StatCard
            icon={TrendingUp}
            value={volunteerStats.mealsDelivered}
            label="Meals Delivered"
          />
          <StatCard
            icon={Clock}
            value={`${volunteerStats.hoursVolunteered}h`}
            label="Time Given"
          />
          <StatCard
            icon={Award}
            value={volunteerStats.rating}
            label="Rating"
            suffix="⭐"
          />
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "available" ? "hero" : "soft"}
            onClick={() => setActiveTab("available")}
          >
            Available Pickups
          </Button>
          <Button
            variant={activeTab === "active" ? "hero" : "soft"}
            onClick={() => setActiveTab("active")}
          >
            My Active Tasks
          </Button>
        </div>

        {/* Pickup Cards */}
        <div className="space-y-4">
          {mockPickups.map((pickup, index) => (
            <motion.div
              key={pickup.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-soft border border-border"
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    pickup.status === "in_progress"
                      ? "bg-warning/10 text-warning"
                      : "bg-success/10 text-success"
                  }`}
                >
                  {pickup.status === "in_progress" ? (
                    <>
                      <Clock className="w-4 h-4" />
                      In Progress
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Available
                    </>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Expires in {pickup.expiresIn}
                </div>
              </div>

              {/* Route Info */}
              <div className="space-y-4 mb-6">
                {/* Pickup Location */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    </div>
                    <div className="w-0.5 h-12 bg-border" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Pickup
                    </div>
                    <div className="font-semibold text-foreground">
                      {pickup.pickup.name}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {pickup.pickup.address}
                    </div>
                    <a
                      href={`tel:${pickup.pickup.phone}`}
                      className="text-sm text-primary flex items-center gap-1 mt-1 hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      {pickup.pickup.phone}
                    </a>
                  </div>
                </div>

                {/* Dropoff Location */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-secondary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Dropoff
                    </div>
                    <div className="font-semibold text-foreground">
                      {pickup.dropoff.name}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {pickup.dropoff.address}
                    </div>
                    <a
                      href={`tel:${pickup.dropoff.phone}`}
                      className="text-sm text-primary flex items-center gap-1 mt-1 hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      {pickup.dropoff.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Food Info */}
              <div className="bg-accent rounded-xl p-4 mb-6">
                <div className="text-sm text-muted-foreground mb-1">Food Details</div>
                <div className="font-medium text-foreground">{pickup.food}</div>
              </div>

              {/* Distance and Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-4 h-4" />
                    {pickup.distance}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    ETA: {pickup.eta}
                  </span>
                </div>
                <div className="flex gap-2">
                  {pickup.status === "pending" ? (
                    <Button variant="hero" className="flex-1 sm:flex-none">
                      Accept Pickup
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" className="flex-1 sm:flex-none">
                        Navigate
                      </Button>
                      <Button variant="warm" className="flex-1 sm:flex-none">
                        Mark Delivered
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  icon: Icon,
  value,
  label,
  suffix = "",
}: {
  icon: any;
  value: number | string;
  label: string;
  suffix?: string;
}) => (
  <div className="bg-card rounded-xl p-4 shadow-soft border border-border">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <div className="text-xl font-bold text-foreground">
          {value}
          {suffix}
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  </div>
);

export default Volunteer;
