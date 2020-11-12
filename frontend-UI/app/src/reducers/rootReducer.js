const initState = {
  videoName: null,
  videoBlob: null,
  appliedMusic: {
    url: null,
    start: null,
    volume: null
  },
  appliedEffects: null,
  labels: null,
  labelMusic: null,
  transcript: null,
  words: null
}

const rootReducer = (state = initState, action) => {
  if (action.type === 'UPDATE_VIDEO') {
    if (state.videoName !== action.filename || state.videoBlob !== action.blob){
      // change state when video file or preview blob changes
      return {
        ...state,
        videoName: action.filename,
        videoBlob: action.blob
      }
    }
  }
  if (action.type === 'UPDATE_TRANSCRIPT'){
    return {
      ...state,
      transcript: action.transcript,
      words: action.words
    }
  }
  if (action.type === 'UPDATE_LABELS'){
    return {
      ...state,
      labels: action.labels
    }
  }
  if (action.type === 'UPDATE_LABEL_MUSIC'){
    console.log(action.music)
    return {
      ...state,
      labelMusic: action.music
    }
  }
  if (action.type === 'UPDATE_BACKGROUND_SONG'){
    console.log(action.song)
    return {
      ...state,
      appliedMusic: {
        url: action.song,
        start: 0,
        volume: 1
      }
    }
  }
  if (action.type === 'UPDATE_EFFECTS') {
    return {
      ...state,
      appliedEFfects: state.appliedEffects.concat([{
        src: action.src,
        video_location: action.video_location,
        audio_start: action.audio_start,
        audio_length: action.audio_length
      }])
    }
  }
  return state;
}

export default rootReducer;
