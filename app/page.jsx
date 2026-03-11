"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await fetch("/api/history");
      const data = await res.json();
      if (data.success) setHistories(data.histories);
      setLoading(false);
    };

    fetchHistory();
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Welcome to Sum-Up</h1>
          <p>
            Your study assistant that helps turn your study materials into
            insightful summarisations.
          </p>
        </div>
        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href=""
            target="_blank"
            rel="noopener noreferrer"
          >
            Start summarisation
          </a>
        </div>
      </main>
    </div>
  );
}
