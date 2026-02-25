import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Message Sent!", description: "We'll get back to you within 24 hours." });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-16 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold mb-4">
            Contact Us
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-primary-foreground/80">
            Have questions? We'd love to hear from you.
          </motion.p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Info */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Get in Touch</h2>
                <p className="text-muted-foreground">Whether you want to partner, volunteer, or just learn more — reach out!</p>
              </div>
              {[
                { icon: Mail, label: "Email", value: "hello@foodbridge.org" },
                { icon: Phone, label: "Phone", value: "+91 1800 123 4567" },
                { icon: MapPin, label: "Location", value: "Agra, India" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{item.label}</div>
                    <div className="font-semibold text-foreground">{item.value}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit}
              className="bg-card rounded-2xl p-8 border border-border shadow-soft space-y-5"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input placeholder="Your name" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input placeholder="How can we help?" value={formData.subject} onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea placeholder="Your message..." rows={5} value={formData.message} onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))} />
              </div>
              <Button variant="hero" className="w-full" size="lg">
                <Send className="w-4 h-4 mr-2" /> Send Message
              </Button>
            </motion.form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
