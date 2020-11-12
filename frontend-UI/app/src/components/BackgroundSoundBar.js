import React, { Component } from 'react';
import LeftSidebar from './LeftSidebar'

class BackgroundSoundBar extends Component {
  state = {
    width : 270,
    height : 100,
    children : []
  }
  render () {

    return (
      <div>
        <LeftSidebar data={this.state}/>
      </div>
    )
  }
}

export default BackgroundSoundBar
