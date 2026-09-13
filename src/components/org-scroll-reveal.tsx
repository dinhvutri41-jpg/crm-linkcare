"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function OrgScrollReveal({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!scope.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      gsap.fromTo(".org-team-card", { autoAlpha: 0, y: 34 }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".org-team-card",
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      });
    }, scope);
    return () => context.revert();
  }, []);

  return <div ref={scope}>{children}</div>;
}
