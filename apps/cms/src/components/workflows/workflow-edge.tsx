"use client";

import { BaseEdge, type EdgeProps, getBezierPath } from "@xyflow/react";
import { memo } from "react";

/**
 * Animated edge component with a flowing dot animation
 */
export const AnimatedEdge = memo(function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        markerEnd={markerEnd}
        path={edgePath}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: "hsl(var(--muted-foreground))",
        }}
      />
      {/* Animated dot */}
      <circle className="animate-flow" fill="hsl(var(--primary))" r={4}>
        <animateMotion dur="2s" path={edgePath} repeatCount="indefinite" />
      </circle>
      <style>
        {`
          @keyframes flowPulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
          }
          .animate-flow {
            animation: flowPulse 2s ease-in-out infinite;
          }
        `}
      </style>
    </>
  );
});
