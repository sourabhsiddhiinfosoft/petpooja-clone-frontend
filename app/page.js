"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  const scrollToSection = (e) => {
    const id = e.target.id
    if (id) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
      }
    }
  };

  const logos = [
    { src: "https://petpoojaweb.gumlet.io/images/home-new/bira_91_logo.webp?w=160&dpr=0.3", alt: "Bira 91" },
    { src: "https://petpoojaweb.gumlet.io/images/home-new/vasantabhavan_logo.webp?w=160&dpr=0.3", alt: "Chaayos" },
    { src: "https://petpoojaweb.gumlet.io/images/home-new/zepto_logo.webp?w=120&dpr=0.3", alt: "zepto" },
    {src:"https://petpoojaweb.gumlet.io/images/home-new/la_pinoz_pizza_logo.webp?w=160&dpr=0.3", alt: "La Pinoz Pizza"},
    {src:"https://petpoojaweb.gumlet.io/images/fine-dine/Hocco.webp?w=160&dpr=0.3", alt: "Hocco"},
     { src: "https://petpoojaweb.gumlet.io/images/home-new/bira_91_logo.webp?w=160&dpr=0.3", alt: "Bira 91" },
    { src: "https://petpoojaweb.gumlet.io/images/home-new/vasantabhavan_logo.webp?w=160&dpr=0.3", alt: "Chaayos" },
    { src: "https://petpoojaweb.gumlet.io/images/home-new/zepto_logo.webp?w=120&dpr=0.3", alt: "zepto" },
    {src:"https://petpoojaweb.gumlet.io/images/home-new/la_pinoz_pizza_logo.webp?w=160&dpr=0.3", alt: "La Pinoz Pizza"},
    {src:"https://petpoojaweb.gumlet.io/images/fine-dine/Hocco.webp?w=160&dpr=0.3", alt: "Hocco"},
    // Add more as needed
  ];

  return (
    <main className="font-sans">
      {/* Hero Section */}
      {/* Header (Sticky) */}
      <header className="sticky top-0 z-50 bg-gray-800/80 backdrop-blur text-white px-6 py-4 flex items-center justify-between shadow">
        <h1 className="text-xl font-bold">🍴 RMS</h1>
        <nav className="space-x-6">
          {/* <a href="#home" className="hover:text-gray-300">Home</a> */}
          <Link href="#home" className="hover:text-gray-300">Home</Link>
          <Link href="#about" className="hover:text-gray-300">About</Link>
          {/* <span id="contact" onClick={scrollToSection} className="hover:text-gray-300">Contact</span> */}
          <Link href="#contact" className="hover:text-gray-300">Contact</Link>
          {/* <button
            onClick={() => setModelActive(true)}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
          >
            Logout
          </button> */}
        </nav>
      </header>
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-12"> */}
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(56,189,248,.35), transparent 25%), radial-gradient(circle at 80% 30%, rgba(99,102,241,.35), transparent 25%), radial-gradient(circle at 40% 80%, rgba(248,113,113,.35), transparent 25%)" }} />

        {/* <section className="relative bg-gradient-to-b from-blue-900 to-blue-800 text-white py-20"> */}
        <section className=" text-white py-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <motion.h1
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-6xl font-extrabold text-cyan-500 mb-6"
            >
              All-in-One <br /> <span className="text-yellow-400">Restaurant Management</span> <br/>System
            </motion.h1>
            <p className="text-lg sm:text-xl text-gray-200 mb-8">
              Simplify your restaurant operations with our easy-to-use platform.<br/>
              Manage menus, categories, orders & customers seamlessly.
            </p>
            <div className="flex justify-center gap-4">
                          <Link  href="/auth/login" className="bg-yellow-400 cursor-pointer text-blue-900 px-8 py-4 rounded-lg font-bold hover:bg-yellow-300 transition">Get Started</Link>
              <button className="border cursor-pointer border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition">
                Learn More
              </button>
            </div>
            <div className="mt-12 w-full">
              <Image
                // src="/background/dashboard.jpeg"
                src="https://petpoojaweb.gumlet.io/images/home-new/poss-slider1.png"
                alt="Restaurant Dashboard"
                width={900}
                height={500}
                className="rounded-lg shadow-lg mx-auto"
              />
            </div>
          </div>
        </section>

        {/* Trusted Customers */}
        <section className="bg-gray-100 py-10">
          <div className="trusted_content">
            <div className="flex items-center justify-center px-6">
              <div className="line"></div>
              <p className="section-subtitle-new sm:px-8 text-[#212121] font-medium mb-0 uppercase text-center">
                Trusted by <span className="font-semibold text-[#C52031]">1,00,00+</span> Restaurant Owners across the globe
              </p>
              <div className="line"></div>
            </div>
          </div>
          <div className="overflow-hidden"> {/* Hidden overflow for the marquee effect */}
            <motion.div
              className="flex whitespace-nowrap" // Flex nowrap to keep logos in a row
              initial={{ x: 0 }}
              animate={{
                x: ["0%", "-50%"] // Move from 0 to -50% (since content is duplicated)
              }}
              transition={{
                duration: 30, // Adjust speed (longer = slower scroll)
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {/* First set of logos */}
              {logos.map((logo, index) => (
                <div key={index} className="slides inline-block mx-4"> {/* Inline-block for spacing */}
                  <img
                    data-src={logo.src}
                    alt={logo.alt}
                    className="gm-lazy gm-loaded gm-observing gm-observing-cb h-12 w-auto object-contain" // Adjust height/width as needed
                    src={`${logo.src}?w=160&dpr=0.3`} // Lazy loading setup
                  />
                </div>
              ))}

              {/* Duplicate set for seamless infinite loop */}
              {logos.map((logo, index) => (
                <div key={`dup-${index}`} className="slides inline-block mx-4">
                  <img
                    data-src={logo.src}
                    alt={logo.alt}
                    className="gm-lazy gm-loaded gm-observing gm-observing-cb h-12 w-auto object-contain"
                    src={`${logo.src}?w=160&dpr=0.3`}
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </section>


        {/* Features Section */}
        <section className="bg-gray-100 py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Why Choose Us?
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Continuous Innovation",
                  desc: "We constantly research and improve to keep you ahead.",
                  icon: "💡",
                },
                {
                  title: "Transparent Pricing",
                  desc: "Simple and affordable pricing for all restaurant sizes.",
                  icon: "💰",
                },
                {
                  title: "Simplicity",
                  desc: "Designed for ease-of-use with zero technical hassle.",
                  icon: "✨",
                },
                {
                  title: "24x7 Support",
                  desc: "Our dedicated support team is always available.",
                  icon: "📞",
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.2 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 border rounded-xl p-6 text-center shadow hover:shadow-lg transition"
                >
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to grow your restaurant?
          </h2>
          <p className="text-lg mb-8 text-gray-200">
            Join 10,000+ restaurants already managing their business with us.
          </p>
  
             <Link  href="/auth/login" className="bg-yellow-400 cursor-pointer text-blue-900 px-8 py-4 rounded-lg font-bold hover:bg-yellow-300 transition">Get Started Now</Link>
          
        </section>

        {/* Contact Section */}
        <section id="contact" className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-6">
          <div className=" w-full  text-slate-100">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(56,189,248,.35), transparent 25%), radial-gradient(circle at 80% 30%, rgba(99,102,241,.35), transparent 25%), radial-gradient(circle at 40% 80%, rgba(248,113,113,.35), transparent 25%)" }} />
            <h3 className="text-2xl font-bold text-center mb-6">Contact Us</h3>
            <form className="max-w-lg mx-auto space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full border rounded px-3 py-2"
              />
              <textarea
                rows="4"
                placeholder="Your Message"
                className="w-full border rounded px-3 py-2"
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Send Message
              </button>
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-gray-200 py-4 text-center">
          <p>© {new Date().getFullYear()} My Restaurant. All Rights Reserved.</p>
        </footer>
      </div>
      {/* </div> */}
    </main>
  );
}
