import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

const slides = [
  {
    id: 1,
    tag: "New Season Collection",
    title: "Shop the Latest\nFashion Trends",
    subtitle: "Discover curated styles from top sellers. Free delivery on orders over ₹500.",
    cta: "Shop Fashion",
    ctaLink: "/products?category=fashion",
    bg: "from-violet-600 via-purple-600 to-indigo-700",
    emoji: "👗",
    floaters: ["✨", "💜", "🌟"],
  },
  {
    id: 2,
    tag: "Flash Sale — 50% Off",
    title: "Electronics at\nUnbeatable Prices",
    subtitle: "Top brands, latest gadgets. Limited time offer — don't miss out!",
    cta: "Grab Deals",
    ctaLink: "/products?isFlashSale=true",
    bg: "from-orange-500 via-rose-500 to-pink-600",
    emoji: "💻",
    floaters: ["⚡", "🔥", "💥"],
  },
  {
    id: 3,
    tag: "Home Makeover",
    title: "Transform Your\nLiving Space",
    subtitle: "Premium home décor and furniture from verified sellers nationwide.",
    cta: "Explore Home",
    ctaLink: "/products?category=home-living",
    bg: "from-emerald-500 via-teal-500 to-cyan-600",
    emoji: "🏠",
    floaters: ["🌿", "🪴", "✨"],
  },
];

export default function HeroSlider() {
  return (
    <section className="relative overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop
        className="h-[480px] md:h-[560px] lg:h-[620px]"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <SlideContent slide={slide} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 80" className="fill-[var(--bg)] w-full" preserveAspectRatio="none">
          <path d="M0,64 C360,0 1080,128 1440,32 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  );
}

function SlideContent({ slide }) {
  return (
    <div className={`relative h-full bg-gradient-to-br ${slide.bg} flex items-center overflow-hidden`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white blur-3xl" />
      </div>

      {/* Floating emojis */}
      {slide.floaters.map((emoji, i) => (
        <motion.span
          key={i}
          className="absolute text-4xl opacity-40 select-none pointer-events-none"
          style={{
            top: `${20 + i * 25}%`,
            right: `${15 + i * 8}%`,
          }}
          animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
        >
          {emoji}
        </motion.span>
      ))}

      {/* Main emoji decoration */}
      <motion.div
        className="absolute right-[10%] top-1/2 -translate-y-1/2 text-[140px] md:text-[200px] opacity-20 select-none pointer-events-none"
        animate={{ scale: [1, 1.05, 1], rotate: [0, 3, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        {slide.emoji}
      </motion.div>

      {/* Content */}
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-block text-white/80 text-sm font-semibold uppercase tracking-widest mb-4 border border-white/30 px-4 py-1 rounded-full backdrop-blur-sm"
          >
            {slide.tag}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-display font-extrabold text-white leading-tight mb-4"
            style={{ whiteSpace: "pre-line" }}
          >
            {slide.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/80 text-lg mb-8 max-w-md"
          >
            {slide.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-3"
          >
            <Link
              to={slide.ctaLink}
              className="btn bg-white text-gray-900 hover:bg-gray-50 shadow-xl hover:shadow-2xl btn-lg font-bold"
            >
              {slide.cta} →
            </Link>
            <Link
              to="/products"
              className="btn border-2 border-white/50 text-white hover:bg-white/15 backdrop-blur-sm btn-lg"
            >
              Browse All
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
