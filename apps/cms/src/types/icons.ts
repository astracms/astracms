import type { SVGProps } from "react";

type SVGAttributes = Partial<SVGProps<SVGSVGElement>>;

export interface IconProps extends Omit<SVGAttributes, "ref"> {
  size?: string | number;
  absoluteStrokeWidth?: boolean;
}
