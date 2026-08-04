"use client";

import { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

interface WordRevealProps {
  text: string;
  highlightWords?: string[];
  className?: string;
  highlightClassName?: string;
}

export function WordReveal({
  text,
  highlightWords = [],
  className = "",
  highlightClassName = "",
}: WordRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.9", "end 0.4"],
  });

  const words = text.split(" ");

  return (
    <div ref={containerRef} className={className}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = (i + 1) / words.length;
        const isHighlighted = highlightWords.includes(word.replace(/[.,—–]/g, ""));

        return (
          <AnimatedWord
            key={i}
            word={word}
            scrollYProgress={scrollYProgress}
            start={start}
            end={end}
            isHighlighted={isHighlighted}
            highlightClassName={highlightClassName}
          />
        );
      })}
    </div>
  );
}

function AnimatedWord({
  word,
  scrollYProgress,
  start,
  end,
  isHighlighted,
  highlightClassName,
}: {
  word: string;
  scrollYProgress: MotionValue<number>;
  start: number;
  end: number;
  isHighlighted: boolean;
  highlightClassName: string;
}) {
  const opacity = useTransform(scrollYProgress, [start, end], [0.15, 1]);

  return (
    <motion.span
      style={{ opacity }}
      className={`inline ${isHighlighted ? highlightClassName : ""}`}
    >
      {word}{" "}
    </motion.span>
  );
}
