import { motion } from "framer-motion";
import { Play } from "lucide-react";

const VideoTestimonials = () => {
  const testimonials = [
    {
      id: "PFE0lqw9jVQ",
      name: "Satisfied Client",
      title: "Panya Global Customer",
    },
    {
      id: "FYdguHFWHa8",
      name: "Happy Client",
      title: "Relocation Customer",
    },
    {
      id: "Q7XaJWKgywo",
      name: "Valued Client",
      title: "Logistics Partner",
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-secondary font-semibold text-sm uppercase tracking-wider mb-4">
            Video Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            What Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">
              Clients
            </span>{" "}
            Say
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Watch real testimonials from our satisfied customers who trusted us with their relocations.
          </p>
        </motion.div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {testimonials.map((video, index) => (
            <motion.div
              key={video.id}
              className="group"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-xl bg-card border border-border">
                {/* Video Embed */}
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0`}
                    title={`Testimonial from ${video.name}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-heading font-semibold text-foreground text-lg mb-1">
                    {video.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {video.title}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* YouTube Channel Link */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <a 
            href="https://www.youtube.com/channel/UCPL5IzVtDI3wkb9CavfpWCA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-secondary font-semibold hover:gap-3 transition-all"
          >
            <Play className="w-5 h-5" />
            Watch More on YouTube
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoTestimonials;
