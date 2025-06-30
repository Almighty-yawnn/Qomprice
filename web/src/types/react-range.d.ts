// src/types/react-range.d.ts
import * as React from "react";

declare module "react-range" {
  export interface RangeProps {
    values: number[];
    step?: number;
    min?: number;
    max?: number;
    onChange: (values: number[]) => void;
    onFinalChange?: (values: number[]) => void;
    renderTrack: (opts: {
      props: any;
      children: React.ReactNode;
    }) => React.ReactNode;
    renderThumb: (opts: {
      props: any;
      children?: React.ReactNode;
    }) => React.ReactNode;
  }
  export const Range: React.FC<RangeProps>;
}
