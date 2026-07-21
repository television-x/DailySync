import React, { useCallback } from 'react';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import type { Engine } from 'tsparticles-engine';

const ParticlesBackground: React.FC<{ theme: string }> = ({ theme }) => {
  const particlesInit = useCallback(async (engine: Engine) => {
    // Cast engine to any to bypass v2/v3 type mismatch between react-tsparticles and tsparticles-slim
    await loadFull(engine as any);
  }, []);

  if (theme === 'hello-kitty') {
    return (
      <Particles
        id="tsparticles"
        init={particlesInit}
        className="-z-10 absolute inset-0 w-full h-full"
        options={{
          fullScreen: { enable: false },
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          interactivity: {
            events: {
              onHover: { enable: true, mode: "bubble" },
              resize: true,
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
            number: { density: { enable: true, area: 800 }, value: 40 },
            opacity: {
              value: 0.6,
              random: true,
              anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false }
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
