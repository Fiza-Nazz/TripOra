import Image from "next/image";
import Navbar from "./components/Navbar"; 
import About from './components/About';
import Destinations from "./components/Destination";
import Packages from './components/Packages';
import Flights from './components/Flights';
import Hotels from './components/Hotels';
import Booking from './components/Booking';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { BiHomeAlt } from "react-icons/bi";

export default function Home() {
  return (
    <div>
      <Navbar />  

      {/* 👇 IDs assign for smooth scroll */}
      

       <section id="about">
        <About />
      </section>


      <section id="destinations">
        <Destinations />
      </section>

      <section id="packages">
        <Packages />
      </section>

      <section id="flights">
        <Flights />
      </section>

      <section id="hotels">
        <Hotels />
      </section>

      <section id="booking">
        <Booking />
      </section>

    
      <section id="contact">
        <Contact />
      </section>

      <Footer />
    </div>
  );
}
