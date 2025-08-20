"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation"; // ✅ Next.js router
import { gsap } from "gsap";
import { Menu, X } from "lucide-react";

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
      gsap.to(button, { y: -5, duration: 0.4, ease: "power2.out" });
    };

    const handleMouseLeave = () => {
      gsap.to(button.querySelector(".auth-bg"), { scale: 1, opacity: 0.5, duration: 0.5 });
      gsap.to(button, { y: 0, duration: 0.4, ease: "power2.out" });
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
      className={`relative px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-base text-white font-semibold group overflow-hidden rounded-lg ${className}`}
      style={{
        clipPath:
          "polygon(15% 0%, 85% 0%, 100% 30%, 100% 70%, 85% 100%, 15% 100%, 0% 70%, 0% 30%)",
      }}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-[#FFD700] to-white opacity-50 scale-0 group-hover:scale-110 transition-transform duration-500 auth-bg" />
      <span className="relative z-10 flex items-center">{label}</span>
    </button>
  );
};

const Navbar: React.FC = () => {
  const router = useRouter(); // ✅ Next.js router
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const menuItems: string[] = [
    "About",
    "Destinations",
    "Packages",
    "Flights",
    "Hotels",
    "Booking",
    "Contact",
  ];

  const handleScroll = (id: string): void => {
    const section = document.getElementById(id.toLowerCase());
    if (section) {
      const navbarHeight = 80; // navbar ki height approx
      const sectionTop = section.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top: sectionTop, behavior: "smooth" });
      setIsOpen(false);
    }
  };

  // ✅ Animate dropdown menu
  useEffect(() => {
    if (!mobileMenuRef.current) return;
    if (isOpen) {
      gsap.to(mobileMenuRef.current, {
        height: "auto",
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
      });
    } else {
      gsap.to(mobileMenuRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
      });
    }
  }, [isOpen]);

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50">
        <div className="backdrop-blur-xl bg-black/90 border-b border-white/20 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center shadow-lg">
          {/* Logo */}
          <button
            className="text-2xl sm:text-3xl font-extrabold text-white tracking-wider hover:text-[#FFD700] transition-all duration-500"
            onClick={() => handleScroll("home")}
          >
            Tripora
          </button>

          {/* Desktop Menu */}
          <ul className="hidden lg:flex space-x-6 text-white font-semibold items-center">
            {menuItems.map((item) => (
              <li key={item} className="nav-item relative cursor-pointer group">
                <button
                  className="px-3 py-2 text-base rounded-lg hover:text-[#FFD700] transition-all duration-300"
                  onClick={() => handleScroll(item)}
                >
                  {item}
                </button>
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-[#FFD700] to-white transition-all duration-500 group-hover:w-full" />
              </li>
            ))}
          </ul>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 text-white">
            {/* Auth Buttons (Desktop) */}
            <div className="hidden lg:flex space-x-4">
              <AirplaneButton label="Login" onClick={() => router.push("/login")} />
              <AirplaneButton label="Sign Up" onClick={() => router.push("/signup")} />
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-white focus:outline-none transition duration-300"
              onClick={() => setIsOpen((prev) => !prev)}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          ref={mobileMenuRef}
          className="lg:hidden bg-black/95 backdrop-blur-md absolute w-full left-0 top-16 sm:top-20 flex flex-col items-center space-y-4 py-4 z-40 overflow-hidden"
        >
          {menuItems.map((item) => (
            <button
              key={item}
              className="text-white text-lg font-medium hover:text-[#FFD700] transition duration-300"
              onClick={() => handleScroll(item)}
            >
              {item}
            </button>
          ))}
          <div className="flex space-x-4 mt-4">
            <AirplaneButton label="Login" onClick={() => router.push("/login")} />
            <AirplaneButton label="Sign Up" onClick={() => router.push("/signup")} />
          </div>
        </div>
      </nav>

      {/* Spacer so content doesn't overlap */}
      <div className="h-20 sm:h-24" />
    </>
  );
};

export default Navbar;
