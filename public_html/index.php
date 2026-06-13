<?php
if (!headers_sent()) {
    if (extension_loaded('zlib') && !ini_get('zlib.output_compression')) {
        ob_start('ob_gzhandler');
    }
    header('Content-Type: text/html; charset=UTF-8');
    header('Cache-Control: public, max-age=3600, must-revalidate');
}

/**
 * Panya Global Relocation - Server-Side SEO Injector
 * ──────────────────────────────────────────────────
 * This script runs on cPanel/Apache. It intercepts page requests,
 * injects target meta tags, structured schemas, and crawlable HTML
 * into index.html before serving it to the client or crawler.
 */

// 1. Get the requested URI (normalized for matching in both root and subdirectories)
$request_uri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($request_uri, PHP_URL_PATH);

// Normalize path by removing the script's base directory (for subdirectory local XAMPP dev)
$script_dir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
if ($script_dir !== '/' && $script_dir !== '') {
    if (strpos($path, $script_dir) === 0) {
        $path = substr($path, strlen($script_dir));
    }
}

// Ensure the path has a leading slash
if (empty($path) || $path[0] !== '/') {
    $path = '/' . $path;
}

if ($path !== '/' && substr($path, -1) === '/') {
    $path = rtrim($path, '/');
}

// 2. Define SEO page data mapping
$pages = [
    '/' => [
        'title' => 'Panya Global | Packers Movers Delhi, Gurgaon & Noida',
        'description' => 'Trusted packers and movers in Delhi, Gurgaon and Noida. 16+ years, 9,600+ clients, 280+ cities. International and corporate relocation. Call +91-11-41556447.',
        'canonical' => 'https://www.panyaglobal.in/',
        'schemas' => '
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "MovingCompany",
          "name": "Panya Global Relocation Pvt. Ltd.",
          "url": "https://www.panyaglobal.in",
          "telephone": "+911141556447",
          "email": "info@panyaglobal.in",
          "logo": "https://www.panyaglobal.in/logo.png",
          "image": "https://www.panyaglobal.in/og-image.jpg",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "New Delhi",
            "addressRegion": "Delhi",
            "addressCountry": "IN"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "28.6139",
            "longitude": "77.2090"
          },
          "areaServed": [
            {"@type": "City", "name": "Delhi"},
            {"@type": "City", "name": "Gurgaon"},
            {"@type": "City", "name": "Noida"}
          ],
          "foundingDate": "2008",
          "description": "Expert packers and movers in Delhi, Gurgaon and Noida. 16+ years, 9,600+ clients, 280+ cities."
        }
        </script>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is the cost of packers and movers in Delhi?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Packers and movers cost in Delhi ranges from Rs. 4,000 to Rs. 50,000+ depending on distance, volume, and services. Contact Panya Global at +91-11-41556447 for a free quote."
              }
            },
            {
              "@type": "Question",
              "name": "Does Panya Global provide packers and movers in Gurgaon?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Panya Global provides professional packing and moving in Gurgaon and Gurugram covering all sectors, DLF phases, Sohna Road, and Golf Course Road areas."
              }
            },
            {
              "@type": "Question",
              "name": "Does Panya Global provide packers and movers in Noida?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Panya Global covers all sectors of Noida including Greater Noida and Noida Extension for household, office, and vehicle relocation."
              }
            },
            {
              "@type": "Question",
              "name": "Does Panya Global do international relocation?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. For moves from India to any country, Panya Global\'s own team handles packing, documentation, and customs. For inbound international moves, we coordinate through our trusted global partner network across 280+ destinations."
              }
            },
            {
              "@type": "Question",
              "name": "How many years of experience does Panya Global have?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Panya Global has 16+ years of experience in domestic and international relocation since 2008, with 9,600+ successful relocations across 280+ cities."
              }
            }
          ]
        }
        </script>',
        'body' => '
        <section id="seo-hero" style="padding: 4rem 1rem; text-align: center; max-width: 1024px; margin: 0 auto;">
          <h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 1.5rem; color: #1e3a8a;">Best Packers and Movers in Delhi, Gurgaon and Noida - Panya Global Relocation</h1>
          <div className="stats-bar" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 2rem; margin-bottom: 2rem; font-weight: bold; color: #f97316;">
            <span>16+ Years Experience</span>
            <span>9,600+ Happy Clients</span>
            <span>280+ Cities Covered</span>
            <span>24/7 Customer Support</span>
          </div>
          <p style="font-size: 1.125rem; line-height: 1.75; color: #4b5563;">
            Panya Global Relocation Pvt. Ltd. is one of India\'s most trusted packers
            and movers companies serving Delhi, Gurgaon, Noida, and 280+ cities across
            India and globally. With 16+ years of experience and 9,600+ successful
            relocations, we deliver household shifting, corporate relocation,
            international moving, and vehicle transport - all with a zero-damage
            commitment and 24/7 support.
          </p>
        </section>
        
        <section id="seo-services" style="padding: 4rem 1rem; max-width: 1024px; margin: 0 auto; background-color: #f3f4f6; border-radius: 1.5rem; margin-bottom: 2rem;">
          <h2 style="font-size: 2rem; font-weight: bold; text-align: center; margin-bottom: 2rem; color: #1f2937;">Our Relocation Services</h2>
          <ul style="list-style: none; padding: 0; display: grid; grid-template-cols: 1fr; gap: 2rem;">
            <li><h3 style="font-size: 1.25rem; font-weight: bold; color: #1e3a8a; margin-bottom: 0.5rem;">Household and Residential Shifting</h3>
              <p style="color: #4b5563;">Safe, careful packing and moving of your home goods across Delhi NCR and 280+ cities Pan-India.</p></li>
            <li><h3 style="font-size: 1.25rem; font-weight: bold; color: #1e3a8a; margin-bottom: 0.5rem;">Corporate and Office Relocation</h3>
              <p style="color: #4b5563;">End-to-end office shifting with dedicated coordinator, IT asset handling, and minimal business downtime.</p></li>
            <li><h3 style="font-size: 1.25rem; font-weight: bold; color: #1e3a8a; margin-bottom: 0.5rem;">International Packing and Moving</h3>
              <p style="color: #4b5563;">Door-to-door international relocation from India to worldwide destinations with full customs support.</p></li>
            <li><h3 style="font-size: 1.25rem; font-weight: bold; color: #1e3a8a; margin-bottom: 0.5rem;">Car and Vehicle Transport</h3>
              <p style="color: #4b5563;">GPS-tracked, enclosed carrier transport for cars and two-wheelers across India.</p></li>
            <li><h3 style="font-size: 1.25rem; font-weight: bold; color: #1e3a8a; margin-bottom: 0.5rem;">Storage and Warehousing</h3>
              <p style="color: #4b5563;">Secure short-term and long-term storage facilities across Delhi NCR.</p></li>
            <li><h3 style="font-size: 1.25rem; font-weight: bold; color: #1e3a8a; margin-bottom: 0.5rem;">Workspace Setup and Shifting</h3>
              <p style="color: #4b5563;">Complete workspace relocation including furniture, fixtures, and equipment reinstallation.</p></li>
          </ul>
        </section>
        
        <section id="seo-why" style="padding: 4rem 1rem; max-width: 1024px; margin: 0 auto; margin-bottom: 2rem;">
          <h2 style="font-size: 2rem; font-weight: bold; text-align: center; margin-bottom: 2rem; color: #1f2937;">Why Choose Panya Global Over Other Packers and Movers</h2>
          <ul style="list-style: none; padding: 0; display: grid; grid-template-cols: 1fr; gap: 1.5rem;">
            <li>
              <strong style="color: #1e3a8a; display: block; margin-bottom: 0.25rem;">Dedicated corporate relocation team.</strong>
              Unlike large movers who treat every job the same, Panya Global assigns
              a dedicated relocation coordinator for every corporate and office move -
              from planning to final setup at the new location.
            </li>
            <li>
              <strong style="color: #1e3a8a; display: block; margin-bottom: 0.25rem;">International door-to-door service.</strong>
              We handle full customs documentation, overseas freight, and delivery
              coordination across 280+ global destinations - so you never deal
              with multiple vendors.
            </li>
            <li>
              <strong style="color: #1e3a8a; display: block; margin-bottom: 0.25rem;">GPS-tracked transportation.</strong>
              Every shipment - local or long-distance - is tracked in real time.
              You get live updates, not just a delivery window.
            </li>
            <li>
              <strong style="color: #1e3a8a; display: block; margin-bottom: 0.25rem;">16 years of verified trust.</strong>
              Over 9,600 families and businesses have relied on Panya Global since
              2008. Our client retention rate reflects what no advertisement
              can manufacture.
            </li>
          </ul>
        </section>
        
        <section id="seo-cities" style="padding: 4rem 1rem; max-width: 1024px; margin: 0 auto; background-color: #f3f4f6; border-radius: 1.5rem; text-align: center; margin-bottom: 2rem;">
          <h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 1.5rem; color: #1f2937;">Packers and Movers Across Delhi NCR and Beyond</h2>
          <p style="color: #4b5563; line-height: 1.75; margin-bottom: 1.5rem;">
            Panya Global provides professional packing and moving services across all
            major Delhi NCR locations including South Delhi, North Delhi, Dwarka,
            Rohini, Gurgaon, Gurugram, Noida, Greater Noida, Faridabad, and
            Ghaziabad. We also cover 280+ cities Pan-India including Mumbai,
            Bangalore, Hyderabad, Chennai, Pune, Kolkata, and Ahmedabad.
          </p>
          <p>
            <a href="/packers-movers-delhi" style="color: #f97316; font-weight: bold; text-decoration: underline;">Packers Movers Delhi</a> |
            <a href="/packers-movers-gurgaon" style="color: #f97316; font-weight: bold; text-decoration: underline;">Packers Movers Gurgaon</a> |
            <a href="/packers-movers-noida" style="color: #f97316; font-weight: bold; text-decoration: underline;">Packers Movers Noida</a> |
            <a href="/international-packers-movers-delhi" style="color: #f97316; font-weight: bold; text-decoration: underline;">International Movers Delhi</a>
          </p>
        </section>
        
        <section id="seo-international" style="padding: 4rem 1rem; max-width: 1024px; margin: 0 auto; margin-bottom: 2rem;">
          <h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 1.5rem; color: #1f2937;">International Relocation and NRI Moving Services</h2>
          <p style="color: #4b5563; line-height: 1.75; margin-bottom: 1rem;">
            Panya Global handles international relocations from India to worldwide
            destinations. For moves originating in Delhi and across India, our own
            team manages the full process - packing, documentation, customs clearance,
            and delivery coordination. For inbound moves and NRI returns from abroad,
            we work with a trusted network of global relocation partners to ensure
            seamless door-to-door service.
          </p>
          <p style="color: #4b5563; line-height: 1.75;">
            Whether you are moving from Delhi to Dubai, relocating your family from
            India to the USA or UK, or returning to India from the Gulf - Panya Global
            coordinates every step. Call +91-11-41556447 for a free international
            relocation consultation.
          </p>
        </section>
        
        <section id="seo-cta" style="padding: 4rem 1rem; max-width: 1024px; margin: 0 auto; text-align: center; background-color: #1e3a8a; color: white; border-radius: 1.5rem;">
          <h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 1rem;">Get a Free Relocation Quote Today</h2>
          <p style="margin-bottom: 1.5rem; font-size: 1.125rem;">
            Planning to shift? Get a free, no-obligation quote from Panya Global\'s relocation experts. We serve Delhi, Gurgaon, Noida, and 280+ cities.
          </p>
          <p style="font-size: 1.25rem; font-weight: bold;">
            Call <a href="tel:+911141556447" style="color: #f97316; text-decoration: underline;">+91-11-41556447</a> or write to <a href="mailto:info@panyaglobal.in" style="color: #f97316; text-decoration: underline;">info@panyaglobal.in</a> - response within 2 hours.
          </p>
        </section>'
    ],
    '/packers-movers-delhi' => [
        'title' => 'Delhi Packers and Movers | Panya Global Relocation',
        'description' => 'Best packers and movers in Delhi. Panya Global offers household, office and international relocation in Delhi. 16+ years experience. Free quote: +91-11-41556447.',
        'canonical' => 'https://www.panyaglobal.in/packers-movers-delhi',
        'schemas' => '
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "MovingCompany",
          "name": "Panya Global Relocation - Delhi",
          "url": "https://www.panyaglobal.in/packers-movers-delhi",
          "telephone": "+911141556447",
          "description": "Expert packers and movers in Delhi offering household, corporate and international relocation with 16+ years experience.",
          "areaServed": {"@type": "City", "name": "Delhi"},
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Delhi",
            "addressRegion": "Delhi NCR",
            "addressCountry": "IN"
          }
        }
        </script>',
        'body' => '
        <section style="padding: 4rem 1rem; text-align: center; max-width: 1024px; margin: 0 auto;">
          <h1 style="font-size: 2.5rem; font-weight: bold; color: #1e3a8a;">Packers and Movers in Delhi | Panya Global</h1>
          <p style="font-size: 1.125rem; line-height: 1.75; color: #4b5563; margin-top: 1.5rem;">
            Panya Global Relocation Pvt. Ltd. is one of the premier packers and movers companies serving Delhi since 2008. 
            Our professional team handles household shifting, office relocation, and vehicle transport with a zero-damage guarantee.
          </p>
        </section>
        <section style="padding: 3rem 1rem; max-width: 1024px; margin: 0 auto; background-color: #f3f4f6; border-radius: 1.5rem; margin-bottom: 2rem;">
          <h2 style="font-size: 2rem; font-weight: bold; text-align: center; margin-bottom: 1.5rem;">Our Services in Delhi</h2>
          <div style="display: grid; grid-template-cols: 1fr; gap: 2rem;">
            <div>
              <h3 style="font-weight: bold; color: #1e3a8a;">Household Shifting in Delhi</h3>
              <p>Moving homes in Delhi can be challenging. Our specialized packers use multi-layer packaging to secure your furniture and fragile items.</p>
            </div>
            <div>
              <h3 style="font-weight: bold; color: #1e3a8a;">Office Relocation in Delhi</h3>
              <p>We offer commercial office shifting across major business districts. With systematic labeling, we minimize business downtime.</p>
            </div>
            <div>
              <h3 style="font-weight: bold; color: #1e3a8a;">Car Transport in Delhi</h3>
              <p>Transport your vehicles securely using specialized car carriers equipped with real-time GPS tracking.</p>
            </div>
          </div>
        </section>
        <section style="padding: 3rem 1rem; max-width: 1024px; margin: 0 auto; text-align: center;">
          <h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 1.5rem;">Why Panya Global is the Best Mover in Delhi</h2>
          <p style="color: #4b5563; line-height: 1.75;">
            Relocating in Delhi requires local expertise, specialized routing knowledge, and compliance with municipal regulations. 
            Panya Global offers end-to-end relocation solutions with transparent, competitive pricing and dedicated coordinators. 
            With 16+ years of proven record, we ensure your household belongings are transported securely without stress.
          </p>
        </section>'
    ],
    '/packers-movers-gurgaon' => [
        'title' => 'Gurgaon Packers and Movers | Panya Global Relocation',
        'description' => 'Best packers and movers in Gurgaon. Panya Global offers household, office and international relocation in Gurgaon. 16+ years experience. Free quote: +91-11-41556447.',
        'canonical' => 'https://www.panyaglobal.in/packers-movers-gurgaon',
        'schemas' => '
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "MovingCompany",
          "name": "Panya Global Relocation - Gurgaon",
          "url": "https://www.panyaglobal.in/packers-movers-gurgaon",
          "telephone": "+911141556447",
          "description": "Premium packers and movers in Gurgaon offering office shifting, home moves and vehicle transport services with 16+ years experience.",
          "areaServed": {"@type": "City", "name": "Gurgaon"},
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Gurgaon",
            "addressRegion": "Haryana",
            "addressCountry": "IN"
          }
        }
        </script>',
        'body' => '
        <section style="padding: 4rem 1rem; text-align: center; max-width: 1024px; margin: 0 auto;">
          <h1 style="font-size: 2.5rem; font-weight: bold; color: #1e3a8a;">Packers and Movers in Gurgaon | Panya Global</h1>
          <p style="font-size: 1.125rem; line-height: 1.75; color: #4b5563; margin-top: 1.5rem;">
            Panya Global Relocation Pvt. Ltd. provides top-tier corporate, household, and vehicle shifting solutions in Gurgaon and Gurugram since 2008. 
            Our experienced staff is trained in professional packing and handling techniques to ensure complete goods protection.
          </p>
        </section>
        <section style="padding: 3rem 1rem; max-width: 1024px; margin: 0 auto; background-color: #f3f4f6; border-radius: 1.5rem; margin-bottom: 2rem;">
          <h2 style="font-size: 2rem; font-weight: bold; text-align: center; margin-bottom: 1.5rem;">Our Services in Gurgaon</h2>
          <div style="display: grid; grid-template-cols: 1fr; gap: 2rem;">
            <div>
              <h3 style="font-weight: bold; color: #1e3a8a;">Household Shifting in Gurgaon</h3>
              <p>Moving to a high-rise apartment or a villa, our teams are equipped to handle high-rise goods handling, large furniture packing, and loading safely.</p>
            </div>
            <div>
              <h3 style="font-weight: bold; color: #1e3a8a;">Office Relocation in Gurgaon</h3>
              <p>We specialize in corporate shifting across Cyber City. Our dedicated move coordinators plan the shifting strategy to ensure your operations resume with zero lag.</p>
            </div>
            <div>
              <h3 style="font-weight: bold; color: #1e3a8a;">Car Transport in Gurgaon</h3>
              <p>We offer premium car and two-wheeler carrier services with secure enclosed trailers and GPS tracking.</p>
            </div>
          </div>
        </section>
        <section style="padding: 3rem 1rem; max-width: 1024px; margin: 0 auto; text-align: center;">
          <h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 1.5rem;">Why Panya Global is the Best Mover in Gurgaon</h2>
          <p style="color: #4b5563; line-height: 1.75;">
            Relocating corporate personnel and luxury households in Gurgaon demands high standards of service. 
            Panya Global offers premium packing materials, modern transport fleets, and licensed crews. 
            We manage customs handling and storage services natively, allowing a completely hassle-free moving experience. 
            With 16+ years of expertise and 9,600+ satisfied clients, we are the most reliable shifting partners in Haryana.
          </p>
        </section>'
    ],
    '/packers-movers-noida' => [
        'title' => 'Noida Packers and Movers | Panya Global Relocation',
        'description' => 'Best packers and movers in Noida. Panya Global offers household, office and international relocation in Noida. 16+ years experience. Free quote: +91-11-41556447.',
        'canonical' => 'https://www.panyaglobal.in/packers-movers-noida',
        'schemas' => '
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "MovingCompany",
          "name": "Panya Global Relocation - Noida",
          "url": "https://www.panyaglobal.in/packers-movers-noida",
          "telephone": "+911141556447",
          "description": "Professional packers and movers in Noida offering residential shifting, IT park relocations and vehicle transport with 16+ years experience.",
          "areaServed": {"@type": "City", "name": "Noida"},
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Noida",
            "addressRegion": "Uttar Pradesh",
            "addressCountry": "IN"
          }
        }
        </script>',
        'body' => '
        <section style="padding: 4rem 1rem; text-align: center; max-width: 1024px; margin: 0 auto;">
          <h1 style="font-size: 2.5rem; font-weight: bold; color: #1e3a8a;">Packers and Movers in Noida | Panya Global</h1>
          <p style="font-size: 1.125rem; line-height: 1.75; color: #4b5563; margin-top: 1.5rem;">
            Panya Global Relocation Pvt. Ltd. is your trusted partner for premium packing and moving services in Noida since 2008. 
            We specialize in secure residential moving, IT park setups, and vehicle carrier shipping.
          </p>
        </section>
        <section style="padding: 3rem 1rem; max-width: 1024px; margin: 0 auto; background-color: #f3f4f6; border-radius: 1.5rem; margin-bottom: 2rem;">
          <h2 style="font-size: 2rem; font-weight: bold; text-align: center; margin-bottom: 1.5rem;">Our Services in Noida</h2>
          <div style="display: grid; grid-template-cols: 1fr; gap: 2rem;">
            <div>
              <h3 style="font-weight: bold; color: #1e3a8a;">Household Shifting in Noida</h3>
              <p>We offer safe home shifting across Noida sectors, Noida Extension, and Greater Noida using clean carton boxes and bubble wraps.</p>
            </div>
            <div>
              <h3 style="font-weight: bold; color: #1e3a8a;">Office Relocation in Noida</h3>
              <p>Relocating corporate spaces in Noida\'s IT hubs is executed with professional planning and computer servers packing.</p>
            </div>
            <div>
              <h3 style="font-weight: bold; color: #1e3a8a;">Car Transport in Noida</h3>
              <p>Transport your vehicle securely outside Uttar Pradesh. We use high-quality car carriers, providing door-to-door transit.</p>
            </div>
          </div>
        </section>
        <section style="padding: 3rem 1rem; max-width: 1024px; margin: 0 auto; text-align: center;">
          <h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 1.5rem;">Why Panya Global is the Best Mover in Noida</h2>
          <p style="color: #4b5563; line-height: 1.75;">
            Moving within Noida or from Noida to other cities requires an understanding of local customs, toll structures, and secure roads. 
            Panya Global Relocation provides transparent estimates, zero hidden fees, and absolute safety of your household belongings. 
            Our team uses premium packaging and modern trucks to handle goods across sectors securely. 
            With 16+ years of verified industry experience and 9,600+ happy clients, we guarantee high reliability.
          </p>
        </section>'
    ],
    '/international-packers-movers-delhi' => [
        'title' => 'International Packers and Movers Delhi | Panya Global',
        'description' => 'Best international packers and movers in Delhi. Panya Global offers door-to-door relocation, customs clearance, and global shipping. Call +91-11-41556447.',
        'canonical' => 'https://www.panyaglobal.in/international-packers-movers-delhi',
        'schemas' => '
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "MovingCompany",
          "name": "Panya Global Relocation - International Moving Delhi",
          "url": "https://www.panyaglobal.in/international-packers-movers-delhi",
          "telephone": "+911141556447",
          "description": "Expert international packers and movers in Delhi offering door-to-door overseas relocation with full customs clearance and shipping support.",
          "areaServed": {"@type": "City", "name": "Delhi"},
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Delhi",
            "addressRegion": "Delhi NCR",
            "addressCountry": "IN"
          }
        }
        </script>',
        'body' => '
        <section style="padding: 4rem 1rem; text-align: center; max-width: 1024px; margin: 0 auto;">
          <h1 style="font-size: 2.5rem; font-weight: bold; color: #1e3a8a;">International Packers and Movers in Delhi</h1>
          <p style="font-size: 1.125rem; line-height: 1.75; color: #4b5563; margin-top: 1.5rem;">
            Panya Global Relocation Pvt. Ltd. is your trusted partner for door-to-door international moving from Delhi and India to global destinations. 
            We manage packing, freight, custom documentations, and port clearance under a single unified coordination team.
          </p>
        </section>
        <section style="padding: 3rem 1rem; max-width: 1024px; margin: 0 auto; background-color: #f3f4f6; border-radius: 1.5rem; margin-bottom: 2rem;">
          <h2 style="font-size: 2rem; font-weight: bold; text-align: center; margin-bottom: 1.5rem;">Our Overseas Shifting Services</h2>
          <div style="display: grid; grid-template-cols: 1fr; gap: 2rem;">
            <div>
              <h3 style="font-weight: bold; color: #1e3a8a;">Outbound International Relocation</h3>
              <p>For moves originating in Delhi, our trained packers handle high-quality export packing and prepare inventory documentation.</p>
            </div>
            <div>
              <h3 style="font-weight: bold; color: #1e3a8a;">Inbound NRI Relocation</h3>
              <p>For families returning to India from the Gulf, USA, UK, or Europe, we manage custom clearances and home setups.</p>
            </div>
            <div>
              <h3 style="font-weight: bold; color: #1e3a8a;">Customs Clearance Support</h3>
              <p>We assist you in preparing correct import/export documents, managing declarations, duties, and clearances.</p>
            </div>
          </div>
        </section>
        <section style="padding: 3rem 1rem; max-width: 1024px; margin: 0 auto; text-align: center;">
          <h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 1.5rem;">Why Panya Global is the Best International Mover in Delhi</h2>
          <p style="color: #4b5563; line-height: 1.75;">
            Unlike conventional packers, international relocation requires complex ocean/air freight booking, cargo consolidation, and network handling. 
            Panya Global works with a verified network of global relocation partners across 280+ cities to ensure seamless door-to-door delivery. 
            Our coordinators manage all aspects of your move, providing clear tracking, responsive updates, and full cargo insurance. 
            Whether you are moving to Dubai, London, New York, or Singapore, we commit to zero-damage shifting.
          </p>
        </section>'
    ]
];

// 3. Load index.html compiled by Vite
$html_file = __DIR__ . '/index.html';
if (!file_exists($html_file)) {
    echo "React application build index.html not found.";
    exit(1);
}

$html = file_get_contents($html_file);

// 4. Inject route-specific content if match is found
if (isset($pages[$path])) {
    $data = $pages[$path];

    // Inject Title
    $html = preg_replace('/<title>.*?<\/title>/i', '<title>' . htmlspecialchars($data['title']) . '</title>', $html);

    // Inject Meta Description
    $html = preg_replace('/<meta\s+name="description"\s+content=".*?"\s*\/?>/i', '<meta name="description" content="' . htmlspecialchars($data['description']) . '">', $html);

    // Inject Canonical
    $html = preg_replace('/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i', '<link rel="canonical" href="' . htmlspecialchars($data['canonical']) . '">', $html);

    // Inject Schemas before </head>
    if (!empty($data['schemas'])) {
        $html = str_ireplace('</head>', $data['schemas'] . "\n</head>", $html);
    }

    // Inject crawlable body inside <div id="root"></div>
    $body_content = '<div id="root">' . $data['body'] . '</div>';
    $html = str_ireplace('<div id="root"></div>', $body_content, $html);
}

// 5. Output the pre-rendered HTML page
echo $html;
?>
