'use client';
import React, { useState, useEffect, useRef, useReducer } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ContactDetails {
  region: string;
  email: string;
  phone: string;
  address: string;
  coordinates: [number, number];
}

interface NavigationLink {
  name: string;
  href: string;
}

interface NavigationCategory {
  [key: string]: NavigationLink[];
}

interface State {
  email: string;
  emailError: string | null;
  success: string | null;
  copied: string | null;
  language: 'en' | 'ur' | 'ar';
}

type Action =
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'SET_EMAIL_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS'; payload: string | null }
  | { type: 'SET_COPIED'; payload: string | null }
  | { type: 'SET_LANGUAGE'; payload: 'en' | 'ur' | 'ar' };

const contactDetails: Record<string, ContactDetails[]> = {
  en: [
    { region: 'Pakistan', email: 'FizaNaazz321@gmail.com', phone: '+92-3123632197', address: '123 Main St, Karachi', coordinates: [24.860, 67.115] },
    { region: 'UAE', email: 'FizaNaazz321@gmail.com', phone: '+92-3123632197', address: '456 Sheikh Zayed Rd, Dubai', coordinates: [25.2048, 55.2708] },
  ],
  ur: [
    { region: 'پاکستان', email: 'FizaNaazz321@gmail.com', phone: '+92-3123632197', address: 'کراچی، مین اسٹریٹ 123', coordinates: [24.860, 67.115] },
    { region: 'متحدہ عرب امارات', email: 'FizaNaazz321@gmail.com', phone: '+92-3123632197', address: 'دبئی، شیخ زاید روڈ 456', coordinates: [25.2048, 55.2708] },
  ],
  ar: [
    { region: 'باكستان', email: 'FizaNaazz321@gmail.com', phone: '+92-3123632197', address: '123 شارع رئيسي، كراتشي', coordinates: [24.860, 67.115] },
    { region: 'الإمارات', email: 'FizaNaazz321@gmail.com', phone: '+92-3123632197', address: '456 طريق الشيخ زايد، دبي', coordinates: [25.2048, 55.2708] },
  ],
};

const navigation: NavigationCategory = {
  explore: [
    { name: 'Discover Home', href: '/' },
    { name: 'Global Destinations', href: '/destinations' },
    { name: 'Luxury Packages', href: '/packages' },
    { name: 'Travel Stories', href: '/blog' },
  ],
  support: [
    { name: 'Reach Out', href: '/contact' },
    { name: 'Quick Answers', href: '/faqs' },
    { name: 'Support Hub', href: '/support' },
  ],
  company: [
    { name: 'Our Journey', href: '/about' },
    { name: 'Join Us', href: '/careers' },
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
  ],
};

const initialState: State = {
  email: '',
  emailError: null,
  success: null,
  copied: null,
  language: 'en',
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_EMAIL': return { ...state, email: action.payload };
    case 'SET_EMAIL_ERROR': return { ...state, emailError: action.payload };
    case 'SET_SUCCESS': return { ...state, success: action.payload };
    case 'SET_COPIED': return { ...state, copied: action.payload };
    case 'SET_LANGUAGE': return { ...state, language: action.payload };
    default: return state;
  }
};

const Footer: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const mountRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const gsapContextRef = useRef<gsap.Context | null>(null);

  // Three.js Particle Wave Background
  useEffect(() => {
    if (typeof window === 'undefined' || !mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const particleCount = window.innerWidth < 768 ? 500 : 1000;
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      scales[i] = Math.random() * 0.02 + 0.01;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    const material = new THREE.PointsMaterial({
      size: 0.03,
      color: new THREE.Color('#FFD700'),
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const animate = () => {
      requestAnimationFrame(animate);
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] = Math.sin(Date.now() * 0.001 + positions[i3]) * 0.5;
        scales[i] = Math.sin(Date.now() * 0.001 + i) * 0.015 + 0.01;
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.scale.needsUpdate = true;
      material.color.setHSL((Date.now() % 5000) / 5000, 0.7, 0.5);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // GSAP animations
  useEffect(() => {
    if (footerRef.current) {
      gsapContextRef.current = gsap.context(() => {
        gsap.from('.footer-card', {
          y: 80,
          opacity: 0,
          rotation: 10,
          stagger: 0.3,
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: { trigger: '.footer-card', start: 'top 85%' },
        });
        gsap.from('.trust-logo', {
          opacity: 0,
          scale: 0.6,
          rotation: 20,
          stagger: 0.4,
          duration: 1,
          ease: 'back.out(2)',
          scrollTrigger: { trigger: '.trust-logo', start: 'top 90%' },
          onComplete: () => {
            gsap.to('.trust-logo', {
              scale: 1.05,
              repeat: -1,
              yoyo: true,
              duration: 2,
              ease: 'sine.inOut',
            });
          },
        });
        gsap.from('.success-modal', {
          scale: 0.5,
          opacity: 0,
          duration: 0.8,
          ease: 'bounce.out',
        });
      }, footerRef.current);
    }
    return () => {
      if (gsapContextRef.current) {
        gsapContextRef.current.revert();
      }
    };
  }, [state.success]);

  // 3D tilt effect
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>('.footer-card');
    cards.forEach((card) => {
      const handleMouseMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const timeline = gsap.timeline();
        timeline.to(card, {
          rotationY: x * 0.08,
          rotationX: -y * 0.08,
          ease: 'power1.out',
          duration: 0.3,
          boxShadow: `0 15px 40px rgba(255, 215, 0, ${0.4 + Math.abs(x) / 500})`,
          transformPerspective: 1200,
        });
      };
      const handleMouseLeave = () => {
        gsap.to(card, {
          rotationY: 0,
          rotationX: 0,
          ease: 'power1.out',
          duration: 0.3,
          boxShadow: '0 8px 20px rgba(255, 215, 0, 0.3)',
        });
      };
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      };
    });
  }, []);

  // Real-time email validation
  useEffect(() => {
    const handler = setTimeout(() => {
      if (state.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
        dispatch({ type: 'SET_EMAIL_ERROR', payload: 'Please enter a valid email.' });
      } else {
        dispatch({ type: 'SET_EMAIL_ERROR', payload: null });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [state.email]);

  // Handle newsletter submission
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_EMAIL_ERROR', payload: null });
    dispatch({ type: 'SET_SUCCESS', payload: null });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
      dispatch({ type: 'SET_EMAIL_ERROR', payload: 'Please enter a valid email.' });
      return;
    }

    const savedEmails = JSON.parse(localStorage.getItem('newsletterEmails') || '[]');
    if (savedEmails.includes(state.email)) {
      dispatch({ type: 'SET_EMAIL_ERROR', payload: 'Email already subscribed.' });
      return;
    }

    try {
      for (let i = 0; i <= 100; i += 20) {
        setSubmissionProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      localStorage.setItem('newsletterEmails', JSON.stringify([...savedEmails, state.email]));
      dispatch({ type: 'SET_SUCCESS', payload: 'Subscribed successfully!' });
      dispatch({ type: 'SET_EMAIL', payload: '' });
      setSubmissionProgress(0);
    } catch {
      dispatch({ type: 'SET_EMAIL_ERROR', payload: 'Failed to subscribe. Try again.' });
      setSubmissionProgress(0);
    }
  };

  // Handle copy to clipboard
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      dispatch({ type: 'SET_COPIED', payload: text });
      setTimeout(() => dispatch({ type: 'SET_COPIED', payload: null }), 2000);
    } catch {
      dispatch({ type: 'SET_SUCCESS', payload: 'Failed to copy. Please try manually.' });
    }
  };

  // Scroll to top
  const scrollToTop = () => {
    gsap.to(window, {
      scrollTo: { y: 0 },
      duration: 1,
      ease: 'power3.out',
    });
  };

  return (
    <footer className="relative bg-gradient-to-b from-black to-gray-900 text-white font-[Poppins] py-16 overflow-hidden">
      {/* Three.js Particle Wave Background */}
      <div ref={mountRef} className="absolute inset-0 z-0 opacity-60" />

      {/* Main Content */}
      <div ref={footerRef} className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-8 justify-between">
          {/* Navigation Links - Explore */}
          <div className="footer-card bg-black/50 backdrop-blur-xl border border-yellow-500/40 rounded-3xl p-6 clip-wave shadow-lg hover:shadow-yellow-500/50 transition-shadow duration-300 max-w-xs">
            <h3 className="text-2xl font-bold text-yellow-400 mb-4 text-shadow">Explore</h3>
            <ul className="space-y-3">
              {navigation.explore.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-200 hover:text-yellow-300 transition-all duration-300 transform hover:scale-105 hover:translate-x-2"
                    aria-label={`Navigate to ${link.name}`}
                    onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.1, rotate: 5, duration: 0.3 })}
                    onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, rotate: 0, duration: 0.3 })}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation Links - Support */}
          <div className="footer-card bg-black/50 backdrop-blur-xl border border-yellow-500/40 rounded-3xl p-6 clip-wave shadow-lg hover:shadow-yellow-500/50 transition-shadow duration-300 max-w-xs">
            <h3 className="text-2xl font-bold text-yellow-400 mb-4 text-shadow">Support</h3>
            <ul className="space-y-3">
              {navigation.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-200 hover:text-yellow-300 transition-all duration-300 transform hover:scale-105 hover:translate-x-2"
                    aria-label={`Navigate to ${link.name}`}
                    onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.1, rotate: 5, duration: 0.3 })}
                    onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, rotate: 0, duration: 0.3 })}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-card bg-black/50 backdrop-blur-xl border border-yellow-500/40 rounded-3xl p-6 clip-wave shadow-lg hover:shadow-yellow-500/50 transition-shadow duration-300 max-w-xs">
            <h3 className="text-2xl font-bold text-yellow-400 mb-4 text-shadow">Connect With Us</h3>
            <ul className="space-y-4 text-gray-200">
              {contactDetails[state.language].map((contact) => (
                <li key={contact.region}>
                  <p className="font-semibold text-yellow-300">{contact.region}</p>
                  <p className="flex items-center gap-2">
                    <span
                      onClick={() => handleCopy(contact.email)}
                      className="cursor-pointer hover:text-yellow-300 transition-all duration-300 transform hover:scale-105"
                      aria-label={`Copy email: ${contact.email}`}
                    >
                      {contact.email}
                    </span>
                    {state.copied === contact.email && (
                      <svg className="w-4 h-4 text-green-500 animate-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </p>
                  <p className="flex items-center gap-2">
                    <span
                      onClick={() => handleCopy(contact.phone)}
                      className="cursor-pointer hover:text-yellow-300 transition-all duration-300 transform hover:scale-105"
                      aria-label={`Copy phone: ${contact.phone}`}
                    >
                      {contact.phone}
                    </span>
                    {state.copied === contact.phone && (
                      <svg className="w-4 h-4 text-green-500 animate-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </p>
                </li>
              ))}
            </ul>
            <div className="flex gap-4 mt-4">
              <a
                href="https://x.com/FizaNazzx"
                className="text-yellow-400 hover:text-yellow-300 transition-all duration-300 transform hover:scale-125"
                aria-label="Follow us on X"
                onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.3, rotate: 360, duration: 0.4 })}
                onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, rotate: 0, duration: 0.4 })}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://wa.me/+92-3123632197"
                className="text-yellow-400 hover:text-yellow-300 transition-all duration-300 transform hover:scale-125"
                aria-label="Contact us on WhatsApp"
                onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.3, rotate: 360, duration: 0.4 })}
                onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, rotate: 0, duration: 0.4 })}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.134.297-.347.446-.52.149-.174.297-.347.397-.496.099-.149.099-.372-.025-.521-.124-.149-.669-.719-.918-.991-.249-.272-.471-.296-.669-.198-.198.099-.865.471-1.036.719-.173.248-.173.496-.074.744.099.248.372.471.67.644l.297.198c1.255.846 2.406 1.738 3.112 2.986.706 1.247 1.067 2.586 1.193 3.925.025.248.074.496.223.644.149.149.347.223.595.223.248 0 .595-.099.892-.297.297-.198 1.036-.595 1.758-.892.721-.297 1.36-.099 1.857.372.496.471.595 1.036.446 1.284-.149.248-.719.595-1.006.744zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/zii_tech_63?igsh=eDg5ZnA4ZmUyb3B6"
                className="text-yellow-400 hover:text-yellow-300 transition-all duration-300 transform hover:scale-125"
                aria-label="Follow us on Instagram"
                onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.3, rotate: 360, duration: 0.4 })}
                onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, rotate: 0, duration: 0.4 })}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.148 3.227-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.849 0-3.204.012-3.584.069-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.058 1.644-.07 4.849-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.982-6.98.058-1.281.072-1.689.072-4.948 0-3.259-.014-3.667-.072-4.947-.2-4.354-2.618-6.782-6.98-6.982-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Newsletter Signup & Language Toggle */}
          <div className="footer-card bg-black/50 backdrop-blur-xl border border-yellow-500/40 rounded-3xl p-6 clip-wave shadow-lg hover:shadow-yellow-500/50 transition-shadow duration-300 max-w-xs">
            <h3 className="text-2xl font-bold text-yellow-400 mb-4 text-shadow">Join Our Journey</h3>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="Your Email Address"
                value={state.email}
                onChange={(e) => dispatch({ type: 'SET_EMAIL', payload: e.target.value })}
                className={`p-3 bg-gray-900/70 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full border ${state.emailError ? 'border-red-500' : 'border-transparent'} transition-all duration-300`}
                aria-label="Newsletter email"
              />
              {submissionProgress > 0 && (
                <div className="w-full bg-gray-800/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-white h-2 rounded-full transition-all duration-200"
                    style={{ width: `${submissionProgress}%` }}
                  />
                </div>
              )}
              <button
                type="submit"
                className="bg-gradient-to-r from-yellow-400 to-white text-black py-2 px-6 rounded-lg hover:from-yellow-300 hover:to-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                aria-label="Subscribe to newsletter"
                onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.1, rotate: 5, duration: 0.3 })}
                onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, rotate: 0, duration: 0.3 })}
              >
                Embark Now
              </button>
              {state.emailError && <p className="text-red-500 text-sm">{state.emailError}</p>}
              {state.success && !state.emailError && <p className="text-green-500 text-sm">{state.success}</p>}
            </form>
            <div className="mt-4">
              <select
                value={state.language}
                onChange={(e) => dispatch({ type: 'SET_LANGUAGE', payload: e.target.value as 'en' | 'ur' | 'ar' })}
                className="bg-gray-900/70 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full"
                aria-label="Select language"
              >
                <option value="en">English</option>
                <option value="ur">Urdu</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-yellow-400 mb-4 text-shadow">Trusted Globally</h3>
          <div className="flex justify-center gap-8">
            <img
              src="/logos/iata.png"
              alt="IATA Certified"
              className="trust-logo h-14 opacity-70 hover:opacity-100 transition-all duration-300 transform hover:scale-110"
            />
            <img
              src="/logos/atol.png"
              alt="ATOL Protected"
              className="trust-logo h-14 opacity-70 hover:opacity-100 transition-all duration-300 transform hover:scale-110"
            />
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} TripOra. All Rights Reserved.</p>
        </div>

        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-yellow-400 to-white text-black p-3 rounded-full shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-110"
          aria-label="Scroll to top"
          onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.2, rotate: 360, duration: 0.5 })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, rotate: 0, duration: 0.5 })}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>

        {/* Success Modal */}
        {state.success && (
          <div className="success-modal fixed inset-0 bg-black/80 flex items-center justify-center z-50" aria-live="polite">
            <div className="bg-black/50 backdrop-blur-xl border border-yellow-500/40 rounded-2xl p-8 max-w-md w-full animate-pulse-glow">
              <h2 className="text-3xl font-bold text-yellow-400 mb-4 text-shadow">Welcome Aboard!</h2>
              <p className="text-gray-200">{state.success}</p>
              <button
                onClick={() => dispatch({ type: 'SET_SUCCESS', payload: null })}
                className="mt-4 bg-gradient-to-r from-yellow-400 to-white text-black py-2 px-6 rounded-lg hover:from-yellow-300 hover:to-white transition-all duration-300 transform hover:scale-105"
                aria-label="Close success modal"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Styling */}
        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap');
          .text-yellow-400 {
            color: #FFD700;
          }
          .bg-yellow-400 {
            background-color: #FFD700;
          }
          .focus\\:ring-yellow-400:focus {
            --tw-ring-color: #FFD700;
          }
          .border-red-500 {
            border: 2px solid #EF4444;
          }
          .text-shadow {
            text-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
          }
          .clip-wave {
            clip-path: polygon(0 10%, 100% 0, 100% 90%, 0 100%);
          }
          .animate-pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
          .animate-check {
            animation: check 0.5s ease-in-out;
          }
          @keyframes pulse-glow {
            0%, 100% { border-color: rgba(255, 215, 0, 0.4); }
            50% { border-color: rgba(255, 215, 0, 0.7); }
          }
          @keyframes check {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </footer>
  );
};

export default Footer;