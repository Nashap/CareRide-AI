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
      style={{
        textAlign: "center",
        padding: "20px",
        marginTop: "40px",
      }}
    >
      <p className="text-cr-text-muted">CareRide AI © 2026</p>
    </motion.footer>
  );
}

export default Footer;