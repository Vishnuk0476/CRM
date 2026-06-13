import { useParams, Navigate } from "react-router-dom";
import { getLocationBySlug } from "@/data/locations";
import LocationTemplate from "./LocationTemplate";

const LocationPage = () => {
  const { slug } = useParams<{ slug: string }>();
  
  if (!slug) {
    return <Navigate to="/services" replace />;
  }

  const location = getLocationBySlug(slug);

  if (!location) {
    return <Navigate to="/services" replace />;
  }

  return <LocationTemplate location={location} />;
};

export default LocationPage;
