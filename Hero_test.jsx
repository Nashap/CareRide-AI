Created At: 2026-07-04T18:17:15Z
Completed At: 2026-07-04T18:17:15Z
File Path: `file:///c:/Users/nasha/OneDrive/zlaqa/CareRide/frontend/src/components/landing/Hero.jsx`
Total Lines: 187
Total Bytes: 7774
Showing lines 1 to 187
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: import { useEffect } from "react";
2: import { Link } from "react-router-dom";
3: import { Sparkles, ArrowRight } from "lucide-react";
4: import { motion, useScroll, useTransform, useMotionValue, useSpring, animate } from "framer-motion";
5: import HeroAnimation from "./HeroAnimation";
6: 
7: function CountUp({ to, duration = 2, suffix = "", prefix = "" }) {
8:   const count = useMotionValue(0);
9:   const rounded = useTransform(count, (latest) => prefix + Math.round(latest).toLocaleString() + suffix);
10: 
11:   useEffect(() => {
12:     const controls = animate(count, to, { duration, ease: "easeOut", delay: 0.5 });
13:     return controls.stop;
14:   }, [count, to, duration]);
15: 
16:   return <motion.span>{rounded}</motion.span>;
17: }
18: 
19: function Hero() {
20:   // Scroll Parallax
21:   const { scrollY } = useScroll();
22:   const yText = useTransform(scrollY, [0, 1000], [0, 150]);
23:   const yAnimation = useTransform(scrollY, [0, 1000], [0, -100]);
24:   const bgOpacity = useTransform(scrollY, [0, 800], [1, 0]);
25: 
26:   // Mouse Parallax
27:   const mouseX = useMotionValue(0);
28:   const mouseY = useMotionValue(0);
29:   const springConfig = { damping: 25, stiffness: 150 };
30:   const mouseXSpring = useSpring(mouseX, springConfig);
31:   const mouseYSpring = useSpring(mouseY, springConfig);
32: 
33:   const handleMouseMove = (e) => {
34:     const { innerWidth, innerHeight } = window;
35:     const x = (e.clientX / innerWidth - 0.5) * 20;
36:     const y = (e.clientY / innerHeight - 0.5) * 20;
37:     mouseX.set(x);
38:     mouseY.set(y);
39:   };
40: 
41:   // Stagger variants
42:   const containerVariants = {
43:     hidden: { opacity: 0 },
44:     visible: {
45:       opacity: 1,
46:       transition: { staggerChildren: 0.15, delayChildren: 0.1 },
47:     },
48:   };
49: 
50:   const itemVariants = {
51:     hidden: { opacity: 0, y: 30 },
52:     visible: { 
53:       opacity: 1, 
54:       y: 0,
55:       transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
56:     },
57:   };
58: 
59:   const badgeVariants = {
60:     hidden: { opacity: 0, x: -30 },
61:     visible: { 
62:       opacity: 1, 
63:       x: 0,
64:       transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
65:     },
66:   };
67: 
68:   return (
69:     <section
70:       id="home"
71:       className="relative bg-gradient-to-b from-cr-bg to-cr-surface py-16 lg:py-0 min-h-[88vh] flex items-center overflow-hidden"
72:       onMouseMove={handleMouseMove}
73:     >
74:       <motion.div 
75:         className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--cr-primary)_0%,transparent_50%)] opacity-5 blur-3xl pointer-events-none"
76:         style={{ opacity: bgOpacity }}
77:       />
78: 
79:       <div className="w-full max-w-[1480px] mx-auto px-10 relative z-10">
80:         <div className="grid lg:grid-cols-[45%_55%] gap-8 items-center">
81: 
82:           {/* Left Side: Text */}
83:           <motion.div 
84:             style={{ y: yText }}
85:             variants={containerVariants}
86:             initial="hidden"
87:             animate="visible"
88:           >
89:             {/* Badge */}
90:             <motion.div variants={badgeVariants} style={{ opacity: 1, filter: 'none', mixBlendMode: 'normal', visibility: 'visible' }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-sm border border-[#A9C7E3] bg-[#DDEAF5] text-[#00002A] hover:bg-[#C8DDF1] hover:border-[#5F82A8] hover:text-[#00002A] dark:border-[rgba(169,199,227,0.35)] hover:dark:border-[rgba(169,199,227,0.45)] dark:bg-[rgba(169,199,227,0.18)] hover:dark:bg-[rgba(169,199,227,0.28)] dark:text-[#FFFFFF] hover:dark:text-[#FFFFFF] transition-colors">
91:               <Sparkles size={16} style={{ opacity: 1, filter: 'none', mixBlendMode: 'normal', visibility: 'visible' }} className="text-[#00002A] dark:text-[#FFFFFF]" />
92:               AI-powered helper matching
93:             </motion.div>
94: 
95:             {/* Heading */}
96:             <motion.div variants={itemVariants} className="overflow-hidden">
97:               <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-cr-text-primary">
98:                 Accessible mobility,
99:                 <br />
100:                 <span className="text-cr-primary">with a human touch.</span>
101:               </h1>
102:             </motion.div>
103: 
104:             {/* Description */}
105:             <motion.p variants={itemVariants} className="mt-8 text-lg text-cr-text-muted leading-8 max-w-xl">
106:               CareRide AI connects elderly riders,
107:               people with disabilities, and patients
108:               with verified helpers using AI to match
109:               you with the right companion every time.
110:             </motion.p>
111: 
112:             {/* Buttons */}
113:             <motion.div variants={itemVariants} className="flex flex-wrap gap-5 mt-10">
114:               <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
115:                 <Link
116:                   to="/register?role=rider"
117:                   className="group bg-cr-primary hover:bg-cr-primary-hover text-white px-8 py-4 rounded-xl font-semibold shadow-[0_8px_20px_rgba(26,63,117,0.25)] hover:shadow-[0_12px_25px_rgba(26,63,117,0.35)] transition-all duration-300 flex items-center gap-2"
118:                 >
119:                   I need a ride
120:                   <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
121:                 </Link>
122:               </motion.div>
123: 
124:               <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
125:                 <Link
126:                   to="/register?role=helper"
127:                   className="bg-cr-card border border-cr-border hover:border-cr-primary hover:text-cr-primary px-8 py-4 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-300 flex items-center h-full"
128:                 >
129:                   I want to help
130:                 </Link>
131:               </motion.div>
132:             </motion.div>
133: 
134:             {/* Stats */}
135:             <motion.div variants={itemVariants} className="grid grid-cols-3 gap-8 border-t mt-12 pt-8 border-cr-border/60">
136:               <div>
137:                 <p className="text-cr-text-muted text-sm font-medium mb-1">Verified Helpers</p>
138:                 <h3 className="text-3xl font-bold text-cr-text-primary">
139:                   <CountUp to={1200} duration={2.5} suffix="+" />
140:                 </h3>
141:               </div>
142:               <div>
143:                 <p className="text-cr-text-muted text-sm font-medium mb-1">Cities</p>
144:                 <h3 className="text-3xl font-bold text-cr-text-primary">
145:                   <CountUp to={48} duration={2} />
146:                 </h3>
147:               </div>
148:               <div>
149:                 <p className="text-cr-text-muted text-sm font-medium mb-1">Avg. Rating</p>
150:                 <h3 className="text-3xl font-bold text-cr-text-primary flex items-center gap-1">
151:                   <CountUp to={4.9} duration={2} />
152:                   <span className="text-cr-primary">★</span>
153:                 </h3>
154:               </div>
155:             </motion.div>
156: 
157:           </motion.div>
158: 
159:           {/* Right Side: Animation */}
160:           <motion.div 
161:             style={{ 
162:               y: yAnimation,
163:               x: mouseXSpring,
164:               rotateX: mouseYSpring,
165:               rotateY: mouseXSpring
166:             }}
167:             initial={{ opacity: 0, scale: 0.92, y: 40 }}
168:             animate={{ opacity: 1, scale: 1, y: 0 }}
169:             transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
170:             className="relative flex justify-center lg:justify-center perspective-[1000px]"
171:           >
172:             <motion.div 
173:               animate={{ y: [0, -8, 0] }}
174:               transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
175:               className="bg-cr-beige rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden w-full max-w-[760px] max-h-[80vh]"
176:             >
177:               <HeroAnimation />
178:             </motion.div>
179:           </motion.div>
180: 
181:         </div>
182:       </div>
183:     </section>
184:   );
185: }
186: 
187: export default Hero;
The above content shows the entire, complete file contents of the requested file.
