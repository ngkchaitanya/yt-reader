import React from "react";
import Link from "next/link";
import styles from "../styles/Header.module.css";

export default function Header() {
  return (
    <div className={styles.headerContainer}>
      <Link href={"/"}>
        <a className={styles.logoText}>{"YT Reader"}</a>
      </Link>
    </div>
  );
}
