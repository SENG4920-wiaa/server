//code from https://medium.com/javascript-in-plain-english/create-a-reusable-sidebar-component-with-react-d75cf48a053a
import React from 'react';
import '../css/Sidebar.css'

const RightSidebar = (props) => {
  
  const elements = [];

  if(props.effects) {
    for(const word of props.effects) {
      elements.push((<span
        onClick={(e) => props.handleAdd(word, e)}
      >{JSON.stringify(word)}</span>));
    }
  }

  return (
    <div className="effects">
      {elements}
    </div>
  );
};
export default RightSidebar
