import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.webp";

const useVideoLoader = (ref: { current: HTMLVideoElement | null }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || loaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || loaded) return;
        setLoaded(true);
        const source = document.createElement("source");
        source.src = "https://panyaglobal.b-cdn.net/hero-video.mp4";
        source.type = "video/mp4";
        el.appendChild(source);
        el.load();
        el.play().catch(() => {});
        observer.disconnect();
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, loaded]);

  return loaded;
};

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useVideoLoader(videoRef);

  return (
    <section className="relative min-h-screen overflow-hidden bg-black font-sans">
      {/* Mobile: Static optimized image (performance priority) */}
      <img
        src={heroBg}
        alt=""
        fetchPriority="high"
        decoding="async"
        width="1920"
        height="1080"
        className="absolute inset-0 h-full w-full object-cover md:hidden"
      />

      {/* Desktop: Static poster image (LCP element) with lazy-loaded video overlay */}
      <img
        src={heroBg}
        alt=""
        fetchPriority="high"
        decoding="async"
        width="1920"
        height="1080"
        className="absolute inset-0 hidden h-full w-full object-cover md:block"
      />

      {/* Desktop: Lazy-loaded video (starts after page is interactive) */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        className="absolute inset-0 hidden h-full w-full object-cover md:block"
        width="1920"
        height="1080"
      />

      {/* Subtle bottom gradient only — keeps text readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* Hero Content — bottom-left aligned, like VEX reference */}
      <div className="relative z-10 w-full min-h-screen flex flex-col justify-end pb-12 lg:pb-16">
        <div className="w-full px-6 md:px-12 lg:px-16 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

          {/* Left: Main Headline + Subtext + Buttons */}
          <div className="max-w-2xl">
            {/* Small label above heading */}
            <span className="mb-4 inline-block text-sm font-medium uppercase tracking-[0.2em] text-white/70">
              India's Most Trusted Relocation Company
            </span>

            {/* Big Heading */}
            <h1 className="mb-5 text-4xl font-semibold leading-none text-white md:text-5xl lg:text-[3.5rem] xl:text-[4rem]">
              Relocating India.{" "}
              <span className="text-[#38b6ff]">Connecting the World.</span>
            </h1>

            {/* Description */}
            <p className="mb-8 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
              Expert packers and movers for homes, offices and international relocations - Pan-India and worldwide. 16+ years, 9,600+ clients, 280+ cities. Zero-damage commitment and 24/7 support.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link to="/quote">
                <button className="rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-gray-100">
                  Get Free Quote
                </button>
              </Link>
              <Link to="/services">
                <button className="rounded-lg border border-white/30 px-8 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:bg-white/10">
                  Explore Services
                </button>
              </Link>
            </div>
          </div>

          {/* Right: Floating pill — bottom-right like VEX */}
          <div className="flex lg:justify-end">
            <div className="inline-block rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 backdrop-blur-md">
              <span className="text-base font-light tracking-wide text-white md:text-lg">
                Household. Corporate. International.
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
