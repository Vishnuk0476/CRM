import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  type?: string;
  image?: string;
  schema?: Record<string, unknown>;
  noindex?: boolean;
}

export const SEO = ({
  title = "Panya Global | International Packers and Movers & Relocation Services",
  description = "Top-rated packing and movers offering domestic, local, and international relocation. Panya Global provides expert workspace shifting, car transport, and secure storage.",
  type = "website",
  image = "https://www.panyaglobal.in/og-image.webp",
  schema,
  noindex = false,
}: SEOProps) => {
  const location = useLocation();
  const currentUrl = `https://www.panyaglobal.in${location.pathname}`;

  const finalSchema = schema || {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Panya Global Relocation",
    "url": "https://www.panyaglobal.in",
    "logo": "https://www.panyaglobal.in/favicon.webp",
    "image": "https://www.panyaglobal.in/og-image.webp",
    "description": "Top-rated packing and movers offering domestic, local, and international relocation.",
    "telephone": "+91 11 4155 6447",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "18/1, Basement, Village Samalkha, Old Delhi Gurgaon Road",
      "addressLocality": "New Delhi",
      "postalCode": "110037",
      "addressCountry": "IN"
    }
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={currentUrl} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Panya Global Relocation" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@panyaglobal" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(finalSchema)}
      </script>
    </Helmet>
  );
};
