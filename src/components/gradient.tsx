import { useRef, useEffect, type HTMLAttributes } from "react";
import { useIsClient } from "usehooks-ts";
import { cn } from "~/utils/shadcn/utils";

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  sinValue: number;
  colour: string;
}

interface GradientProps extends HTMLAttributes<HTMLCanvasElement> {
  animated?: boolean;
  colours: string[];
}

const Gradient: React.FC<GradientProps> = ({ animated, colours, ...props }) => {
  const { className, style, ...rest } = props;
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const isWindow = useIsClient();

  useEffect(() => {
    if (!canvas.current || isWindow) return;

    const cv = canvas.current;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let width = cv.offsetWidth;
    let height = cv.offsetHeight;
    const pixelRatio = window.devicePixelRatio > 1 ? 2 : 1;
    const particles: Particle[] = [];
    const maxRadius = 180;
    const minRadius = 180;

    cv.width = width * pixelRatio;
    cv.height = height * pixelRatio;
    ctx.scale(pixelRatio, pixelRatio);

    const draw = () => {
      for (const colour of colours) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * (maxRadius - minRadius) + minRadius,
          vx: Math.random() * 4,
          vy: Math.random() * 4,
          sinValue: Math.random(),
          colour,
        });
      }
    };

    const resize = () => {
      width = cv.offsetWidth;
      height = cv.offsetHeight;
      cv.width = width * pixelRatio;
      cv.height = height * pixelRatio;
      ctx.scale(pixelRatio, pixelRatio);
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (const particle of particles) {
        particle.sinValue += 0.01;
        particle.radius += Math.sin(particle.sinValue);
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) {
          particle.vx *= -1;
          particle.x += 10;
        } else if (particle.x > width) {
          particle.vx *= -1;
          particle.x -= 10;
        }

        if (particle.y < 0) {
          particle.vy *= -1;
          particle.y += 10;
        } else if (particle.y > height) {
          particle.vy *= -1;
          particle.y -= 10;
        }

        ctx.beginPath();
        const g = ctx.createRadialGradient(
          particle.x,
          particle.y,
          particle.radius * 0.01,
          particle.x,
          particle.y,
          particle.radius
        );
        g.addColorStop(0, particle.colour);
        g.addColorStop(1, particle.colour + "00");
        ctx.fillStyle = g;
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2, false);
        ctx.fill();
      }

      if (animated && colours.length > 1) {
        requestAnimationFrame(animate);
      }
    };

    draw();

    addEventListener("resize", resize);

    requestAnimationFrame(animate);

    return () => {
      removeEventListener("resize", resize);
    };
  }, [animated, canvas, colours, isWindow]);

  return (
    <canvas
      ref={canvas}
      {...rest}
      style={{
        background:
          colours.length > 1
            ? `linear-gradient(135deg, ${colours
                .map((c, i) => `${c} ${(i / (colours.length - 1)) * 100}%`)
                .toString()})`
            : undefined,
        backgroundColor: colours[0],
        ...style,
      }}
      className={cn("h-full w-full", className)}
    />
  );
};
export default Gradient;
