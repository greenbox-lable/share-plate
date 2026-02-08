import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Building, Bike, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const roles = [
  {
    icon: UtensilsCrossed,
    title: "Food Donor",
    description:
      "Restaurants, hotels, caterers, or households with surplus food ready to share.",
    features: ["Quick 1-min posting", "Real-time tracking", "Impact dashboard"],
    cta: "Start Donating",
    href: "/donate",
    gradient: "bg-gradient-hero",
  },
  {
    icon: Building,
    title: "NGO / Shelter",
    description:
      "Orphanages, old-age homes, and community kitchens looking for food support.",
    features: ["Nearby donation alerts", "Accept/decline requests", "Volunteer coordination"],
    cta: "Register as NGO",
    href: "/receive",
    gradient: "bg-gradient-warm",
  },
  {
    icon: Bike,
    title: "Volunteer",
    description:
      "Heroes who pick up and deliver food, connecting donors with receivers.",
    features: ["Optimized routes", "Flexible timing", "Recognition badges"],
    cta: "Become a Volunteer",
    href: "/volunteer",
    gradient: "bg-gradient-hero",
  },
];

const RolesSection = () => {
  return (
    <section className="py-20 md:py-32 bg-card">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Join the Movement
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
            Choose Your Role
          </h2>
          <p className="text-muted-foreground text-lg">
            Whether you have food to share, need support, or want to help — there's
            a place for you in our community.
          </p>
        </motion.div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-background rounded-2xl p-8 shadow-soft hover:shadow-elevated transition-all duration-300 h-full border border-border flex flex-col">
                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-xl ${role.gradient} flex items-center justify-center mb-6 group-hover:scale-105 transition-transform`}
                >
                  <role.icon className="w-8 h-8 text-primary-foreground" />
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {role.title}
                </h3>
                <p className="text-muted-foreground mb-6">{role.description}</p>

                {/* Features */}
                <ul className="space-y-2 mb-8 flex-grow">
                  {role.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={index === 1 ? "warm" : "hero"}
                  className="w-full group/btn"
                  asChild
                >
                  <Link to={role.href}>
                    {role.cta}
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RolesSection;
