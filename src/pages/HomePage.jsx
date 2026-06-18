import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../store/slices/productSlice";
import HeroSlider from "../components/home/HeroSlider";
import ProductCard from "../components/product/ProductCard";
import { formatPrice } from "../utils/helpers";

const categories = [
  { name: "Electronics", slug: "electronics", emoji: "💻", color: "from-blue-500 to-cyan-500" },
  { name: "Fashion", slug: "fashion", emoji: "👗", color: "from-pink-500 to-rose-500" },
  { name: "Home & Living", slug: "home-living", emoji: "🏠", color: "from-green-500 to-emerald-500" },
  { name: "Sports", slug: "sports", emoji: "⚽", color: "from-orange-500 to-amber-500" },
  { name: "Books", slug: "books", emoji: "📚", color: "from-purple-500 to-violet-500" },
  { name: "Beauty", slug: "beauty", emoji: "💄", color: "from-red-500 to-pink-500" },
  { name: "Toys", slug: "toys", emoji: "🧸", color: "from-yellow-500 to-orange-500" },
  { name: "Grocery", slug: "grocery", emoji: "🛒", color: "from-teal-500 to-green-500" },
];

const features = [
  { icon: "🚚", title: "Free Delivery", desc: "On orders above ₹500" },
  { icon: "↩️", title: "Easy Returns", desc: "7-day hassle-free returns" },
  { icon: "🔒", title: "Secure Payments", desc: "100% safe & encrypted" },
  { icon: "🎧", title: "24/7 Support", desc: "We're always here to help" },
];

function FadeSection({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const dispatch = useDispatch();
  const { items: featured, loading } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchProducts({ isFeatured: true, limit: 8, sort: "best_selling" }));
  }, []);

  return (
    <div>
      {/* Hero */}
      <HeroSlider />

      {/* Features strip */}
      <FadeSection>
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map(({ icon, title, desc }) => (
              <motion.div
                key={title}
                whileHover={{ y: -3 }}
                className="card p-4 flex items-center gap-3"
              >
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="font-semibold text-sm text-[var(--text)]">{title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </FadeSection>

      {/* Categories */}
      <FadeSection delay={0.1}>
        <section className="section">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text)]">
                  Shop by Category
                </h2>
                <p className="text-[var(--text-muted)] text-sm mt-1">Find exactly what you're looking for</p>
              </div>
              <Link to="/products" className="btn-ghost text-sm text-primary-600">View all →</Link>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.slug}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.05, y: -3 }}
                >
                  <Link
                    to={`/products?category=${cat.slug}`}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl shadow-md group-hover:shadow-lg transition-shadow`}>
                      {cat.emoji}
                    </div>
                    <span className="text-xs font-medium text-[var(--text)] text-center leading-tight">{cat.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </FadeSection>

      {/* Flash Sale Banner */}
      <FadeSection delay={0.1}>
        <div className="container-custom mb-10">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 p-8 md:p-12 text-white"
          >
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-4 right-4 text-6xl opacity-30"
            >⚡</motion.div>
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="badge bg-white/20 text-white mb-3 text-sm border border-white/30">Limited Time Offer</div>
                <h2 className="text-3xl md:text-4xl font-display font-extrabold mb-2">Flash Sale is LIVE! ⚡</h2>
                <p className="text-white/80 text-lg">Up to 70% off on selected products. Ends tonight!</p>
              </div>
              <Link to="/products?isFlashSale=true" className="btn bg-white text-gray-900 hover:bg-gray-50 font-bold btn-lg flex-shrink-0 shadow-xl">
                Shop Flash Sale →
              </Link>
            </div>
          </motion.div>
        </div>
      </FadeSection>

      {/* Featured Products */}
      <FadeSection delay={0.1}>
        <section className="section">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text)]">
                  Featured Products
                </h2>
                <p className="text-[var(--text-muted)] text-sm mt-1">Handpicked just for you</p>
              </div>
              <Link to="/products?isFeatured=true" className="btn-ghost text-sm text-primary-600">View all →</Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="card overflow-hidden">
                    <div className="skeleton aspect-square" />
                    <div className="p-3 space-y-2">
                      <div className="skeleton h-4 w-3/4 rounded" />
                      <div className="skeleton h-3 w-1/2 rounded" />
                      <div className="skeleton h-5 w-1/3 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {featured.map((product, i) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </FadeSection>

      {/* Sell on MultiShop CTA */}
      <FadeSection delay={0.1}>
        <section className="section">
          <div className="container-custom">
            <div className="card overflow-hidden">
              <div className="flex flex-col md:flex-row items-center">
                <div className="flex-1 p-8 md:p-12">
                  <span className="text-4xl mb-4 block">🏪</span>
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--text)] mb-3">
                    Start Selling on MultiShop
                  </h2>
                  <p className="text-[var(--text-muted)] mb-6 max-w-md">
                    Join thousands of sellers reaching millions of customers. Simple setup, powerful tools, real results.
                  </p>
                  <div className="flex flex-wrap gap-4 mb-8">
                    {["Low commissions", "Analytics dashboard", "Easy payouts", "24/7 seller support"].map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-sm text-[var(--text)]">
                        <span className="text-green-500">✓</span> {feat}
                      </div>
                    ))}
                  </div>
                  <Link to="/seller/register" className="btn-primary btn-lg">
                    Become a Seller →
                  </Link>
                </div>
                <div className="hidden md:flex items-center justify-center w-64 h-64 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30">
                  <motion.span
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-[100px]"
                  >
                    🛍️
                  </motion.span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeSection>

      {/* Newsletter */}
      <FadeSection>
        <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-700 dark:to-primary-600">
          <div className="container-custom text-center text-white">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">Stay in the Loop</h2>
            <p className="text-white/80 mb-8">Get exclusive deals and new arrivals straight to your inbox.</p>
            <form className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
              />
              <button type="submit" className="btn bg-white text-primary-600 hover:bg-gray-50 font-bold px-6 py-3">
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </FadeSection>
    </div>
  );
}
