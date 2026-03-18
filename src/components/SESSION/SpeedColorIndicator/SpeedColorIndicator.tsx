import styles from './SpeedColorIndicator.module.css';

interface SpeedColorIndicatorProps {
  color: string;
  className?: string;
}

export default function SpeedColorIndicator({ color, className }: SpeedColorIndicatorProps) {
  return (
    <div
      className={`${styles.colorIndicator} ${className || ''}`}
      style={{ backgroundColor: color }}
    />
  );
}