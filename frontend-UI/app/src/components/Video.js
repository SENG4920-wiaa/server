import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone'
import { connect } from 'react-redux'
//https://github.com/NikValdez/react-dropzone-tut/blob/master/src/App.js

const Video = (props) => {

  const [file, setFile] = useState(null)

  const { getRootProps, getInputProps } = useDropzone({
    accept: "video/*",
    maxFiles:1,
    onDrop: (acceptedFiles) => {
      setFile(
        Object.assign(
          acceptedFiles[0], 
          {preview: URL.createObjectURL(acceptedFiles[0])}
        )
      )
    },
  })

  const videos = () => {
    if(file == null) {
      return (
        <p>Drop Video Here</p>
      )
    } else {
      return (
        <div key={file.name}>
          <div>
            <video src={file.preview} className="video-player" controls>
            </video>
          </div>
        </div>
      )
    }
  }

  const updateStore = () => {
    if(file != null) {
      props.updateVideo(file.name, file);
    }
  }

  return (
      <div>
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <div className="drag-drop-zone" width="48" height="48">
            {videos()}
            {updateStore()}
          </div>
        </div>
      </div>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateVideo: (filename, blob) => {
      dispatch( {type: 'UPDATE_VIDEO', filename: filename, blob: blob} )
    }
  }
}

export default connect(null, mapDispatchToProps)(Video)
