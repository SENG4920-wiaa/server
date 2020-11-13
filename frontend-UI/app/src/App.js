import React, { Component } from 'react';
import './css/Style.css'

import Navbar from './components/Navbar'
import BackgroundSoundBar from './components/BackgroundSoundBar'
import EffectsSoundBar from './components/EffectsSoundBar'
import VideoFrame from './components/VideoFrame'
import AudioFrame from './components/AudioFrame'
import RenderUpload from './components/RenderUpload'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videoElem: <VideoFrame ref={e => {this.state.refVideo=e;}}/>
    };
  }
  render(){
    return(
      <div className="App">
        <header>
          <div className="header"><Navbar /></div>
        </header>
        <div className="body">
          <div className="rightSidebar"><EffectsSoundBar /></div>
          <div className="leftSidebar"><BackgroundSoundBar /></div>
          <div className="content">
            <RenderUpload />
            {this.state.videoElem}
            <AudioFrame sref={e => {
              window.setBackgroundAudio(e.audioEl.current)
            }} />
          </div>
        </div>
        <footer>
        </footer>
      </div>
    );
  }
}

export default App;
