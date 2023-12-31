import React, { type HTMLAttributes } from "react";
import { useElementSize } from "usehooks-ts";
import { cn } from "~/utils/shadcn/utils";

interface MarqueeProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
}

const Marquee: React.FC<MarqueeProps> = ({ label, ...props }) => {
  const { className, children, ...rest } = props;
  const [text, { width: length }] = useElementSize();
  return (
    <section {...rest} className={cn("section flex flex-col p-0", className)}>
      <h2 className="section-label mb-0 flex-none p-2">{label}</h2>
      <div className="flex flex-1 items-center overflow-hidden">
        <h1
          style={{ animationDuration: `${length * 0.001}s` }}
          ref={text}
          className="marquee marquee-text"
        >
          {Array.from({ length: 16 }).map((_, index) => (
            <span key={index}>
              &nbsp;
              {children}
            </span>
          ))}
        </h1>
      </div>
    </section>
  );
};
export default Marquee;
