import { useRef, useEffect } from "react";
import { useIsClient } from "usehooks-ts";

interface GradientProps {
  animated?: boolean;
}

const Gradient: React.FC<GradientProps> = ({}) => {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const isWindow = useIsClient();

  useEffect(() => {
    if (!canvas.current || isWindow) return;

    const cv = canvas.current;
    let width = cv.offsetWidth;
    let height = cv.offsetHeight;
    const ctx = cv.getContext("2d");
    const pixelRatio = window.devicePixelRatio > 1 ? 2 : 1;
    const totalParticles = 1;
    const maxRadius = 90;
    const minRadius = 40;

    let frameId: number;

    const resize = () => {
      if (!ctx) return;
      width = cv.offsetWidth;
      height = cv.offsetHeight;
      cv.width = width * pixelRatio;
      cv.height = height * pixelRatio;
      ctx.scale(pixelRatio, pixelRatio);
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < totalParticles; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * (maxRadius - minRadius) + minRadius;
        const dx = Math.random() * 4;
        const dy = Math.random() * 4;
        const sinValue = Math.random();

        if (x < 0) {
        }

        ctx.beginPath();
        ctx.fillStyle = "#200022";
        ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        ctx.fill();
      }
      frameId = requestAnimationFrame(animate);
    };

    addEventListener("resize", resize);
    frameId = requestAnimationFrame(animate);

    return () => {
      removeEventListener("resize", resize);
    };
  }, [canvas, isWindow]);

  return <canvas ref={canvas} className="h-full w-full" />;
};
export default Gradient;
