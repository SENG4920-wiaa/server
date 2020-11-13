import React, { Component } from 'react';
import RightSidebar from './RightSidebar'
import { connect } from 'react-redux'


class EffectsSoundBar extends Component {

  // selectedOptions is a list of selected values
  // can be multiple 
  handleMultiEffectsMusic = (selectedOptions) => {
    this.props.updateMultiEffectsMusic(selectedOptions)
  }
  render () {
    return (
      <div>
        <h5>Sound Effects</h5>
        <RightSidebar
          handleEffects={this.handleMultiEffectsMusic}
          effects={this.props.effects} />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    effects: state.effectsMusic
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    updateMultiEffectsMusic: (appliedEffects) => {
      dispatch( {type: 'UPDATE_EFFECTS_SONGS', appliedEffects: appliedEffects} )
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EffectsSoundBar)
