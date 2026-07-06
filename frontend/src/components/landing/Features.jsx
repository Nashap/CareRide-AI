import { useState, useEffect, useCallback } from "react";
import {
  Brain,
  ShieldCheck,
  MapPin,
  Heart,
  Users,
  Bot,
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

function Features() {
  const features = [
    {
      icon: <Brain size={28} />,
      title: "AI helper matching",
      description:
        "Matches by skill, distance, ratings and availability in seconds.",
    },
    {
      icon: <ShieldCheck size={28} />,
      title: "Verified helpers",
      description:
        "Background-checked volunteers, caregivers and trained companions.",
    },
    {
      icon: <MapPin size={28} />,
      title: "Accessible routes",
      description:
        "Wheelchair-friendly paths, ramps and barrier-free entrances.",
    },
    {
      icon: <Heart size={28} />,
      title: "Special assistance",
      description:
        "Elderly care, visual/hearing support and post-surgery assistance.",
    },
    {
      icon: <Users size={28} />,
      title: "Companion support",
      description:
        "Trusted company for hospital visits, errands and appointments.",
    },
    {
      icon: <Bot size={28} />,
      title: "AI travel assistant",
      description:
        "Friendly AI guidance for accessibility, bookings and travel planning.",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextCard = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  }, [features.length]);

  const prevCard = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
  }, [features.length]);

  const goToCard = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextCard();
    }, 4000);
    return () => clearInterval(interval);
  }, [nextCard, currentIndex]);

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      nextCard();
    } else if (info.offset.x > swipeThreshold) {
      prevCard();
    }
  };

  const getCardStyle = (index) => {
    if (index === currentIndex) return "active";
    if (index === (currentIndex - 1 + features.length) % features.length) return "prev";
    if (index === (currentIndex + 1) % features.length) return "next";
    return "hidden";
  };

  const variants = {
    active: {
      scale: 1,
      x: "0%",
      opacity: 1,
      zIndex: 30,
      filter: "blur(0px)",
      boxShadow: "0 25px 50px -12px rgba(26,63,117,0.15)",
    },
    prev: {
      scale: isMobile ? 0.9 : 0.85,
      x: isMobile ? "-35%" : "-65%",
      opacity: isMobile ? 0.6 : 0.4,
      zIndex: 20,
      filter: "blur(2px)",
      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
    },
    next: {
      scale: isMobile ? 0.9 : 0.85,
      x: isMobile ? "35%" : "65%",
      opacity: isMobile ? 0.6 : 0.4,
      zIndex: 20,
      filter: "blur(2px)",
      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
    },
    hidden: {
      scale: 0.7,
      x: "0%",
      opacity: 0,
      zIndex: 0,
      filter: "blur(4px)",
    }
  };

  return (
    <section
      id="features"
      className="pt-12 pb-16 md:py-24 bg-cr-bg relative overflow-hidden"
    >
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.2 } }
        }}
        className="w-full max-w-[1480px] mx-auto px-5 md:px-8 lg:px-10 relative z-10"
      >

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[40%_60%] gap-12 lg:gap-16 items-center">

          {/* Left Side: Title & Description */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="flex flex-col justify-center text-center md:text-left md:pr-4 lg:pr-8"
          >
            <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-cr-text-primary leading-tight mb-4 md:mb-6">
              Designed for trust,
              <br className="hidden md:block" />
              built for <span className="text-cr-primary">everyone</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-cr-text-muted leading-relaxed max-w-[500px] mx-auto md:mx-0 mb-6 md:mb-8">
              Every ride is supported by verified helpers
              and thoughtful Artificial Intelligence,
              helping people travel safely, comfortably,
              and independently.
            </p>
            <div>
              <button className="flex items-center justify-center md:justify-start w-full md:w-auto min-h-[48px] text-cr-primary font-semibold hover:text-cr-primary-hover transition-colors group text-base md:text-lg">
                Learn More 
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Right Side: Features List (Mobile) / Carousel (Desktop) */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, scale: 0.95, y: 40 },
              visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="relative w-full flex flex-col items-center"
          >
            {/* 3D Carousel (Mobile & Desktop) */}
            <div className="flex relative w-full h-[400px] md:h-[450px] items-center justify-center mt-8 md:mt-0">
              
              {/* Cards Container */}
              <div className="relative w-full max-w-[320px] md:max-w-[420px] h-[360px] md:h-full flex items-center justify-center">
                {features.map((feature, index) => {
                  const position = getCardStyle(index);
                  
                  return (
                    <motion.div
                      key={index}
                      className="absolute w-full bg-cr-card rounded-[32px] p-6 md:p-10 border border-cr-border flex flex-col items-start cursor-grab active:cursor-grabbing shadow-xl"
                      variants={variants}
                      initial="hidden"
                      animate={position}
                      transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={handleDragEnd}
                      onClick={() => {
                        if (position === "prev") prevCard();
                        else nextCard();
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-cr-sage/30 text-cr-primary flex items-center justify-center mb-6 md:mb-8">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-cr-text-primary mb-3 md:mb-4 leading-tight">
                        {feature.title}
                      </h3>
                      <p className="text-cr-text-muted text-sm md:text-base leading-relaxed mb-6 md:mb-8">
                        {feature.description}
                      </p>
                      <button className="mt-auto text-cr-primary text-sm font-semibold hover:underline">
                        Learn More
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Navigation Arrows (Desktop Only) */}
              <button
                onClick={prevCard}
                className="absolute left-0 xl:left-8 z-40 w-12 h-12 bg-cr-card border border-cr-border rounded-full flex items-center justify-center text-cr-text-primary hover:bg-cr-surface transition-colors shadow-md hidden sm:flex"
                aria-label="Previous feature"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextCard}
                className="absolute right-0 xl:right-8 z-40 w-12 h-12 bg-cr-card border border-cr-border rounded-full flex items-center justify-center text-cr-text-primary hover:bg-cr-surface transition-colors shadow-md hidden sm:flex"
                aria-label="Next feature"
              >
                <ChevronRight size={24} />
              </button>
              
            </div>



          </motion.div>

        </div>

      </motion.div>
    </section>
  );
}

export default Features;