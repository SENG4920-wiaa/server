import React, { Component, useEffect } from 'react';
import WindowedSelect from "react-windowed-select";

function LeftSidebar(props){

  const options = [];

  if (props.music){
    for (const element of props.music){
      for (const track of element.tracks){
        const title = track.split('/')[4].replace('/_/g', ' ')
        options.push({
          label: `${element.label} : ${title}`,
          value: track
        });
      }
    }
  }

  return(
    <div className="backgroundMusic">
    <WindowedSelect onChange={props.handleMusic} options={options}/>
    </div>
  )
};
export default LeftSidebar
