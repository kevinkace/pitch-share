import styles from './AnimatedEnvelope.module.css';

const size = 120;

export default function AnimatedEnvelope() {
  return (
      <svg
        width={size}
        height={size * 0.75}
        viewBox="0 0 160 160"
        className={styles.envelope}
      >
        {/* Envelope back */}
        <rect
          x="10"
          y="50"
          width="140"
          height="80"
          fill="#f8f9fa"
          stroke="#e9ecef"
          strokeWidth="2"
          rx="4"
        />

        {/* Envelope flap (back triangle) */}
        <polygon
          points="10,50 80,90 150,50"
          fill="#e9ecef"
          stroke="#e9ecef"
          strokeWidth="1"
          className={styles.flapBack}
        />

        {/* Letter inside */}
        <g className={styles.letter}>
            <rect
              x="25"
              y="65"
              width="110"
              height="70"
              fill="white"
              stroke="#ced4da"
              strokeWidth="1"
              rx="2"
            />
            {/* Letter content lines */}
            <line x1="35" y1="75" x2="125" y2="75" stroke="#adb5bd" strokeWidth="2" strokeLinecap="round" />
            <line x1="35" y1="85" x2="115" y2="85" stroke="#adb5bd" strokeWidth="2" strokeLinecap="round" />
            <line x1="35" y1="95" x2="120" y2="95" stroke="#adb5bd" strokeWidth="2" strokeLinecap="round" />
            <line x1="35" y1="105" x2="105" y2="105" stroke="#adb5bd" strokeWidth="2" strokeLinecap="round" />
          </g>


        {/* Envelope flap (front triangle) - this is the animated part */}
        <polygon
          points="10,50 80,90 150,50"
          fill="#4f46e5"
          stroke="#4338ca"
          strokeWidth="2"
          className={styles.flap}
          style={{
            transformOrigin: '10px 50px'
          }}
        />

        {/* Magic sparkles when opening */}
        <g className={styles.sparkles}>
            <circle cx="50" cy="45" r="2" fill="#fbbf24" className={styles.sparkle1} />
            <circle cx="110" cy="40" r="1.5" fill="#f59e0b" className={styles.sparkle2} />
            <circle cx="130" cy="55" r="2.5" fill="#fbbf24" className={styles.sparkle3} />
            <circle cx="30" cy="60" r="1" fill="#f59e0b" className={styles.sparkle4} />
          </g>
      </svg>
  );
}