import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform, useMotionValue, useSpring, animate } from "framer-motion";
import HeroAnimation from "./HeroAnimation";

function CountUp({ to, duration = 2, suffix = "", prefix = "" }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => prefix + Math.round(latest).toLocaleString() + suffix);

  useEffect(() => {
    const controls = animate(count, to, { duration, ease: "easeOut", delay: 0.5 });
    return controls.stop;
  }, [count, to, duration]);

  return <motion.span>{rounded}</motion.span>;
}

function Hero() {
  // Scroll Parallax
  const { scrollY } = useScroll();
  const yText = useTransform(scrollY, [0, 1000], [0, 150]);
  const yAnimation = useTransform(scrollY, [0, 1000], [0, -100]);
  const bgOpacity = useTransform(scrollY, [0, 800], [1, 0]);

  // Mouse Parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  const handleMouseMove = (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 20;
    const y = (e.clientY / innerHeight - 0.5) * 20;
    mouseX.set(x);
    const y2 = (e.clientY / innerHeight - 0.5) * 20;
    mouseY.set(y2);
  };

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Stagger variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    },
  };

  const badgeVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    },
  };

  return (
    <section
      id="home"
      className="relative bg-gradient-to-b from-cr-bg to-cr-surface pt-28 pb-16 lg:pt-40 lg:pb-24 min-h-[auto] md:min-h-[90vh] flex items-center overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--cr-primary)_0%,transparent_50%)] opacity-5 blur-3xl pointer-events-none"
        style={{ opacity: bgOpacity }}
      />

      <div className="w-full max-w-[1360px] mx-auto px-6 md:px-10 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">

          {/* Left Side: Text */}
          <motion.div 
            style={isMobile ? {} : { y: yText }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center lg:items-start text-center lg:text-left w-full relative z-10 pt-2 lg:pt-0"
          >
            {/* Badge */}
            <motion.div variants={badgeVariants} style={{ opacity: 1, filter: 'none', mixBlendMode: 'normal', visibility: 'visible' }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 cr-badge-custom shadow-sm transition-colors">
              <Sparkles size={16} style={{ opacity: 1, filter: 'none', mixBlendMode: 'normal', visibility: 'visible' }} className="!text-[#FFFFFF] dark:!text-[#FFFFFF]" />
              AI-powered helper matching
            </motion.div>

            {/* Heading */}
            <motion.div variants={itemVariants} className="overflow-hidden w-full mb-6">
              <h1 className="text-4xl md:text-5xl lg:text-[64px] lg:leading-[1.1] font-bold text-cr-text-primary tracking-tight">
                Accessible mobility,
                <br className="hidden lg:block" />
                <span className="text-cr-primary"> with a human touch.</span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p variants={itemVariants} className="text-lg text-cr-text-muted mb-10 lg:mb-12 max-w-[500px] leading-relaxed mx-auto lg:mx-0">
              CareRide AI connects elderly riders,
              people with disabilities, and patients
              with verified helpers using AI to match
              you with the right companion every time.
            </motion.p>

            {/* Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row flex-wrap gap-4 mb-12 lg:mb-16 w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  to="/register?role=rider"
                  className="group bg-cr-primary hover:bg-cr-primary-hover text-white w-full sm:w-auto min-h-[48px] px-8 py-3.5 md:py-4 rounded-xl font-semibold shadow-[0_8px_20px_rgba(26,63,117,0.25)] hover:shadow-[0_12px_25px_rgba(26,63,117,0.35)] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  I need a ride
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  to="/register?role=helper"
                  className="bg-cr-card border border-cr-border hover:border-cr-primary hover:text-cr-primary w-full sm:w-auto min-h-[48px] px-8 py-3.5 md:py-4 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center h-full"
                >
                  I want to help
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 gap-6 lg:gap-8 border-t pt-8 lg:pt-10 border-cr-border/60 w-full">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <p className="text-cr-text-muted text-sm md:text-base font-medium mb-1">Verified Helpers</p>
                <h3 className="text-2xl md:text-3xl font-bold text-cr-text-primary">
                  <CountUp to={1200} duration={2.5} suffix="+" />
                </h3>
              </div>
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <p className="text-cr-text-muted text-sm md:text-base font-medium mb-1">Cities</p>
                <h3 className="text-2xl md:text-3xl font-bold text-cr-text-primary">
                  <CountUp to={48} duration={2} />
                </h3>
              </div>
              <div className="col-span-2 sm:col-span-1 flex flex-col items-center lg:items-start text-center lg:text-left">
                <p className="text-cr-text-muted text-sm md:text-base font-medium mb-1">Avg. Rating</p>
                <h3 className="text-2xl md:text-3xl font-bold text-cr-text-primary flex items-center gap-1">
                  <CountUp to={4.9} duration={2} />
                  <span className="text-cr-primary">★</span>
                </h3>
              </div>
            </motion.div>

          </motion.div>

          {/* Right Side: Animation */}
          <motion.div 
            style={isMobile ? {} : { 
              y: yAnimation,
              x: mouseXSpring,
              rotateX: mouseYSpring,
              rotateY: mouseXSpring
            }}
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="relative flex justify-center perspective-[1000px] w-full"
          >
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
              className="bg-cr-beige rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden w-full flex items-center justify-center"
            >
              <HeroAnimation />
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

export default Hero;
