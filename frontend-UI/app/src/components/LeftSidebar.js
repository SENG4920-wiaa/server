//code from https://medium.com/javascript-in-plain-english/create-a-reusable-sidebar-component-with-react-d75cf48a053a
import React from 'react';
import '../css/Sidebar.css'

const LeftSidebar = (props) => {
  const { width, height, children } = props.data;
  const [xPosition, setX] = React.useState(-width);
  
  const toggleMenu = () => {
    if (xPosition < 0) {
      setX(0);
    } else {
      setX(-width);
    }
  };

  React.useEffect(() => {
    setX(0);
  }, []);
  return (
    <React.Fragment>
      <div
        className="left-side-bar"
        style={{
          transform: `translatex(${xPosition}px)`,
          width: `${width}px`,
          minHeight: `${height}vh`
        }}
      >
        <button
          onClick={() => toggleMenu()}
          className="left-toggle-menu"
          style={{
            transform: `translate(${width}px, 20vh)`
          }}
        ></button>
        <div className="content">{children}</div>
      </div>
    </React.Fragment>
  );
};
export default LeftSidebar
