"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

gsap.registerPlugin(ScrollTrigger);

// Dynamically import react-leaflet components with SSR disabled
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
}

interface FeedbackForm {
  rating: number;
  comment: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface ContactDetails {
  region: string;
  email: string;
  phone: string;
  address: string;
  coordinates: [number, number];
}

const contactDetails: ContactDetails[] = [
  { region: 'Pakistan', email: 'FizaNaazz321@gmail.com', phone: '+923123632197', address: '123 Main St, Karachi', coordinates: [24.860, 67.115] },
  { region: 'UAE', email: 'FizaNaazz321@gmail.com', phone: '+923123632197', address: '456 Sheikh Zayed Rd, Dubai', coordinates: [25.2048, 55.2708] },
];

const faqs: FAQ[] = [
  { question: 'How do I cancel a booking?', answer: 'You can cancel within 24 hours via the Booking History section.' },
  { question: 'What is the refund policy?', answer: 'Refunds are processed within 7 days for eligible cancellations.' },
  { question: 'How do I change my booking?', answer: 'Contact our support team with your PNR to modify your booking.' },
  { question: 'Are pets allowed in hotels?', answer: 'Pet policies vary by hotel. Please check the hotel’s amenities.' },
];

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'General',
    message: '',
  });
  const [feedback, setFeedback] = useState<FeedbackForm>({ rating: 0, comment: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState('Pakistan');
  const mountRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const gsapContextRef = useRef<gsap.Context | null>(null);

  // Fix Leaflet marker icon issue
  useEffect(() => {
    if (typeof window === 'undefined') return;

    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        iconUrl: '/leaflet/marker-icon.png',
        shadowUrl: '/leaflet/marker-shadow.png',
      });
    });
  }, []);

  // Three.js particle background
  useEffect(() => {
    if (typeof window === 'undefined' || !mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const particleCount = window.innerWidth < 768 ? 1000 : 2000;
    const posArray = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
      if (i % 3 === 0) scales[i / 3] = Math.random() * 0.02 + 0.01;
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: new THREE.Color('#FFD700'),
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      particlesMesh.rotation.y += 0.0008;
      for (let i = 0; i < particleCount; i++) {
        scales[i] = Math.sin(Date.now() * 0.001 + i) * 0.01 + 0.015;
      }
      particlesGeometry.attributes.scale.needsUpdate = true;
      particlesMaterial.color.setHSL((Date.now() % 5000) / 5000, 0.7, 0.5);
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
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // GSAP animations
  useEffect(() => {
    if (mountRef.current) {
      gsapContextRef.current = gsap.context(() => {
        gsap.from('.contact-form', { y: 50, opacity: 0, duration: 1.2, ease: 'power4.out' });
        gsap.from('.contact-card', {
          y: 50,
          opacity: 0,
          stagger: 0.3,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.contact-card', start: 'top 80%' },
        });
        gsap.from('.faq-item', {
          y: 30,
          opacity: 0,
          stagger: 0.2,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.faq-item', start: 'top 85%' },
        });
        gsap.from('.feedback-form', { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.feedback-form', start: 'top 80%' } });
        gsap.from('.success-modal', { scale: 0.7, opacity: 0, duration: 0.6, ease: 'back.out(2)' });
      }, mountRef.current);
    }
    return () => {
      if (gsapContextRef.current) {
        gsapContextRef.current.revert();
      }
    };
  }, [success]);

  // 3D card tilt effect
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const cards = document.querySelectorAll<HTMLElement>('.contact-card, .feedback-form');
    cards.forEach((card) => {
      const handleMouseMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(card, {
          rotationY: x * 0.05,
          rotationX: -y * 0.05,
          ease: 'power1.out',
          duration: 0.2,
          boxShadow: '0 10px 30px rgba(255, 215, 0, 0.3)',
        });
      };
      const handleMouseLeave = () => {
        gsap.to(card, {
          rotationY: 0,
          rotationX: 0,
          ease: 'power1.out',
          duration: 0.2,
          boxShadow: '0 4px 15px rgba(255, 215, 0, 0.2)',
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

  // Handle contact form submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields (Name, Email, Message).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (formData.phone && !/^\+?\d{10,15}$/.test(formData.phone)) {
      setError('Please enter a valid phone number (10-15 digits).');
      return;
    }
    // Mock CAPTCHA check
    if (Math.random() > 0.9) {
      setError('Failed CAPTCHA verification. Please try again.');
      return;
    }

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Contact form submitted:', formData);
      setSuccess('Your message has been sent successfully!');
      setFormData({ name: '', email: '', phone: '', inquiryType: 'General', message: '' });
    } catch (err) {
      setError('Failed to send message. Please try again.');
    }
  };

  // Handle feedback submission
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (feedback.rating === 0) {
      setError('Please select a rating.');
      return;
    }

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Feedback submitted:', feedback);
      setSuccess('Thank you for your feedback!');
      setFeedback({ rating: 0, comment: '' });
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
    }
  };

  // Filter FAQs
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-black text-white font-sans overflow-hidden font-[Inter]">
      {/* Three.js Particle Background */}
      <div ref={mountRef} className="absolute inset-0 z-0 opacity-70" />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Title */}
        <h1 className="text-center text-5xl md:text-6xl font-extrabold mt-20 bg-gradient-to-r from-yellow-400 via-white to-yellow-400 bg-clip-text text-transparent">
          Contact Us
        </h1>

        {/* Contact Form */}
        <form
          className="contact-form bg-black/60 backdrop-blur-lg border border-yellow-500/30 rounded-2xl p-8 mt-10 shadow-2xl hover:shadow-yellow-500/50 transition-all duration-500"
          onClick={handleContactSubmit}
        >
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Get in Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 ${error && !formData.name.trim() ? 'border-red-500' : ''}`}
              aria-label="Full name"
              required
            />
            <input
              type="email"
              placeholder="Email *"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 ${error && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'border-red-500' : ''}`}
              aria-label="Email"
              required
            />
            <input
              type="tel"
              placeholder="Phone Number (optional)"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              aria-label="Phone number"
            />
            <select
              value={formData.inquiryType}
              onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
              className="p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              aria-label="Inquiry type"
            >
              <option value="General">General Inquiry</option>
              <option value="Booking">Booking Issue</option>
              <option value="Payment">Payment Issue</option>
              <option value="Feedback">Feedback</option>
            </select>
            <textarea
              placeholder="Your Message *"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className={`p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 col-span-1 md:col-span-2 ${error && !formData.message.trim() ? 'border-red-500' : ''}`}
              aria-label="Message"
              rows={4}
              required
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-gradient-to-r from-yellow-400 to-white text-black py-2 px-4 rounded-lg hover:from-yellow-300 hover:to-white transition-all duration-300 transform hover:scale-105"
            aria-label="Send message"
          >
            Send Message
          </button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </form>

        {/* Contact Information */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Our Contact Details</h2>
          <div className="flex justify-center mb-4">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="p-2 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              aria-label="Select region"
            >
              {contactDetails.map((contact) => (
                <option key={contact.region} value={contact.region}>
                  {contact.region}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactDetails
              .filter((contact) => contact.region === selectedRegion)
              .map((contact) => (
                <div
                  key={contact.region}
                  className="contact-card bg-black/60 backdrop-blur-lg border border-yellow-500/30 rounded-2xl p-6 shadow-lg hover:shadow-yellow-500/50 transition-all duration-500"
                >
                  <h3 className="text-xl font-semibold text-yellow-400">{contact.region}</h3>
                  <p className="text-gray-300">
                    <strong>Email:</strong>{' '}
                    <a href={`mailto:${contact.email}`} className="hover:text-yellow-400">
                      {contact.email}
                    </a>
                  </p>
                  <p className="text-gray-300">
                    <strong>Phone:</strong>{' '}
                    <a href={`tel:${contact.phone}`} className="hover:text-yellow-400">
                      {contact.phone}
                    </a>
                  </p>
                  <p className="text-gray-300"><strong>Address:</strong> {contact.address}</p>
                  <p className="text-gray-300"><strong>Hours:</strong> Mon-Fri, 9 AM - 6 PM</p>
                  <div className="flex gap-4 mt-4">
                    <a href="https://x.com/FizaNazzx" className="text-yellow-400 hover:text-yellow-300" aria-label="Follow us on X">
                      X
                    </a>
                    <a href="https://wa.me/+923123632197" className="text-yellow-400 hover:text-yellow-300" aria-label="Contact us on WhatsApp">
                      WhatsApp
                    </a>
                    <a href="https://www.instagram.com/zii_tech_63?igsh=eDg5ZnA4ZmUyb3B6" className="text-yellow-400 hover:text-yellow-300" aria-label="Follow us on Instagram">
                      Instagram
                    </a>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Interactive Map */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Find Our Office</h2>
          <div ref={mapRef} className="w-full h-64 rounded-lg overflow-hidden">
            <Suspense fallback={<div className="w-full h-64 bg-gray-900 rounded-lg flex items-center justify-center text-gray-300">Loading Map...</div>}>
              <MapContainer
                center={contactDetails.find((c) => c.region === selectedRegion)?.coordinates as [number, number] || [24.860, 67.115]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                className="rounded-lg"
                aria-label="Interactive office map"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={contactDetails.find((c) => c.region === selectedRegion)?.coordinates as [number, number] || [24.860, 67.115]}>
                  <Popup>{contactDetails.find((c) => c.region === selectedRegion)?.address}</Popup>
                </Marker>
              </MapContainer>
            </Suspense>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Frequently Asked Questions</h2>
          <input
            type="text"
            placeholder="Search FAQs..."
            value={faqSearch}
            onChange={(e) => setFaqSearch(e.target.value)}
            className="p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full mb-4"
            aria-label="Search FAQs"
          />
          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="faq-item bg-black/60 backdrop-blur-lg border border-yellow-500/30 rounded-lg p-4"
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  onKeyDown={(e) => e.key === 'Enter' && setExpandedFaq(expandedFaq === index ? null : index)}
                  aria-label={`Toggle FAQ: ${faq.question}`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-yellow-400">{faq.question}</h3>
                    <span className="text-yellow-400">{expandedFaq === index ? '▲' : '▼'}</span>
                  </div>
                  {expandedFaq === index && (
                    <p className="text-gray-300 mt-2">{faq.answer}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-300">No FAQs found.</p>
            )}
          </div>
        </div>

        {/* Feedback Form */}
        <div
          className="feedback-form mt-10 bg-black/60 backdrop-blur-lg border border-yellow-500/30 rounded-2xl p-8 shadow-lg hover:shadow-yellow-500/50 transition-all duration-500"
          onClick={handleFeedbackSubmit}
        >
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Share Your Feedback</h2>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFeedback({ ...feedback, rating: star })}
                className={`text-2xl ${feedback.rating >= star ? 'text-yellow-400' : 'text-gray-500'}`}
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            placeholder="Your Feedback (optional)"
            value={feedback.comment}
            onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
            className="p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full"
            aria-label="Feedback comment"
            rows={3}
          />
          <button
            type="submit"
            className="mt-4 bg-gradient-to-r from-yellow-400 to-white text-black py-2 px-4 rounded-lg hover:from-yellow-300 hover:to-white transition-all duration-300 transform hover:scale-105"
            aria-label="Submit feedback"
          >
            Submit Feedback
          </button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>

        {/* Success Modal */}
        {success && (
          <div className="success-modal fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-black/60 backdrop-blur-lg border border-yellow-500/30 rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Success!</h2>
              <p className="text-gray-300">{success}</p>
              <button
                onClick={() => setSuccess(null)}
                className="mt-4 bg-gradient-to-r from-yellow-400 to-white text-black py-2 px-4 rounded-lg hover:from-yellow-300 hover:to-white transition-all duration-300 transform hover:scale-105"
                aria-label="Close success modal"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Tailwind CSS and Leaflet styling */}
        <style jsx>{`
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
          .leaflet-container {
            background: #1a1a1a;
          }
          .leaflet-popup-content-wrapper {
            background: #1a1a1a;
            color: #FFD700;
            border: 1px solid #FFD700;
            border-radius: 8px;
          }
          .leaflet-popup-tip {
            background: #1a1a1a;
            border-top: 1px solid #FFD700;
            border-left: 1px solid #FFD700;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Contact;