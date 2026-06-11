import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeatureCard from "../components/FeatureCard";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Navbar />

      <Hero />

      <section style={{ padding: "30px" }}>
        <h2>What We Offer</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          <FeatureCard
            title="Verified Helpers"
            description="Trained companions ready to assist."
          />

          <FeatureCard
            title="AI Matching"
            description="AI recommends the best helper."
          />

          <FeatureCard
            title="Accessible Routes"
            description="Wheelchair-friendly routes."
          />

          <FeatureCard
            title="SOS Tracking"
            description="Emergency support available."
          />

          <FeatureCard
            title="In-App Chat"
            description="Communicate with helpers."
          />

          <FeatureCard
            title="Ratings & Reviews"
            description="Trusted community feedback."
          />
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Home;