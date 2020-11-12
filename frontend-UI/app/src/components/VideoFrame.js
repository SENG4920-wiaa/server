import React, { Component } from 'react';
import Video from './Video'
import { connect } from 'react-redux'

class VideoFrame extends Component {
  // send api request for transcript and labels

  async componentDidUpdate() {
    if (this.props.videoName !== null && this.props.videoBlob !== null) {
      console.log(this.props.videoBlob);
      var blobFile = new File([this.props.videoBlob], this.props.videoName, {type: this.props.videoBlob.type})
      var formData = new FormData();
      formData.append(this.props.videoName, blobFile)

      // get labels
      const labelResponse = await fetch(`http://127.0.0.1:8000/labels/${this.props.videoName}`,
        {
          method: 'PUT',
          body: blobFile,
          headers: {
            "Content-Type": 'video/mp4'
          }
        }
      ).then(res => res.json())

      let labels = []
      for (const items of labelResponse.annotation_results[0].segment_label_annotations){
        labels.push(items.entity.description)
      }
      this.props.updateLabels(labels)

      // get label music
      var music = []
      for (const label of labels){
        const musicResponse = await fetch(`http://127.0.0.1:8000/music/?keyword=${label}`,
          {
            method: 'GET',
          }
        ).then(res => res.json())
        if (musicResponse.tracks.length > 0) {
          const element = {
            label: label,
            tracks: musicResponse.tracks
          }
          music.push(element)
        }
      }

      this.props.updateLabelMusic(music)

      const transcriptResponse = await fetch(`http://127.0.0.1:8000/transcript/${this.props.videoName}`,
        {
          method: 'PUT',
          body: blobFile,
          headers: {
            "Content-Type": 'video/mp4'
          }
        }
      ).then(res => res.json())


      let transcript = ""
      let words = []
      for (const items of transcriptResponse.annotation_results[0].speech_transcriptions) {
        const alts = items.alternatives[0]
        transcript = transcript.concat(alts.transcript)
        transcript = transcript.concat(" ")
        for (const w of alts.words) {
          words.push(w)
        }
      }
      this.props.updateTranscript(transcript, words)

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
      dispatch( {type: 'UPDATE_TRANSCRIPT', transcript: transcript, words: words} )
    },
    updateLabels: (labels) => {
      dispatch( {type: 'UPDATE_LABELS', labels: labels})
    },
    updateLabelMusic: (music) => {
      dispatch( {type: 'UPDATE_LABEL_MUSIC', music: music})
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(VideoFrame)
