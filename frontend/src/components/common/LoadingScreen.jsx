import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen({ isLoading = true, fullScreen = false }) {
  // Container classes based on whether it's a full-screen overlay or localized
  const containerClasses = fullScreen
    ? "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FFFFFF] dark:bg-[#00002A]"
    : "flex flex-col items-center justify-center p-8 w-full h-full min-h-[160px]";

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className={containerClasses}
        >
          {/* Responsive Outer Container: Mobile (48px), Tablet (52px), Desktop (56px) */}
          <div className="relative flex items-center justify-center w-[48px] h-[48px] md:w-[52px] md:h-[52px] lg:w-[56px] lg:h-[56px]">
            
            {/* Outer Ring */}
            <div className="absolute inset-0 rounded-full border-[5px] border-[#00002A]/15 dark:border-[#44E6A9C]/20" />
            
            {/* Rotating Container */}
            <motion.div 
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {/* Inner Capsule */}
              <div 
                className="absolute left-1/2 -translate-x-1/2 top-[6px] h-[18px] md:h-[20px] lg:h-[22px] w-[8px] md:w-[9px] lg:w-[10px] bg-[#00002A] dark:bg-[#00002A] rounded-full shadow-[0_0_12px_rgba(169,199,227,0.30)] dark:shadow-[0_0_12px_rgba(169,199,227,0.25)]"
              />
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
