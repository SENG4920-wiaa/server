const initState = {
  videoName: null,
  videoBlob: null,
  appliedMusic: {
    url: null,
    start: null,
    volume: null
  },
  appliedEffects: [],
  labels: null,
  labelMusic: null,
  effectsMusic: null,
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
    return {
      ...state,
      labelMusic: action.music
    }
  }
  if (action.type === 'UPDATE_BACKGROUND_SONG'){
    return {
      ...state,
      appliedMusic: {
        url: action.song,
        start: 0,
        volume: 1
      }
    }
  }
  if (action.type === 'UPDATE_EFFECTS_MUSIC'){
    return {
      ...state,
      effectsMusic: action.effects
    }
  }
  if (action.type === 'UPDATE_EFFECTS_SONGS'){
    var effectsList = [];
    for (const song of action.appliedEffects){
      var details = {
        word: song.value.word,
        url: song.value.track,
        start: song.value.start_time,
        end: song.value.end_time,
        volume: 0.5
      }
      effectsList.push(details)
    }
    console.log(effectsList)
    return {
      ...state,
      appliedEffects: effectsList
    }
  }
  return state;
}

export default rootReducer;
