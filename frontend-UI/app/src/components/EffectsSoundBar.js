import React, { Component } from 'react';
import RightSidebar from './RightSidebar'
import { connect } from 'react-redux'

class EffectsSoundBar extends Component {

  handleAddEffects = (selectedElement) => {
    this.props.addEffects({
      src: selectedElement.value,
      video_location:0,
      audio_start:0,
      audio_length:-1,
    });
  }

  render () {
    console.log('effects');
    if(this.props.transcript) {
      this.props.transcript.map(m => console.log(m.label));
    }
    return (
      <div>
        <h5> Sound Effects</h5>
        <RightSidebar handleAdd={handleAddEffects} effects={this.props.effects}></RightSidebar>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    transcript: state.transcript
  }
}

export default connect(mapStateToProps)(EffectsSoundBar)
