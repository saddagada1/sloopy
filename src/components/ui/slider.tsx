import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "~/utils/shadcn/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, orientation, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex touch-none select-none",
      orientation === "horizontal"
        ? "h-fit w-full items-center"
        : "h-full w-fit justify-center",
      className
    )}
    {...props}
    orientation={orientation}
  >
    <SliderPrimitive.Track
      className={cn(
        "relative overflow-hidden rounded bg-primary/20",
        orientation === "horizontal" ? "h-1.5 w-full" : "h-full w-1.5"
      )}
    >
      <SliderPrimitive.Range
        className={cn(
          "absolute bg-primary",
          orientation === "horizontal" ? "h-full" : "w-full"
        )}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
