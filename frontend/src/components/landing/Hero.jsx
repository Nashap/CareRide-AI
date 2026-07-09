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
      className="relative bg-cr-bg pt-28 pb-16 md:pt-36 md:pb-24 lg:pt-40 lg:pb-32 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Background Gradients */}
      <motion.div 
        className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,#1A3F75_0%,transparent_60%)] opacity-[0.08] blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3"
        style={{ opacity: bgOpacity }}
      />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,#5F82A8_0%,transparent_60%)] opacity-[0.05] blur-[80px] pointer-events-none transform -translate-x-1/3 translate-y-1/3" />

      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">

          {/* Left Side: Text */}
          <motion.div 
            style={isMobile ? {} : { y: yText }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center lg:items-start text-center lg:text-left w-full relative z-10"
          >
            {/* Badge */}
            <motion.div variants={badgeVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8 bg-cr-primary/10 text-cr-primary border border-cr-primary/20 shadow-sm backdrop-blur-md transition-all md:hover:bg-cr-primary/15 md:hover:shadow-md cursor-default">
              <Sparkles size={16} className="text-cr-primary" />
              AI-powered helper matching
            </motion.div>

            {/* Heading */}
            <motion.div variants={itemVariants} className="overflow-hidden w-full">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] xl:text-[5rem] font-extrabold tracking-tight text-cr-text-primary leading-[1.12] mb-6">
                Accessible mobility,
                <br className="hidden lg:block" />
                <span className="text-cr-primary"> with a human touch.</span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p variants={itemVariants} className="text-lg md:text-xl lg:text-[1.35rem] text-cr-text-muted mb-10 max-w-[540px] leading-relaxed mx-auto lg:mx-0 font-medium">
              CareRide AI connects elderly riders,
              people with disabilities, and patients
              with verified helpers using AI to match
              you with the right companion every time.
            </motion.p>

            {/* Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row flex-wrap gap-4 md:gap-5 mb-14 w-full sm:w-auto mx-auto lg:mx-0">
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  to="/register?role=rider"
                  className="group bg-cr-primary hover:bg-cr-primary-hover text-white w-full sm:w-auto min-h-[52px] px-8 py-4 rounded-xl font-bold shadow-[0_8px_20px_rgba(26,63,117,0.25)] hover:shadow-[0_12px_25px_rgba(26,63,117,0.35)] transition-all duration-300 flex items-center justify-center gap-2 text-base md:text-lg"
                >
                  I need a ride
                  <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link
                  to="/register?role=helper"
                  className="bg-white border-2 border-cr-border hover:border-cr-primary hover:text-cr-primary w-full sm:w-auto min-h-[52px] px-8 py-4 rounded-xl font-bold text-cr-text-primary shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center h-full text-base md:text-lg"
                >
                  I want to help
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-12 border-t mt-4 pt-8 border-cr-border/80 w-full max-w-[600px] mx-auto lg:mx-0">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <h3 className="text-3xl md:text-4xl font-extrabold text-cr-text-primary tracking-tight">
                  <CountUp to={1200} duration={2.5} suffix="+" />
                </h3>
                <p className="text-cr-text-muted text-sm md:text-base font-semibold mt-1">Verified Helpers</p>
              </div>
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <h3 className="text-3xl md:text-4xl font-extrabold text-cr-text-primary tracking-tight">
                  <CountUp to={48} duration={2} />
                </h3>
                <p className="text-cr-text-muted text-sm md:text-base font-semibold mt-1">Cities Active</p>
              </div>
              <div className="col-span-2 sm:col-span-1 flex flex-col items-center lg:items-start text-center lg:text-left">
                <h3 className="text-3xl md:text-4xl font-extrabold text-cr-text-primary tracking-tight flex items-center gap-1.5">
                  <CountUp to={4.9} duration={2} />
                  <span className="text-cr-primary text-2xl md:text-3xl">★</span>
                </h3>
                <p className="text-cr-text-muted text-sm md:text-base font-semibold mt-1">Avg. Rating</p>
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
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="relative flex justify-center perspective-[1200px] w-full"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
              className="relative w-full max-w-full lg:max-w-[800px] rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(26,63,117,0.25)] border border-white/60 bg-white/40 backdrop-blur-md p-2 lg:p-3"
            >
              <div className="w-full aspect-video rounded-[2rem] overflow-hidden bg-cr-beige/50">
                <HeroAnimation />
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

export default Hero;
