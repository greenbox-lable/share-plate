import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-food-sharing.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Community food sharing"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between">
          {/* Left Floating Cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="hidden xl:flex flex-col gap-4 w-64"
          >
            <FloatingCard
              title="Food Rescued"
              subtitle="120 kg saved today"
              location="Bangalore, India"
              time="Updated just now"
              delay={0.5}
              variant="success"
            />
            <FloatingCard
              title="NGO Matched"
              subtitle="Hope Foundation accepted"
              location="JP Nagar, Bangalore"
              time="5 mins ago"
              delay={0.7}
              variant="warm"
            />
          </motion.div>

          {/* Center Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-accent rounded-full px-4 py-2 mb-6"
            >
              <span className="w-2 h-2 bg-success rounded-full animate-pulse-soft" />
              <span className="text-sm font-medium text-muted-foreground">
                1,200+ meals shared today
              </span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Turn Surplus Food Into{" "}
              <span className="text-gradient-hero">Smiles</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Connect with local NGOs and volunteers to donate excess food from
              your restaurant, event, or home. Together, we can end hunger and
              reduce food waste in our communities.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button variant="hero" size="xl" asChild>
                <Link to="/donate" className="gap-2">
                  Donate Food <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/receive">I Need Food</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8">
              <StatItem icon={Heart} value="50,000+" label="Meals Served" />
              <StatItem icon={Users} value="2,500+" label="Volunteers" />
              <StatItem icon={MapPin} value="100+" label="Cities" />
            </div>
          </motion.div>

          {/* Right Floating Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hidden xl:flex flex-col gap-4 w-64"
          >
            <FloatingCard
              title="New Donation"
              subtitle="50 meals available"
              location="Koramangala, Bangalore"
              time="Expires in 2 hours"
              delay={0.5}
            />
            <FloatingCard
              title="Pickup Assigned"
              subtitle="Volunteer on the way"
              location="Indiranagar, Bangalore"
              time="ETA: 15 mins"
              delay={0.7}
              variant="warm"
            />
            <FloatingCard
              title="Delivered!"
              subtitle="30 meals to Hope NGO"
              location="JP Nagar, Bangalore"
              time="Just now"
              delay={0.9}
              variant="success"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const StatItem = ({
  icon: Icon,
  value,
  label,
}: {
  icon: any;
  value: string;
  label: string;
}) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <div className="text-left">
      <div className="text-xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  </div>
);

const FloatingCard = ({
  title,
  subtitle,
  location,
  time,
  className = "",
  delay = 0,
  variant = "default",
}: {
  title: string;
  subtitle: string;
  location: string;
  time: string;
  className?: string;
  delay?: number;
  variant?: "default" | "warm" | "success";
}) => {
  const variants = {
    default: "border-border",
    warm: "border-secondary/30",
    success: "border-success/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className={`bg-card/95 backdrop-blur-sm rounded-2xl p-4 shadow-elevated border-2 ${variants[variant]} w-full ${className}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-foreground">{title}</h4>
        <div
          className={`w-2 h-2 rounded-full ${
            variant === "success"
              ? "bg-success"
              : variant === "warm"
              ? "bg-secondary"
              : "bg-primary"
          }`}
        />
      </div>
      <p className="text-sm text-muted-foreground mb-2">{subtitle}</p>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="w-3 h-3" />
        {location}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{time}</div>
    </motion.div>
  );
};

export default HeroSection;
