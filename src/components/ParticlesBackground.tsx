import React, { useEffect, useState } from 'react';
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { tsParticles } from "@tsparticles/engine";

const ParticlesBackground: React.FC<{ theme: string }> = ({ theme }) => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    loadSlim(tsParticles).then(() => {
      setInit(true);
    });
  }, []);

  if (theme === 'hello-kitty' && init) {
    return (
      <Particles
        id="tsparticles"
        className="-z-10 absolute inset-0 w-full h-full"
        options={{
          fullScreen: { enable: false },
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          interactivity: {
            events: {
              onHover: { enable: true, mode: "bubble" },
            },
            modes: {
              bubble: { distance: 200, size: 10, duration: 2, opacity: 0.8 },
            },
          },
          particles: {
            color: { value: ["#ffffff", "#ffb6c1", "#ff69b4"] },
            links: { enable: false },
            move: {
              direction: "top",
              enable: true,
              outModes: { default: "out" },
              random: true,
              speed: 1,
              straight: false,
            },
            number: { value: 40 },
            opacity: {
              value: 0.6,
              random: true,
              animation: { enable: true, speed: 1, sync: false }
            },
            shape: {
              type: ["circle", "star"],
            },
            size: {
              value: { min: 2, max: 6 },
              random: true,
            },
          },
          detectRetina: true,
        }}
      />
    );
  }

  return null;
};

export default ParticlesBackground;
