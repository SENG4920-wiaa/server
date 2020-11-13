import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { connect, useSelector, useDispatch } from 'react-redux'
//https://github.com/NikValdez/react-dropzone-tut/blob/master/src/App.js

const Video = (props) => {
  const store = useSelector(store => store);
  const dispatch = useDispatch();

  const [backgroundAudio, setBackgroundAudio] = useState(null);
  window.setBackgroundAudio = setBackgroundAudio.bind(this);

  const [file, setFile] = useState(null);

  const updateVideo = (filename, blob) => {
    dispatch( {type: 'UPDATE_VIDEO', filename: filename, blob: blob} );
  }

  const { getRootProps, getInputProps } = useDropzone({
    accept: "video/*",
    maxFiles:1,
    onDrop: (acceptedFiles) => {
      setFile(
        Object.assign(
          acceptedFiles[0], 
          {preview: URL.createObjectURL(acceptedFiles[0])}
        )
      );
      updateVideo(acceptedFiles[0].name, acceptedFiles[0]);
    },
  });

  const videoRef = useRef(null);

  /*
  Array of
  {
    url: From words
    start: From words
    volume: From words
    word: From words
    audio_element: HTML <audio> element,
    video_position: Float within video's runtime
    audio_length: Float within audio_element's runtime 
    audio_start: Float within audio_element's runtime - 
  }
  */
  const syncedAudio = useRef([]);

  /* This is true when playback is, by the users account,
  either waiting for network or actually playing. 
  
  We can't just use videoRef.paused because that
  might be true when audio is stalled.
  
  But in other respects this should be the same as
  !videoRef.paused*/
  const tryingPlay = useRef(false);
  /*
  True when play() or pause() are called 
  on the videoElem from THIS CODE instead of the userpurposely
  */
  const changingState = useRef(false);

  const stopAllExcept = (except_for) => {
    if(videoRef.current !== except_for)
      videoRef.current.pause();
    
    syncedAudio.current.forEach(
      (syncedAudio) => {
        console.log(syncedAudio);
        const {audio_element, ...rest} = syncedAudio;
        if(audio_element !== except_for)
          audio_element.pause();
      }
    );
    if(backgroundAudio != null && backgroundAudio != except_for)
      backgroundAudio.pause();
  };

  const areAnyStalled = () => {
    /* Determine if any of audio or video is stalled*/
    if(videoRef.current.readyState < 2 /*HAVE_CURRENT_DATA*/) {
      console.info('Video is stalled: State == ' + videoRef.current.readyState);
    }
    syncedAudio.current.forEach(
      ({audio_element, ...rest}) => {
        if(audio_element.readyState < 2 /*HAVE_CURRENT_DATA*/) {
          console.info('Audio is stalled: State == ' + audio_element.readyState);
        }
      }
    );

    if(backgroundAudio != null && backgroundAudio.src != '' && backgroundAudio.readyState < 2 /*HAVE_CURRENT_DATA*/) {
      console.info('Music is stalled: State == ' + backgroundAudio.readyState);
    }

    return videoRef.current.readyState < 2 /*HAVE_CURRENT_DATA*/ ||
      (backgroundAudio != null && backgroundAudio.src != '' &&  backgroundAudio.readyState < 2 /*HAVE_CURRENT_DATA*/) ||
      syncedAudio.current.some(
        ({audio_element, ...rest}) =>
          audio_element.readyState < 2 /*HAVE_CURRENT_DATA*/
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

    if(!tryingPlay.current || areAnyStalled()) {
      console.info('Waiting for more data or user to click play');
      stopAllExcept(null);
    } else {
      console.info('Nothing is stalled; playing everything...');
      if(videoRef.current.paused) {
        changingState.current = true;
        videoRef.current.play();
        changingState.current = false;
      }
      syncaudioPlaying();
    }
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
    let debug_message = '';

    if(mediaEvent.target == videoElem) {
      debug_message = 'Video';
    } else if(mediaEvent.target == backgroundAudio) {
      debug_message = 'Background music';
    } else {
      let found = false;
      for(const {audio_elem, ...rest} of store.appliedEffects) {
        if(audio_elem == mediaEvent.target) {
          debug_message = JSON.stringify(rest);
          found = true;
          break;
        }
      }
      if(!found) {
        debug_message = mediaEvent.target;
      }
    }

    if(!tryingPlay.current) {
      console.warn('A stall occurred but nothing should be playing');
    }
    if(mediaEvent.target.readyState >= 2 /*HAVE_CURRENT_DATA*/) {
      console.warn('A stall occurred, but the element that stalled has data!');
    }
    if(mediaEvent.target.timestamp == mediaEvent.target.duration) {
      console.info(debug_message + " stalled, but finished");
      return;
    } else {
      console.info(debug_message + " stalled");
      stopAllExcept(null);
    }
  };

  const getAudioElements = () => {
    const newList = store.appliedEffects;

    let accounted_for_audios = [];

    //Additions from newList into syncedAudio
    for(const word_props of newList) {

      // console.log("Checking ", word_props);
      //Find an existing syncedElement that exactly matches
      let corresponding_audio_obj = syncedAudio.current.find(
        audio_props => {
          const result = audio_props.start == word_props.start &&
            audio_props.url == word_props.url &&
            audio_props.volume == word_props.volume &&
            audio_props.word == word_props.word;
          // console.log(" Against ", audio_props, result);
          return result;
        }
      );

      if(corresponding_audio_obj === undefined) {
        //This list element is new
        console.info(" New audio element: " + JSON.stringify(word_props));
        const DOMElem = document.createElement('audio');
        document.getElementById("root").appendChild(DOMElem);
        DOMElem.addEventListener('stalled', stalledEvent);
        DOMElem.addEventListener('playing', unstallEvent);
        DOMElem.addEventListener('canplay', unstallEvent);
        DOMElem.src = word_props.url;
        DOMElem.controls = true;

        corresponding_audio_obj = {
          audio_element: DOMElem,
          audio_start:  0,
          audio_length: -1,
          video_position: word_props.start.slice(0,-1) - 0, //Convert to seconds numeral
          ...word_props
        }
        syncedAudio.current.push(corresponding_audio_obj);
      //   console.log(" Corresponds to ", corresponding_audio_obj);
      // } else {
      //   console.log(" Corresponds to ", corresponding_audio_obj);
      }

      accounted_for_audios.push(corresponding_audio_obj);
    }
    //Deletions from syncedAudio
    for(var i = syncedAudio.current.length-1;i>=0;i--) {
      const audio_props = syncedAudio.current[i];
      // console.log("DChecking ", audio_props);
      //Find an existing syncedElement that exactly matches
      let corresponding_new_obj = syncedAudio.current.find(
        word_props => {
          const result = audio_props.start == word_props.start &&
            audio_props.url == word_props.url &&
            audio_props.volume == word_props.volume &&
            audio_props.word == word_props.word;
          // console.log(" Against ", audio_props, result);
          return result;
        }
      );

      if(corresponding_new_obj === undefined) {
        console.info(" Removed audio element: " + JSON.stringify(audio_props));
        document.body.removeChild(audio_props.audio_element);
        //Delete 1 element at index i
        syncedAudio.current = syncedAudio.current.splice(i, 1);
      // } else {
      //   console.log(" Corresponds ", corresponding_new_obj);
      }
    }


    //Remove all event listeners from old list
    // let newAudioElements = audioElements;
    // let newSyncedAudio = [];
    // const requiredElems = newList.length;
    // const existingElems = audioElements.length;

    // for(var i = 0; i < existingElems && i < requiredElems; i++) {
    //   //Repurpose existing audio elements
    //   newAudioElements[i].src = newList[i].src;


    //   newSyncedAudio.push({
    //     audio_element: newAudioElements[i],
    //     ...newList[i]
    //   });
    // }
    // //Create any new required audio elements
    // for(var i = existingElems; i < requiredElems; i++) {
    //   const DOMElem = document.createElement('audio');
    //   document.body.appendChild(DOMElem);
    //   DOMElem.addEventListener('stalled', stalledEvent);
    //   DOMElem.addEventListener('playing', unstallEvent);
    //   DOMElem.addEventListener('canplay', unstallEvent);
    //   DOMElem.src = newList[i].src;
    //   newAudioElements.push(DOMElem);


    //   newSyncedAudio.push({
    //     audio_element: DOMElem,
    //     ...newList[i]
    //   });
    // }
    // //Remove unrequired audio elements
    // newAudioElements = newAudioElements.splice(
    //   requiredElems, //Start deleting from
    // );

    // setAudioElements(newAudioElements);
    // setSyncedAudio(newSyncedAudio);

    // return newAudioElements;
  };

  const userSyncVolume = (mediaEvent) => {
    // Volume of video governs volume of all audios
    syncedAudio.current.forEach(
      ({audio_element, volume, ...rest}) => {
        audio_element.volume = Math.min(1, mediaEvent.target.volume * (volume.slice(0,-1)-0));
      }
    );
  };

  const userSyncRate = (mediaEvent) => {
    // Playback rate of video governs rates of all audios
    // same as volume
    syncedAudio.current.forEach(
      ({audio_element, ...rest}) => {
        audio_element.playbackRate = mediaEvent.target.playbackRate;
      }
    );
    if(backgroundAudio != null) {
      backgroundAudio.playbackRate = mediaEvent.target.playbackRate;
    }
  };

  const onUserPlay = (mediaEvent) => {
    /*
      This function is linked to the play and pause event
      of the Video element ONLY.

      Its purpose is to set the 'tryingPlay' variable according
      to if the user just paused/played the video.

      This function then attempts to start playback if not stalled,
      or stop all playback, depending on if this was a play or pause
      event.
    */
    if(changingState.current) {
      console.log("Ignoring play event");
      return;
    }

    // Here, we update tryingPlay to reflect !videoRef,
    // but tryingPlay won't be updated in this scope yet.
    tryingPlay.current = true;
    // Attempt to start playback again
    // Start playing
    console.log('User tried to play');
    if(!areAnyStalled()) { // But we can't if we're stalled
      console.log('Starting playback');
      // videoRef.current.play();
      syncaudioPlaying();
    } else {
      console.log('Stalled: cannot start playback');
      changingState.current = true;
      videoRef.current.pause();
      changingState.current = false;
    }
  };

  const onUserPause = (mediaEvent) => {
    /*
      This function is linked to the play and pause event
      of the Video element ONLY.

      Its purpose is to set the 'tryingPlay' variable according
      to if the user just paused/played the video.

      This function then attempts to start playback if not stalled,
      or stop all playback, depending on if this was a play or pause
      event.
    */
    if(changingState.current) {
      console.log("Ignoring pause event");
    }
    // Here, we update tryingPlay to reflect !videoRef,
    // but tryingPlay won't be updated in this scope yet.
    tryingPlay.current = false;
    //Stop playback
    console.log('User tried to pause');
    stopAllExcept(null);
  };

  const syncaudioPlaying = () => {
    /*
    To be called periodically, and when start/stop events
    occur, this function corrals the audio elements so that
    they all play/pause and are at the right timestamp.
    */
    const currentTime = videoRef.current.currentTime;
    syncedAudio.current.forEach(
      ({audio_element, video_position, audio_start, audio_length, ...rest}) => {
        //Determine if said syncedAudio object is within range
        if(
          currentTime > video_position &&
          currentTime < video_position + (audio_length == -1 ? audio_element.duration : audio_length)
        ) {
          // Set to correct time
          const time_within_play_length = currentTime - video_position;
          const time_within_audio = time_within_play_length + audio_start;

          const time_diff = time_within_audio - audio_element.currentTime;

          if(time_diff > 0.001 || time_diff < -0.001 || audio_element.paused) {

            try {
              audio_element.currentTime = time_within_audio;
              // The audio should play, but I think the browser
              // if it needed to stall here, would still trigger the stall event
              if(audio_element.paused) {
                console.log("Starting " + audio_element.src);
              }
              audio_element.play();
            } catch(exception) {
              console.error(exception);
              stopAllExcept();
            }
          }
        } else {
          if(!audio_element.paused) {
            console.log("Stopping " + audio_element.src);
            audio_element.pause();
            audio_element.currentTime = audio_start;
          }
        }
    });

    //Background starts from beginning
    if(backgroundAudio != null && currentTime < backgroundAudio.duration) {
      try {
        backgroundAudio.currentTime = currentTime;
        backgroundAudio.play();
      } catch(exception) {
        console.error(exception);
        stopAllExcept();
      }
    } else if(backgroundAudio != null && currentTime >= backgroundAudio.duration) {
      backgroundAudio.pause();
      backgroundAudio.currentTime = 0;
    }
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
      onPlay={onUserPlay}
      onPause={onUserPause}
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

  return (
      <div>
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <div className="drag-drop-zone" width="48" height="48">
            {preview()}
            {getAudioElements()}
          </div>
        </div>
      </div>
  );
}

export default Video
