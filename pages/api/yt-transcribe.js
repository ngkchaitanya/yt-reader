async function handler(req, res) {
  if (req.method === "POST") {
    const data = req.body;
    console.log("API body data: ", data);
    var ytId = data.ytId;
    var lang = data.lang;

    if (!ytId) {
      res.status(200).json({
        success: false,
        errorMsg: "Missing video id",
      });
      return 0;
    }

    var getSubtitles = require("youtube-captions-scraper").getSubtitles;

    getSubtitles({
      videoID: ytId, // youtube video id
      lang: lang ? lang : "en", // default: `en`
    }).then(function (captions) {
      // console.log("captions: ", captions);
      var captionsText = "";
      var punctuatedText = "";
      var time = 25;
      var interval = 25;
      for (const caption of captions) {
        if (caption.text.substr(0, 1) === "*") {
          // do not include
        } else if (caption.text.length <= 1) {
          // do not include
        } else {
          captionsText += " " + caption.text.replace("\n", " ");
          // if (parseInt(caption.start) > time) {
          //   punctuatedText += "\n";
          //   time += interval;
          // }

          // punctuatedText += " " + caption.text;
        }
      }

      captionsText = captionsText.replace("\n", " ");
      // console.log("captions text: ", captionsText);
      // split caption text based on full stops
      if (captionsText) {
        var captionSentencesArr = captionsText.split(". ");
        var sentenceCount = 0;
        var sentenceLimitCount = 4;
        var sentenceInterval = 4;
        if (captionSentencesArr && captionSentencesArr.length) {
          for (const sentence of captionSentencesArr) {
            punctuatedText += sentence;
            punctuatedText += ". ";

            if (sentenceCount > sentenceLimitCount) {
              punctuatedText += "\n";
              sentenceLimitCount += sentenceInterval;
            }
            sentenceCount++;
          }
        }
      }

      captionsText = captionsText.trim();
      punctuatedText = punctuatedText.trim();
      // console.log("CaptionsText: ", captionsText);

      res.status(200).json({
        success: true,
        subs: "text from API",
        captions: captions,
        transcript: captionsText,
        punctuatedTranscript: punctuatedText,
      });
    });
  }
}

export default handler;
