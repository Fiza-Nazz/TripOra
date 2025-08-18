'use client';
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { format, addDays, isAfter } from 'date-fns';

gsap.registerPlugin(ScrollTrigger);

interface Hotel {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  amenities: string[];
  image: string;
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

const mockHotels: Hotel[] = [
  { id: '1', name: 'Luxury Inn', location: 'Karachi', price: 15000, rating: 4.5, amenities: ['WiFi', 'Pool', 'Gym'], image: '/luxury.png' },
  { id: '2', name: 'Golden Stay', location: 'Lahore', price: 20000, rating: 4.8, amenities: ['WiFi', 'Spa', 'Breakfast'], image: '/gold.png' },
  { id: '3', name: 'Pearl Palace', location: 'Islamabad', price: 18000, rating: 4.2, amenities: ['WiFi', 'Pool', 'Parking'], image: '/pearl.png' },
  { id: '4', name: 'Royal Retreat', location: 'Karachi', price: 25000, rating: 4.9, amenities: ['WiFi', 'Spa', 'Gym', 'Breakfast'], image: '/royal.png' },
  { id: '5', name: 'Makkah Towers', location: 'Makkah', price: 35000, rating: 4.7, amenities: ['WiFi', 'Prayer Room', 'Breakfast'], image: '/makkah.png' },
  { id: '6', name: 'Madinah Hilton', location: 'Madinah', price: 30000, rating: 4.6, amenities: ['WiFi', 'Shuttle', 'Prayer Room'], image: '/madinah.png' },
  { id: '7', name: 'Burj Al Arab', location: 'Dubai', price: 100000, rating: 5.0, amenities: ['WiFi', 'Spa', 'Pool', 'Butler'], image: '/burj.png' },
  { id: '8', name: 'Atlantis The Palm', location: 'Dubai', price: 85000, rating: 4.9, amenities: ['WiFi', 'Aquarium', 'Pool'], image: '/atlantis.png' },
  { id: '9', name: 'The Plaza', location: 'New York', price: 60000, rating: 4.8, amenities: ['WiFi', 'Gym', 'Spa'], image: '/plaza.png' },
  { id: '10', name: 'Beverly Hills Hotel', location: 'Los Angeles', price: 55000, rating: 4.7, amenities: ['WiFi', 'Pool', 'Spa'], image: '/baverli.png' },
  { id: '11', name: 'Anwar Al Madinah', location: 'Madinah', price: 28000, rating: 4.5, amenities: ['WiFi', 'Prayer Room', 'Breakfast'], image: '/madina1.png' },
  { id: '12', name: 'Swissotel Makkah', location: 'Makkah', price: 32000, rating: 4.6, amenities: ['WiFi', 'Shuttle', 'Prayer Room'], image: '/makka1.png' },
];

const Hotels: React.FC = () => {
  const [formData, setFormData] = useState<SearchForm>({
    destination: '',
    checkIn: format(new Date(), 'yyyy-MM-dd'),
    checkOut: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    guests: 1,
  });
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [filters, setFilters] = useState({ priceRange: [0, 100000], rating: 0, amenities: [] as string[], sortBy: 'price-asc' });
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    name: '',
    email: '',
    phone: '',
    roomType: 'Standard',
    paymentMethod: 'Credit Card',
    cardNumber: '',
    cvv: '',
    expiryDate: '',
    specialRequests: '',
  });
  const [confirmedGuestDetails, setConfirmedGuestDetails] = useState<GuestDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);
  const gsapContextRef = useRef<gsap.Context | null>(null);

  // Three.js particle background with twinkling effect
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Particles with twinkling
    const particleCount = 2000;
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

    // Twinkling animation
    const animate = () => {
      requestAnimationFrame(animate);
      particlesMesh.rotation.y += 0.0008;
      for (let i = 0; i < particleCount; i++) {
        scales[i] = Math.sin(Date.now() * 0.001 + i) * 0.01 + 0.015;
      }
      particlesGeometry.attributes.scale.needsUpdate = true;
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // GSAP animations with ScrollTrigger
  useEffect(() => {
    if (mountRef.current) {
      gsapContextRef.current = gsap.context(() => {
        gsap.from('.search-form', {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
        });
        gsap.from('.hotel-card', {
          y: 50,
          opacity: 0,
          stagger: 0.3,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.hotel-card',
            start: 'top 80%',
          },
        });
        gsap.from('.booking-form', {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          delay: 0.5,
        });
        gsap.from('.confirmation-modal', {
          scale: 0.8,
          opacity: 0,
          duration: 0.5,
          ease: 'back.out(1.7)',
        });
      }, mountRef.current);
    }

    return () => {
      if (gsapContextRef.current) {
        gsapContextRef.current.revert();
      }
    };
  }, [hotels, selectedHotel, showConfirmation]);

  // 3D card tilt effect
  useEffect(() => {
    const cards = document.querySelectorAll('.hotel-card');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e: any) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(card, {
          rotationY: x * 0.05,
          rotationX: -y * 0.05,
          ease: 'power1.out',
          duration: 0.2,
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotationY: 0,
          rotationX: 0,
          ease: 'power1.out',
          duration: 0.2,
        });
      });
    });
  }, [filteredHotels]);

  // Fetch hotels
  const fetchHotels = () => {
    setLoading(true);
    setError(null);
    try {
      const filtered = mockHotels.filter((hotel) =>
        formData.destination ? hotel.location.toLowerCase().includes(formData.destination.toLowerCase()) : true
      );
      if (filtered.length === 0) {
        setError('No hotels found for this destination. Try another city (e.g., Karachi, Dubai, Makkah).');
      } else {
        setHotels(filtered);
        applyFilters(filtered);
      }
    } catch (err) {
      setError('An error occurred while fetching hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting
  const applyFilters = (data: Hotel[] = hotels) => {
    let filtered = [...data].filter(
      (hotel) =>
        hotel.price >= filters.priceRange[0] &&
        hotel.price <= filters.priceRange[1] &&
        hotel.rating >= filters.rating &&
        (filters.amenities.length === 0 || filters.amenities.every((amenity) => hotel.amenities.includes(amenity)))
    );

    if (filters.sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === 'rating-desc') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    setFilteredHotels(filtered);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.destination.trim()) {
      setError('Please enter a destination.');
      return;
    }
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const maxDate = addDays(new Date(), 365);
    if (isAfter(checkInDate, maxDate) || isAfter(checkOutDate, maxDate)) {
      setError('Dates cannot be more than one year in the future.');
      return;
    }
    if (!isAfter(checkOutDate, checkInDate)) {
      setError('Check-out date must be after check-in date.');
      return;
    }
    if (formData.guests < 1) {
      setError('Please select at least one guest.');
      return;
    }
    fetchHotels();
  };

  // Handle hotel selection
  const selectHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setGuestDetails({
      name: '',
      email: '',
      phone: '',
      roomType: 'Standard',
      paymentMethod: 'Credit Card',
      cardNumber: '',
      cvv: '',
      expiryDate: '',
      specialRequests: '',
    });
    setError(null);
  };

  // Handle booking
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestDetails.name.trim() || !guestDetails.email.trim() || !guestDetails.phone.trim() || !guestDetails.cardNumber.trim() || !guestDetails.cvv.trim() || !guestDetails.expiryDate.trim()) {
      setError('Please fill in all guest and payment details.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestDetails.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!/^\+?\d{10,15}$/.test(guestDetails.phone)) {
      setError('Please enter a valid phone number (10-15 digits).');
      return;
    }
    if (guestDetails.paymentMethod !== 'PayPal' && !/^\d{16}$/.test(guestDetails.cardNumber)) {
      setError('Please enter a valid 16-digit card number.');
      return;
    }
    if (guestDetails.paymentMethod !== 'PayPal' && !/^\d{3,4}$/.test(guestDetails.cvv)) {
      setError('Please enter a valid CVV (3-4 digits).');
      return;
    }
    if (guestDetails.paymentMethod !== 'PayPal' && !/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(guestDetails.expiryDate)) {
      setError('Please enter a valid expiry date (MM/YY).');
      return;
    }
    try {
      const priceBreakdown = {
        basePrice: selectedHotel!.price,
        taxes: selectedHotel!.price * 0.15,
        total: selectedHotel!.price * 1.15,
      };
      setConfirmedGuestDetails(guestDetails); // Store guest details for confirmation
      setShowConfirmation(true);
      setGuestDetails({
        name: '',
        email: '',
        phone: '',
        roomType: 'Standard',
        paymentMethod: 'Credit Card',
        cardNumber: '',
        cvv: '',
        expiryDate: '',
        specialRequests: '',
      });
      setSelectedHotel(null);
      setError(null);
    } catch (err) {
      setError('Payment failed. Please try again.');
    }
  };

  // Generate unique PNR
  const generatePNR = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    return `ABC${selectedHotel?.id}${timestamp}`;
  };

  return (
    <div className="relative min-h-screen bg-black text-white font-sans overflow-hidden font-[Inter]">
      {/* Three.js Particle Background */}
      <div ref={mountRef} className="absolute inset-0 z-0 opacity-70" />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Title */}
        <h1 className="text-center text-5xl md:text-6xl font-extrabold mt-20 bg-gradient-to-r from-yellow-400 via-white to-yellow-400 bg-clip-text text-transparent">
          Discover Your Perfect Hotel
        </h1>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="search-form bg-black/60 backdrop-blur-lg border border-yellow-500/30 rounded-2xl p-8 mt-10 shadow-2xl hover:shadow-yellow-500/50 transition-all duration-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Destination (e.g., Karachi, Dubai, Makkah)"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className={`p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 ${error && !formData.destination.trim() ? 'border-red-500' : ''}`}
              aria-label="Destination"
            />
            <input
              type="date"
              value={formData.checkIn}
              onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
              aria-label="Check-in date"
            />
            <input
              type="date"
              value={formData.checkOut}
              onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
              min={format(addDays(new Date(formData.checkIn), 1), 'yyyy-MM-dd')}
              className="p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
              aria-label="Check-out date"
            />
            <select
              value={formData.guests}
              onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })}
              className="p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
              aria-label="Number of guests"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num} Guest{num > 1 ? 's' : ''}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="col-span-1 md:col-span-4 bg-gradient-to-r from-yellow-400 to-white text-black py-3 rounded-lg hover:from-yellow-300 hover:to-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-black" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Searching...
                </div>
              ) : (
                'Search Hotels'
              )}
            </button>
          </div>
          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        </form>

        {/* Filters and Sorting */}
        <div className="mt-10 bg-black/60 backdrop-blur-lg border border-yellow-500/30 rounded-2xl p-6 shadow-lg sticky top-0 z-20">
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Filter & Sort Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block mb-2 text-gray-300">Price Range (PKR)</label>
              <input
                type="range"
                min="0"
                max="100000"
                value={filters.priceRange[1]}
                onChange={(e) => setFilters({ ...filters, priceRange: [0, Number(e.target.value)] })}
                className="w-full accent-yellow-400"
                aria-label="Price range"
              />
              <p className="text-gray-300">Up to PKR {filters.priceRange[1].toLocaleString()}</p>
            </div>
            <div>
              <label className="block mb-2 text-gray-300">Minimum Rating</label>
              <select
                onChange={(e) => setFilters({ ...filters, rating: Number(e.target.value) })}
                className="p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
                aria-label="Minimum rating"
              >
                <option value="0">All</option>
                <option value="4">4+</option>
                <option value="4.5">4.5+</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-gray-300">Sort By</label>
              <select
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
                aria-label="Sort by"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Rating: High to Low</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-gray-300">Amenities</label>
              <div className="grid grid-cols-2 gap-2">
                {['WiFi', 'Pool', 'Gym', 'Spa', 'Breakfast', 'Parking', 'Prayer Room', 'Shuttle', 'Butler', 'Aquarium'].map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.amenities.includes(amenity)}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          amenities: e.target.checked
                            ? [...filters.amenities, amenity]
                            : filters.amenities.filter((a) => a !== amenity),
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
                onKeyDown={(e) => e.key === 'Enter' && selectHotel(hotel)}
                aria-label={`Select ${hotel.name}`}
              >
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Hotel+Image')}
                />
                <h3 className="text-2xl font-semibold text-yellow-400">{hotel.name}</h3>
                <p className="text-gray-300">{hotel.location}</p>
                <p className="text-gray-300">Price: PKR {hotel.price.toLocaleString()}</p>
                <p className="text-gray-300">Rating: {hotel.rating} ★</p>
                <p className="text-gray-300">Amenities: {hotel.amenities.join(', ')}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-300 col-span-3 text-center">
              No hotels found. Try adjusting your search or filters.
            </p>
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
                className={`p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 ${error && !guestDetails.name.trim() ? 'border-red-500' : ''}`}
                aria-label="Full name"
              />
              <input
                type="email"
                placeholder="Email"
                value={guestDetails.email}
                onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                className={`p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 ${error && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestDetails.email) ? 'border-red-500' : ''}`}
                aria-label="Email"
              />
              <input
                type="tel"
                placeholder="Phone Number (e.g., +923001234567)"
                value={guestDetails.phone}
                onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                className={`p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 ${error && !guestDetails.phone.trim() ? 'border-red-500' : ''}`}
                aria-label="Phone number"
              />
              <select
                value={guestDetails.roomType}
                onChange={(e) => setGuestDetails({ ...guestDetails, roomType: e.target.value })}
                className="p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
                aria-label="Room type"
              >
                <option value="Standard">Standard Room</option>
                <option value="Deluxe">Deluxe Room</option>
                <option value="Suite">Suite</option>
              </select>
              <select
                value={guestDetails.paymentMethod}
                onChange={(e) => setGuestDetails({ ...guestDetails, paymentMethod: e.target.value })}
                className="p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
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
                className={`p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 ${error && !guestDetails.cardNumber.trim() ? 'border-red-500' : ''}`}
                aria-label="Card number"
                disabled={guestDetails.paymentMethod === 'PayPal'}
              />
              <input
                type="text"
                placeholder="CVV (3-4 digits)"
                value={guestDetails.cvv}
                onChange={(e) => setGuestDetails({ ...guestDetails, cvv: e.target.value })}
                className={`p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 ${error && !guestDetails.cvv.trim() ? 'border-red-500' : ''}`}
                aria-label="CVV"
                disabled={guestDetails.paymentMethod === 'PayPal'}
              />
              <input
                type="text"
                placeholder="Expiry Date (MM/YY)"
                value={guestDetails.expiryDate}
                onChange={(e) => setGuestDetails({ ...guestDetails, expiryDate: e.target.value })}
                className={`p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 ${error && !guestDetails.expiryDate.trim() ? 'border-red-500' : ''}`}
                aria-label="Expiry date"
                disabled={guestDetails.paymentMethod === 'PayPal'}
              />
              <textarea
                placeholder="Special Requests (e.g., Non-smoking room)"
                value={guestDetails.specialRequests}
                onChange={(e) => setGuestDetails({ ...guestDetails, specialRequests: e.target.value })}
                className="p-3 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 col-span-1 md:col-span-2"
                aria-label="Special requests"
                rows={3}
              />
            </div>
            <div className="my-4 text-gray-300">
              <p>Base Price: PKR {selectedHotel.price.toLocaleString()}</p>
              <p>Taxes (15%): PKR {(selectedHotel.price * 0.15).toLocaleString()}</p>
              <p className="font-bold">Total: PKR {(selectedHotel.price * 1.15).toLocaleString()}</p>
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
                <p><strong>Hotel:</strong> {selectedHotel.name}</p>
                <p><strong>Location:</strong> {selectedHotel.location}</p>
                <p><strong>PNR:</strong> {generatePNR()}</p>
                <p><strong>Check-In:</strong> {formData.checkIn}</p>
                <p><strong>Check-Out:</strong> {formData.checkOut}</p>
                <p><strong>Guests:</strong> {formData.guests}</p>
                <p><strong>Room Type:</strong> {confirmedGuestDetails.roomType}</p>
                <p><strong>Guest Name:</strong> {confirmedGuestDetails.name}</p>
                <p><strong>Email:</strong> {confirmedGuestDetails.email}</p>
                <p><strong>Phone:</strong> {confirmedGuestDetails.phone}</p>
                <p><strong>Payment Method:</strong> {confirmedGuestDetails.paymentMethod}</p>
                <p><strong>Special Requests:</strong> {confirmedGuestDetails.specialRequests || 'None'}</p>
                <p><strong>Base Price:</strong> PKR {selectedHotel.price.toLocaleString()}</p>
                <p><strong>Taxes (15%):</strong> PKR {(selectedHotel.price * 0.15).toLocaleString()}</p>
                <p className="font-bold"><strong>Total:</strong> PKR {(selectedHotel.price * 1.15).toLocaleString()}</p>
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
                  onClick={() => alert('Receipt downloaded!')}
                  className="flex-1 bg-gradient-to-r from-gray-700 to-gray-900 text-white py-2 px-4 rounded-lg hover:from-gray-600 hover:to-gray-800 transition-all duration-300 transform hover:scale-105"
                  aria-label="Download receipt"
                >
                  Download Receipt
                </button>
              </div>
            </div>
          </div>
        )}
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

export default Hotels;