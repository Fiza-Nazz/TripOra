"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import axios from "axios";
import { format, addDays, subDays } from "date-fns";
import { FaPlane, FaExchangeAlt } from "react-icons/fa";
import Tilt from "react-parallax-tilt";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import React from "react";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Interfaces for TypeScript type safety
interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
  cabinClass: string;
  layover?: string;
  baggage?: string;
}

interface SearchForm {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: string;
  tripType: "one-way" | "round-trip";
  flexibleDates: boolean;
}

interface PassengerDetails {
  name: string;
  email: string;
}

interface Ancil {
  seatSelection: boolean;
  extraBaggage: boolean;
}

// Mock airport data for autocomplete
const airports = [
  { code: "LHE", name: "Lahore, Pakistan - Allama Iqbal Intl" },
  { code: "DXB", name: "Dubai, UAE - Dubai Intl" },
  { code: "KHI", name: "Karachi, Pakistan - Jinnah Intl" },
  { code: "JFK", name: "New York, USA - John F. Kennedy Intl" },
];

// Mock API response for demo purposes
const mockFlights: Flight[] = [
  {
    id: "1",
    airline: "Emirates",
    flightNumber: "EK123",
    departure: "LHE",
    arrival: "DXB",
    departureTime: "2025-08-20T10:00:00",
    arrivalTime: "2025-08-20T13:00:00",
    duration: "3h",
    stops: 0,
    price: 45000,
    cabinClass: "Economy",
    layover: "None",
    baggage: "20kg",
  },
  {
    id: "2",
    airline: "Qatar Airways",
    flightNumber: "QR456",
    departure: "LHE",
    arrival: "DXB",
    departureTime: "2025-08-20T14:00:00",
    arrivalTime: "2025-08-20T18:30:00",
    duration: "4h 30m",
    stops: 1,
    price: 52000,
    cabinClass: "Economy",
    layover: "1h 30m in DOH",
    baggage: "25kg",
  },
];

// Main Flights Component
const Flights: React.FC = () => {
  const [formData, setFormData] = useState<SearchForm>({
    origin: "",
    destination: "",
    departureDate: format(new Date(), "yyyy-MM-dd"),
    returnDate: "",
    passengers: 1,
    cabinClass: "Economy",
    tripType: "one-way",
    flexibleDates: false,
  });
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{ code: string; name: string }[]>([]);
  const [sortBy, setSortBy] = useState<"cheapest" | "fastest" | "earliest">("cheapest");
  const [filters, setFilters] = useState<{ maxPrice?: number; stops?: number; cabinClass?: string }>({});
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [passengerDetails, setPassengerDetails] = useState<PassengerDetails>({ name: "", email: "" });
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [ancillaries, setAncillaries] = useState<Ancil>({
    seatSelection: false,
    extraBaggage: false,
  });
  const [flightNumber, setFlightNumber] = useState("");
  const [flightStatus, setFlightStatus] = useState<string | null>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  // Three.js setup for enhanced particle background
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Optimize particle count for mobile
    const particleCount = window.innerWidth < 640 ? 5000 : 10000;
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 40;
      posArray[i + 1] = (Math.random() - 0.5) * 40;
      posArray[i + 2] = (Math.random() - 0.5) * 40;
      velocities[i / 3] = Math.random() * 0.02;
    }
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: window.innerWidth < 640 ? 0.03 : 0.02,
      color: new THREE.Color("#FFD700"),
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Animation with wave effect
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const positions = particlesGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(velocities[i] + Date.now() * 0.001) * 0.01;
      }
      particlesGeometry.attributes.position.needsUpdate = true;
      particlesMesh.rotation.y += 0.001;
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // GSAP animations
  useEffect(() => {
    gsap.from(".form-container", { y: 50, opacity: 0, duration: 1, ease: "power3.out" });
    gsap.from(".flight-card", { y: 50, opacity: 0, stagger: 0.3, duration: 1, ease: "power3.out", delay: 0.5 });
    if (showModal) {
      gsap.from(".modal", { scale: 0.8, opacity: 0, duration: 0.5, ease: "back.out(1.7)" });
    }
  }, [flights, showModal]);

  // Autocomplete for origin/destination
  const handleAutocomplete = useCallback(
    (value: string, field: "origin" | "destination") => {
      const filtered = airports.filter(
        (airport) =>
          airport.code.toLowerCase().includes(value.toLowerCase()) ||
          airport.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "origin" || name === "destination") {
      handleAutocomplete(value, name as "origin" | "destination");
    }
  };

  // Swap origin and destination
  const handleSwap = () => {
    setFormData((prev) => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin,
    }));
  };

  // Handle search
  const handleSearch = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.origin || !formData.destination || formData.origin === formData.destination) {
      setError("Please enter valid origin and destination cities.");
      setLoading(false);
      return;
    }

    try {
      // Save search to localStorage
      localStorage.setItem("recentSearch", JSON.stringify(formData));
      // Replace with real API call
      setFlights(mockFlights);
      setFilteredFlights(mockFlights);
    } catch (err) {
      setError("Failed to fetch flights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Sort flights
  useEffect(() => {
    let sorted = [...flights];
    if (sortBy === "cheapest") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === "fastest") {
      sorted.sort((a, b) => a.duration.localeCompare(b.duration));
    } else if (sortBy === "earliest") {
      sorted.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
    }
    setFilteredFlights(sorted);
  }, [sortBy, flights]);

  // Apply filters
  useEffect(() => {
    let filtered = [...flights];
    if (filters.maxPrice) {
      filtered = filtered.filter((flight) => flight.price <= filters.maxPrice!);
    }
    if (filters.stops !== undefined) {
      filtered = filtered.filter((flight) => flight.stops === filters.stops);
    }
    if (filters.cabinClass) {
      filtered = filtered.filter((flight) => flight.cabinClass === filters.cabinClass);
    }
    setFilteredFlights(filtered);
  }, [filters, flights]);

  // Handle booking
  const handleBook = (flight: Flight) => {
    setSelectedFlight(flight);
    setShowModal(true);
  };

  // Handle modal submission
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Replace with real Booking API call
      alert(
        `Booking confirmed for ${selectedFlight?.flightNumber}! Passenger: ${passengerDetails.name}, Extras: ${
          ancillaries.seatSelection ? "Seat Selection" : ""
        } ${ancillaries.extraBaggage ? "Extra Baggage" : ""}`
      );
      setShowModal(false);
      setPassengerDetails({ name: "", email: "" });
      setAncillaries({ seatSelection: false, extraBaggage: false });
    } catch (err) {
      setError("Booking failed. Please try again.");
    }
  };

  // Flight status checker
  const handleStatusCheck = async () => {
    setLoading(true);
    try {
      // Replace with real Flight Status API
      setFlightStatus(`Flight ${flightNumber} is on time.`);
    } catch (err) {
      setFlightStatus("Unable to fetch status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Price trend chart data
  const chartData = {
    labels: [
      subDays(new Date(formData.departureDate), 3),
      subDays(new Date(formData.departureDate), 2),
      subDays(new Date(formData.departureDate), 1),
      new Date(formData.departureDate),
      addDays(new Date(formData.departureDate), 1),
      addDays(new Date(formData.departureDate), 2),
      addDays(new Date(formData.departureDate), 3),
    ].map((date) => format(date, "MMM dd")),
    datasets: [
      {
        label: "Price (PKR)",
        data: [40000, 42000, 45000, 45000, 47000, 46000, 43000],
        backgroundColor: "#FFD700",
      },
    ],
  };

  return (
    <div className="relative min-h-screen bg-black text-white font-sans overflow-hidden">
      {/* Three.js Particle Background */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 md:p-8 lg:p-12">
        {/* Search Form */}
        <h1 className="text-center text-3xl sm:text-4xl md:text-5xl font-extrabold mt-8 sm:mt-12 md:mt-16 bg-gradient-to-r from-yellow-400 via-white to-yellow-400 bg-clip-text text-transparent">
          Find Your Perfect Flight
        </h1>
        <div className="form-container bg-black/60 backdrop-blur-lg border border-yellow-500/30 rounded-xl p-4 sm:p-6 md:p-8 mt-8 sm:mt-12 shadow-lg hover:scale-100 sm:hover:scale-105 transition-transform duration-500 hover:shadow-yellow-500/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative">
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
                placeholder="Origin (e.g., LHE)"
                className="p-2 sm:p-3 bg-black/50 text-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-yellow-500/30 text-sm sm:text-base"
                aria-label="Origin city"
              />
              {suggestions.length > 0 && formData.origin && (
                <ul className="absolute bg-black/80 text-white rounded-lg mt-1 max-h-40 overflow-auto z-20 w-full">
                  {suggestions.map((s) => (
                    <li
                      key={s.code}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, origin: s.code }));
                        setSuggestions([]);
                      }}
                      className="p-2 hover:bg-yellow-400/20 cursor-pointer text-sm sm:text-base"
                    >
                      {s.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex items-center justify-center">
              <button
                onClick={handleSwap}
                className="p-2 sm:p-3 bg-yellow-400/20 rounded-full hover:bg-yellow-400/40 transition-colors duration-300"
                aria-label="Swap origin and destination"
              >
                <FaExchangeAlt className="text-yellow-400 text-base sm:text-lg" />
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                placeholder="Destination (e.g., DXB)"
                className="p-2 sm:p-3 bg-black/50 text-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-yellow-500/30 text-sm sm:text-base"
                aria-label="Destination city"
              />
              {suggestions.length > 0 && formData.destination && (
                <ul className="absolute bg-black/80 text-white rounded-lg mt-1 max-h-40 overflow-auto z-20 w-full">
                  {suggestions.map((s) => (
                    <li
                      key={s.code}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, destination: s.code }));
                        setSuggestions([]);
                      }}
                      className="p-2 hover:bg-yellow-400/20 cursor-pointer text-sm sm:text-base"
                    >
                      {s.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <input
              type="date"
              name="departureDate"
              value={formData.departureDate}
              onChange={handleInputChange}
              min={format(new Date(), "yyyy-MM-dd")}
              className="p-2 sm:p-3 bg-black/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-yellow-500/30 text-sm sm:text-base"
              aria-label="Departure date"
            />
            {formData.tripType === "round-trip" && (
              <input
                type="date"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleInputChange}
                min={format(addDays(new Date(formData.departureDate), 1), "yyyy-MM-dd")}
                className="p-2 sm:p-3 bg-black/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-yellow-500/30 text-sm sm:text-base"
                aria-label="Return date"
              />
            )}
            <select
              name="passengers"
              value={formData.passengers}
              onChange={handleInputChange}
              className="p-2 sm:p-3 bg-black/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-yellow-500/30 text-sm sm:text-base"
              aria-label="Number of passengers"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num} Passenger{num > 1 ? "s" : ""}
                </option>
              ))}
            </select>
            <select
              name="cabinClass"
              value={formData.cabinClass}
              onChange={handleInputChange}
              className="p-2 sm:p-3 bg-black/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-yellow-500/30 text-sm sm:text-base"
              aria-label="Cabin class"
            >
              <option value="Economy">Economy</option>
              <option value="Premium Economy">Premium Economy</option>
              <option value="Business">Business</option>
              <option value="First Class">First Class</option>
            </select>
            <select
              name="tripType"
              value={formData.tripType}
              onChange={handleInputChange}
              className="p-2 sm:p-3 bg-black/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-yellow-500/30 text-sm sm:text-base"
              aria-label="Trip type"
            >
              <option value="one-way">One-Way</option>
              <option value="round-trip">Round-Trip</option>
            </select>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="flexibleDates"
                checked={formData.flexibleDates}
                onChange={(e) => setFormData((prev) => ({ ...prev, flexibleDates: e.target.checked }))}
                className="mr-2"
                aria-label="Flexible dates"
              />
              <label className="text-gray-300 text-sm sm:text-base">Flexible Dates (±3 days)</label>
            </div>
            <button
              onClick={handleSearch}
              className="col-span-1 sm:col-span-2 lg:col-span-4 bg-gradient-to-r from-yellow-400 to-white text-black py-2 sm:py-3 rounded-lg hover:bg-yellow-400 transition-colors duration-300 transform hover:scale-105 text-sm sm:text-base"
              disabled={loading}
              aria-label="Search flights"
            >
              {loading ? "Searching..." : "Search Flights"}
            </button>
          </div>
          {error && <p className="text-red-500 mt-4 text-sm sm:text-base">{error}</p>}
        </div>

        {/* Price Trend Chart */}
        {formData.flexibleDates && (
          <div className="mt-8 sm:mt-12 bg-black/60 backdrop-blur-lg border border-yellow-500/30 rounded-xl p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-yellow-400 to-white bg-clip-text text-transparent">
              Price Trends
            </h2>
            <div className="mt-4">
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: true, labels: { color: "#FFFFFF" } } },
                  scales: {
                    x: { ticks: { color: "#FFFFFF", font: { size: window.innerWidth < 640 ? 10 : 12 } } },
                    y: { ticks: { color: "#FFFFFF", font: { size: window.innerWidth < 640 ? 10 : 12 } } },
                  },
                }}
                height={window.innerWidth < 640 ? 200 : 300}
              />
            </div>
          </div>
        )}

        {/* Filters and Sorting */}
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <select
            onChange={(e) => setSortBy(e.target.value as "cheapest" | "fastest" | "earliest")}
            className="p-2 sm:p-3 bg-black/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-yellow-500/30 text-sm sm:text-base"
            aria-label="Sort flights"
          >
            <option value="cheapest">Cheapest</option>
            <option value="fastest">Fastest</option>
            <option value="earliest">Earliest</option>
          </select>
          <input
            type="number"
            placeholder="Max Price (PKR)"
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) || undefined }))
            }
            className="p-2 sm:p-3 bg-black/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-yellow-500/30 text-sm sm:text-base"
            aria-label="Max price filter"
          />
          <select
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, stops: Number(e.target.value) || undefined }))
            }
            className="p-2 sm:p-3 bg-black/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-yellow-500/30 text-sm sm:text-base"
            aria-label="Stops filter"
          >
            <option value="">All Stops</option>
            <option value="0">Non-Stop</option>
            <option value="1">1 Stop</option>
          </select>
        </div>

        {/* Flight Results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
          {filteredFlights.map((flight) => (
            <Tilt key={flight.id}>
              <div className="flight-card bg-black/60 backdrop-blur-lg border border-yellow-500/30 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-yellow-500/30 transition-shadow duration-500">
                <div className="flex items-center mb-3 sm:mb-4">
                  <FaPlane className="text-2xl sm:text-3xl text-yellow-400 mr-2" />
                  <h2 className="text-lg sm:text-xl md:text-2xl font-semibold bg-gradient-to-r from-yellow-400 to-white bg-clip-text text-transparent">
                    {flight.airline} - {flight.flightNumber}
                  </h2>
                </div>
                <p className="text-gray-300 text-sm sm:text-base">
                  {flight.departure} → {flight.arrival}
                </p>
                <p className="text-gray-300 text-sm sm:text-base">
                  {new Date(flight.departureTime).toLocaleTimeString()} -{" "}
                  {new Date(flight.arrivalTime).toLocaleTimeString()}
                </p>
                <p className="text-gray-300 text-sm sm:text-base">Duration: {flight.duration}</p>
                <p className="text-gray-300 text-sm sm:text-base">
                  Stops: {flight.stops === 0 ? "Non-Stop" : `${flight.stops} Stop(s)`}
                </p>
                <p className="text-gray-300 text-sm sm:text-base">Class: {flight.cabinClass}</p>
                <button
                  onClick={() => setShowDetails(showDetails === flight.id ? null : flight.id)}
                  className="text-yellow-400 underline mt-2 text-sm sm:text-base"
                  aria-label={`Toggle details for ${flight.flightNumber}`}
                >
                  {showDetails === flight.id ? "Hide Details" : "Show Details"}
                </button>
                {showDetails === flight.id && (
                  <div className="mt-2 text-gray-300 text-sm sm:text-base">
                    <p>Layover: {flight.layover}</p>
                    <p>Baggage: {flight.baggage}</p>
                  </div>
                )}
                <div className="mt-4 sm:mt-6 text-base sm:text-lg font-bold bg-gradient-to-r from-yellow-400 to-white bg-clip-text text-transparent">
                  PKR {flight.price.toLocaleString()}
                </div>
                <button
                  onClick={() => handleBook(flight)}
                  className="mt-3 sm:mt-4 bg-gradient-to-r from-yellow-400 to-white text-black py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors duration-300 transform hover:scale-105 text-sm sm:text-base"
                  aria-label={`Book ${flight.flightNumber}`}
                >
                  Book Now
                </button>
              </div>
            </Tilt>
          ))}
        </div>

        {/* Flight Status Checker */}
        <div className="mt-8 sm:mt-12 bg-black/60 backdrop-blur-lg border border-yellow-500/30 rounded-xl p-4 sm:p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-yellow-400 to-white bg-clip-text text-transparent">
            Check Flight Status
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
            <input
              type="text"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              placeholder="Flight Number (e.g., EK123)"
              className="p-2 sm:p-3 bg-black/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-yellow-500/30 text-sm sm:text-base"
              aria-label="Flight number"
            />
            <button
              onClick={handleStatusCheck}
              className="bg-gradient-to-r from-yellow-400 to-white text-black py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors duration-300 text-sm sm:text-base"
              aria-label="Check flight status"
            >
              Check Status
            </button>
          </div>
          {flightStatus && <p className="mt-4 text-gray-300 text-sm sm:text-base">{flightStatus}</p>}
        </div>

        {/* Booking Modal */}
        {showModal && (
          <div className="modal fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-black/60 backdrop-blur-lg border border-yellow-500/30 rounded-xl p-4 sm:p-6 md:p-8 max-w-full sm:max-w-md w-full">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold bg-gradient-to-r from-yellow-400 to-white bg-clip-text text-transparent">
                Book Flight: {selectedFlight?.flightNumber}
              </h2>
              <form onSubmit={handleModalSubmit} className="mt-4 space-y-4">
                <input
                  type="text"
                  value={passengerDetails.name}
                  onChange={(e) =>
                    setPassengerDetails((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Full Name"
                  className="p-2 sm:p-3 bg-black/50 text-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-yellow-500/30 text-sm sm:text-base"
                  aria-label="Passenger name"
                  required
                />
                <input
                  type="email"
                  value={passengerDetails.email}
                  onChange={(e) =>
                    setPassengerDetails((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Email"
                  className="p-2 sm:p-3 bg-black/50 text-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-yellow-500/30 text-sm sm:text-base"
                  aria-label="Passenger email"
                  required
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={ancillaries.seatSelection}
                    onChange={(e) =>
                      setAncillaries((prev) => ({ ...prev, seatSelection: e.target.checked }))
                    }
                    className="mr-2"
                    aria-label="Seat selection"
                  />
                  <label className="text-gray-300 text-sm sm:text-base">Seat Selection (+PKR 5000)</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={ancillaries.extraBaggage}
                    onChange={(e) =>
                      setAncillaries((prev) => ({ ...prev, extraBaggage: e.target.checked }))
                    }
                    className="mr-2"
                    aria-label="Extra baggage"
                  />
                  <label className="text-gray-300 text-sm sm:text-base">Extra Baggage (+PKR 3000)</label>
                </div>
                <div className="flex justify-end gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm sm:text-base"
                    aria-label="Cancel booking"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-gradient-to-r from-yellow-400 to-white text-black rounded-lg hover:bg-yellow-400 text-sm sm:text-base"
                    aria-label="Confirm booking"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Error Boundary Props Interface
interface FlightsErrorBoundaryProps {
  children: React.ReactNode;
}

// Error Boundary State Interface
interface FlightsErrorBoundaryState {
  hasError: boolean;
}

// Error Boundary
class FlightsErrorBoundary extends React.Component<FlightsErrorBoundaryProps, FlightsErrorBoundaryState> {
  state: FlightsErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): FlightsErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center text-red-500 p-10">
          Something went wrong. Please refresh the page.
        </div>
      );
    }
    return this.props.children;
  }
}

export default function FlightsWithErrorBoundary() {
  return (
    <FlightsErrorBoundary>
      <Flights />
    </FlightsErrorBoundary>
  );
}