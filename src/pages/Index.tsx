import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import ImpactSection from "@/components/landing/ImpactSection";
import RolesSection from "@/components/landing/RolesSection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <ImpactSection />
      <RolesSection />
      <Footer />
    </div>
  );
};

export default Index;
