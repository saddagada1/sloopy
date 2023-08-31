import { useEffect, useRef } from "react";
import { SVGuitarChord } from "svguitar";
import { secondaryColour } from "~/utils/constants";
import { type Chord } from "~/utils/types";

interface ChordProps {
  chord: Chord;
}

const Chord: React.FC<ChordProps> = ({ chord }) => {
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
            color: secondaryColour,
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
  }, [chord, canvasRef, svguitarRef]);

  return <div className="h-full w-full" ref={canvasRef}></div>;
};

export default Chord;
