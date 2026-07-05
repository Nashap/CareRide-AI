import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { HeartHandshake, ArrowRight, Menu, X } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import ThemeToggle from "../common/ThemeToggle";

function Navbar() {
  const [activeHash, setActiveHash] = useState("#home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { scrollY } = useScroll();

  // Scroll animations
  const height = useTransform(scrollY, [0, 100], [70, 60]);
  const maxWidth = useTransform(scrollY, [0, 100], [1200, 1100]);
  const boxShadow = useTransform(
    scrollY,
    [0, 100],
    [
      "0 8px 30px rgba(0,0,0,0.06)",
      "0 15px 40px rgba(0,0,0,0.12)"
    ]
  );
  const backdropFilter = useTransform(
    scrollY,
    [0, 100],
    ["blur(8px)", "blur(16px)"]
  );

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "features", "services"];
      let current = "";
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            current = `#${section}`;
          }
        }
      }
      if (current) setActiveHash(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (location.hash) {
      setActiveHash(location.hash);
    } else if (location.pathname === "/") {
      setActiveHash("#home");
    }
  }, [location]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-4 z-40 px-4 lg:px-6 pointer-events-none"
      >
        <motion.div 
          style={{ 
            height, 
            maxWidth, 
            boxShadow,
            backdropFilter,
            WebkitBackdropFilter: backdropFilter
          }}
          className={`mx-auto rounded-full border border-cr-border px-4 md:px-5 lg:px-6 flex items-center justify-between pointer-events-auto transition-colors duration-300 ${
            isScrolled ? "bg-cr-card/80" : "bg-cr-card"
          }`}
        >
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3.5 group">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-cr-primary flex items-center justify-center shadow-sm"
            >
              <HeartHandshake size={20} className="text-white group-hover:animate-pulse" />
            </motion.div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-cr-text-primary tracking-tight">
                CareRide AI
              </h1>
            </div>
          </Link>

          {/* Center Menu with sliding indicator (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center gap-1 md:gap-2 relative">
            {["home", "features", "services"].map((item) => (
              <a
                key={item}
                href={`#${item}`}
                className={`relative px-3 py-1.5 md:px-5 md:py-2 rounded-full text-sm md:text-base font-medium transition-colors duration-300 capitalize z-10
                  ${
                    activeHash === `#${item}`
                      ? "text-white"
                      : "text-cr-text-primary hover:text-cr-primary hover:bg-cr-beige/50"
                  }
                `}
              >
                {activeHash === `#${item}` && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-cr-primary rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                {item}
              </a>
            ))}
          </nav>

          {/* Right Buttons (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            <Link
              to="/login"
              className="hidden lg:flex text-cr-text-muted font-medium hover:text-cr-text-primary transition-all duration-[250ms] px-3 md:px-4 py-2 rounded-full hover:bg-cr-beige text-sm md:text-base"
            >
              Sign In
            </Link>
            <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/register"
                className="group bg-cr-primary hover:bg-cr-primary-hover text-white px-4 py-2 md:px-6 md:py-2.5 rounded-full text-sm md:text-base font-medium shadow-[0_4px_14px_0_rgba(26,63,117,0.39)] hover:shadow-[0_6px_20px_rgba(26,63,117,0.23)] transition-all duration-300 flex items-center gap-2"
              >
                Get Started
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            className="md:hidden p-2 min-h-[48px] min-w-[48px] flex items-center justify-center text-cr-text-primary"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>

        </motion.div>
      </motion.header>

      {/* Mobile Sliding Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-cr-bg z-50 shadow-2xl flex flex-col p-6 md:hidden border-l border-cr-border overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-cr-primary flex items-center justify-center shadow-sm">
                    <HeartHandshake size={20} className="text-white" />
                  </div>
                  <span className="text-lg font-bold text-cr-text-primary tracking-tight">CareRide AI</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="p-2 min-h-[48px] min-w-[48px] flex items-center justify-center text-cr-text-primary bg-cr-card rounded-full border border-cr-border"
                  aria-label="Close Menu"
                >
                  <X size={20} />
                </button>
              </div>
              
              <nav className="flex flex-col gap-4 mb-10">
                {["home", "features", "services"].map((item) => (
                  <a
                    key={item}
                    href={`#${item}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-2xl font-bold capitalize py-3 transition-colors ${
                      activeHash === `#${item}` ? "text-cr-primary" : "text-cr-text-primary hover:text-cr-primary"
                    }`}
                  >
                    {item}
                  </a>
                ))}
              </nav>

              <div className="flex flex-col gap-4 mt-auto pt-8 border-t border-cr-border/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-cr-text-muted">Theme</span>
                  <ThemeToggle />
                </div>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-3.5 min-h-[48px] rounded-xl border border-cr-border font-semibold text-cr-text-primary hover:bg-cr-card transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-3.5 min-h-[48px] rounded-xl bg-cr-primary hover:bg-cr-primary-hover text-white font-semibold shadow-md transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;