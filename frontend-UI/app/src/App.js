import React, { Component } from 'react';
import './css/Style.css'

import Navbar from './components/Navbar'
import BackgroundSoundBar from './components/BackgroundSoundBar'
import EffectsSoundBar from './components/EffectsSoundBar'
import Video from './components/Video'

class App extends Component {
  render(){
    return (
      <div className="App">
        <header>
          <div className="header"><Navbar /></div>
        </header>
        <div className="body">
          <div className="rightSidebar"><EffectsSoundBar /></div>
          <div className="leftSidebar"><BackgroundSoundBar /></div>
          <div className="content">
            <Video />
          </div>
        </div>
        <footer>
        </footer>
      </div>
    );
  }
}

export default App;
