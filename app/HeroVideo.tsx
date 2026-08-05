"use client";

import { useEffect, useRef, useState } from "react";

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPausedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as NavigatorWithConnection).connection?.saveData;
    if (reducedMotion || saveData) return;
    const video = videoRef.current;
    if (!video) return;
    // Promote the deferred sources in the browser only, so server rendering never fetches a film.
    for (const source of video.querySelectorAll<HTMLSourceElement>("source[data-src]")) {
      source.media = source.dataset.media ?? "";
      source.src = source.dataset.src ?? "";
    }
    video.load();
    void video.play().catch(() => {
      if (!userPausedRef.current) setReady(false);
    });
  }, []);

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (userPausedRef.current) {
      userPausedRef.current = false;
      setPaused(false);
      try {
        await video.play();
      } catch {
        if (userPausedRef.current) return;
        userPausedRef.current = true;
        setPaused(true);
        setReady(false);
        return;
      }
      if (userPausedRef.current) return;
    } else {
      userPausedRef.current = true;
      setPaused(true);
      video.pause();
    }
  }

  return (
    <div className="hero-media">
      <picture className="hero-video-fallback">
        <source media="(max-width: 640px)" srcSet="/property/video/property-overview-mobile-poster.webp" />
        <img
          src="/property/video/property-overview-desktop-poster.webp"
          alt="Aerial view of 1309 Queens Bush Road and its surrounding grounds"
          width="1600"
          height="900"
          fetchPriority="high"
        />
      </picture>
      <video
        ref={videoRef}
        className={`hero-video${ready ? " is-ready" : ""}`}
        poster="/property/video/property-overview-desktop-poster.webp"
        width="1920"
        height="1080"
        muted
        playsInline
        loop
        preload="none"
        aria-hidden="true"
        onCanPlay={() => setReady(true)}
        onError={() => {
          if (!userPausedRef.current) setReady(false);
        }}
      >
        <source
          data-src="/property/video/property-overview-mobile.mp4"
          data-media="(max-width: 640px)"
          type="video/mp4"
        />
        <source data-src="/property/video/property-overview-desktop.mp4" type="video/mp4" />
      </video>
      <button
        className="hero-video-control"
        type="button"
        onClick={togglePlayback}
        hidden={!ready}
        disabled={!ready}
      >
        {paused ? "Play video" : "Pause video"}
      </button>
    </div>
  );
}
