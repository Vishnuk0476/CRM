import { ReactNode } from "react";

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "fade";
}

const SectionReveal = ({
  children,
  className = "",
  delay: _delay = 0,
  direction: _direction = "up",
}: SectionRevealProps) => {
  return <div className={className}>{children}</div>;
};

export default SectionReveal;
