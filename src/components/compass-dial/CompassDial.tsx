import { useId } from 'react';
import Svg, { Circle, Defs, Line, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';
import { circumference, computeProgressEndpoint, computeTicks } from './geometry';

export type CompassDialProps = {
  /** 0-100. What it represents is up to the caller - e.g. gap analysis, stage progress. */
  percent: number;
  size?: number;
  /** Sub-label under the percentage - should match whatever `percent` actually measures. */
  label?: string;
  showLabel?: boolean;
  colorFrom?: string;
  colorTo?: string;
  tickActiveColor?: string;
  trackColor?: string;
};

export function CompassDial({
  percent,
  size = 176,
  label,
  showLabel = true,
  colorFrom,
  colorTo,
  tickActiveColor,
  trackColor,
}: CompassDialProps) {
  const theme = useTheme();
  const resolvedColorFrom = colorFrom ?? theme.pri;
  const resolvedColorTo = colorTo ?? theme.pri2;
  const resolvedTickActiveColor = tickActiveColor ?? theme.pri2;
  const resolvedTrackColor = trackColor ?? theme.surf2;
  // useId() includes colons (":r0:"), which are valid in SVG ids but risky in
  // CSS-style url(#...) references on the react-native-web renderer - strip them.
  const gradientId = `compass-dial-gradient-${useId().replace(/:/g, '')}`;
  const safePercent = Number.isFinite(percent) ? percent : 0;
  const clampedPercent = Math.max(0, Math.min(100, safePercent));
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
        <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={resolvedColorFrom} />
          <Stop offset="100%" stopColor={resolvedColorTo} />
        </LinearGradient>
      </Defs>

      <Circle cx={cx} cy={cy} r={radius} fill="none" stroke={resolvedTrackColor} strokeWidth={strokeWidth} />

      {ticks.map((tick) => (
        <Line
          key={tick.key}
          x1={tick.from.x}
          y1={tick.from.y}
          x2={tick.to.x}
          y2={tick.to.y}
          stroke={tick.isActive ? resolvedTickActiveColor : theme.border}
          strokeWidth={tick.isMajor ? size * 0.014 : size * 0.007}
          strokeLinecap="round"
        />
      ))}

      <Circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - clampedPercent / 100)}
        rotation={-90}
        originX={cx}
        originY={cy}
      />

      <Circle cx={progressEnd.x} cy={progressEnd.y} r={size * 0.055} fill={resolvedColorTo} opacity={0.28} />
      <Circle cx={progressEnd.x} cy={progressEnd.y} r={size * 0.032} fill={theme.bg} />

      {showLabel && (
        <SvgText x={cx} y={cy - size * 0.02} textAnchor="middle" fontSize={size * 0.19} fontWeight="800" fill={theme.text}>
          {Math.round(clampedPercent)} %
        </SvgText>
      )}
      {showLabel && label && (
        <SvgText x={cx} y={cy + size * 0.11} textAnchor="middle" fontSize={size * 0.06} fontWeight="600" fill={theme.textDim}>
          {label}
        </SvgText>
      )}
    </Svg>
  );
}
