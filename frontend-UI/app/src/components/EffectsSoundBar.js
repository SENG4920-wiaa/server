import React, { Component } from 'react';
import RightSidebar from './RightSidebar'

class EffectsSoundBar extends Component {
  state = {
    width : 270,
    height : 100,
    children : ["hell"]
  }
  render () {

    return (
      <div>
        <RightSidebar data={this.state}/>
      </div>
    )
  }
}

export default EffectsSoundBar