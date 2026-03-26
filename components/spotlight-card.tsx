"use client";

import { useRef, useState, type MouseEvent, type ReactNode } from "react";

export function SpotlightCard<T extends React.ElementType = "div">({
  as,
  children,
  className = "",
  spotlightColor = "rgba(94, 106, 210, 0.15)",
  spotlightSize = 300,
  ...rest
}: {
  as?: T;
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  spotlightSize?: number;
} & React.ComponentPropsWithoutRef<T>) {
  const Component = as || "div";
  const divRef = useRef<HTMLElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  function handleMouseMove(e: MouseEvent<HTMLElement>) {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  function handleMouseEnter() {
    setOpacity(1);
  }

  function handleMouseLeave() {
    setOpacity(0);
  }

  return (
    <Component
      ref={divRef as React.Ref<any>}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
      {...rest}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(${spotlightSize}px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 100%)`,
        }}
        aria-hidden="true"
      />
      {children}
    </Component>
  );
}
