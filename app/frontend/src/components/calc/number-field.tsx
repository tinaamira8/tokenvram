import { cn } from '@/lib/utils';

interface NumberFieldProps {
  id: string;
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  /** Render a slider under the input */
  slider?: boolean;
  /** Slider scale: numbers are linear, "log" suits wide ranges like context length */
  scale?: 'linear' | 'log';
  formatValue?: (value: number) => string;
  className?: string;
}

const LOG_STEPS = 1000;

function toSliderPosition(value: number, min: number, max: number, scale: 'linear' | 'log') {
  if (scale === 'linear') return ((value - min) / (max - min)) * LOG_STEPS;
  const safeMin = Math.max(min, 1);
  const safeValue = Math.max(value, safeMin);
  return (Math.log(safeValue / safeMin) / Math.log(max / safeMin)) * LOG_STEPS;
}

function fromSliderPosition(position: number, min: number, max: number, scale: 'linear' | 'log') {
  if (scale === 'linear') return min + (position / LOG_STEPS) * (max - min);
  const safeMin = Math.max(min, 1);
  return safeMin * Math.pow(max / safeMin, position / LOG_STEPS);
}

export function NumberField({
  id,
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  slider = true,
  scale = 'linear',
  formatValue,
  className,
}: NumberFieldProps) {
  const position = toSliderPosition(value, min, max, scale);
  const fillPct = Math.min(100, Math.max(0, (position / LOG_STEPS) * 100));

  const handleSlider = (raw: number) => {
    const next = fromSliderPosition(raw, min, max, scale);
    const stepped = scale === 'log' ? Math.round(next) : Math.round(next / step) * step;
    onChange(Math.min(max, Math.max(min, Number(stepped.toFixed(4)))));
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-mono text-[11px] uppercase leading-[1.5] tracking-[0.12em] text-muted-foreground">
          {label}
        </label>
        <div className="flex items-center gap-1">
          <input
            id={id}
            type="number"
            inputMode="decimal"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(event) => {
              const parsed = Number(event.target.value);
              if (Number.isFinite(parsed)) onChange(Math.min(max, Math.max(min, parsed)));
            }}
            aria-describedby={hint ? `${id}-hint` : undefined}
            className="tnum w-[92px] border border-input bg-card px-2 py-1.5 text-right font-mono text-[13px] font-medium text-foreground outline-none transition-colors focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
          />
          {suffix ? <span className="font-mono text-[11px] text-muted-foreground">{suffix}</span> : null}
        </div>
      </div>
      {slider ? (
        <input
          type="range"
          aria-label={`${label} slider`}
          min={0}
          max={LOG_STEPS}
          step={1}
          value={Math.round(position)}
          onChange={(event) => handleSlider(Number(event.target.value))}
          className="slider-input"
          style={{ ['--fill' as string]: `${fillPct}%` }}
        />
      ) : null}
      {hint ? (
        <p id={`${id}-hint`} className="text-[11.5px] leading-[1.5] text-muted-foreground">
          {formatValue ? `${formatValue(value)} — ${hint}` : hint}
        </p>
      ) : null}
    </div>
  );
}
