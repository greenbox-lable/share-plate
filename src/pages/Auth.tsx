import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  UtensilsCrossed,
  Building,
  Bike,
  MapPin,
  Loader2,
} from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const isSignup = searchParams.get("mode") === "signup";
  const [mode, setMode] = useState<"signin" | "signup">(
    isSignup ? "signup" : "signin"
  );
  const [role, setRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, signIn } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    city: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getRoleDashboard = (userRole: string) => {
    switch (userRole) {
      case "donor": return "/donor/dashboard";
      case "ngo": return "/receiver/dashboard";
      case "volunteer": return "/volunteer/dashboard";
      case "admin": return "/admin";
      default: return "/";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "signup" && !role) {
      toast({
        title: "Please select a role",
        description: "Choose whether you want to donate, receive, or volunteer.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email || !formData.password) {
      toast({
        title: "Missing fields",
        description: "Please enter your email and password.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "signup") {
        if (!formData.name) {
          toast({ title: "Name required", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        await signUp(formData.email, formData.password, {
          full_name: formData.name,
          phone: formData.phone,
          city: formData.city,
          role: role,
        });
        toast({
          title: "Account created!",
          description: "Redirecting to your dashboard...",
        });
        navigate(getRoleDashboard(role));
      } else {
        await signIn(formData.email, formData.password);
        // Fetch the actual role from database after sign-in
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .single();
          const userRole = roleData?.role || "donor";
          toast({
            title: "Welcome back!",
            description: "Redirecting to your dashboard...",
          });
          navigate(getRoleDashboard(userRole));
        }
      }
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow">
              <Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />
            </div>
            <span className="text-xl font-bold text-foreground">
              ANNA<span className="text-primary"> SEVA</span>
            </span>
          </Link>

          {/* Header */}
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {mode === "signin" ? "Welcome back" : "Join the movement"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {mode === "signin"
              ? "Sign in to continue making an impact"
              : "Create an account to start sharing food"}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Your name"
                      className="pl-10"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="+91 98765 43210"
                      className="pl-10"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="city"
                      placeholder="e.g., Agra, Delhi, Mumbai"
                      className="pl-10"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Role Selection - only shown for signup */}
            {mode === "signup" && (
            <div className="space-y-2">
              <Label>I am a</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="donor">
                    <span className="flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4" /> Food Donor
                    </span>
                  </SelectItem>
                  <SelectItem value="ngo">
                    <span className="flex items-center gap-2">
                      <Building className="w-4 h-4" /> NGO / Receiver
                    </span>
                  </SelectItem>
                  <SelectItem value="volunteer">
                    <span className="flex items-center gap-2">
                      <Bike className="w-4 h-4" /> Volunteer
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button variant="hero" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {mode === "signin" ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle Mode */}
          <p className="text-center text-muted-foreground mt-6">
            {mode === "signin" ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setMode("signin")}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </motion.div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-hero items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-center text-primary-foreground max-w-md"
        >
          <div className="w-24 h-24 rounded-3xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-8">
            <Heart className="w-12 h-12" fill="currentColor" />
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Every meal shared is a life touched
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            Join thousands of donors, NGOs, and volunteers in building a
            hunger-free India.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-12">
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">50K+</div>
              <div className="text-sm text-primary-foreground/70">Meals</div>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">2.5K+</div>
              <div className="text-sm text-primary-foreground/70">Volunteers</div>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">340+</div>
              <div className="text-sm text-primary-foreground/70">NGOs</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
