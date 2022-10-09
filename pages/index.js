import Head from "next/head";
import Image from "next/image";
import { useRef } from "react/cjs/react.development";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  const ytLink = useRef("");

  const onLinkSubmit = () => {
    var link = ytLink.current.value;
    ytLink.current.value = "";
    console.log(link);
    if (!link) {
      alert("Pls. provide a valid link");
      return;
    }

    var url = new URL(link);
    var ytId = url.searchParams.get("v");
    console.log(ytId);
    router.push("/v/" + ytId);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Youtube Transcript Reader</title>
        <meta name="description" content="Read the youtube video" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.leftContainer}>
          <div className={styles.titleContainer}>
            <h1 className={styles.title}>Welcome to YT Reader</h1>
            <h2 className={styles.subTitle}>
              Read the youtube transcript at a glance
            </h2>
          </div>

          <div className={styles.bottomContainer}>
            <p className={styles.description}>Paste the Youtube link below</p>
            <div>
              <input
                className={styles.input}
                type={"text"}
                ref={ytLink}
                placeholder="link goes here..."
              />
              <button className={styles.primaryCTA} onClick={onLinkSubmit}>
                Submit
              </button>
            </div>
          </div>
        </div>
        <div className={styles.rightContainer}>
          <Image src="/video-watch.png" alt="Video" width={600} height={600} />
        </div>
      </main>

      {/* <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer> */}
    </div>
  );
}
