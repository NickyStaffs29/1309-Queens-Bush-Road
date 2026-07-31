/* eslint-disable @next/next/no-img-element -- poster fallback is a local derivative, not an optimizable remote image */
"use client";

import { useEffect, useRef, useState } from "react";

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

export default function PropertyVideo({
  name,
  alt,
  className,
  staggerMs = 0,
}: {
  name: string;
  alt: string;
  className?: string;
  staggerMs?: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as NavigatorWithConnection).connection?.saveData;
    const root = rootRef.current;
    const video = videoRef.current;
    if (!root || !video || reducedMotion || saveData) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    // ponytail: one-shot IntersectionObserver, not continuous pause-on-scroll-away —
    // goal only requires gating the *first* autoplay so tiles don't all start at once;
    // a continuous toggle wasn't asked for and adds state for no requirement it serves
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const promote = () => {
          const source = video.querySelector<HTMLSourceElement>("source[data-src]");
          if (source) source.src = source.dataset.src ?? "";
          video.load();
          void video.play().catch(() => setReady(false));
        };
        if (staggerMs > 0) {
          timeoutId = setTimeout(promote, staggerMs);
        } else {
          promote();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [staggerMs]);

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      await video.play();
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  }

  return (
    <div ref={rootRef} className={`property-video${className ? ` ${className}` : ""}`}>
      <img
        className="property-video-fallback"
        src={`/property/video/${name}-poster.webp`}
        alt={alt}
        width="1920"
        height="1080"
        loading="lazy"
        decoding="async"
      />
      <video
        ref={videoRef}
        className={`property-video-media${ready ? " is-ready" : ""}`}
        poster={`/property/video/${name}-poster.webp`}
        width="1920"
        height="1080"
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        onCanPlay={() => setReady(true)}
        onError={() => setReady(false)}
      >
        {/* ponytail: single source, no vertical crop — only 01/03/07 have 9:16 masters
            and none of those are used here; if a future clip ships a vertical cut, add
            a second `<source data-media>` following HeroVideo's exact pattern. */}
        <source data-src={`/property/video/${name}.mp4`} type="video/mp4" />
      </video>
      <button
        className="property-video-control"
        type="button"
        onClick={togglePlayback}
        aria-pressed={paused}
        hidden={!ready}
        disabled={!ready}
      >
        {paused ? "Play video" : "Pause video"}
      </button>
    </div>
  );
}
