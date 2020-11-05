import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone'
import { connect } from 'react-redux'
//https://github.com/NikValdez/react-dropzone-tut/blob/master/src/App.js

const Video = (props) => {

  const [files, setFiles] = useState([])

  const { getRootProps, getInputProps } = useDropzone({
    accept: "video/*",
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      )
    },
  })

  const videos = files.map((file) => (
    <div key={file.name}>
      <div>
        <video src={file.preview} className="video-player" controls>
        </video>
      </div>
    </div>
  ))

  const updateStore = () => (
    files.map((file) => (
      props.updateVideo(file.name, file)
    ))
  )

  return (
      <div>
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <div className="drag-drop-zone" width="48" height="48">
            <p>Drop Video Here</p>
            {videos}
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
