import styles from './SessionSummary.module.css';

interface SessionSummaryProps {
  pitchCount: number | null;
  topSpeed: number | null;
  avgSpeed: number | null;
  medSpeed: number | null;
  unit: string;
  fastestStrike: number | null;
}

export default function SessionSummary({
  pitchCount,
  topSpeed,
  avgSpeed,
  medSpeed,
  unit,
  fastestStrike
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

      {fastestStrike && (
      <div className={styles.statCard}>
        <div className={styles.statValue}>{fastestStrike}</div>
        <div className={styles.statLabel}>Fastest Strike ({unit})</div>
      </div>
      )}
    </div>
  );
}