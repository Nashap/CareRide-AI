import Navbar from "../components/layout/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import Services from "../components/landing/Services";
import CTA from "../components/landing/CTA";
import Footer from "../components/layout/Footer";

function Home() {
  return (
    <div className="bg-cr-bg min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Services />
      <CTA />
      <Footer />
    </div>
  );
}

export default Home;