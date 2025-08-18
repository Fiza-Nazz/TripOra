"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { motion } from "framer-motion";
import { useRef, useState, useEffect, Suspense } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";  // ✅ Next.js Link import

gsap.registerPlugin(ScrollTrigger);

interface Destination {
  name: string;
  image: string;
  description: string;
}

const destinations: Destination[] = [
  { name: "Paris, France", image: "/paris.png", description: "The city of lights with iconic landmarks." },
  { name: "Tokyo, Japan", image: "/tokyo.png", description: "A vibrant blend of futuristic tech and ancient traditions." },
  { name: "New York, USA", image: "/america.png", description: "The city that never sleeps, buzzing with energy." },
  { name: "Bali, Indonesia", image: "/bali.png", description: "Tropical paradise with serene beaches and lush jungles." },
];

export default function PackagesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasLoaded, setCanvasLoaded] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll(".destination-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 100, rotateY: -15 },
        {
          opacity: 1,
          y: 0,
          rotateY: 0,
          duration: 1.2,
          ease: "power3.out",
          stagger: 0.2,
          scrollTrigger: { trigger: containerRef.current, start: "top 80%" },
        }
      );
    }
    setCanvasLoaded(true);
  }, []);

  return (
    <div className="bg-black text-white min-h-screen overflow-hidden font-sans relative">
      {/* 3D Background */}
      {canvasLoaded && (
        <Canvas
          className="absolute inset-0 z-0"
          camera={{ position: [0, 0, 12], fov: 60 }}
        >
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#FFD700" />
          <Suspense fallback={null}>
            <Environment preset="sunset" />
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      )}

      {/* Heading */}
      <motion.h2
        className="relative z-20 text-5xl md:text-6xl font-extrabold text-center mt-0 mb-6 bg-gradient-to-r from-[#FFD700] via-white to-[#FFD700] bg-clip-text text-transparent drop-shadow-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Explore Our Premium Packages
      </motion.h2>

      {/* Destination Cards */}
      <div
        ref={containerRef}
        className="relative z-20 flex gap-8 overflow-x-auto pb-10 px-10 snap-x snap-mandatory"
      >
        {destinations.map((dest, idx) => (
          <motion.div
            key={idx}
            className="destination-card min-w-[320px] bg-black/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg border border-[#FFD700]/25 snap-center hover:shadow-[#FFD700]/50 transition-all cursor-pointer transform hover:scale-[1.05]"
            whileHover={{ y: -10 }}
          >
            <div className="relative w-full h-64 md:h-72">
              <Image
                src={dest.image}
                alt={dest.name}
                fill
                className="object-cover rounded-t-3xl"
              />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-[#FFD700]">{dest.name}</h3>
              <p className="text-gray-300 mt-2">{dest.description}</p>
              {/* ✅ Direct Link to booking.tsx page */}
              <Link href="#">
                <button
                  className="mt-4 w-full py-2 bg-[#FFD700] text-black rounded-full hover:bg-[#FFD700]/80 transition-colors font-semibold shadow-md"
                >
                  Book Now
                </button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
