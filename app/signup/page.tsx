"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import * as THREE from "three";
import { useRouter } from "next/navigation";

// ✅ Validation schema
const signupSchema = z
  .object({
    fullName: z.string().min(3, "Full name must be at least 3 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // 🎇 Particles Background (same as login)
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (data: SignupFormData) => {
    console.log("✅ Signup Data:", data);
    router.push("/"); 
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 3D Background */}
      <div ref={mountRef} className="absolute inset-0 -z-10"></div>

      {/* Signup Panel */}
      <div className="flex items-center justify-center h-full">
        <div className="w-[400px] p-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-center text-white mb-2">
            Create an Account
          </h2>
          <p className="text-gray-200 text-center mb-6">
            Sign up to start your travel journey ✈️
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div>
              <div className="relative mt-1">
                <User className="absolute left-3 top-2.5 text-gray-300 w-5 h-5" />
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register("fullName")}
                  className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              {errors.fullName && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-2.5 text-gray-300 w-5 h-5" />
                <input
                  type="email"
                  placeholder="example@email.com"
                  {...register("email")}
                  className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 text-gray-300 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full pl-10 pr-10 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 text-gray-300 w-5 h-5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-yellow-500 to-yellow-300 text-white rounded-lg font-semibold hover:opacity-90 transition"
            >
              Sign Up
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-gray-200 text-sm">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-yellow-300 hover:underline font-medium"
            >
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
