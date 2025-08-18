"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { User, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";

interface AirplaneButtonProps {
  label: string;
  onClick?: () => void;
  className?: string;
}

const AirplaneButton: React.FC<AirplaneButtonProps> = ({ label, onClick, className }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleMouseEnter = () => {
      gsap.to(button.querySelector(".auth-bg"), { scale: 1.2, opacity: 0.8, duration: 0.5 });
      gsap.to(button, {
        y: -5,
        rotateX: 10,
        rotateY: 5,
        duration: 0.4,
        ease: "power2.out",
      });
      gsap.to(button.querySelector(".glow-effect"), {
        boxShadow: "0 0 25px #FFD700cc, 0 0 40px #ADD8E680",
        duration: 0.4,
      });
      gsap.to(button.querySelector(".glow-pulse"), {
        keyframes: [
          { opacity: 0.6, scale: 1.1, duration: 0.6 },
          { opacity: 0.3, scale: 1, duration: 0.6 },
        ],
        repeat: -1,
        yoyo: true,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(button.querySelector(".auth-bg"), { scale: 1, opacity: 0.5, duration: 0.5 });
      gsap.to(button, {
        y: 0,
        rotateX: 0,
        rotateY: 0,
        duration: 0.4,
        ease: "power2.out",
      });
      gsap.to(button.querySelector(".glow-effect"), {
        boxShadow: "0 0 15px #FFD70066",
        duration: 0.4,
      });
      gsap.to(button.querySelector(".glow-pulse"), {
        opacity: 0.3,
        scale: 1,
        duration: 0.4,
      });
    };

    button.addEventListener("mouseenter", handleMouseEnter);
    button.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      button.removeEventListener("mouseenter", handleMouseEnter);
      button.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={`relative px-4 py-1.5 sm:px-6 sm:py-2 text-sm sm:text-base text-white font-semibold group overflow-hidden ${className}`}
      style={{
        clipPath: "polygon(15% 0%, 85% 0%, 100% 30%, 100% 70%, 85% 100%, 15% 100%, 0% 70%, 0% 30%)",
      }}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-[#FFD700] to-#ADD8E6 opacity-50 scale-0 group-hover:scale-110 transition-transform duration-500 auth-bg" />
      <span className="glow-effect absolute inset-0 transition-all duration-500" style={{ boxShadow: "0 0 15px #FFD70066" }} />
      <span className="glow-pulse absolute inset-0 transition-all duration-500" style={{ boxShadow: "0 0 20px #ADD8E644", opacity: 0.3 }} />
      <span className="relative z-10 flex items-center">
        {label}
      </span>
    </button>
  );
};

const Navbar: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const menuItems: string[] = ["About", "Destinations", "Packages", "Flights", "Hotels", "Booking",  "Contact"];
  const router = useRouter();

  // Scroll Function
  const handleScroll = (id: string): void => {
    const section = document.getElementById(id.toLowerCase());
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle Auth Navigation
  const handleAuthClick = (type: "SignUp" | "Login"): void => {
    router.push(`/${type.toLowerCase()}`);
    setIsOpen(false);
  };

  // Three.js background and button particle effects
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Torus Knot
    const geometry = new THREE.TorusKnotGeometry(3, 1, 150, 32);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color("#ADD8E6"),
      shininess: 120,
      specular: new THREE.Color("#FFFFFF"),
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Background Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 40;
    }
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({ size: 0.01, color: "#FFFFFF" });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Button Particle Effects
    const buttonParticles: THREE.Points[] = [];
    const createButtonParticles = (button: HTMLElement, color: string) => {
      const buttonRect = button.getBoundingClientRect();
      const particleGeometry = new THREE.BufferGeometry();
      const particleCount = 100;
      const particlePos = new Float32Array(particleCount * 3);
      const velocities = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        particlePos[i] = buttonRect.left + buttonRect.width / 2 - window.innerWidth / 2;
        particlePos[i + 1] = -buttonRect.top + buttonRect.height / 2 + window.innerHeight / 2;
        particlePos[i + 2] = -5;
        velocities[i] = (Math.random() - 0.5) * 0.05;
        velocities[i + 1] = (Math.random() - 0.5) * 0.05;
        velocities[i + 2] = (Math.random() - 0.5) * 0.05;
      }
      particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
      particleGeometry.setAttribute("velocity", new THREE.BufferAttribute(velocities, 3));
      const particleMaterial = new THREE.PointsMaterial({
        size: 0.06,
        color: color,
        transparent: true,
        opacity: 0,
      });
      const particleMesh = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particleMesh);
      buttonParticles.push(particleMesh);
      return particleMesh;
    };

    // Initialize particles for auth buttons
    const loginButton = document.querySelector(".login-btn");
    const signupButton = document.querySelector(".signup-btn");
    let loginParticles: THREE.Points | null = null;
    let signupParticles: THREE.Points | null = null;
    if (loginButton) {
      loginParticles = createButtonParticles(loginButton as HTMLElement, "#FFFFFF");
    }
    if (signupButton) {
      signupParticles = createButtonParticles(signupButton as HTMLElement, "#FFFFFF");
    }

    scene.add(new THREE.AmbientLight("#FFFFFF", 0.5));
    const pointLight = new THREE.PointLight("#FFFFFF", 1.2);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const animate = () => {
      mesh.rotation.x += 0.002;
      mesh.rotation.y += 0.003;
      particlesMesh.rotation.y += 0.0008;

      // Animate button particles
      buttonParticles.forEach((particleMesh) => {
        const positions = particleMesh.geometry.attributes.position.array as Float32Array;
        const velocities = particleMesh.geometry.attributes.velocity.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += velocities[i];
          positions[i + 1] += velocities[i + 1];
          positions[i + 2] += velocities[i + 2];
          if (Math.abs(positions[i]) > 10 || Math.abs(positions[i + 1]) > 10 || Math.abs(positions[i + 2]) > 10) {
            const button = particleMesh === loginParticles ? loginButton : signupButton;
            if (button) {
              const buttonRect = button.getBoundingClientRect();
              positions[i] = buttonRect.left + buttonRect.width / 2 - window.innerWidth / 2;
              positions[i + 1] = -buttonRect.top + buttonRect.height / 2 + window.innerHeight / 2;
              positions[i + 2] = -5;
              velocities[i] = (Math.random() - 0.5) * 0.05;
              velocities[i + 1] = (Math.random() - 0.5) * 0.05;
              velocities[i + 2] = (Math.random() - 0.5) * 0.05;
            }
          }
        }
        particleMesh.geometry.attributes.position.needsUpdate = true;
      });

      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Handle button hover for particle effects
    const updateButtonParticles = (button: HTMLElement, particleMesh: THREE.Points) => {
      const buttonRect = button.getBoundingClientRect();
      const positions = particleMesh.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] = buttonRect.left + buttonRect.width / 2 - window.innerWidth / 2;
        positions[i + 1] = -buttonRect.top + buttonRect.height / 2 + window.innerHeight / 2;
      }
      particleMesh.geometry.attributes.position.needsUpdate = true;
    };

    const handleMouseEnter = (e: Event) => {
      const button = e.currentTarget as HTMLElement;
      const isLogin = button.classList.contains("login-btn");
      const particleMesh = isLogin ? loginParticles : signupParticles;
      if (particleMesh) {
        updateButtonParticles(button, particleMesh);
        gsap.to(particleMesh.material, { opacity: 0.9, duration: 0.5 });
      }
    };

    const handleMouseLeave = (e: Event) => {
      const button = e.currentTarget as HTMLElement;
      const isLogin = button.classList.contains("login-btn");
      const particleMesh = isLogin ? loginParticles : signupParticles;
      if (particleMesh) {
        gsap.to(particleMesh.material, { opacity: 0, duration: 0.5 });
      }
    };

    if (loginButton) {
      loginButton.addEventListener("mouseenter", handleMouseEnter);
      loginButton.addEventListener("mouseleave", handleMouseLeave);
    }
    if (signupButton) {
      signupButton.addEventListener("mouseenter", handleMouseEnter);
      signupButton.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      if (loginButton) {
        loginButton.removeEventListener("mouseenter", handleMouseEnter);
        loginButton.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (signupButton) {
        signupButton.removeEventListener("mouseenter", handleMouseEnter);
        signupButton.removeEventListener("mouseleave", handleMouseLeave);
      }
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // GSAP Animations
  useEffect(() => {
    gsap.from(".nav-item", { y: -40, opacity: 0, stagger: 0.08, duration: 1.2, ease: "power4.out" });
    gsap.from(".action-icons > *", { scale: 0, opacity: 0, stagger: 0.12, duration: 0.8, ease: "elastic.out(1, 0.5)", delay: 0.8 });
    gsap.from(".auth-btn", { y: 30, opacity: 0, stagger: 0.15, duration: 1.2, ease: "back.out(1.7)", delay: 1 });
  }, []);

  const toggleTheme = (): void => {
    setIsDarkMode((prev) => !prev);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <nav className="relative w-full overflow-hidden">
      <div ref={mountRef} className="absolute top-0 left-0 w-full h-20 sm:h-24 -z-10" />

      <div className="backdrop-blur-xl bg-gradient-to-r from-black to-#ADD8E6 dark:from-black dark:to-#ADD8E6 border-b border-white/20 px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex justify-between items-center shadow-lg transition-colors duration-500">
        {/* Logo */}
        <span
          className="text-2xl sm:text-3xl font-extrabold text-white tracking-wider hover:text-[#FFD700] transition-all duration-500 transform hover:scale-105 cursor-pointer mr-4 sm:mr-8 md:mr-12"
          onClick={() => handleScroll("home")}
        >
          Tripora
        </span>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex space-x-4 xl:space-x-6 text-white font-semibold items-center ml-4">
          {menuItems.map((item) => (
            <li key={item} className="nav-item relative cursor-pointer group">
              <button
                onClick={() => handleScroll(item)}
                className="px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-base rounded-lg hover:bg-white/10 transition-all duration-300 hover:text-[#FFD700]"
              >
                {item}
              </button>
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-[#FFD700] to-#ADD8E6 transition-all duration-500 group-hover:w-full" />
            </li>
          ))}
        </ul>

        {/* Action Icons */}
        <div className="action-icons flex items-center space-x-2 sm:space-x-4 text-white">
          <button
            onClick={() => handleScroll("profile")}
            className="hover:text-[#FFD700] transition duration-300 transform hover:scale-110"
          >
            <User size={20} className="sm:h-6 sm:w-6" />
          </button>
          <button
            onClick={toggleTheme}
            className="hover:text-[#FFD700] transition duration-300 transform hover:scale-110"
          >
            {isDarkMode ? <Sun size={20} className="sm:h-6 sm:w-6" /> : <Moon size={20} className="sm:h-6 sm:w-6" />}
          </button>

          {/* Auth Buttons (Desktop) */}
          <div className="hidden lg:flex space-x-2 xl:space-x-4">
            <AirplaneButton
              label="Login"
              onClick={() => handleAuthClick("Login")}
              className="auth-btn login-btn"
            />
            <AirplaneButton
              label="Sign Up"
              onClick={() => handleAuthClick("SignUp")}
              className="auth-btn signup-btn"
            />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white focus:outline-none transform transition duration-300 hover:scale-110"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <span className="text-2xl sm:text-3xl">☰</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-gradient-to-b from-black to-#ADD8E6 dark:from-black dark:to-#ADD8E6 backdrop-blur-md absolute w-full left-0 top-20 sm:top-24 flex flex-col items-center space-y-4 sm:space-y-6 py-4 sm:py-6 transition-all duration-500 z-50">
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => {
                handleScroll(item);
                setIsOpen(false);
              }}
              className="text-white text-base sm:text-xl font-medium hover:text-[#FFD700] transition duration-300 transform hover:translate-x-2"
            >
              {item}
            </button>
          ))}
          {/* Auth Buttons (Mobile) */}
          <div className="flex space-x-2 sm:space-x-4 mt-4">
            <AirplaneButton
              label="Login"
              onClick={() => handleAuthClick("Login")}
              className="auth-btn login-btn"
            />
            <AirplaneButton
              label="Sign Up"
              onClick={() => handleAuthClick("SignUp")}
              className="auth-btn signup-btn"
            />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;