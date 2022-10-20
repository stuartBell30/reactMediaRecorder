import "./styles.css";
import { ReactMediaRecorderr, useReactMediaRecorder } from "./rebuild";
import React, { useEffect, useRef, useState } from "react";
import SVGInline from "react-svg-inline";

const RecorderState = {
  IDLE : "IDLE",
  TURNING_CAMERA_ON : "TURNING_CAMERA_ON",
  CAMERA_ON : "CAMERA_ON",
  COUNTING_DOWN : "COUNTING_DOWN",
  RECORDING : "RECORDING"
}

const icon = `
<svg width="210px" height="150px" viewBox="0 0 210 150" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
    <g transform="translate(-915.000000, -356.000000)" fill="#4D4D4D" fill-rule="nonzero">
      <path d="M1117.31284,419.636364 C1117.31284,417.512192 1119.03367,415.79021 1121.15642,415.79021 C1123.27917,415.79021 1125,417.512192 1125,419.636364 C1125,447.023515 1111.3017,469.453876 1087.80267,485.191015 C1067.98313,498.464025 1042.15567,506 1019.49682,506 C996.229145,506 970.976604,499.222345 951.727522,486.61975 C928.403996,471.349569 915,448.691655 915,419.636364 C915,417.512192 916.720828,415.79021 918.843578,415.79021 C920.966327,415.79021 922.687155,417.512192 922.687155,419.636364 C922.687155,445.976297 934.696662,466.276987 955.936236,480.18278 C973.867198,491.922388 997.657898,498.307692 1019.49682,498.307692 C1040.66212,498.307692 1064.99852,491.20678 1083.52721,478.798245 C1105.01628,464.407157 1117.31284,444.272084 1117.31284,419.636364 Z M1079.57501,381.174825 C1072.62783,381.174825 1066.99602,375.539249 1066.99602,368.587413 C1066.99602,361.635577 1072.62783,356 1079.57501,356 C1086.52218,356 1092.15399,361.635577 1092.15399,368.587413 C1092.15399,375.539249 1086.52218,381.174825 1079.57501,381.174825 Z M962.870012,381.174825 C955.922833,381.174825 950.291031,375.539249 950.291031,368.587413 C950.291031,361.635577 955.922833,356 962.870012,356 C969.817192,356 975.448993,361.635577 975.448993,368.587413 C975.448993,375.539249 969.817192,381.174825 962.870012,381.174825 Z"></path>
    </g>
  </g>
</svg>
`;

function VideoPreview({ stream }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) {
    return null;
  }

  return <video id="video-view" ref={videoRef} autoPlay />;
}

export default function App() {
  const [svgBGIcon, setSVGBGIcon] = useState(true);
  const [recorderState, setRecorderState] = useState(RecorderState.IDLE);
  const [audio, setAudio] = useState(true);
  const [video, setVideo] = useState(true);
  const [initialPreviewStream, setInitialPreviewStream] = useState();
  const [countdown, setCountdown] = useState(3);

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    previewStream,
    isAudioMuted,
    clearBlobUrl
  } = useReactMediaRecorder({ audio, video });

  const getInitialPreviewStream = async (constraints) => {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices
        .enumerateDevices()
        .then((mediaDevices) => {
          console.log(mediaDevices);
          const videoDevices = mediaDevices.filter(
            (x) => x.kind === "videoinput"
          );
          const currentDeviceID = videoDevices[0].deviceId;

          //update state.
          //set currentDeviceID.
          //set videoDevicesIDs.

          navigator.mediaDevices
            .getUserMedia(constraints)
            .catch((err) => {
              // there's a bug in chrome in some windows computers where using `ideal` in the constraints throws a NotReadableError
              if (
                err.name === "NotReadableError" ||
                err.name === "OverconstrainedError"
              ) {
                console.warn(
                  `Got ${err.name}, trying getUserMedia again with fallback constraints`
                );
                return navigator.mediaDevices.getUserMedia({
                  audio: true,
                  video: true
                });
              }

              throw err;
            })
            .then((stream) => {
              resolve(stream);
            });
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  };
  //when the record button is clicked
  const handleStartRecordClick = (event) => {
    // startRecording();
    setRecorderState(RecorderState.COUNTING_DOWN);
    // useInterval(() => {});

    //show countdown for 3 secs.
    //make initial preview stream undefined.[depends on how we're previewing]
    //start recording and update status to recording.
    //ui updates to show stop button and timer as RecorderState updates.
    setInterval(() => {
      if (countdown > 0) {
        setCountdown((countdown) => countdown - 1);
      } else {
        setInitialPreviewStream(undefined);
        startRecording();
        setRecorderState(RecorderState.RECORDING);
      }
    }, 1000);
  };
  /**
   * show camera view, with start recording action over it.
   * @param event
   */
  const handleTurnMyCameraOnClick = async (event) => {
    //get initial Preview Stream and set it
    setRecorderState(RecorderState.TURNING_CAMERA_ON);
    //TODO: show loading UI.
    startRecording();
    // const stream = await getInitialPreviewStream({ audio, video });
    // setInitialPreviewStream(stream);
    //TODO: remove loading UI.
    setRecorderState(RecorderState.CAMERA_ON);

    //change content of render actions.
    //replace turn on camera button, with start recording button and message.
    //hide svg-icon background.
    //show the camera-view with the camera turned on and its
    //live feed showing - recording hasn't started yet.
  };

  const getSVGBgIcon = () => {
    return (
      <div className="svg-icon">
        <SVGInline svg={icon} />
      </div>
    );
  };

  const isIdle = () => {
    return recorderState === RecorderState.IDLE;
  };

  const isCameraOn = () => {
    return recorderState === RecorderState.CAMERA_ON;
  };

  const isCountingDown = () => {
    return recorderState === RecorderState.COUNTING_DOWN;
  };

  const getActions = () => {
    console.log(RecorderState[recorderState]);
    const idleActions = (
      <button
        className="turn-on-camera-button"
        onClick={handleTurnMyCameraOnClick}
      >
        Turn my camera ON
      </button>
    );

    const cameraOnActions = (
      <React.Fragment>
        <button
          className="turn-on-camera-button"
          onClick={handleStartRecordClick}
        >
          Record
        </button>
        <p>Press record when ready</p>
      </React.Fragment>
    );

    if (isIdle()) {
      return idleActions;
    }
    if (isCameraOn()) {
      return cameraOnActions;
    }
    return <div></div>;
  };

  const getCountdown = () => {
    return (
      <div className="countdown">
        <span>{countdown}</span>
      </div>
    );
  };

  return (
    <div className="App">
      {
        <div className="recorder-container">
          <div className="recorder-main">
            {isIdle() && getSVGBgIcon()}
            <div className="render-actions">{getActions()}</div>
            {isCountingDown() && getCountdown()}

            <VideoPreview stream={initialPreviewStream || previewStream} />
          </div>
          <p className="upload-file-prompt">
            Or upload a file from your computer
          </p>
        </div>
      }
      {/* <ReactMediaRecorder
        render={({ previewStream }) => {
          return <VideoPreview stream={previewStream} />;
        }}
      /> */}
      {/* <ReactMediaRecorder
        render={({ status, startRecording, stopRecording, mediaBlobUrl }) => {
          return (
            <div>
              <p>{status}</p>
              <button onClick={startRecording}>Start Recording</button>
              <button onClick={stopRecording}>Stop Recording</button>
              <video src={mediaBlobUrl || undefined} controls autoPlay loop />
            </div>
          );
        }}
      /> */}
    </div>
  );
}

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      if (savedCallback.current !== "undefined") {
        savedCallback.current();
      }
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
