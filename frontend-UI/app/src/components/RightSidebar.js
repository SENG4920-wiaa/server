//code from https://medium.com/javascript-in-plain-english/create-a-reusable-sidebar-component-with-react-d75cf48a053a
import React from 'react';
import WindowedSelect from "react-windowed-select";

function RightSidebar(props){

  const options = [];
  if (props.effects){
    for (const wordEffects of props.effects){
      for (const track of wordEffects.tracks){
        const title = track.split('/')[4].replace('/_/g', ' ')
        options.push({
          label: `${wordEffects.word} : ${title}`,
          value: {
            word: wordEffects.word,
            track: track,
            start_time: wordEffects.start_time,
            end_time: wordEffects.end_time
          }

        })
      }
    }
  }
  return (
    <div className="effectsMusic">
    <WindowedSelect

      onChange={props.handleEffects}
      options={options}
      isMulti
      closeMenuOnSelect={false}
    />
    </div>
  );
};
export default RightSidebar
