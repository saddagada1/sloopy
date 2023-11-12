import { type HTMLAttributes, useEffect, useRef } from "react";
import { Orientation, SVGuitarChord } from "svguitar";
import { cn } from "~/utils/shadcn/utils";
import { type Chord } from "~/utils/types";

interface ChordProps extends HTMLAttributes<HTMLDivElement> {
  chord?: Chord;
  horizontal?: boolean;
}

const Chord: React.FC<ChordProps> = ({ chord, horizontal, ...props }) => {
  const { className, ...rest } = props;
  const canvasRef = useRef<HTMLDivElement>(null!);
  const svguitarRef = useRef<SVGuitarChord>(null!);

  useEffect(() => {
    if (canvasRef.current) {
      if (chord) {
        svguitarRef.current = new SVGuitarChord(canvasRef.current)
          .chord({
            fingers: chord.fingers,

            barres: chord.barres,

            position: chord.position,
          })
          .configure({
            fixedDiagramPosition: true,
            tuning: ["E", "A", "D", "G", "B", "E"],
            orientation: horizontal ? Orientation.horizontal : undefined,
          });
      }
    }

    if (svguitarRef.current && canvasRef.current) {
      canvasRef.current.innerHTML = "";
      svguitarRef.current.draw();
    }

    return () => {
      svguitarRef.current?.clear();
    };
  }, [chord, canvasRef, svguitarRef, horizontal]);

  return (
    <div
      {...rest}
      className={cn("h-full w-full", className)}
      ref={canvasRef}
    ></div>
  );
};

export default Chord;
