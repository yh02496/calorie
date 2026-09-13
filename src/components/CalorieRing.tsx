interface CalorieRingProps {
  consumed: number;
  target: number;
  size?: number;
  stroke?: number;
}

export function CalorieRing({ consumed, target, size = 200, stroke = 14 }: CalorieRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = target > 0 ? Math.min(100, (consumed / target) * 100) : 0;
  const dashoffset = circumference - (pct / 100) * circumference;
  const remaining = Math.max(0, target - consumed);
  const over = consumed > target;

  return (
    <div className="calorie-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f0f0f0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={over ? "#DC2626" : "#000000"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="calorie-ring-center">
        <div className="consumed">{consumed}</div>
        <div className="of">of {target} cal</div>
        {remaining > 0 && (
          <div className="remaining under">{remaining} remaining</div>
        )}
        {over && (
          <div className="remaining over">{consumed - target} over</div>
        )}
        {remaining === 0 && !over && (
          <div className="remaining">Goal met</div>
        )}
      </div>
    </div>
  );
}
