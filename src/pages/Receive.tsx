import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Search,
  Filter,
  Utensils,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for available donations
const mockDonations = [
  {
    id: 1,
    foodType: "veg",
    description: "Fresh Biryani and Raita",
    quantity: 50,
    donor: "Hotel Grand Palace",
    distance: "1.2 km",
    expiresIn: "2 hours",
    status: "available",
    address: "Koramangala, Bangalore",
  },
  {
    id: 2,
    foodType: "veg",
    description: "Dal, Rice, Chapati, Sabzi",
    quantity: 100,
    donor: "Wedding Caterers",
    distance: "2.5 km",
    expiresIn: "3 hours",
    status: "available",
    address: "Indiranagar, Bangalore",
  },
  {
    id: 3,
    foodType: "nonveg",
    description: "Chicken Curry with Rice",
    quantity: 30,
    donor: "Corporate Cafe",
    distance: "0.8 km",
    expiresIn: "1.5 hours",
    status: "available",
    address: "HSR Layout, Bangalore",
  },
  {
    id: 4,
    foodType: "veg",
    description: "Mixed Fruits and Salad",
    quantity: 25,
    donor: "Health Restaurant",
    distance: "3.1 km",
    expiresIn: "4 hours",
    status: "available",
    address: "JP Nagar, Bangalore",
  },
];

const Receive = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "veg" | "nonveg">(
    "all"
  );

  const filteredDonations = mockDonations.filter((donation) => {
    const matchesSearch =
      donation.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.donor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" || donation.foodType === selectedFilter;
    return matchesSearch && matchesFilter;
  });

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
            <h1 className="text-xl font-bold text-foreground">Find Food</h1>
            <p className="text-sm text-muted-foreground">
              Available donations near you
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by food type or donor..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {[
              { value: "all", label: "All" },
              { value: "veg", label: "🥬 Veg" },
              { value: "nonveg", label: "🍗 Non-Veg" },
            ].map((filter) => (
              <Button
                key={filter.value}
                variant={selectedFilter === filter.value ? "hero" : "soft"}
                size="sm"
                onClick={() =>
                  setSelectedFilter(filter.value as "all" | "veg" | "nonveg")
                }
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse-soft" />
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {filteredDonations.length}
              </span>{" "}
              donations available nearby
            </span>
          </div>
          <Button variant="ghost" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
        </motion.div>

        {/* Donation Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredDonations.map((donation, index) => (
            <motion.div
              key={donation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl p-5 shadow-soft border border-border hover:shadow-elevated transition-shadow group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      donation.foodType === "veg"
                        ? "bg-success/10"
                        : "bg-secondary/10"
                    }`}
                  >
                    <Utensils
                      className={`w-6 h-6 ${
                        donation.foodType === "veg"
                          ? "text-success"
                          : "text-secondary"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {donation.description}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {donation.donor}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    donation.foodType === "veg"
                      ? "bg-success/10 text-success"
                      : "bg-secondary/10 text-secondary"
                  }`}
                >
                  {donation.foodType === "veg" ? "Veg" : "Non-Veg"}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {donation.quantity} servings
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {donation.distance}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Expires in {donation.expiresIn}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  📍 {donation.address}
                </span>
                <Button
                  variant="hero"
                  size="sm"
                  className="group-hover:scale-105 transition-transform"
                >
                  Accept
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDonations.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No donations found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Receive;
