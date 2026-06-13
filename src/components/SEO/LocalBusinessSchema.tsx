import { useEffect } from "react";

interface LocalBusinessSchemaProps {
  city: string;
  state: string;
  description: string;
  phoneNumber: string;
  areas: string[];
}

const LocalBusinessSchema = ({ 
  city, 
  state, 
  description, 
  phoneNumber, 
  areas 
}: LocalBusinessSchemaProps) => {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "MovingCompany",
      "name": `Panya Global Movers - Packers and Movers in ${city}`,
      "description": description,
      "image": "https://www.panyaglobal.in/og-image.webp",
      "logo": "https://www.panyaglobal.in/favicon.webp",
      "url": `https://www.panyaglobal.in/packers-movers/${city.toLowerCase().replace(/\s+/g, '-')}`,
      "telephone": "+91 11 4155 6447",
      "email": "info@panyaglobal.in",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "18/1, Basement, Village Samalkha, Old Delhi Gurgaon Road",
        "addressLocality": city,
        "addressRegion": state,
        "postalCode": "110037",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "28.6139",
        "longitude": "77.2090"
      },
      "areaServed": [
        {
          "@type": "City",
          "name": city
        },
        ...areas.map(area => ({
          "@type": "Place",
          "name": `${area}, ${city}`
        }))
      ],
      "priceRange": "₹₹",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
          ],
          "opens": "09:00",
          "closes": "18:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Sunday",
          "opens": "10:00",
          "closes": "16:00"
        }
      ],
      "sameAs": [
        "https://www.facebook.com/panyaglobalmovers",
        "https://twitter.com/panyamovers",
        "https://www.instagram.com/panyaglobalmovers",
        "https://www.youtube.com/channel/UCPL5IzVtDI3wkb9CavfpWCA",
        "https://www.linkedin.com/company/panya-global-relocation"
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "1500",
        "bestRating": "5",
        "worstRating": "1"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Relocation Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Home Relocation",
              "description": "Complete household moving with professional packing"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Office Relocation",
              "description": "Minimal downtime corporate moves"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Vehicle Transport",
              "description": "Safe car and bike transportation"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Packing & Unpacking",
              "description": "Expert packing with quality materials"
            }
          }
        ]
      }
    };

    // Remove existing schema if present
    const existingScript = document.querySelector('script[data-schema="local-business"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'local-business');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[data-schema="local-business"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [city, state, description, phoneNumber, areas]);

  return null;
};

export default LocalBusinessSchema;
