import React from "react";
import Svg, { G, Circle, Text } from "react-native-svg";

export default function Donut({
  size = 220,
  strokeWidth = 24,
  segments = [
    { value: 0.33, color: "#F06292" }, // humano
    { value: 0.33, color: "#F4C542" }, // mixto
    { value: 0.34, color: "#5BA4D8" }, // IA
  ],
  centerText = "53 %",
  centerColor = "#0f3b3a",
}: {
  size?: number;
  strokeWidth?: number;
  segments?: { value:number; color:string }[];
  centerText?: string;
  centerColor?: string;
}) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  let start = -Math.PI/2;

  return (
    <Svg width={size} height={size}>
      <G rotation="0" originX={size/2} originY={size/2}>
        {segments.map((s, idx) => {
          const dash = c * s.value;
          const gap = c - dash;
          const x = size/2 + r * Math.cos(start);
          const y = size/2 + r * Math.sin(start);
          start += 2*Math.PI*s.value;
          return (
            <Circle
              key={idx}
              cx={size/2} cy={size/2} r={r}
              stroke={s.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${gap}`}
              strokeLinecap="butt"
              fill="none"
              rotation="0"
              originX={size/2} originY={size/2}
            />
          );
        })}
        <Text x={size/2} y={size/2+10} fontSize={size*0.18} fontWeight="900" fill={centerColor} textAnchor="middle">
          {centerText}
        </Text>
      </G>
    </Svg>
  );
}
