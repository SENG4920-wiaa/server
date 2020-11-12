import React, { Component } from 'react';
import RightSidebar from './RightSidebar'
import { connect } from 'react-redux'

class EffectsSoundBar extends Component {

  handleAddEffects = (word, clickEvent) => {
    console.log("Attempting to add word to effects, don't know how to convert");
    console.log(word);
    this.props.addEffects({
      src: "test",
      video_location:0,
      audio_start:0,
      audio_length:-1,
    });
  }

  render () {
    console.log('effects');
    if(this.props.words) {
      this.props.words.map(m => console.log(m.label));
    }
    return (
      <div>
        <h5> Sound Effects</h5>
        <RightSidebar handleAdd={this.handleAddEffects} effects={this.props.words}></RightSidebar>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    // transcript: state.transcript
    words: state.words,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addEffects: (effect_element) => {
      dispatch({type: 'UPDATE_EFFECTS', ...effect_element})
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EffectsSoundBar)
