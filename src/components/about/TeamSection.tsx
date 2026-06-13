import { motion } from "framer-motion";
import { Linkedin } from "lucide-react";

const team = [
  {
    name: "Jasleen Kaur",
    role: "Director & CEO",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
    linkedin: "https://www.linkedin.com/in/panyaglobalmovers/",
  },
  {
    name: "Jatin Rai",
    role: "Director",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
    linkedin: "https://www.linkedin.com/in/jatin-rai-299124176/",
  },
  {
    name: "Waqarul Haque",
    role: "Head of Corporate Sales - India",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    linkedin: "https://www.linkedin.com/in/waqarul-haque-42645a153/",
  },
  {
    name: "Vishnu Nishad",
    role: "Digital Marketing Manager",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    linkedin: "https://www.linkedin.com/in/vishnu-kumar-94713b21a/",
  },
];

const TeamSection = () => {
  return (
    <section id="team" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
            Our Leadership
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
            Meet the <span className="text-secondary">Team</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our leadership team brings decades of combined experience in logistics, 
            customer service, and operations management.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group text-center"
            >
              <div className="relative mb-6 overflow-hidden rounded-2xl">
                <img 
                  src={member.image}
                  alt={member.name}
                  className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy" decoding="async" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                  <a 
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-primary-foreground flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Linkedin className="w-5 h-5 text-primary" />
                  </a>
                </div>
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-1">
                {member.name}
              </h3>
              <p className="text-secondary font-medium">{member.role}</p>
              <a 
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground text-sm mt-2 hover:text-secondary transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
