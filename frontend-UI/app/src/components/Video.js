import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone'
import { connect } from 'react-redux'
//https://github.com/NikValdez/react-dropzone-tut/blob/master/src/App.js

const Video = (props) => {
  console.log(props);
  const [file, setFile] = useState(null);
  const [syncedAudio, setSyncedAudio] = useState([
    {
      audio_element: props.test_audio,
      video_position:4,
      audio_start:15,
      audio_length:3
    }
  ]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: "video/*",
    maxFiles:1,
    onDrop: (acceptedFiles) => {
      setFile(
        Object.assign(
          acceptedFiles[0], 
          {preview: URL.createObjectURL(acceptedFiles[0])}
        )
      )
    },
  });

  // let videoElem = null; //Forward declared; used later.

  const stopAllElements = () => {
    videoElemDOM.pause();
    syncedAudio.forEach(
      (syncedAudio) => {
        console.log(syncedAudio);
        const {audio_element, video_position, audio_start, audio_length} = syncedAudio;
        audio_element().pause();
      }
    );
  };

  const addAudio = (audioSync) => {
    setSyncedAudio(syncedAudio.concat(audioSync));
    audioSync.audio_element().addEventListener('waiting', stopAllElements)
  };

  const timeUpdate = (event) => {
    syncaudioPlaying();
  }

  const syncaudioPlaying = () => {
    const currentTime = videoElemDOM.currentTime;
    console.log("Current time: " + videoElemDOM.currentTime);
    syncedAudio.forEach(
      ({audio_element, video_position, audio_start, audio_length}) => {
        //Determine if said syncedAudio object is within range
        if(
          currentTime > video_position &&
          currentTime < video_position + audio_length
        ) {
          // Set to correct time
          const time_within_play_length = currentTime - video_position;
          const time_within_audio = time_within_play_length + audio_start;

          try {
            audio_element().currentTime = time_within_audio;
            // The audio should play, but I think the browser
            // if it needed to stall here, would still trigger the stall event
            audio_element().play();
          } catch(exception) {
            console.error(exception);
            stopAllElements();
          }
        } else {
          audio_element().pause();
          audio_element().currentTime = 0;
        }
    })
  }

  const onPlay = () => {
    // The user clicked play
    // Ensure that all synced audios are in the right place
    syncaudioPlaying();
  } 

  const preview = () => {
    if(file == null) {
      return (
        <p>Drop Video Here</p>
      )
    } else {
      return videoElem
    }
  }

  const updateStore = () => {
    if(file != null) {
      props.updateVideo(file.name, file);
    }
  }

  var videoElemDOM = null;

  const videoElem = (
    <video 
      src={file == null ? null : file.preview} 
      controls
      ref={(e) => {videoElemDOM = e;}}
      className="video-player" 
      onAbort={(e) => console.log('onAbort: ' + e)}
      onCanPlay={(e) => console.log('onCanPlay: ' + e)}
      onCanPlayThrough={(e) => console.log('onCanPlayThrough: ' + e)}
      onDurationChange={(e) => console.log('onDurationChange: ' + e)}
      onEnded={(e) => console.log('onEnded: ' + e)}
      onLoadedData={(e) => console.log('onLoadedData: ' + e)}
      onLoadedMetadata={(e) => console.log('onLoadedMetadata: ' + e)}
      onLoadStart={(e) => console.log('onLoadStart: ' + e)}
      onLoadstart={(e) => console.log('onLoadstart: ' + e)}
      onPause={(e) => console.log('onPause: ' + e)}
      onPlay={(e) => console.log('onPlay: ' + e)}
      onPlaying={(e) => console.log('onPlaying: ' + e)}
      onProgress={(e) => console.log('onProgress: ' + e)}
      onRateChange={(e) => console.log('onRateChange: ' + e)}
      onSeeked={(e) => console.log('onSeeked: ' + e)}
      onSeeking={(e) => console.log('onSeeking: ' + e)}
      onStalled={(e) => console.log('onStalled: ' + e)}
      onSuspend={(e) => console.log('onSuspend: ' + e)}
      // onTimeUpdate={(e) => console.log('onTimeUpdate: ' + e)}
      onVolumeChange={(e) => console.log('onVolumeChange: ' + e)}
      onWaiting={(e) => console.log('onWaiting: ' + e)}
      onTimeUpdate={timeUpdate}
      >
    </video>
  );

  return (
      <div>
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <div className="drag-drop-zone" width="48" height="48">
            {preview()}
            {updateStore()}
          </div>
        </div>
      </div>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateVideo: (filename, blob) => {
      dispatch( {type: 'UPDATE_VIDEO', filename: filename, blob: blob} )
    }
  }
}

const mapStateToProps = (state) => {
  return {
    timestamp: state
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Video)
