import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function CTA() {
  return (
    <section className="w-full max-w-[1480px] mx-auto px-5 md:px-8 lg:px-10 pb-16 md:pb-24 pt-8 md:pt-12">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: { opacity: 0, y: 60, scale: 0.95 },
          visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1, 
            transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } 
          }
        }}
        className="relative bg-cr-primary rounded-[32px] md:rounded-[40px] p-8 md:p-16 lg:p-20 text-center text-white shadow-2xl overflow-hidden"
      >
        {/* Breathing background glow */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15)_0%,transparent_60%)] pointer-events-none"
        />

        <div className="relative z-10">
          <motion.h2 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease: "easeOut" } }
            }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight text-white"
          >
            Ready to travel with confidence?
          </motion.h2>

          <motion.p 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.3, ease: "easeOut" } }
            }}
            className="text-base md:text-xl text-white/90 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Sign up free and book your first accessible ride in minutes. Experience mobility with a human touch.
          </motion.p>

          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: { 
                opacity: 1, 
                scale: 1, 
                transition: { 
                  type: "spring", stiffness: 200, damping: 15, delay: 0.4 
                } 
              }
            }}
            className="w-full md:w-auto"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="block md:inline-block w-full md:w-auto">
              <Link
                to="/register"
                className="flex md:inline-flex items-center justify-center bg-cr-card text-cr-primary hover:text-cr-primary-hover w-full md:w-auto min-h-[48px] px-8 py-3.5 md:px-10 md:py-5 rounded-full font-bold shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-colors text-base md:text-lg"
              >
                Get Started
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export default CTA;