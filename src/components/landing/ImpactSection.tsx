import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Utensils, Users, Leaf, Building2 } from "lucide-react";

const stats = [
  {
    icon: Utensils,
    value: 52847,
    suffix: "+",
    label: "Meals Served",
    description: "Hot, nutritious meals delivered to those in need",
  },
  {
    icon: Users,
    value: 2500,
    suffix: "+",
    label: "Active Volunteers",
    description: "Dedicated individuals making a difference daily",
  },
  {
    icon: Leaf,
    value: 125,
    suffix: " tons",
    label: "CO₂ Saved",
    description: "Reducing environmental impact through food rescue",
  },
  {
    icon: Building2,
    value: 340,
    suffix: "+",
    label: "Partner NGOs",
    description: "Verified organizations across India",
  },
];

const useCountUp = (end: number, duration: number = 2, inView: boolean) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, inView]);

  return count;
};

const StatCard = ({
  stat,
  index,
  inView,
}: {
  stat: (typeof stats)[0];
  index: number;
  inView: boolean;
}) => {
  const count = useCountUp(stat.value, 2.5, inView);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="text-center"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
        <stat.icon className="w-8 h-8 text-primary" />
      </div>
      <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
        {count.toLocaleString()}
        {stat.suffix}
      </div>
      <div className="text-lg font-semibold text-foreground mb-1">
        {stat.label}
      </div>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        {stat.description}
      </p>
    </motion.div>
  );
};

const ImpactSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="impact" className="py-20 md:py-32 bg-background" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">
            Our Impact
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
            Every Meal Counts
          </h2>
          <p className="text-muted-foreground text-lg">
            Together, we're building a hunger-free India. Here's the impact
            we've made so far.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} inView={inView} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 bg-accent rounded-full px-6 py-3">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse-soft" />
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground">1,200+</span> meals
              being shared right now
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ImpactSection;
