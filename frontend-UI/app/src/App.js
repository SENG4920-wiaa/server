import React, { Component } from 'react';
import './css/Style.css'

import Navbar from './components/Navbar'
import BackgroundSoundBar from './components/BackgroundSoundBar'
import EffectsSoundBar from './components/EffectsSoundBar'
import VideoFrame from './components/VideoFrame'
import AudioFrame from './components/AudioFrame'

const App = (props) => {
  return (
    <div className="App">
      <header>
        <div className="header"><Navbar /></div>
      </header>
      <div className="body">
        <div className="rightSidebar"><EffectsSoundBar /></div>
        <div className="leftSidebar"><BackgroundSoundBar /></div>
        <div className="content">
          <VideoFrame />
          <AudioFrame />
        </div>
      </div>
      <footer>
      </footer>
    </div>
  );
}

export default App;
