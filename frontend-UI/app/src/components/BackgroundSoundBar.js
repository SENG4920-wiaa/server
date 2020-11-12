import React, { Component } from 'react';
import LeftSidebar from './LeftSidebar'
import { connect } from 'react-redux'

class BackgroundSoundBar extends Component {


  handleBackgroundMusic = (selectedOption) => {
    this.props.updateBackgroundMusic(selectedOption.value)
  }

  render () {
    console.log("music")
    if (this.props.music) {
      this.props.music.map(m => console.log(m.label))
    }
    return(
      <div>
        <h5>Background Music</h5>
        <LeftSidebar handleMusic={this.handleBackgroundMusic} music={this.props.music} />
      </div>
    )
  }
}
//<LeftSidebar data={this.state}/>
const mapStateToProps = (state) => {
  return {
    music: state.labelMusic
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateBackgroundMusic: (song) => {
      dispatch( {type: 'UPDATE_BACKGROUND_SONG', song: song} )
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BackgroundSoundBar)
