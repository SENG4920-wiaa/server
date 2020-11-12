import React, { Component } from 'react';
import RightSidebar from './RightSidebar'
import { connect } from 'react-redux'

class EffectsSoundBar extends Component {

  render () {

    return (
      <div>
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
