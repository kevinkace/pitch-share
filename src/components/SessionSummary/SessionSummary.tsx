import styles from './SessionSummary.module.css';

interface SessionSummaryProps {
  pitchCount: number;
  topSpeed: number;
  avgSpeed: number;
  medSpeed: number;
  unit: string;
}

export default function SessionSummary({
  pitchCount,
  topSpeed,
  avgSpeed,
  medSpeed,
  unit
}: SessionSummaryProps) {
  return (
    <div className={styles.container}>
      <div className={styles.statCard}>
        <div className={styles.statValue}>{pitchCount}</div>
        <div className={styles.statLabel}>Pitches</div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statValue}>{topSpeed}</div>
        <div className={styles.statLabel}>Top Speed ({unit})</div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statValue}>{avgSpeed}</div>
        <div className={styles.statLabel}>Average ({unit})</div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statValue}>{medSpeed}</div>
        <div className={styles.statLabel}>Median ({unit})</div>
      </div>
    </div>
  );
}