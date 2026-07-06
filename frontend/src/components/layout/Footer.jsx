import { motion } from "framer-motion";

function Footer() {
  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
      }}
      className="text-center py-6 md:py-10 mt-10"
    >
      <p className="text-cr-text-muted">CareRide AI © 2026</p>
    </motion.footer>
  );
}

export default Footer;