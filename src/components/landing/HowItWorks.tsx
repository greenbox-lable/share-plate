import { motion } from "framer-motion";
import { Package, MapPin, Truck, Heart, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Package,
    title: "Post Your Donation",
    description:
      "List your surplus food with details like quantity, type, and pickup time. It takes less than a minute.",
    color: "primary",
  },
  {
    icon: MapPin,
    title: "Get Matched",
    description:
      "Our smart algorithm connects you with nearby NGOs and shelters who need your food the most.",
    color: "secondary",
  },
  {
    icon: Truck,
    title: "Volunteer Pickup",
    description:
      "A verified volunteer picks up the food from your location and delivers it to those in need.",
    color: "primary",
  },
  {
    icon: Heart,
    title: "Make Impact",
    description:
      "Track your donations and see the real impact you're making in reducing hunger and waste.",
    color: "secondary",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-card">
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
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
            How AnnaSeva Works
          </h2>
          <p className="text-muted-foreground text-lg">
            From posting a donation to seeing smiles — the entire process takes
            less than an hour.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full">
                  <ArrowRight className="w-6 h-6 text-border" />
                </div>
              )}

              <div className="bg-background rounded-2xl p-6 shadow-soft hover:shadow-elevated transition-shadow duration-300 h-full border border-border">
                {/* Step Number */}
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      step.color === "primary"
                        ? "bg-gradient-hero"
                        : "bg-gradient-warm"
                    }`}
                  >
                    <step.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="text-4xl font-bold text-border">
                    0{index + 1}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
