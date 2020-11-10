const initState = {
  videoName: null,
  videoBlob: null,
  appliedMusic: null,
  appliedEffects: [],
  labels: [],
  transcript: "",
  words: []
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
  return state;
}

export default rootReducer;
