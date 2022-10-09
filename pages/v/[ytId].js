import React from "react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react/cjs/react.development";
import { useRouter } from "next/router";
import languageCodes from "../../util/languageCodes.json";

import styles from "../../styles/TranscriberPage.module.css";
import Header from "../../components/Header";

export default function TranscriberPage(props) {
  const router = useRouter();
  const APIkey = "AIzaSyBIUnAIVYOyKFZ5KyM6HxV81E6UtYU9g4E";
  const DEFAULT_LANG = "en";

  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(DEFAULT_LANG);
  const [captions, setCaptions] = useState([]);
  const [transcript, setTranscript] = useState([]);
  const [punctuatedTranscript, setPunctuatedTranscript] = useState([]);
  const [displayType, setDisplayType] = useState("CAPTIONS"); // CAPTIONS | TRANSCRIPT | PUNCTUATED
  const [videoName, setVideoName] = useState("");
  const [channelName, setChannelName] = useState("");

  const updateLanguage = (event) => {
    if (router.query.ytId) {
      setSelectedLanguage(event.target.value);
      fetchTranscipt(router.query.ytId, event.target.value);
    } else {
      // @TODO: handle error case
    }
  };

  const fetchTranscipt = useCallback(async (videoId, lang) => {
    const response = await fetch("http://localhost:3000/api/yt-transcribe", {
      method: "POST",
      body: JSON.stringify({
        ytId: videoId,
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
  }, []);

  const fetchCaptionLanguages = useCallback(async (videoId) => {
    const langRes = await fetch(
      "https://youtube.googleapis.com/youtube/v3/captions?part=snippet&videoId=" +
        videoId +
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
  }, []);

  const fetchVideoDetails = useCallback(async (videoId) => {
    const videoRes = await fetch(
      "https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=" +
        videoId +
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
    setChannelName(videoData?.items[0]?.snippet?.channelTitle);
  }, []);

  useEffect(() => {
    console.log("--USEEFFECT REG---");
    if (router.query.ytId) {
      console.log("--USEEFFECT IN---");
      fetchCaptionLanguages(router.query.ytId);
      fetchVideoDetails(router.query.ytId);
      fetchTranscipt(router.query.ytId, DEFAULT_LANG);
    }

    return () => {
      console.log("unmounting");
    };
  }, [
    router.query.ytId,
    fetchTranscipt,
    fetchCaptionLanguages,
    fetchVideoDetails,
  ]);

  return (
    <>
      <div className={styles.container}>
        <Header />
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
                className={styles.youtubeIFrame}
              ></iframe>
            </div>
            <div className={styles.titleContainer}>
              <div className={styles.videoTitle}>{videoName}</div>
              <div className={styles.channelContainer}>
                <span className={styles.channelLabel}>Channel: </span>
                <span className={styles.channelTitle}>{channelName}</span>
              </div>
              <div>
                {languages && languages.length > 0 && (
                  <div className={styles.languageSelectionContainer}>
                    {/* <div className={styles.languageSelectionLabel}>
                      Pls. select your preferred language
                    </div> */}
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
            {punctuatedTranscript ? (
              <div>
                {/* <div className={styles.transcriptLabel}>Transcript</div> */}
                <div className={styles.transcriptContainer}>
                  <NewlineText text={punctuatedTranscript} />
                </div>
              </div>
            ) : (
              <div className={styles.noTranscript}>No Transcript</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function NewlineText(props) {
  const text = props.text;
  if (props.text && props.text.length) {
    return text.split("\n").map((str, index) => (
      <p className={styles.transcriptText} key={index}>
        {str}
      </p>
    ));
  } else {
    return "";
  }
}
