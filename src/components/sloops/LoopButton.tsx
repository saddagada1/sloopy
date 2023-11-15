import { type HTMLAttributes } from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

interface LoopButtonProps extends HTMLAttributes<HTMLDivElement> {
  loopId: string;
  chord: string;
}

const LoopButton: React.FC<LoopButtonProps> = ({ loopId, chord, ...props }) => {
  const { children, ...rest } = props;
  return (
    <AccordionItem {...rest} value={loopId}>
      <AccordionTrigger className="h-6">{chord}</AccordionTrigger>
      <AccordionContent>{children}</AccordionContent>
    </AccordionItem>
  );
};

export default LoopButton;
