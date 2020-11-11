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

  /* This is true when playback is, by the users account,
  either waiting for network or actually playing. 
  
  We can't just use videoElemDOM.paused because that
  might be true when audio is stalled.
  
  But in other respects this should be the same as
  !videoElemDOM.paused*/
  const [tryingPlay, setTryingPlay] = useState(false);

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

  const stopAllExcept = (except_for) => {
    console.log('<stopAllExcept>');
    console.log(except_for);
    if(videoElemDOM != except_for)
      videoElemDOM.pause();
    
    syncedAudio.forEach(
      (syncedAudio) => {
        console.log(syncedAudio);
        const {audio_element, video_position, audio_start, audio_length} = syncedAudio;
        if(audio_element != except_for)
          audio_element().pause();
      }
    );
    console.log('</stopAllExcept>');
  };

  const areAnyStalled = () => {
    /* Determine if any of audio or video is stalled*/
    if(videoElemDOM.readyState < window.HAVE_FUTURE_DATA) {
      console.info('Video is stalled: State == ' + videoElemDOM.readyState);
    }
    syncedAudio.forEach(
      ({audio_element, video_position, audio_start, audio_length}) => {
        if(audio_element.readyState < window.HAVE_FUTURE_DATA) {
          console.info('Audio is stalled: State == ' + videoElemDOM.readyState);
        }
      }
    )

    return videoElemDOM.readyState < window.HAVE_FUTURE_DATA ||
      syncedAudio.some(
        ({audio_element, video_position, audio_start, audio_length}) =>
          audio_element.readyState < window.HAVE_FUTURE_DATA
      );
  }

  const unstallEvent = (mediaEvent) => {
    /* 
      This function is linked to events when one of the audio or video
      players either:
        Has started playing, after being stalled
         (But I have it setup so that whenever any stall happens,
          all media pauses, so this in reality shouldn't happen), OR
        Has enough data to now start playing
        Or the user has just clicked play,
         (onUserPlayPaused would have already fired, changing tryingPlay)
      
      The job of this is to synchronise everything so that:
        Everything pauses when we're still waiting or not yet playing
        Everything plays when we're not still waiting and we *are* trying to play

    */
    console.log('<unstallEvent'+
    ' tryingPlay='+tryingPlay+
    ' anyStalled='+areAnyStalled()+' >');

    if(!tryingPlay || areAnyStalled()) {
      console.info('Waiting for more data or user to click play');
      stopAllExcept(null);
    } else {
      console.info('Nothing is stalled; playing everything...');
      videoElemDOM.play();
      syncaudioPlaying();
    }
    console.log('</unstallEvent>');
  }

  const stalledEvent = (mediaEvent) => {
    /*
      This function is linked to events when one or more media
      elements doesn't have enough data.

      (This is NOT called when the user pauses the video)

      Its job is to pause everything else
       (And ensure tryingPlay is correct - 
        According to my vision of how this system works,
        tryingPlay should always be true, because if it wasn't,
        then there shouldn't have been any media playing)
    */
    console.log('<stalledEvent'+
      ' tryingPlay='+tryingPlay+
      ' readyState='+mediaEvent.target.readyState+'>');

    if(!tryingPlay) {
      console.warn('A stall occurred but nothing should be playing');
    }
    if(mediaEvent.target.readyState >= window.HAVE_FUTURE_DATA) {
      console.warn('A stall occurred, but the element that stalled has data!');
    }
    stopAllExcept(null);
    console.log('</stalledEvent>');
  }

  const addAudio = (audioSync) => {
    setSyncedAudio(syncedAudio.concat(audioSync));
    audioSync.audio_element().addEventListener('stalled', stalledEvent);
    audioSync.audio_element().addEventListener('playing', unstallEvent);
    audioSync.audio_element().addEventListener('canplay', unstallEvent);
    //syncedAudio has the old length, here in this line,
    //so it is the index at which audioSync was added.
    return syncedAudio.length;
  };

  const onUserVolume = (mediaEvent) => {
    // Volume of video governs volume of all audios
    console.log('<onUserVolume>');
    syncedAudio.forEach(
      ({audio_element, video_position, audio_start, audio_length}) => {
        audio_element.volume = mediaEvent.target.volume;
      }
    );
    console.log('</onUserVolume>');
  }

  const onUserPlayPause = (mediaEvent) => {
    /*
      This function is linked to the play and pause event
      of the Video element ONLY.

      Its purpose is to set the 'tryingPlay' variable according
      to if the user just paused/played the video.

      This function then attempts to start playback if not stalled,
      or stop all playback, depending on if this was a play or pause
      event.
    */
    console.log('<onUserPlayPause'+
      ' tryingPlay='+tryingPlay+
      ' anyStalled='+areAnyStalled()+
      ' paused='+videoElemDOM.paused+' >');

    // Here, we update tryingPlay to reflect !videoElemDOM,
    // but tryingPlay won't be updated in this scope yet.
    setTryingPlay(!videoElemDOM.paused);
    if(!videoElemDOM.paused) {
      // Attempt to start playback again
      // Start playing
      console.log('User tried to play');
      if(!areAnyStalled()) { // But we can't if we're stalled
        console.log('Starting playback');
        videoElemDOM.play();
        syncaudioPlaying();
      } else {
        console.log('Stalled: cannot start playback');
        videoElemDOM.pause();
      }
    } else {
      //Stop playback
      console.log('User tried to pause');
      stopAllExcept(null);
    }
    console.log('</onUserPlayPause>');
  }

  const syncaudioPlaying = () => {
    /*
    To be called periodically, and when start/stop events
    occur, this function corrals the audio elements so that
    they all play/pause and are at the right timestamp.
    */
    const currentTime = videoElemDOM.currentTime;
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
            stopAllExcept();
          }
        } else {
          audio_element().pause();
          audio_element().currentTime = audio_start;
        }
    })
  }

  var videoElemDOM = null;

  const videoElem = (
    <video 
      src={file == null ? null : file.preview} 
      controls
      ref={(e) => {videoElemDOM = e;}}
      className="video-player" 
      onAbort={(e) => console.log('onAbort: ' + e)}
      onCanPlay={unstallEvent}
      onCanPlayThrough={(e) => console.log('onCanPlayThrough: ' + e)}
      onDurationChange={(e) => console.log('onDurationChange: ' + e)}
      onEnded={(e) => console.log('onEnded: ' + e)}
      onLoadedData={(e) => console.log('onLoadedData: ' + e)}
      onLoadedMetadata={(e) => console.log('onLoadedMetadata: ' + e)}
      onLoadStart={(e) => console.log('onLoadStart: ' + e)}
      onLoadstart={(e) => console.log('onLoadstart: ' + e)}
      onPause={onUserPlayPause}
      onPlay={onUserPlayPause}
      onPlaying={unstallEvent}
      onProgress={(e) => console.log('onProgress: ' + e)}
      onRateChange={(e) => console.log('onRateChange: ' + e)}
      onSeeked={(e) => console.log('onSeeked: ' + e)}
      onSeeking={(e) => stopAllExcept(e.target)}
      onStalled={stalledEvent}
      onSuspend={(e) => console.log('onSuspend: ' + e)}
      onVolumeChange={onUserVolume}
      onWaiting={(e) => console.log('onWaiting: ' + e)}
      onTimeUpdate={syncaudioPlaying}
      >
    </video>
  );

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
