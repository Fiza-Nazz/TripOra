"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Background Particles
  useEffect(() => {
    if (!mountRef.current) return;

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
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const particlesCount = 5000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const material = new THREE.PointsMaterial({
      size: 0.015,
      color: new THREE.Color("gold"),
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const animate = () => {
      requestAnimationFrame(animate);
      particles.rotation.y += 0.001;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Handle login submit
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
      router.push("/");
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 3D Particle Background */}
      <div ref={mountRef} className="absolute inset-0 -z-10"></div>

      {/* Fixed Centered Login Panel */}
      <div className="flex items-center justify-center h-full">
        <div className="w-[380px] p-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-center text-white mb-6">
            Login to TravelX
          </h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              required
              className="p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <input
              type="password"
              placeholder="Password"
              required
              className="p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              type="submit"
              className="mt-4 bg-gradient-to-r from-yellow-500 to-yellow-300 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Sign In
            </button>
          </form>
          <p className="mt-4 text-center text-gray-200 text-sm">
            Don’t have an account?{" "}
            <a href="/signup" className="text-yellow-300 hover:underline">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
