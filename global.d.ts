import * as hooks from "usehooks-ts";

declare module "usehooks-ts" {
  interface Size {
    width: number;
    height: number;
  }
  declare function useElementSize<T extends HTMLElement>(): [
    (node: T | null) => void,
    Size
  ];
}
