import React, { Component } from 'react';
import { connect } from 'react-redux'

class RenderUpload extends Component {

  async uploadVideo(){
    if (this.props.videoName !== null && this.props.videoBlob !== null && (this.props.appliedMusic.url !== null || this.props.appliedEffects != null)) {
      var blobFile = new File([this.props.videoBlob], this.props.videoName, {type: this.props.videoBlob.type})
      var formData = new FormData();
      formData.append(this.props.videoName, blobFile)

      //upload video
      const transcriptResponse = await fetch(`http://127.0.0.1:8000/upload/${this.props.videoName}`,
        {
          method: 'POST',
          body: blobFile,
          headers: {
            "Content-Type": 'video/mp4'
          }
        }
      ).then(res => res.json())
      // transcriptResponse contains the videoName with timestamp prepended, used to compile uploaded video
      var effectsList = []
      if (this.props.appliedEffects !== null){
        for (const effect of this.props.appliedEffects){
          effectsList.push(
            {
              url: effect.url,
              start: effect.start,
              volume: effect.volume
            }
          )
        }
      }
      const body = JSON.stringify({
        music: {
          url: this.props.appliedMusic.url,
          start: this.props.appliedMusic.start,
          volume: this.props.appliedMusic.volume
        },
        effects: effectsList
      });

      const compileResponse = await fetch(`http://127.0.0.1:8000/compiled/${transcriptResponse}`,
        {
          method: 'POST',
          body: body,
          headers:{
            'Content-Type' : 'application/json'
          }
        }
      )
      //var contentType = compileResponse.headers["content-type"] || 'application/octet-binary';
      console.log(compileResponse)
      try {
        var blob = new File([compileResponse], 'temp_video.mp4', {type: 'video/mp4'})
        var objectURL = URL.createObjectURL(blob);

        console.log(objectURL)
      } catch (exc) {
        console.log(exc);
      }
    }
  }

  render () {
    return (
      <div>
        <button onClick={() => {this.uploadVideo()}}>
          Render and Download
        </button>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    appliedEffects: state.appliedEffects,
    appliedMusic: state.appliedMusic,
    videoName: state.videoName,
    videoBlob: state.videoBlob
  }
}
export default connect(mapStateToProps)(RenderUpload)
