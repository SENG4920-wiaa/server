import React, { Component } from 'react';
import './css/Style.css'

import Navbar from './components/Navbar'
import BackgroundSoundBar from './components/BackgroundSoundBar'
import EffectsSoundBar from './components/EffectsSoundBar'
import VideoFrame from './components/VideoFrame'
import AudioFrame from './components/AudioFrame'

const App = (props) => {
  let testAudioDOM;

  const testAudio = (<audio
      id="test-audio"
      src="http://10.42.0.72/Downloads/bobby-flying.mov"
      controls
      ref={(e) => testAudioDOM = e}
    >
      Your browser does not support Audio
    </audio>
  );

  return (
    <div className="App">
      <header>
        <div className="header"><Navbar /></div>
      </header>
      <div className="body">
        <div className="rightSidebar"><EffectsSoundBar /></div>
        <div className="leftSidebar"><BackgroundSoundBar /></div>
        <div className="content">
          <VideoFrame test_audio={() => testAudioDOM} />
          <AudioFrame />
          {testAudio}
        </div>
      </div>
      <footer>
      </footer>
    </div>
  );
}

export default App;
