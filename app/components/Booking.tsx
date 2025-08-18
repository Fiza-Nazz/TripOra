"use client";

import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { format, addDays, isAfter, differenceInDays } from "date-fns";

gsap.registerPlugin(ScrollTrigger);

interface Hotel {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  amenities: string[];
  image: string;
  distance: number;
}

interface SearchForm {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

interface GuestDetails {
  name: string;
  email: string;
  phone: string;
  roomType: string;
  paymentMethod: string;
  cardNumber: string;
  cvv: string;
  expiryDate: string;
  specialRequests: string;
}

interface Booking {
  id: string;
  hotel: Hotel;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestDetails: GuestDetails;
  total: number;
  status: "Confirmed" | "Cancelled";
  bookingDate: string;
}

const mockHotels: Hotel[] = [
  { id: "1", name: "Luxury Inn", location: "Karachi", price: 15000, rating: 4.5, amenities: ["WiFi", "Pool", "Gym"], image: "/luxury.png", distance: 2.5 },
  { id: "2", name: "Golden Stay", location: "Lahore", price: 20000, rating: 4.8, amenities: ["WiFi", "Spa", "Breakfast"], image: "/gold.png", distance: 3.0 },
  { id: "3", name: "Pearl Palace", location: "Islamabad", price: 18000, rating: 4.2, amenities: ["WiFi", "Pool", "Parking"], image: "/pearl.png", distance: 1.8 },
  { id: "4", name: "Royal Retreat", location: "Karachi", price: 25000, rating: 4.9, amenities: ["WiFi", "Spa", "Gym", "Breakfast"], image: "/royal.png", distance: 1.5 },
  { id: "5", name: "Makkah Towers", location: "Makkah", price: 35000, rating: 4.7, amenities: ["WiZi", "Prayer Room", "Breakfast"], image: "/makkah.png", distance: 0.5 },
  { id: "6", name: "Madinah Hilton", location: "Madinah", price: 30000, rating: 4.6, amenities: ["WiFi", "Shuttle", "Prayer Room"], image: "/madinah.png", distance: 0.7 },
  { id: "7", name: "Burj Al Arab", location: "Dubai", price: 100000, rating: 5.0, amenities: ["WiFi", "Spa", "Pool", "Butler"], image: "/burj.png", distance: 4.0 },
  { id: "8", name: "Atlantis The Palm", location: "Dubai", price: 85000, rating: 4.9, amenities: ["WiFi", "Aquarium", "Pool"], image: "/atlantis.png", distance: 5.0 },
  { id: "9", name: "The Plaza", location: "New York", price: 60000, rating: 4.8, amenities: ["WiFi", "Gym", "Spa"], image: "/plaza.png", distance: 2.0 },
  { id: "10", name: "Beverly Hills Hotel", location: "Los Angeles", price: 55000, rating: 4.7, amenities: ["WiFi", "Pool", "Spa"], image: "/baverli.png", distance: 3.5 },
  { id: "11", name: "Anwar Al Madinah", location: "Madinah", price: 28000, rating: 4.5, amenities: ["WiFi", "Prayer Room", "Breakfast"], image: "/madina1.png", distance: 0.8 },
  { id: "12", name: "Swissotel Makkah", location: "Makkah", price: 32000, rating: 4.6, amenities: ["WiFi", "Shuttle", "Prayer Room"], image: "/makka1.png", distance: 0.6 },
];

const mockCities = ["Karachi", "Lahore", "Islamabad", "Makkah", "Madinah", "Dubai", "New York", "Los Angeles"];

const Booking: React.FC = () => {
  const [formData, setFormData] = useState<SearchForm>({
    destination: "",
    checkIn: format(new Date(), "yyyy-MM-dd"),
    checkOut: format(addDays(new Date(), 1), "yyyy-MM-dd"),
    guests: 1,
  });
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [filters, setFilters] = useState({
    priceRange: [0, 100000],
    rating: 0,
    amenities: [] as string[],
    distance: 10,
    sortBy: "price-asc",
  });
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    name: "",
    email: "",
    phone: "",
    roomType: "Standard",
    paymentMethod: "Credit Card",
    cardNumber: "",
    cvv: "",
    expiryDate: "",
    specialRequests: "",
  });
  const [confirmedGuestDetails, setConfirmedGuestDetails] = useState<GuestDetails | null>(null);
  const [bookingHistory, setBookingHistory] = useState<Booking[]>([]);
  const [historyFilters, setHistoryFilters] = useState({
    status: "All" as "All" | "Confirmed" | "Cancelled",
    dateFrom: "",
    dateTo: "",
    sortBy: "date-desc" as "date-desc" | "date-asc" | "price-asc" | "price-desc" | "name-asc",
  });
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [currency, setCurrency] = useState<"PKR" | "USD" | "SAR">("PKR");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);
  const gsapContextRef = useRef<gsap.Context | null>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Currency conversion rates (mock)
  const exchangeRates = { PKR: 1, USD: 0.0036, SAR: 0.0135 };

  // Load booking history from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedBookings = localStorage.getItem("bookingHistory");
    if (savedBookings) {
      try {
        setBookingHistory(JSON.parse(savedBookings));
      } catch (err) {
        console.error("Failed to parse booking history from localStorage:", err);
      }
    }
  }, []);

  // Save booking history to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem("bookingHistory", JSON.stringify(bookingHistory));
    } catch (err) {
      console.error("Failed to save booking history to localStorage:", err);
    }
  }, [bookingHistory]);

  // Three.js particle background with dynamic color transitions
  useEffect(() => {
    if (typeof window === "undefined" || !mountRef.current) return;

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
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute("scale", new THREE.BufferAttribute(scales, 1));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: new THREE.Color("#FFD700"),
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    const animate = () => {
      requestAnimationFrame(animate);
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
    window.addEventListener("resize", handleResize);

    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // GSAP animations with ScrollTrigger
  useEffect(() => {
    if (typeof window === "undefined" || !mountRef.current) return;

    gsapContextRef.current = gsap.context(() => {
      gsap.from(".search-form", { y: 50, opacity: 0, duration: 1.2, ease: "power4.out" });
      gsap.from(".hotel-card", {
        y: 50,
        opacity: 0,
        stagger: 0.3,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".hotel-card", start: "top 80%" },
      });
      gsap.from(".booking-form", { y: 50, opacity: 0, duration: 1, ease: "power3.out", delay: 0.5 });
      gsap.from(".confirmation-modal", { scale: 0.7, opacity: 0, duration: 0.6, ease: "back.out(2)" });
      gsap.from(".history-section", { y: 50, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".history-section", start: "top 80%" } });
      gsap.from(".history-card", {
        y: 30,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: ".history-card", start: "top 85%" },
      });
    }, mountRef.current);

    return () => {
      if (gsapContextRef.current) {
        gsapContextRef.current.revert();
      }
    };
  }, [hotels, selectedHotel, showConfirmation, showHistory, bookingHistory]);

  // 3D card tilt effect with proper typing
  useEffect(() => {
    if (typeof window === "undefined") return;

    const cards = document.querySelectorAll<HTMLElement>(".hotel-card, .history-card");
    cards.forEach((card) => {
      if (!card) return; // Ensure card exists

      const handleMouseMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(card, {
          rotationY: x * 0.05,
          rotationX: -y * 0.05,
          ease: "power1.out",
          duration: 0.2,
          boxShadow: "0 10px 30px rgba(255, 215, 0, 0.3)",
        });
      };

      const handleMouseLeave = () => {
        gsap.to(card, {
          rotationY: 0,
          rotationX: 0,
          ease: "power1.out",
          duration: 0.2,
          boxShadow: "0 4px 15px rgba(255, 215, 0, 0.2)",
        });
      };

      card.addEventListener("mousemove", handleMouseMove as EventListener);
      card.addEventListener("mouseleave", handleMouseLeave as EventListener);

      return () => {
        card.removeEventListener("mousemove", handleMouseMove as EventListener);
        card.removeEventListener("mouseleave", handleMouseLeave as EventListener);
      };
    });
  }, [filteredHotels, bookingHistory]);

  // Autocomplete suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);
  useEffect(() => {
    if (formData.destination.trim()) {
      const filteredSuggestions = mockCities.filter((city) =>
        city.toLowerCase().startsWith(formData.destination.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [formData.destination]);

  // Fetch hotels with mock availability check
  const fetchHotels = () => {
    setLoading(true);
    setError(null);
    try {
      const filtered = mockHotels.filter((hotel) =>
        formData.destination ? hotel.location.toLowerCase().includes(formData.destination.toLowerCase()) : true
      );
      const availableHotels = filtered.filter(() => Math.random() > 0.2); // 80% chance of availability
      if (availableHotels.length === 0) {
        setError("No hotels available for this destination. Try another city (e.g., Karachi, Dubai, Makkah).");
      } else {
        setHotels(availableHotels);
        applyFilters(availableHotels);
      }
    } catch (err) {
      setError("An error occurred while fetching hotels. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting for hotels
  const applyFilters = (data: Hotel[] = hotels) => {
    let filtered = [...data].filter(
      (hotel) =>
        hotel.price * exchangeRates[currency] >= filters.priceRange[0] &&
        hotel.price * exchangeRates[currency] <= filters.priceRange[1] &&
        hotel.rating >= filters.rating &&
        hotel.distance <= filters.distance &&
        (filters.amenities.length === 0 || filters.amenities.every((amenity) => hotel.amenities.includes(amenity)))
    );

    if (filters.sortBy === "price-asc") {
      filtered.sort((a, b) => a.price * exchangeRates[currency] - b.price * exchangeRates[currency]);
    } else if (filters.sortBy === "price-desc") {
      filtered.sort((a, b) => b.price * exchangeRates[currency] - a.price * exchangeRates[currency]);
    } else if (filters.sortBy === "rating-desc") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === "distance-asc") {
      filtered.sort((a, b) => a.distance - b.distance);
    }

    setFilteredHotels(filtered);
  };

  // Apply filters and sorting for booking history
  const applyHistoryFilters = (data: Booking[] = bookingHistory) => {
    let filtered = [...data];

    if (historyFilters.status !== "All") {
      filtered = filtered.filter((booking) => booking.status === historyFilters.status);
    }

    if (historyFilters.dateFrom) {
      filtered = filtered.filter((booking) => new Date(booking.bookingDate) >= new Date(historyFilters.dateFrom));
    }

    if (historyFilters.dateTo) {
      filtered = filtered.filter((booking) => new Date(booking.bookingDate) <= new Date(historyFilters.dateTo));
    }

    if (historyFilters.sortBy === "date-desc") {
      filtered.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
    } else if (historyFilters.sortBy === "date-asc") {
      filtered.sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());
    } else if (historyFilters.sortBy === "price-asc") {
      filtered.sort((a, b) => a.total - b.total);
    } else if (historyFilters.sortBy === "price-desc") {
      filtered.sort((a, b) => b.total - a.total);
    } else if (historyFilters.sortBy === "name-asc") {
      filtered.sort((a, b) => a.hotel.name.localeCompare(b.hotel.name));
    }

    return filtered;
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.destination.trim()) {
      setError("Please enter a destination.");
      return;
    }
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const maxDate = addDays(new Date(), 365);
    if (isAfter(checkInDate, maxDate) || isAfter(checkOutDate, maxDate)) {
      setError("Dates cannot be more than one year in the future.");
      return;
    }
    if (!isAfter(checkOutDate, checkInDate)) {
      setError("Check-out date must be after check-in date.");
      return;
    }
    if (formData.guests < 1) {
      setError("Please select at least one guest.");
      return;
    }
    fetchHotels();
  };

  // Handle hotel selection
  const selectHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setGuestDetails({
      name: "",
      email: "",
      phone: "",
      roomType: "Standard",
      paymentMethod: "Credit Card",
      cardNumber: "",
      cvv: "",
      expiryDate: "",
      specialRequests: "",
    });
    setError(null);
  };

  // Handle booking
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestDetails.name.trim() || !guestDetails.email.trim() || !guestDetails.phone.trim()) {
      setError("Please fill in all guest details.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestDetails.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!/^\+?\d{10,15}$/.test(guestDetails.phone)) {
      setError("Please enter a valid phone number (10-15 digits).");
      return;
    }
    if (guestDetails.paymentMethod !== "PayPal") {
      if (!/^\d{16}$/.test(guestDetails.cardNumber)) {
        setError("Please enter a valid 16-digit card number.");
        return;
      }
      if (!/^\d{3,4}$/.test(guestDetails.cvv)) {
        setError("Please enter a valid CVV (3-4 digits).");
        return;
      }
      if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(guestDetails.expiryDate)) {
        setError("Please enter a valid expiry date (MM/YY).");
        return;
      }
      const [month, year] = guestDetails.expiryDate.split("/").map(Number);
      const expiryDate = new Date(2000 + year, month - 1);
      const today = new Date();
      if (expiryDate <= today) {
        setError("Card expiry date must be in the future.");
        return;
      }
    }
    try {
      if (!selectedHotel) throw new Error("No hotel selected.");
      const nights = differenceInDays(new Date(formData.checkOut), new Date(formData.checkIn));
      const roomTypeMultiplier = guestDetails.roomType === "Deluxe" ? 1.2 : guestDetails.roomType === "Suite" ? 1.5 : 1;
      const total = selectedHotel.price * exchangeRates[currency] * roomTypeMultiplier * nights * 1.15;
      const booking: Booking = {
        id: generatePNR(),
        hotel: selectedHotel,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: formData.guests,
        guestDetails: { ...guestDetails },
        total,
        status: "Confirmed",
        bookingDate: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      };
      setBookingHistory([...bookingHistory, booking]);
      setConfirmedGuestDetails(guestDetails);
      setShowConfirmation(true);
      setGuestDetails({
        name: "",
        email: "",
        phone: "",
        roomType: "Standard",
        paymentMethod: "Credit Card",
        cardNumber: "",
        cvv: "",
        expiryDate: "",
        specialRequests: "",
      });
      setSelectedHotel(null);
      setError(null);
    } catch (err) {
      setError("Payment failed. Please try again.");
    }
  };

  // Cancel booking with policy check
  const cancelBooking = (id: string) => {
    const booking = bookingHistory.find((b) => b.id === id);
    if (!booking) return;
    const bookingDate = new Date(booking.bookingDate);
    const now = new Date();
    const hoursSinceBooking = (now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60);
    if (hoursSinceBooking > 24) {
      setError("Cannot cancel booking: Cancellation is only allowed within 24 hours of booking.");
      return;
    }
    setBookingHistory(bookingHistory.map((b) => (b.id === id ? { ...b, status: "Cancelled" } : b)));
    setError(null);
  };

  // Generate unique PNR
  const generatePNR = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    return `ABC${selectedHotel?.id ?? ""}${timestamp}`;
  };

  // Generate PDF receipt (mock LaTeX)
  const generatePDFReceipt = (booking: Booking) => {
    const latexContent = `
\\documentclass{article}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}
\\usepackage{noto}
\\begin{document}
\\begin{center}
  \\textbf{\\large Booking Confirmation}\\\\
  \\vspace{0.5cm}
  \\textbf{Hotel:} ${booking.hotel.name}\\\\
  \\textbf{Location:} ${booking.hotel.location}\\\\
  \\textbf{PNR:} ${booking.id}\\\\
  \\textbf{Booking Date:} ${booking.bookingDate}\\\\
  \\textbf{Check-In:} ${booking.checkIn}\\\\
  \\textbf{Check-Out:} ${booking.checkOut}\\\\
  \\textbf{Guests:} ${booking.guests}\\\\
  \\textbf{Room Type:} ${booking.guestDetails.roomType}\\\\
  \\textbf{Guest Name:} ${booking.guestDetails.name}\\\\
  \\textbf{Email:} ${booking.guestDetails.email}\\\\
  \\textbf{Phone:} ${booking.guestDetails.phone}\\\\
  \\textbf{Payment Method:} ${booking.guestDetails.paymentMethod}\\\\
  \\textbf{Special Requests:} ${booking.guestDetails.specialRequests || "None"}\\\\
  \\textbf{Base Price:} ${currency} ${(booking.hotel.price * exchangeRates[currency]).toLocaleString()}\\\\
  \\textbf{Taxes (15\\%):} ${currency} ${(booking.total - booking.hotel.price * exchangeRates[currency]).toLocaleString()}\\\\
  \\textbf{Total:} ${currency} ${booking.total.toLocaleString()}
\\end{center}
\\end{document}
    `;
    alert("PDF Receipt generated! (Mock LaTeX content logged to console)");
    console.log(latexContent);
  };

  return (
    <div className="relative min-h-screen bg-black text-white font-sans overflow-hidden font-[Inter]">
      {/* Three.js Particle Background */}
      <div ref={mountRef} className="absolute inset-0 z-0 opacity-70" />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Title */}
        <h1 className="text-center text-5xl md:text-6xl font-extrabold mt-20 bg-gradient-to-r from-yellow-400 via-white to-yellow-400 bg-clip-text text-transparent">
          Book Your Dream Stay
        </h1>

        {/* Currency Toggle */}
        <div className="flex justify-end mt-4">
          <select
            value={currency}
            onChange={(e) => {
              setCurrency(e.target.value as "PKR" | "USD" | "SAR");
              applyFilters();
            }}
            className="p-2 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            aria-label="Select currency"
          >
            <option value="PKR">PKR</option>
            <option value="USD">USD</option>
            <option value="SAR">SAR</option>
          </select>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="search-form bg-black/60 backdrop-blur-lg border border-yellow-500/30 rounded-2xl p-8 mt-10 shadow-2xl hover:shadow-yellow-500/50 transition-all duration-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Destination (e.g., Karachi, Dubai)"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className={`p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 w-full ${error && !formData.destination.trim() ? "border-red-500" : ""}`}
                aria-label="Destination"
              />
              {suggestions.length > 0 && (
                <div ref={autocompleteRef} className="absolute z-20 bg-gray-900 border border-yellow-500/30 rounded-lg mt-1 w-full max-h-40 overflow-y-auto">
                  {suggestions.map((city) => (
                    <div
                      key={city}
                      className="p-2 hover:bg-yellow-400/20 cursor-pointer"
                      onClick={() => {
                        setFormData({ ...formData, destination: city });
                        setSuggestions([]);
                      }}
                      role="option"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && setFormData({ ...formData, destination: city })}
                    >
                      {city}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input
              type="date"
              value={formData.checkIn}
              onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
              min={format(new Date(), "yyyy-MM-dd")}
              className="p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              aria-label="Check-in date"
            />
            <input
              type="date"
              value={formData.checkOut}
              onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
              min={format(addDays(new Date(formData.checkIn), 1), "yyyy-MM-dd")}
              className="p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              aria-label="Check-out date"
            />
            <select
              value={formData.guests}
              onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })}
              className="p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              aria-label="Number of guests"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num} Guest{num > 1 ? "s" : ""}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="col-span-1 md:col-span-4 bg-gradient-to-r from-yellow-400 to-white text-black py-3 rounded-lg hover:from-yellow-300 hover:to-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              disabled={loading}
              aria-label="Search hotels"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-black" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Searching...
                </div>
              ) : (
                "Search Hotels"
              )}
            </button>
          </div>
          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        </form>

        {/* Filters and Sorting */}
        <div className="mt-10 bg-black/60 backdrop-blur-lg border border-yellow-500/30 rounded-2xl p-6 shadow-lg sticky top-0 z-20">
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Filter & Sort Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block mb-2 text-gray-300">Price Range ({currency})</label>
              <input
                type="range"
                min="0"
                max={100000 * exchangeRates[currency]}
                value={filters.priceRange[1]}
                onChange={(e) => setFilters({ ...filters, priceRange: [0, Number(e.target.value)] })}
                className="w-full accent-yellow-400"
                aria-label="Price range"
              />
              <p className="text-gray-300">Up to {currency} {filters.priceRange[1].toLocaleString()}</p>
            </div>
            <div>
              <label className="block mb-2 text-gray-300">Minimum Rating</label>
              <select
                onChange={(e) => setFilters({ ...filters, rating: Number(e.target.value) })}
                className="p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                aria-label="Minimum rating"
              >
                <option value="0">All</option>
                <option value="4">4+</option>
                <option value="4.5">4.5+</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-gray-300">Max Distance (km)</label>
              <input
                type="range"
                min="0"
                max="10"
                value={filters.distance}
                onChange={(e) => setFilters({ ...filters, distance: Number(e.target.value) })}
                className="w-full accent-yellow-400"
                aria-label="Max distance"
              />
              <p className="text-gray-300">Up to {filters.distance} km</p>
            </div>
            <div>
              <label className="block mb-2 text-gray-300">Sort By</label>
              <select
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                aria-label="Sort by"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Rating: High to Low</option>
                <option value="distance-asc">Distance: Near to Far</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-gray-300">Amenities</label>
              <div className="grid grid-cols-2 gap-2">
                {["WiFi", "Pool", "Gym", "Spa", "Breakfast", "Parking", "Prayer Room", "Shuttle", "Butler", "Aquarium"].map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.amenities.includes(amenity)}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          amenities: e.target.checked ? [...filters.amenities, amenity] : filters.amenities.filter((a) => a !== amenity),
                        })
                      }
                      className="accent-yellow-400"
                      aria-label={amenity}
                    />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => applyFilters()}
            className="mt-4 bg-gradient-to-r from-yellow-400 to-white text-black py-2 px-4 rounded-lg hover:from-yellow-300 hover:to-white transition-all duration-300 transform hover:scale-105"
            aria-label="Apply filters"
          >
            Apply Filters
          </button>
        </div>

        {/* Hotel Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-10">
          {filteredHotels.length > 0 ? (
            filteredHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="hotel-card bg-black/60 backdrop-blur-lg border border-yellow-500/30 rounded-2xl p-6 shadow-lg hover:shadow-yellow-500/50 transition-all duration-500 cursor-pointer"
                onClick={() => selectHotel(hotel)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && selectHotel(hotel)}
                aria-label={`Select ${hotel.name}`}
              >
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  loading="lazy"
                  onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/400x300?text=Hotel+Image")}
                />
                <h3 className="text-2xl font-semibold text-yellow-400">{hotel.name}</h3>
                <p className="text-gray-300">{hotel.location} ({hotel.distance} km from center)</p>
                <p className="text-gray-300">Price: {currency} {(hotel.price * exchangeRates[currency]).toLocaleString()}/night</p>
                <p className="text-gray-300">Rating: {hotel.rating} ★</p>
                <p className="text-gray-300">Amenities: {hotel.amenities.join(", ")}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-300 col-span-3 text-center">No hotels found. Try adjusting your search or filters.</p>
          )}
        </div>

        {/* Booking Form */}
        {selectedHotel && (
          <form
            onSubmit={handleBooking}
            className="booking-form mt-10 bg-black/60 backdrop-blur-lg border border-yellow-500/30 rounded-2xl p-8 shadow-lg"
          >
            <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Book {selectedHotel.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={guestDetails.name}
                onChange={(e) => setGuestDetails({ ...guestDetails, name: e.target.value })}
                className={`p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 ${error && !guestDetails.name.trim() ? "border-red-500" : ""}`}
                aria-label="Full name"
              />
              <input
                type="email"
                placeholder="Email"
                value={guestDetails.email}
                onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                className={`p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 ${error && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestDetails.email) ? "border-red-500" : ""}`}
                aria-label="Email"
              />
              <input
                type="tel"
                placeholder="Phone Number (e.g., +923001234567)"
                value={guestDetails.phone}
                onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                className={`p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 ${error && !guestDetails.phone.trim() ? "border-red-500" : ""}`}
                aria-label="Phone number"
              />
              <select
                value={guestDetails.roomType}
                onChange={(e) => setGuestDetails({ ...guestDetails, roomType: e.target.value })}
                className="p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                aria-label="Room type"
              >
                <option value="Standard">Standard Room ({currency} {(selectedHotel.price * exchangeRates[currency]).toLocaleString()}/night)</option>
                <option value="Deluxe">Deluxe Room ({currency} {(selectedHotel.price * exchangeRates[currency] * 1.2).toLocaleString()}/night)</option>
                <option value="Suite">Suite ({currency} {(selectedHotel.price * exchangeRates[currency] * 1.5).toLocaleString()}/night)</option>
              </select>
              <select
                value={guestDetails.paymentMethod}
                onChange={(e) => setGuestDetails({ ...guestDetails, paymentMethod: e.target.value })}
                className="p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                aria-label="Payment method"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="PayPal">PayPal</option>
              </select>
              <input
                type="text"
                placeholder="Card Number (16 digits)"
                value={guestDetails.cardNumber}
                onChange={(e) => setGuestDetails({ ...guestDetails, cardNumber: e.target.value })}
                className={`p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 ${error && guestDetails.paymentMethod !== "PayPal" && !guestDetails.cardNumber.trim() ? "border-red-500" : ""}`}
                aria-label="Card number"
                disabled={guestDetails.paymentMethod === "PayPal"}
              />
              <input
                type="password"
                placeholder="CVV (3-4 digits)"
                value={guestDetails.cvv}
                onChange={(e) => setGuestDetails({ ...guestDetails, cvv: e.target.value })}
                className={`p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 ${error && guestDetails.paymentMethod !== "PayPal" && !guestDetails.cvv.trim() ? "border-red-500" : ""}`}
                aria-label="CVV"
                disabled={guestDetails.paymentMethod === "PayPal"}
              />
              <input
                type="text"
                placeholder="Expiry Date (MM/YY)"
                value={guestDetails.expiryDate}
                onChange={(e) => setGuestDetails({ ...guestDetails, expiryDate: e.target.value })}
                className={`p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 ${error && guestDetails.paymentMethod !== "PayPal" && !guestDetails.expiryDate.trim() ? "border-red-500" : ""}`}
                aria-label="Expiry date"
                disabled={guestDetails.paymentMethod === "PayPal"}
              />
              <textarea
                placeholder="Special Requests (e.g., Non-smoking room)"
                value={guestDetails.specialRequests}
                onChange={(e) => setGuestDetails({ ...guestDetails, specialRequests: e.target.value })}
                className="p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 col-span-1 md:col-span-2"
                aria-label="Special requests"
                rows={3}
              />
            </div>
            <div className="my-4 text-gray-300">
              <p>Base Price: {currency} {(selectedHotel.price * exchangeRates[currency] * (guestDetails.roomType === "Deluxe" ? 1.2 : guestDetails.roomType === "Suite" ? 1.5 : 1)).toLocaleString()}/night</p>
              <p>Nights: {differenceInDays(new Date(formData.checkOut), new Date(formData.checkIn))}</p>
              <p>Taxes (15%): {currency} {(selectedHotel.price * exchangeRates[currency] * (guestDetails.roomType === "Deluxe" ? 1.2 : guestDetails.roomType === "Suite" ? 1.5 : 1) * differenceInDays(new Date(formData.checkOut), new Date(formData.checkIn)) * 0.15).toLocaleString()}</p>
              <p className="font-bold">Total: {currency} {(selectedHotel.price * exchangeRates[currency] * (guestDetails.roomType === "Deluxe" ? 1.2 : guestDetails.roomType === "Suite" ? 1.5 : 1) * differenceInDays(new Date(formData.checkOut), new Date(formData.checkIn)) * 1.15).toLocaleString()}</p>
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-yellow-400 to-white text-black py-2 px-4 rounded-lg hover:from-yellow-300 hover:to-white transition-all duration-300 transform hover:scale-105"
              aria-label="Confirm booking"
            >
              Confirm Booking
            </button>
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </form>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && selectedHotel && confirmedGuestDetails && (
          <div className="confirmation-modal fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-black/60 backdrop-blur-lg border border-yellow-500/30 rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-semibold text-yellow-400 mb-4 border-b border-yellow-500/50 pb-2">Booking Confirmed!</h2>
              <div className="text-gray-300 space-y-2">
                <p>
                  <strong>Hotel:</strong> {selectedHotel.name}
                </p>
                <p>
                  <strong>Location:</strong> {selectedHotel.location}
                </p>
                <p>
                  <strong>PNR:</strong> {bookingHistory[bookingHistory.length - 1].id}
                </p>
                <p>
                  <strong>Booking Date:</strong> {bookingHistory[bookingHistory.length - 1].bookingDate}
                </p>
                <p>
                  <strong>Check-In:</strong> {formData.checkIn}
                </p>
                <p>
                  <strong>Check-Out:</strong> {formData.checkOut}
                </p>
                <p>
                  <strong>Guests:</strong> {formData.guests}
                </p>
                <p>
                  <strong>Room Type:</strong> {confirmedGuestDetails.roomType}
                </p>
                <p>
                  <strong>Guest Name:</strong> {confirmedGuestDetails.name}
                </p>
                <p>
                  <strong>Email:</strong> {confirmedGuestDetails.email}
                </p>
                <p>
                  <strong>Phone:</strong> {confirmedGuestDetails.phone}
                </p>
                <p>
                  <strong>Payment Method:</strong> {confirmedGuestDetails.paymentMethod}
                </p>
                <p>
                  <strong>Special Requests:</strong> {confirmedGuestDetails.specialRequests || "None"}
                </p>
                <p>
                  <strong>Base Price:</strong> {currency} {(selectedHotel.price * exchangeRates[currency] * (confirmedGuestDetails.roomType === "Deluxe" ? 1.2 : confirmedGuestDetails.roomType === "Suite" ? 1.5 : 1)).toLocaleString()}/night
                </p>
                <p>
                  <strong>Nights:</strong> {differenceInDays(new Date(formData.checkOut), new Date(formData.checkIn))}
                </p>
                <p>
                  <strong>Taxes (15%):</strong> {currency}{" "}
                  {(selectedHotel.price * exchangeRates[currency] * (confirmedGuestDetails.roomType === "Deluxe" ? 1.2 : confirmedGuestDetails.roomType === "Suite" ? 1.5 : 1) * differenceInDays(new Date(formData.checkOut), new Date(formData.checkIn)) * 0.15).toLocaleString()}
                </p>
                <p className="font-bold">
                  <strong>Total:</strong> {currency}{" "}
                  {(selectedHotel.price * exchangeRates[currency] * (confirmedGuestDetails.roomType === "Deluxe" ? 1.2 : confirmedGuestDetails.roomType === "Suite" ? 1.5 : 1) * differenceInDays(new Date(formData.checkOut), new Date(formData.checkIn)) * 1.15).toLocaleString()}
                </p>
              </div>
              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => {
                    setShowConfirmation(false);
                    setConfirmedGuestDetails(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-white text-black py-2 px-4 rounded-lg hover:from-yellow-300 hover:to-white transition-all duration-300 transform hover:scale-105"
                  aria-label="Close confirmation"
                >
                  Close
                </button>
                <button
                  onClick={() => generatePDFReceipt(bookingHistory[bookingHistory.length - 1])}
                  className="flex-1 bg-gradient-to-r from-gray-700 to-gray-900 text-white py-2 px-4 rounded-lg hover:from-gray-600 hover:to-gray-800 transition-all duration-300 transform hover:scale-105"
                  aria-label="Download receipt"
                >
                  Download Receipt
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Booking History */}
        <div className="history-section mt-10">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="bg-gradient-to-r from-yellow-400 to-white text-black py-2 px-4 rounded-lg hover:from-yellow-300 hover:to-white transition-all duration-300 transform hover:scale-105"
            aria-label="Toggle booking history"
          >
            {showHistory ? "Hide Booking History" : "View Booking History"}
          </button>
          {showHistory && (
            <div className="mt-6 bg-black/60 backdrop-blur-lg border border-yellow-500/30 rounded-2xl p-6">
              <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Booking History</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block mb-2 text-gray-300">Filter by Status</label>
                  <select
                    value={historyFilters.status}
                    onChange={(e) => setHistoryFilters({ ...historyFilters, status: e.target.value as "All" | "Confirmed" | "Cancelled" })}
                    className="p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    aria-label="Filter by status"
                  >
                    <option value="All">All</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-gray-300">Date From</label>
                  <input
                    type="date"
                    value={historyFilters.dateFrom}
                    onChange={(e) => setHistoryFilters({ ...historyFilters, dateFrom: e.target.value })}
                    className="p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    aria-label="Booking date from"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-gray-300">Date To</label>
                  <input
                    type="date"
                    value={historyFilters.dateTo}
                    onChange={(e) => setHistoryFilters({ ...historyFilters, dateTo: e.target.value })}
                    className="p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    aria-label="Booking date to"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-gray-300">Sort By</label>
                  <select
                    value={historyFilters.sortBy}
                    onChange={(e) => setHistoryFilters({ ...historyFilters, sortBy: e.target.value as "date-desc" | "date-asc" | "price-asc" | "price-desc" | "name-asc" })}
                    className="p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    aria-label="Sort booking history"
                  >
                    <option value="date-desc">Booking Date: Newest First</option>
                    <option value="date-asc">Booking Date: Oldest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Hotel Name: A to Z</option>
                  </select>
                </div>
                <button
                  onClick={() => setHistoryFilters({ status: "All", dateFrom: "", dateTo: "", sortBy: "date-desc" })}
                  className="mt-6 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-all duration-300"
                  aria-label="Reset history filters"
                >
                  Reset Filters
                </button>
              </div>
              {applyHistoryFilters().length > 0 ? (
                <div className="space-y-4">
                  {applyHistoryFilters().map((booking) => (
                    <div
                      key={booking.id}
                      className="history-card border border-yellow-500/30 rounded-lg p-4 cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onClick={() => setExpandedBookingId(expandedBookingId === booking.id ? null : booking.id)}
                      onKeyDown={(e) => e.key === "Enter" && setExpandedBookingId(expandedBookingId === booking.id ? null : booking.id)}
                      aria-label={`Toggle details for booking ${booking.id}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p>
                            <strong>PNR:</strong> {booking.id}
                          </p>
                          <p>
                            <strong>Hotel:</strong> {booking.hotel.name}
                          </p>
                          <p>
                            <strong>Location:</strong> {booking.hotel.location}
                          </p>
                          <p>
                            <strong>Booking Date:</strong> {booking.bookingDate}
                          </p>
                          <p>
                            <strong>Status:</strong> {booking.status}
                          </p>
                          <p>
                            <strong>Total:</strong> {currency} {booking.total.toLocaleString()}
                          </p>
                        </div>
                        <button
                          className="text-yellow-400 hover:text-yellow-300"
                          aria-label={expandedBookingId === booking.id ? "Collapse booking details" : "Expand booking details"}
                        >
                          {expandedBookingId === booking.id ? "▲" : "▼"}
                        </button>
                      </div>
                      {expandedBookingId === booking.id && (
                        <div className="mt-4 text-gray-300 space-y-2 border-t border-yellow-500/30 pt-4">
                          <p>
                            <strong>Check-In:</strong> {booking.checkIn}
                          </p>
                          <p>
                            <strong>Check-Out:</strong> {booking.checkOut}
                          </p>
                          <p>
                            <strong>Guests:</strong> {booking.guests}
                          </p>
                          <p>
                            <strong>Room Type:</strong> {booking.guestDetails.roomType}
                          </p>
                          <p>
                            <strong>Guest Name:</strong> {booking.guestDetails.name}
                          </p>
                          <p>
                            <strong>Email:</strong> {booking.guestDetails.email}
                          </p>
                          <p>
                            <strong>Phone:</strong> {booking.guestDetails.phone}
                          </p>
                          <p>
                            <strong>Payment Method:</strong> {booking.guestDetails.paymentMethod}
                          </p>
                          <p>
                            <strong>Special Requests:</strong> {booking.guestDetails.specialRequests || "None"}
                          </p>
                          <p>
                            <strong>Base Price:</strong> {currency}{" "}
                            {(booking.hotel.price * exchangeRates[currency] * (booking.guestDetails.roomType === "Deluxe" ? 1.2 : booking.guestDetails.roomType === "Suite" ? 1.5 : 1)).toLocaleString()}/night
                          </p>
                          <p>
                            <strong>Nights:</strong> {differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn))}
                          </p>
                          <p>
                            <strong>Taxes (15%):</strong> {currency}{" "}
                            {(booking.total - booking.hotel.price * exchangeRates[currency] * (booking.guestDetails.roomType === "Deluxe" ? 1.2 : booking.guestDetails.roomType === "Suite" ? 1.5 : 1) * differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn))).toLocaleString()}
                          </p>
                          <div className="flex gap-4 mt-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                generatePDFReceipt(booking);
                              }}
                              className="bg-gradient-to-r from-gray-700 to-gray-900 text-white py-1 px-3 rounded-lg hover:from-gray-600 hover:to-gray-800 transition-all duration-300"
                              aria-label={`Download receipt for booking ${booking.id}`}
                            >
                              Download Receipt
                            </button>
                            {booking.status === "Confirmed" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelBooking(booking.id);
                                }}
                                className="bg-red-600 text-white py-1 px-3 rounded-lg hover:bg-red-700 transition-all duration-300"
                                aria-label={`Cancel booking ${booking.id}`}
                              >
                                Cancel Booking
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-300">No bookings found.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tailwind CSS for styling */}
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
        .accent-yellow-400 {
          accent-color: #FFD700;
        }
        .border-red-500 {
          border: 2px solid #EF4444;
        }
      `}</style>
    </div>
  );
};

export default Booking;