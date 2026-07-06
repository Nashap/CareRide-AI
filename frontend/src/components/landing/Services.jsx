import { useState, useEffect, useCallback } from "react";
import {
  Car,
  Accessibility,
  HeartHandshake,
  Hospital,
  ShoppingBag,
  Bot
} from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

const MobilePinnedServices = ({ services }) => {
  const containerRef = useRef(null);
  const total = services.length;
  
  // 400vh scroll track
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const springProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 20,
    restDelta: 0.001
  });

  return (
    <div ref={containerRef} className="relative w-full h-[400vh] md:hidden block">
      {/* Pinned Viewport */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden px-5">
        
        {/* Title pinned at top */}
        <div className="mb-10 text-center flex flex-col items-center -mt-10">
           <span className="cr-badge-custom px-4 py-2 rounded-full text-sm font-medium w-fit mb-4 transition-colors">
              Our Services
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-cr-text-primary leading-tight mt-2">
              Everything you need for
              <br/>
              <span className="text-cr-primary"> safe travel</span>
            </h2>
        </div>

        {/* Cards stack */}
        <div className="relative w-full max-w-[360px] h-[380px] perspective-[1200px]">
          {services.map((service, index) => {
            // Calculate dynamic transforms based on continuous scroll progress
            const y = useTransform(springProgress, (p) => {
               const currentIndex = p * (total - 1);
               const diff = currentIndex - index;
               // Entering from below
               if (diff < 0) return diff < -1 ? 400 : -diff * 400;
               // Pushed back upward slightly
               return -diff * 20; 
            });

            const scale = useTransform(springProgress, (p) => {
               const currentIndex = p * (total - 1);
               const diff = currentIndex - index;
               // Entering: scaling up
               if (diff < 0) return diff < -1 ? 0.9 : 1 + diff * 0.1; 
               // Pushed back: scaling down
               return Math.max(0.85, 1 - diff * 0.04); 
            });

            const opacity = useTransform(springProgress, (p) => {
               const currentIndex = p * (total - 1);
               const diff = currentIndex - index;
               // Entering: fading in
               if (diff < 0) return diff < -1 ? 0 : 1 + diff; 
               // Pushed back: fading slightly
               return Math.max(0, 1 - diff * 0.15);
            });
            
            const rotateX = useTransform(springProgress, (p) => {
               const currentIndex = p * (total - 1);
               const diff = currentIndex - index;
               if (diff < 0) return 0;
               return Math.min(10, diff * 2); 
            });

            return (
              <motion.div
                key={index}
                className="absolute inset-0 w-full bg-cr-card rounded-[32px] p-8 border border-cr-border flex flex-col items-start shadow-[0_20px_50px_rgba(26,63,117,0.12)]"
                style={{
                  y,
                  opacity,
                  scale,
                  rotateX,
                  zIndex: index, // New cards render ON TOP of older ones
                  transformOrigin: "top center"
                }}
              >
                <div className="absolute top-6 right-8 text-cr-primary/20 font-bold text-3xl tracking-tight">
                  {(index + 1).toString().padStart(2, '0')}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-cr-sage/30 text-cr-primary flex items-center justify-center mb-6 shadow-sm">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-cr-text-primary mb-3 leading-tight">
                  {service.title}
                </h3>
                <p className="text-cr-text-muted text-sm leading-relaxed mb-6">
                  {service.description}
                </p>
                <button className="mt-auto text-cr-primary text-sm font-semibold hover:underline min-h-[48px]">
                  Learn More
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function Services() {
  const services = [
    {
      icon: <Car size={34} />,
      title: "Accessible Transport",
      description:
        "Comfortable transportation designed for elderly people and persons with disabilities.",
    },
    {
      icon: <Accessibility size={34} />,
      title: "Wheelchair Assistance",
      description:
        "Professional helpers assist with wheelchair support from pickup to destination.",
    },
    {
      icon: <HeartHandshake size={34} />,
      title: "Personal Companion",
      description:
        "Verified companions travel with you during hospital visits, shopping and appointments.",
    },
    {
      icon: <Hospital size={34} />,
      title: "Hospital Visits",
      description:
        "Safe transportation and assistance for treatments, medical appointments and checkups.",
    },
    {
      icon: <ShoppingBag size={34} />,
      title: "Shopping Assistance",
      description:
        "Travel comfortably to supermarkets, pharmacies and shopping malls with a helper.",
    },
    {
      icon: <Bot size={34} />,
      title: "AI Recommendation",
      description:
        "Our AI recommends the most suitable helper according to your needs and location.",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextCard = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % services.length);
  }, [services.length]);

  const prevCard = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);
  }, [services.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      nextCard();
    }, 4000);
    return () => clearInterval(interval);
  }, [nextCard, currentIndex]);

  const handleDragEnd = (event, info) => {
    if (!isMobile) return;
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      nextCard();
    } else if (info.offset.x > swipeThreshold) {
      prevCard();
    }
  };

  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const stackRotate = useTransform(scrollYProgress, [0, 1], [-6, 6]);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="bg-cr-bg relative"
    >
      {/* Mobile Sticky Scrolling Content */}
      <MobilePinnedServices services={services} />

      {/* Desktop/Tablet Layout */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.2 } }
        }}
        className="w-full max-w-[1480px] mx-auto px-5 md:px-8 lg:px-10 relative z-10 hidden md:block py-16 md:py-24"
      >

        <div className="flex flex-col-reverse lg:grid lg:grid-cols-[60%_40%] gap-12 lg:gap-16 items-center">

          {/* Left Side: Stacked Cards Container */}
          <motion.div
            style={isMobile ? {} : { rotateZ: stackRotate }}
            variants={{
              hidden: { opacity: 0, y: isMobile ? 30 : 100 },
              visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="relative w-full md:h-[400px] lg:h-[550px] flex items-center justify-center lg:justify-start lg:pl-10 perspective-[1200px]"
          >



            {/* Desktop Stacked Animation */}
            <div
              className="relative hidden md:block w-full max-w-[340px] md:max-w-[420px] h-[400px] lg:h-full cursor-grab active:cursor-grabbing"
              onClick={() => !isMobile && nextCard()}
            >
              {services.map((service, index) => {
                const offset = (index - currentIndex + services.length) % services.length;
                const isActive = offset === 0;

                return (
                  <motion.div
                    key={index}
                    className="absolute inset-0 bg-cr-card rounded-[32px] p-8 border border-cr-border flex flex-col items-start cr-service-card overflow-hidden"
                    initial={false}
                    animate={{
                      y: -offset * 32,
                      x: 0,
                      scale: 1 - (offset * 0.05),
                      opacity: 1 - (offset * 0.15),
                      zIndex: services.length - offset,
                      rotateX: isActive ? 0 : 2,
                    }}
                    whileHover={{ 
                      y: -offset * 32 - 10,
                      scale: 1 - (offset * 0.05) + 0.02,
                      transition: { duration: 0.35, ease: "easeOut" }
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 80,
                      damping: 20,
                      duration: 0.8
                    }}
                    style={{
                      transformOrigin: "top center",
                    }}
                  >
                    {/* Top Edge Number */}
                    <div className="absolute top-6 right-8 text-cr-primary/30 font-bold text-2xl tracking-tight">
                      {(index + 1).toString().padStart(2, '0')}
                    </div>

                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-cr-sage/30 text-cr-primary flex items-center justify-center mb-6 mt-2 shadow-sm">
                      {service.icon}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-cr-text-primary mb-3 leading-tight">
                      {service.title}
                    </h3>
                    <p className="text-cr-text-muted text-sm md:text-base leading-relaxed mb-6">
                      {service.description}
                    </p>
                    <button className="mt-auto text-cr-primary text-sm font-semibold hover:underline min-h-[48px]">
                      Learn More
                    </button>
                  </motion.div>
                );
              })}
            </div>

          </motion.div>

          {/* Right Side: Text & Navigation Indicator */}
          <motion.div
            variants={{
              hidden: { opacity: 0, x: 30 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="flex flex-col justify-center text-center lg:text-left lg:pl-8 items-center lg:items-start w-full"
          >
            <span className="cr-badge-custom px-4 py-2 rounded-full text-sm md:text-base font-medium w-fit mb-6 transition-colors">
              Our Services
            </span>

            <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-cr-text-primary leading-tight mb-4 md:mb-6">
              Everything you need for
              <br className="hidden xl:block" />
              <span className="text-cr-primary"> safe travel</span>
            </h2>

            <p className="text-base md:text-lg lg:text-xl text-cr-text-muted leading-relaxed max-w-[500px] mb-8 lg:mb-12">
              CareRide AI combines trusted helpers,
              intelligent recommendations and accessible
              transportation to make every journey safer
              and easier.
            </p>

            {/* Minimal Navigation Indicator */}
            <div className="flex items-center gap-4 text-cr-text-muted font-medium text-lg md:text-xl">
              <span className="text-cr-primary font-bold">
                {(currentIndex + 1).toString().padStart(2, '0')}
              </span>
              <span className="w-12 md:w-16 h-[2px] bg-cr-border"></span>
              <span>
                {services.length.toString().padStart(2, '0')}
              </span>
            </div>

          </motion.div>

        </div>

      </motion.div>
    </section>
  );
}

export default Services;