import React from "react";
import type { CSSProperties } from "react";
import { Card, type CardProps } from "./Card";

export type BentoCardProps = CardProps & {
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  tall?: boolean;
};

export function BentoCard({ span = 1, tall = false, style, ...props }: BentoCardProps) {
  const gridStyle = {
    gridColumn: `span ${span} / span ${span}`,
    gridRow: tall ? "span 2 / span 2" : undefined,
    ...style
  } satisfies CSSProperties;

  return <Card style={gridStyle} {...props} />;
}
