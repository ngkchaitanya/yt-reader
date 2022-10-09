import React from "react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react/cjs/react.development";
import { useRouter } from "next/router";
import languageCodes from "../util/languageCodes.json";

import styles from "../styles/TranscriberPage.module.css";
import Link from "next/link";

export default function TranscriberPage(props) {
  const router = useRouter();
  const DEFAULT_LANG = "en";

  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(DEFAULT_LANG);
  const [captions, setCaptions] = useState([]);
  const [transcript, setTranscript] = useState([]);
  const [punctuatedTranscript, setPunctuatedTranscript] = useState([]);
  const [displayType, setDisplayType] = useState("CAPTIONS"); // CAPTIONS | TRANSCRIPT | PUNCTUATED
  const [videoName, setVideoName] = useState("");

  const updateLanguage = (event) => {
    setSelectedLanguage(event.target.value);
    fetchTranscipt(event.target.value);
  };

  const fetchTranscipt = useCallback(
    async (lang) => {
      var ytId = router.query.ytId;
      const response = await fetch("http://localhost:3000/api/yt-transcribe", {
        method: "POST",
        body: JSON.stringify({
          ytId: ytId,
          lang: lang,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      // @TODO
      // or any error
      if (!data.captions) {
        console.log("error while fetching captions");
      }
      setCaptions(data.captions);
      setTranscript(data.transcript);
      setPunctuatedTranscript(data.punctuatedTranscript);
    },
    [router.query.ytId]
  );

  useEffect(() => {
    async function fetchCaptionLanguages() {
      let APIkey = "AIzaSyBIUnAIVYOyKFZ5KyM6HxV81E6UtYU9g4E";
      const langRes = await fetch(
        "https://youtube.googleapis.com/youtube/v3/captions?part=snippet&videoId=" +
          router.query.ytId +
          "&key=" +
          APIkey,
        {
          method: "GET",
          headers: {
            // Authorization: accessToeken,
            "Content-Type": "application/json",
          },
        }
      );

      const langData = await langRes.json();
      console.log("----- LANG -----");
      if (langData && langData.items) {
        console.log("----- LANG LENGTH -----");
        let langOptions = [];
        for (const item of langData.items) {
          let languageCode = item.snippet.language;
          let codeObj = languageCodes.find(
            (element) => element.code === languageCode
          );
          if (codeObj) {
            langOptions.push(codeObj);
          }
        }

        langOptions = langOptions.filter(function (value, index, array) {
          return array.indexOf(value) === index;
        });
        // console.log("langoptions: ", langOptions);
        setLanguages(langOptions);
        console.log("langData: ", langData);
      }
      // console.log("langData: ", langData);
    }

    async function fetchVideoDetails() {
      let APIkey = "AIzaSyBIUnAIVYOyKFZ5KyM6HxV81E6UtYU9g4E";
      const videoRes = await fetch(
        "https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=" +
          router.query.ytId +
          "&key=" +
          APIkey,
        {
          method: "GET",
          headers: {
            // Authorization: accessToeken,
            "Content-Type": "application/json",
          },
        }
      );

      const videoData = await videoRes.json();
      console.log("videoData: ", videoData);
      setVideoName(videoData?.items[0]?.snippet?.title);
    }

    console.log("--USEEFFECT REG---");
    if (router.query.ytId) {
      console.log("--USEEFFECT IN---");
      fetchCaptionLanguages();
      fetchVideoDetails();
    }

    return () => {
      console.log("unmounting");
    };
  }, [router.query.ytId]);

  useEffect(() => {
    console.log("--------INITIAL-----------");
    fetchTranscipt(DEFAULT_LANG);
    console.log("LANG CODES: ", languageCodes.length);

    return () => {
      console.log("unmounting en load data useeffect");
    };
  }, [fetchTranscipt]);

  return (
    <>
      <div className={styles.container}>
        <div>
          <Link href={"/"}>{"< Home"}</Link>
          <hr></hr>
        </div>
        <div className={styles.bodyContainer}>
          <div className={styles.topContainer}>
            <div className={styles.youtubeVideoContaner}>
              <iframe
                width="100%"
                height="200"
                src={"https://www.youtube.com/embed/" + router.query.ytId}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className={styles.titleContainer}>
              <div className={styles.videoTitle}>{videoName}</div>
              <div>
                {languages && languages.length > 0 && (
                  <div className={styles.languageSelectionContainer}>
                    <div className={styles.languageSelectionLabel}>
                      Pls. select your preferred language
                    </div>
                    <select
                      id="languageSelection"
                      onChange={updateLanguage}
                      value={selectedLanguage}
                      className={styles.languageSelect}
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={styles.bottomContainer}>
            <div>
              <button onClick={() => setDisplayType("CAPTIONS")}>
                Captions
              </button>
              <button onClick={() => setDisplayType("TRANSCRIPT")}>
                Transcript
              </button>
              <button onClick={() => setDisplayType("PUNCTUATED")}>
                Punctuated Transcript
              </button>
            </div>
            <div>
              {displayType === "CAPTIONS" ? (
                <div>
                  {captions ? (
                    <div>
                      {captions.map((caption) => (
                        <div className={styles.caption} key={caption.start}>
                          <div>{caption.start}</div>
                          <div>{caption.text}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>No captions</div>
                  )}
                </div>
              ) : displayType === "TRANSCRIPT" ? (
                <div>
                  {transcript ? (
                    <div>{transcript}</div>
                  ) : (
                    <div>No transcript</div>
                  )}
                </div>
              ) : displayType === "PUNCTUATED" ? (
                <div>
                  {punctuatedTranscript ? (
                    <NewlineText text={punctuatedTranscript} />
                  ) : (
                    <div>No transcript</div>
                  )}
                </div>
              ) : (
                <div>Third display type</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function NewlineText(props) {
  const text = props.text;
  if (props.text && props.text.length) {
    return text.split("\n").map((str, index) => <p key={index}>{str}</p>);
  } else {
    return "";
  }
}

// export async function getServerSideProps(context) {
//   const req = context.req;
//   const res = context.res;
//   const query = context.query;

//   // fetch data from API
//   console.log("query: ", query);
//   var ytId = query.ytId;

//   if (!ytId || ytId.length <= 0) {
//     alert("issue");
//   }

//   // make API to fetch subs
//   // TODO: update this
//   const response = await fetch("http://localhost:3000/api/yt-transcribe", {
//     method: "POST",
//     body: JSON.stringify({
//       ytId: ytId,
//     }),
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });

//   const data = await response.json();
//   // console.log(data);

//   // @TODO: handle error cases

//   return {
//     props: {
//       ytId: ytId,
//       subs: data.subs,
//       captions: data.captions,
//     },
//   };
// }
