import Svg, { Circle, Defs, Line, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

import { Colors } from '@/constants/theme';
import { circumference, computeProgressEndpoint, computeTicks } from './geometry';

export type CompassDialProps = {
  /** 0-100 gap-analysis percentage. */
  percent: number;
  size?: number;
  /** Sub-label under the percentage, e.g. "갭분석" or "탭해서 로드맵 보기". */
  label?: string;
  showLabel?: boolean;
  colorFrom?: string;
  colorTo?: string;
  tickActiveColor?: string;
  trackColor?: string;
};

const GRADIENT_ID = 'compass-dial-gradient';

export function CompassDial({
  percent,
  size = 176,
  label,
  showLabel = true,
  colorFrom = Colors.pri,
  colorTo = Colors.pri2,
  tickActiveColor = Colors.pri2,
  trackColor = Colors.surf2,
}: CompassDialProps) {
  const clampedPercent = Math.max(0, Math.min(100, percent));
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.42;
  const strokeWidth = size * 0.055;
  const circ = circumference(radius);
  const ticks = computeTicks(size, radius, clampedPercent);
  const progressEnd = computeProgressEndpoint(size, radius, clampedPercent);

  return (
    <Svg width={size} height={size}>
      <Defs>
        <LinearGradient id={GRADIENT_ID} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={colorFrom} />
          <Stop offset="100%" stopColor={colorTo} />
        </LinearGradient>
      </Defs>

      <Circle cx={cx} cy={cy} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />

      {ticks.map((tick) => (
        <Line
          key={tick.key}
          x1={tick.from.x}
          y1={tick.from.y}
          x2={tick.to.x}
          y2={tick.to.y}
          stroke={tick.isActive ? tickActiveColor : Colors.border}
          strokeWidth={tick.isMajor ? size * 0.014 : size * 0.007}
          strokeLinecap="round"
        />
      ))}

      <Circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={`url(#${GRADIENT_ID})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - clampedPercent / 100)}
        rotation={-90}
        originX={cx}
        originY={cy}
      />

      <Circle cx={progressEnd.x} cy={progressEnd.y} r={size * 0.055} fill={colorTo} opacity={0.28} />
      <Circle cx={progressEnd.x} cy={progressEnd.y} r={size * 0.032} fill="#ffffff" />

      {showLabel && (
        <SvgText
          x={cx}
          y={cy - size * 0.02}
          textAnchor="middle"
          fontSize={size * 0.19}
          fontWeight="800"
          fill={Colors.text}>
          {Math.round(clampedPercent)}%
        </SvgText>
      )}
      {showLabel && label && (
        <SvgText x={cx} y={cy + size * 0.11} textAnchor="middle" fontSize={size * 0.06} fontWeight="600" fill={Colors.textDim}>
          {label}
        </SvgText>
      )}
    </Svg>
  );
}
