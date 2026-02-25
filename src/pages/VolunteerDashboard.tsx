import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Clock,
  Navigation,
  Phone,
  Package,
  TrendingUp,
  Award,
  Bike,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const volunteerStats = {
  totalDeliveries: 47,
  mealsDelivered: 1250,
  hoursVolunteered: 32,
  rating: 4.9,
};

const mockOrders = [
  {
    id: 1,
    donor: "Sharma Caterers",
    food: "Veg Biryani",
    quantity: 50,
    distance: "3.2 km",
    eta: "20 mins",
    expiresIn: "1 hour",
    pickup: { address: "123 MG Road, Koramangala", phone: "+91 98765 43210" },
    dropoff: { name: "Hope Foundation", address: "45 Church Street, JP Nagar", phone: "+91 87654 32109" },
  },
  {
    id: 2,
    donor: "Grand Hotel Kitchen",
    food: "Dal, Rice, Roti",
    quantity: 80,
    distance: "1.8 km",
    eta: "12 mins",
    expiresIn: "2 hours",
    pickup: { address: "Tech Park, Whitefield", phone: "+91 76543 21098" },
    dropoff: { name: "Seva Ashram", address: "12 Temple Road, Indiranagar", phone: "+91 65432 10987" },
  },
  {
    id: 3,
    donor: "Corporate Cafeteria",
    food: "Mixed Thali",
    quantity: 35,
    distance: "4.5 km",
    eta: "28 mins",
    expiresIn: "1.5 hours",
    pickup: { address: "IT Hub, Electronic City", phone: "+91 85432 10976" },
    dropoff: { name: "Annapurna Trust", address: "HSR Layout Main Road", phone: "+91 94321 09876" },
  },
];

const StatCard = ({ icon: Icon, value, label, suffix = "" }: { icon: any; value: number | string; label: string; suffix?: string }) => (
  <div className="bg-card rounded-xl p-4 shadow-soft border border-border">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <div className="text-xl font-bold text-foreground">{value}{suffix}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  </div>
);

const VolunteerDashboard = () => {
  const [isActive, setIsActive] = useState(false);
  const { toast } = useToast();

  const handleToggle = (checked: boolean) => {
    setIsActive(checked);
    toast({
      title: checked ? "You're now Active! 🟢" : "You're now Inactive",
      description: checked ? "You'll start receiving pickup requests." : "You won't receive new requests.",
    });
  };

  const handleAccept = (orderId: number) => {
    toast({
      title: "Pickup Accepted! 🚴",
      description: "Navigate to the pickup location to collect the food.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Welcome, Amit 👋</h1>
            <p className="text-sm text-muted-foreground">Volunteer Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Active/Inactive Toggle */}
            <div className="flex items-center gap-3 bg-card rounded-full px-4 py-2 shadow-soft border border-border">
              <div className={`w-2.5 h-2.5 rounded-full ${isActive ? "bg-green-500 animate-pulse" : "bg-muted-foreground"}`} />
              <Label htmlFor="active-toggle" className="text-sm font-medium cursor-pointer">
                {isActive ? "Active" : "Inactive"}
              </Label>
              <Switch id="active-toggle" checked={isActive} onCheckedChange={handleToggle} />
            </div>
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
          <StatCard icon={Package} value={volunteerStats.totalDeliveries} label="Deliveries" />
          <StatCard icon={TrendingUp} value={volunteerStats.mealsDelivered} label="Meals Delivered" />
          <StatCard icon={Clock} value={`${volunteerStats.hoursVolunteered}h`} label="Time Given" />
          <StatCard icon={Award} value={volunteerStats.rating} label="Rating" suffix=" ⭐" />
        </motion.div>

        {/* Content based on active status */}
        {!isActive ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-12 shadow-soft border border-border text-center"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">You are currently Inactive</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Turn on the Active toggle to start receiving live pickup requests — just like Swiggy or Zomato!
            </p>
            <Button variant="hero" size="lg" onClick={() => handleToggle(true)}>
              <Bike className="w-5 h-5 mr-2" />
              Go Active Now
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <h2 className="text-lg font-bold text-foreground">Available Pickups</h2>
              <span className="text-sm text-muted-foreground">({mockOrders.length} nearby)</span>
            </div>

            <div className="space-y-4">
              {mockOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-6 shadow-soft border border-border"
                >
                  {/* Food Info Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{order.donor}</h3>
                      <p className="text-sm text-muted-foreground">{order.food} • {order.quantity} meals</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {order.expiresIn} left
                    </div>
                  </div>

                  {/* Route */}
                  <div className="space-y-3 mb-5">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        </div>
                        <div className="w-0.5 h-10 bg-border" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Pickup</div>
                        <div className="font-medium text-foreground">{order.pickup.address}</div>
                        <a href={`tel:${order.pickup.phone}`} className="text-sm text-primary flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {order.pickup.phone}
                        </a>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center">
                        <MapPin className="w-3.5 h-3.5 text-secondary" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Dropoff — {order.dropoff.name}</div>
                        <div className="font-medium text-foreground">{order.dropoff.address}</div>
                        <a href={`tel:${order.dropoff.phone}`} className="text-sm text-primary flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {order.dropoff.phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Navigation className="w-4 h-4" /> {order.distance}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> ETA: {order.eta}</span>
                    </div>
                    <Button variant="hero" onClick={() => handleAccept(order.id)}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept Pickup
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VolunteerDashboard;
