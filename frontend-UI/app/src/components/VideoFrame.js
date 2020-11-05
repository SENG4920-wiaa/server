import React, { Component } from 'react';
import Video from './Video'
import { connect } from 'react-redux'
import axios from 'axios'

class VideoFrame extends Component {
  // send api request for transcript and labels

  componentDidUpdate() {
    if (this.props.videoName !== null && this.props.videoBlob !== null) {
      console.log(this.props.videoBlob);
      var blobFile = new File([this.props.videoBlob], this.props.videoName, {type: this.props.videoBlob.type})
      var formData = new FormData();
      formData.append(this.props.videoName, blobFile)
      fetch(`http://127.0.0.1:8000/transcript/${this.props.videoName}`,
        {
          method: 'PUT',
          body: blobFile,
          headers: {
            "Content-Type": 'video/mp4'
          }
        }
      ).then(res => {
        //var transcript = json.annotation_results[0].speech_transcriptions[0].alternatives[0].transcript
        //var words = json.annotation_results[0].speech_transcriptions[0].alternatives[0].words
        // console.log(transcript)
        // console.log(words)
        this.props.updateTranscript(res.json())
      })
      fetch(`http://127.0.0.1:8000/labels/${this.props.videoName}`,
        {
          method: 'PUT',
          body: blobFile,
          headers: {
            "Content-Type": 'video/mp4'
          }
        }
      ).then(res => {
        this.props.updateLabels(res.json())
      })
    }
  }

  render() {
    return (
      <div>
        <Video />
      </div>
    )
  }
}

// return an object representing the store state variables we want this
// component to have access to, in this case videoName and videoBlob
const mapStateToProps = (state) => {
  return {
    videoName: state.videoName,
    videoBlob: state.videoBlob
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateTranscript: (transcript, words) => {
      dispatch( {type: 'UPDATE_TRANSCRIPT', transcript: transcript} )
    },
    updateLabels: (labels) => {
      dispatch( {type: 'UPDATE_LABELS', labels: labels})
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(VideoFrame)
