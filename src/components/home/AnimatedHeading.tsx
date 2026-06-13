import React, { useState, useEffect } from 'react';

interface AnimatedHeadingProps {
  text: string;
  className?: string;
  delay?: number;
  charDelay?: number;
  duration?: number;
}

export const AnimatedHeading: React.FC<AnimatedHeadingProps> = ({
  text,
  className = "",
  delay = 200,
  charDelay = 18,
  duration = 500
}) => {
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStartAnimation(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const lines = text.split('\n');
  let globalCharIndex = 0;

  return (
    <h1 className={className} style={{ letterSpacing: '-0.03em' }}>
      {lines.map((line, lineIndex) => {
        // Split into words, animate char by char but keep words intact
        const words = line.split(' ');
        return (
          <div key={lineIndex} className="block">
            {words.map((word, wordIndex) => {
              const wordElement = (
                <span key={wordIndex} className="inline-block whitespace-nowrap">
                  {word.split('').map((char) => {
                    const charDelayCurrent = globalCharIndex * charDelay;
                    globalCharIndex++;
                    return (
                      <span
                        key={charDelayCurrent}
                        className="inline-block"
                        style={{
                          opacity: startAnimation ? 1 : 0,
                          transform: startAnimation ? 'translateY(0)' : 'translateY(12px)',
                          transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
                          transitionDelay: `${charDelayCurrent}ms`,
                        }}
                      >
                        {char}
                      </span>
                    );
                  })}
                </span>
              );
              globalCharIndex++; // for the space
              // Add space between words (except last word)
              return wordIndex < words.length - 1 ? (
                <React.Fragment key={wordIndex}>
                  {wordElement}
                  <span className="inline-block">&nbsp;</span>
                </React.Fragment>
              ) : wordElement;
            })}
          </div>
        );
      })}
    </h1>
  );
};
