import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

const FRAME_COUNT = 52;
const FPS = 5; // 5 FPS for a calm cinematic feel
const FRAME_DURATION = 1000 / FPS;

function HeroAnimation() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  
  const framesRef = useRef([]);
  const currentFrameRef = useRef(0);
  const requestRef = useRef(null);
  
  const lastDrawTimeRef = useRef(0);
  
  const isVisibleRef = useRef(false);
  const isPageVisibleRef = useRef(true);

  // 1. Handle prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mediaQuery.matches);
    
    const listener = (e) => setReduceMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // 2. Preload images
  useEffect(() => {
    let loadedCount = 0;
    const frames = [];

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      const paddedIndex = i.toString().padStart(3, "0");
      img.src = `/frame/ezgif-frame-${paddedIndex}.jpg`;
      
      img.onload = () => {
        loadedCount++;
        if (loadedCount === FRAME_COUNT) {
          setIsLoaded(true);
        }
      };
      
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === FRAME_COUNT) {
          setIsLoaded(true);
        }
      }
      frames.push(img);
    }
    
    framesRef.current = frames;
  }, []);

  // 3. Draw function
  const drawFrame = (frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const img = framesRef.current[frameIndex];
    if (img && img.complete && img.naturalWidth !== 0) {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      
      ctx.clearRect(0, 0, w, h);
      
      // Calculate scale to fit the container (object-fit: contain equivalent)
      const scale = Math.min(w / img.width, h / img.height);
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;
      
      // Center the image
      const x = (w - drawWidth) / 2;
      const y = (h - drawHeight) / 2;
      
      ctx.drawImage(img, 0, 0, img.width, img.height, x, y, drawWidth, drawHeight);
    }
  };

  // 4. Animation loop
  useEffect(() => {
    if (!isLoaded || reduceMotion) {
      if (isLoaded && reduceMotion) {
        requestAnimationFrame(() => drawFrame(0));
      }
      return;
    }

    const animate = (time) => {
      if (isVisibleRef.current && isPageVisibleRef.current) {
        if (!lastDrawTimeRef.current) {
          lastDrawTimeRef.current = time;
        }

        const elapsed = time - lastDrawTimeRef.current;
        
        if (elapsed > FRAME_DURATION) {
          currentFrameRef.current = (currentFrameRef.current + 1) % FRAME_COUNT;
          drawFrame(currentFrameRef.current);
          lastDrawTimeRef.current = time - (elapsed % FRAME_DURATION);
        }
      } else {
        lastDrawTimeRef.current = 0;
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isLoaded, reduceMotion]);

  // 5. Setup resize, intersection, visibility observers
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const dpr = window.devicePixelRatio || 1;
        
        canvasRef.current.width = clientWidth * dpr;
        canvasRef.current.height = clientHeight * dpr;
        
        const ctx = canvasRef.current.getContext("2d");
        ctx.scale(dpr, dpr);
        
        if (isLoaded) {
           drawFrame(reduceMotion ? 0 : currentFrameRef.current);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (!entry.isIntersecting) {
            lastDrawTimeRef.current = 0;
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const handleVisibilityChange = () => {
      isPageVisibleRef.current = document.visibilityState === "visible";
      if (!isPageVisibleRef.current) {
          lastDrawTimeRef.current = 0;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isLoaded, reduceMotion]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video"
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-cr-bg/80 backdrop-blur-sm z-10">
          <Loader2 className="w-8 h-8 text-cr-primary animate-spin" />
          <span className="mt-3 text-sm text-cr-text-muted font-medium">Loading animation...</span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`w-full h-full block object-contain object-center transition-opacity duration-700 ease-in-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

export default HeroAnimation;
