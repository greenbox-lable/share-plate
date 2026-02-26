import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, MapPin, Clock, Users, Utensils, Heart, CheckCircle, Loader2, Home, Hotel,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Donate = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    foodType: "",
    quantity: "",
    description: "",
    preparedTime: "",
    expiryTime: "",
    address: "",
    landmark: "",
    contactName: profile?.full_name || "",
    contactPhone: profile?.phone || "",
    foodSource: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const today = new Date().toISOString().split("T")[0];
      const expiryTimestamp = new Date(`${today}T${formData.expiryTime}:00`).toISOString();

      const { error } = await supabase.from("donations").insert({
        donor_id: user.id,
        food_item: `${formData.foodType} - ${formData.description}`,
        quantity: `${formData.quantity} servings`,
        expiry_time: expiryTimestamp,
        pickup_address: formData.address + (formData.landmark ? `, Near: ${formData.landmark}` : ""),
        city: profile?.city || "",
        description: formData.description,
        status: "pending",
        food_source: formData.foodSource || "home",
      });

      if (error) throw error;

      setStep(3);
      toast({ title: "Donation Posted! 🎉", description: "We're finding the best match for your donation." });
    } catch (error: any) {
      toast({ title: "Failed to post donation", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/donor/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Donate Food</h1>
            <p className="text-sm text-muted-foreground">Share your surplus, spread smiles</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${step >= s ? "bg-gradient-hero text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 3 && <div className={`w-16 sm:w-24 h-1 mx-2 rounded ${step > s ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          {step === 1 && (
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Utensils className="w-6 h-6 text-primary" /> Food Details
              </h2>

              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="foodType">Food Type</Label>
                    <Select value={formData.foodType} onValueChange={(v) => handleChange("foodType", v)}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="veg">🥬 Vegetarian</SelectItem>
                        <SelectItem value="nonveg">🍗 Non-Vegetarian</SelectItem>
                        <SelectItem value="vegan">🌱 Vegan</SelectItem>
                        <SelectItem value="mixed">🍱 Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity (servings)</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="quantity" type="number" placeholder="e.g., 50" className="pl-10" value={formData.quantity} onChange={(e) => handleChange("quantity", e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Food Source - Ghar ka ya Hotel ka */}
                <div className="space-y-2">
                  <Label>Food Source (खाना कहाँ से है?)</Label>
                  <Select value={formData.foodSource} onValueChange={(v) => handleChange("foodSource", v)}>
                    <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">🏠 Ghar ka (Home)</SelectItem>
                      <SelectItem value="hotel">🏨 Hotel / Restaurant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="What kind of food is it? (e.g., Rice, Dal, Roti, Vegetable curry)" rows={3} value={formData.description} onChange={(e) => handleChange("description", e.target.value)} />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preparedTime">Prepared At</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="preparedTime" type="time" className="pl-10" value={formData.preparedTime} onChange={(e) => handleChange("preparedTime", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryTime">Best Before</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="expiryTime" type="time" className="pl-10" value={formData.expiryTime} onChange={(e) => handleChange("expiryTime", e.target.value)} />
                    </div>
                  </div>
                </div>

                <Button variant="hero" className="w-full" size="lg" onClick={() => setStep(2)} disabled={!formData.foodType || !formData.quantity || !formData.description || !formData.foodSource}>
                  Continue to Pickup Details
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-primary" /> Pickup Location
              </h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Textarea id="address" placeholder="Enter your complete address for pickup" rows={2} value={formData.address} onChange={(e) => handleChange("address", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landmark">Landmark (Optional)</Label>
                  <Input id="landmark" placeholder="Near any famous place?" value={formData.landmark} onChange={(e) => handleChange("landmark", e.target.value)} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name</Label>
                    <Input id="contactName" placeholder="Your name" value={formData.contactName} onChange={(e) => handleChange("contactName", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone Number</Label>
                    <Input id="contactPhone" placeholder="+91 98765 43210" value={formData.contactPhone} onChange={(e) => handleChange("contactPhone", e.target.value)} />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" size="lg" onClick={() => setStep(1)}>Back</Button>
                  <Button variant="hero" className="flex-1" size="lg" onClick={handleSubmit} disabled={isSubmitting || !formData.address || !formData.contactName || !formData.contactPhone}>
                    {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Posting...</> : "Post Donation"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="bg-card rounded-2xl p-8 md:p-12 shadow-soft border border-border text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-hero flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-primary-foreground" fill="currentColor" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Thank You! 🙏</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">Your donation has been posted. We're matching it with nearby NGOs and volunteers.</p>
              <div className="bg-accent rounded-xl p-4 mb-8">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-warning rounded-full animate-pulse-soft" /> Looking for nearby receivers...
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="hero" asChild><Link to="/donor/dashboard">Go to Dashboard</Link></Button>
                <Button variant="outline" onClick={() => { setStep(1); setFormData({ foodType: "", quantity: "", description: "", preparedTime: "", expiryTime: "", address: "", landmark: "", contactName: profile?.full_name || "", contactPhone: profile?.phone || "", foodSource: "" }); }}>
                  Donate More
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Donate;
