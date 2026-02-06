import SessionList from './SessionList';
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Pitch Share</h1>
        <p>Baseball pitching session analysis and tracking</p>
        <SessionList />
      </main>
    </div>
  );
}
