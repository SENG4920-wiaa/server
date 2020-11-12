import React, { Component } from 'react';
import { connect } from 'react-redux'
import ReactAudioPlayer from 'react-audio-player';

class AudioFrame extends Component {


  render() {
    return (
      <div>
      <ReactAudioPlayer
        src={this.props.appliedMusic.url}
        autoPlay
        controls
      />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    appliedMusic: state.appliedMusic
  }
}

export default connect(mapStateToProps)(AudioFrame)
