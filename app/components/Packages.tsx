"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { FaPlaneDeparture, FaUmbrellaBeach, FaMountain } from "react-icons/fa";

const packages = [
  {
    title: "Luxury City Escape",
    description: "5-star hotels, private transfers & premium dining experiences.",
    icon: <FaPlaneDeparture className="text-5xl text-yellow-400" />,
    price: "$2,999",
  },
  {
    title: "Tropical Paradise",
    description: "Overwater villas, crystal-clear waters & personal butler service.",
    icon: <FaUmbrellaBeach className="text-5xl text-yellow-400" />,
    price: "$4,499",
  },
  {
    title: "Mountain Adventure",
    description: "Luxury lodges, helicopter rides & breathtaking landscapes.",
    icon: <FaMountain className="text-5xl text-yellow-400" />,
    price: "$3,299",
  },
];

export default function Packages() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (mountRef.current) mountRef.current.appendChild(renderer.domElement);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 2000;
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: new THREE.Color("#FFD700"), // Gold
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(
      particlesGeometry,
      particlesMaterial
    );
    scene.add(particlesMesh);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      particlesMesh.rotation.y += 0.0008;
      renderer.render(scene, camera);
    };
    animate();

    // GSAP Page Animations
    gsap.from(".package-card", {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.3,
      ease: "power3.out",
    });

    // Cleanup
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Three.js Background */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* Title */}
      <h1 className="relative z-10 text-center text-5xl md:text-6xl font-extrabold mt-20 bg-gradient-to-r from-yellow-400 via-white to-yellow-400 bg-clip-text text-transparent">
        Explore Our Exclusive Packages
      </h1>

      {/* Packages */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10 px-6 md:px-20 mt-16">
        {packages.map((pkg, i) => (
          <div
            key={i}
            className="package-card bg-black/60 backdrop-blur-lg border border-yellow-500/30 rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform duration-500 hover:shadow-yellow-500/30"
          >
            <div className="flex justify-center mb-4">{pkg.icon}</div>
            <h2 className="text-2xl font-semibold text-yellow-400">
              {pkg.title}
            </h2>
            <p className="mt-3 text-gray-300">{pkg.description}</p>
            <div className="mt-6 text-lg font-bold bg-gradient-to-r from-yellow-400 to-white bg-clip-text text-transparent">
              {pkg.price}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
