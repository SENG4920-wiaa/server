import React, { Component } from 'react';
import LeftSidebar from './LeftSidebar'
import { connect } from 'react-redux'

class BackgroundSoundBar extends Component {
  state = {
    children : [],
    elements: []
  }

  componentDidUpdate() {
    if (this.props.labels !== []){
      for (const label of this.props.labels){
        fetch(`http://127.0.0.1:8000/music/?keyword=${label}`,
          {
            method: 'GET',
          }
        ).then(res => res.json()
        ).then(data => {
          if (data.tracks.length > 0) {
            const element = {
              label: label,
              tracks: data.tracks
            }
            this.state.elements.push(element)
          }
          }
        )
      }
    }

  }



  render () {
    this.state.children = this.state.elements.map(element => {
      return (
        <div className="label">
          <div>label: {element.label}</div>
          <div>tracks: {element.tracks} </div>
        </div>
      )
    })
    return (
      <div>
        { this.state.children }
      </div>
    )
  }
}
//<LeftSidebar data={this.state}/>
const mapStateToProps = (state) => {
  return {
    labels: state.labels
  }
}

export default connect(mapStateToProps, null)(BackgroundSoundBar)
