"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
// ✅ Correct import path
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Link from "next/link";

export default function About() {
  const mountRef = useRef<HTMLDivElement>(null);

  // Three.js Background Setup
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    // 3D Globe
    const geometry = new THREE.SphereGeometry(4, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color("#00bfff"),
      shininess: 100,
      specular: new THREE.Color("#ffffff"),
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 3000;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 25;
    }
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.01,
      color: "#ffd700",
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Lights
    const ambientLight = new THREE.AmbientLight("#ffffff", 0.6);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight("#ffffff", 1.8);
    pointLight.position.set(8, 8, 8);
    scene.add(pointLight);

    // ✅ OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 6;
    controls.maxDistance = 15;

    const animate = () => {
      requestAnimationFrame(animate);
      globe.rotation.y += 0.002;
      particlesMesh.rotation.y += 0.0008;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // GSAP Animations
  useEffect(() => {
    gsap.from(".about-section", {
      y: 100,
      opacity: 0,
      duration: 1.2,
      ease: "power4.out",
      stagger: 0.2,
    });
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-b from-teal-600/20 to-indigo-900/20 dark:from-gray-900/30 dark:to-black/30 font-[Poppins]">
      {/* 3D Background */}
      <div
        ref={mountRef}
        className="absolute top-0 left-0 w-full h-full -z-10"
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Section */}
        <div className="about-section text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
            About <span className="text-amber-300">Tripora</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
            We are your ultimate travel companion, crafting unforgettable
            journeys with passion and precision. Explore the world with ease,
            guided by our innovative tools and personalized recommendations.
          </p>
        </div>

        {/* Call to Action */}
        <div className="about-section text-center mt-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Explore?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who trust Tripora to turn their dreams
            into reality. Start your journey today!
          </p>
          <Link
            href="/booking"
            className="inline-block px-8 py-3 bg-amber-300 text-black font-semibold rounded-full hover:bg-amber-400 transition-all duration-300 transform hover:scale-105"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}
