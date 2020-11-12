//code from https://medium.com/javascript-in-plain-english/create-a-reusable-sidebar-component-with-react-d75cf48a053a
import React from 'react';
import '../css/Sidebar.css'

const RightSidebar = (props) => {
  const { width, height, children } = props.data;
  const diff = window.innerWidth - width;
  const [xPosition, setX] = React.useState(diff);
  console.log("xPosition", xPosition)
  console.log("diff", diff)
  console.log("window", window.innerWidth)
  const toggleMenu = () => {
    if (xPosition < window.innerWidth) {
      setX(window.innerWidth);
    } else {
      setX(diff);
    }
  };

  React.useEffect(() => {
    setX(window.innerWidth);
  }, []);
  return (
    <React.Fragment>
      <div
        className="right-side-bar grey lighten-1"
        style={{
          transform: `translatex(${xPosition}px)`,
          width: `${width}px`,
          minHeight: `${height}vh`
        }}
      >
        <button
          onClick={() => toggleMenu()}
          className="right-toggle-menu grey lighten-1"
          style={{
            transform: `translate(${-width}px, 20vh)`
          }}
        ></button>
        <div className="content">{children}</div>
      </div>
    </React.Fragment>
  );
};
export default RightSidebar
