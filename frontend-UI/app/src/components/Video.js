import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { connect } from 'react-redux'
//https://github.com/NikValdez/react-dropzone-tut/blob/master/src/App.js

const Video = (props) => {
  console.log(props);
  window.setBackgroundAudio = setBackgroundAudio.bind(this);

  const [file, setFile] = useState(null);

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

  const videoRef = useRef(null);

  /*
  Array of
  {
      audio_element: HTML <audio> element,
      video_position: Float within video's runtime
      audio_length: Float within audio_element's runtime 
      audio_start: Float within audio_element's runtime - 
  }
  */
  const [syncedAudio, setSyncedAudio] = useState([]);

  const [audioElements, setAudioElements] = useState([]);

  /* This is true when playback is, by the users account,
  either waiting for network or actually playing. 
  
  We can't just use videoRef.paused because that
  might be true when audio is stalled.
  
  But in other respects this should be the same as
  !videoRef.paused*/
  const [tryingPlay, setTryingPlay] = useState(false);

  const stopAllExcept = (except_for) => {
    console.log('<stopAllExcept>');
    console.log(except_for);
    if(videoRef.current !== except_for)
      videoRef.current.pause();
    
    syncedAudio.forEach(
      (syncedAudio) => {
        console.log(syncedAudio);
        const {audio_element, ...rest} = syncedAudio;
        if(audio_element !== except_for)
          audio_element().pause();
      }
    );
    if(backgroundAudio != null && backgroundAudio != except_for)
      backgroundAudio.pause();
    console.log('</stopAllExcept>');
  };

  const areAnyStalled = () => {
    /* Determine if any of audio or video is stalled*/
    if(videoRef.current.readyState < window.HAVE_FUTURE_DATA) {
      console.info('Video is stalled: State == ' + videoRef.current.readyState);
    }
    syncedAudio.forEach(
      ({audio_element, ...rest}) => {
        if(audio_element.readyState < window.HAVE_FUTURE_DATA) {
          console.info('Audio is stalled: State == ' + videoRef.current.readyState);
        }
      }
    );

    if(backgroundAudio != null && backgroundAudio.readyState < window.HAVE_FUTURE_DATA) {
      console.info('Music is stalled: State == ' + backgroundAudio.readyState);
    }

    return videoRef.current.readyState < window.HAVE_FUTURE_DATA ||
      (backgroundAudio != null && backgroundAudio.readyState < window.HAVE_FUTURE_DATA) ||
      syncedAudio.some(
        ({audio_element, ...rest}) =>
          audio_element.readyState < window.HAVE_FUTURE_DATA
      );
  };

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
      videoRef.current.play();
      syncaudioPlaying();
    }
    console.log('</unstallEvent>');
  };

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
  };

  const setAudio = (newList) => {
    //Remove all event listeners from old list
    let newAudioElements = audioElements;
    let newSyncedAudio = [];
    const requiredElems = newList.length;
    const existingElems = audioElements.length;

    for(var i = 0; i < existingElems && i < requiredElems; i++) {
      //Repurpose existing audio elements
      newAudioElements[i].src = newList[i].src;


      newSyncedAudio.push({
        audio_element: newAudioElements[i],
        ...newList[i]
      });
    }
    //Create any new required audio elements
    for(var i = existingElems; i < requiredElems; i++) {
      const DOMElem = document.createElement('audio');
      document.body.appendChild(DOMElem);
      DOMElem.addEventListener('stalled', stalledEvent);
      DOMElem.addEventListener('playing', unstallEvent);
      DOMElem.addEventListener('canplay', unstallEvent);
      DOMElem.src = newList[i].src;
      newAudioElements.push(DOMElem);


      newSyncedAudio.push({
        audio_element: DOMElem,
        ...newList[i]
      });
    }
    //Remove unrequired audio elements
    newAudioElements = newAudioElements.splice(
      requiredElems, //Start deleting from
    );

    setAudioElements(newAudioElements);
    setSyncedAudio(newSyncedAudio);
  };

  const userSyncVolume = (mediaEvent) => {
    // Volume of video governs volume of all audios
    console.log('<userSyncVolume>');
    syncedAudio.forEach(
      ({audio_element, ...rest}) => {
        audio_element.volume = mediaEvent.target.volume;
      }
    );
    console.log('</userSyncVolume>');
  };

  const userSyncRate = (mediaEvent) => {
    // Playback rate of video governs rates of all audios
    // same as volume
    console.log('<userSyncRate>');
    syncedAudio.forEach(
      ({audio_element, ...rest}) => {
        audio_element.playbackRate = mediaEvent.target.playbackRate;
      }
    );
    console.log('</userSyncRate>');
  };

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
      ' paused='+videoRef.current.paused+' >');

    // Here, we update tryingPlay to reflect !videoRef,
    // but tryingPlay won't be updated in this scope yet.
    setTryingPlay(!videoRef.current.paused);
    if(!videoRef.current.paused) {
      // Attempt to start playback again
      // Start playing
      console.log('User tried to play');
      if(!areAnyStalled()) { // But we can't if we're stalled
        console.log('Starting playback');
        videoRef.current.play();
        syncaudioPlaying();
      } else {
        console.log('Stalled: cannot start playback');
        videoRef.current.pause();
      }
    } else {
      //Stop playback
      console.log('User tried to pause');
      stopAllExcept(null);
    }
    console.log('</onUserPlayPause>');
  };

  const syncaudioPlaying = () => {
    /*
    To be called periodically, and when start/stop events
    occur, this function corrals the audio elements so that
    they all play/pause and are at the right timestamp.
    */
    const currentTime = videoRef.current.currentTime;
    syncedAudio.forEach(
      ({audio_element, video_position, audio_start, audio_length}) => {
        //Determine if said syncedAudio object is within range
        if(
          currentTime > video_position &&
          currentTime < video_position + (audio_length == -1 ? audio_element.duration : audio_length)
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
  };

  const videoElem = (
    <video 
      src={file === null ? null : file.preview} 
      className="video-player" 
      controls
      ref={videoRef}
      onTimeUpdate={syncaudioPlaying}
      onCanPlay={unstallEvent}
      onPlaying={unstallEvent}
      onStalled={stalledEvent}
      onPlay={onUserPlayPause}
      onPause={onUserPlayPause}
      onRateChange={userSyncRate}
      onVolumeChange={userSyncVolume}
      onSeeking={e => stopAllExcept(e.target)}
      >
    </video>
  );

  const preview = () => {
    if(file === null) {
      return (
        <p>Drop Video Here</p>
      )
    } else {
      return videoElem
    }
  }

  const updateStore = () => {
    if(file !== null) {
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

const mapStateToProps = (state) => {
  return {
    appliedEffects: state.appliedEffects
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateVideo: (filename, blob) => {
      dispatch( {type: 'UPDATE_VIDEO', filename: filename, blob: blob} )
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Video)
