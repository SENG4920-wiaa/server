import React, { Component, useState } from 'react';
import { useDropzone } from "react-dropzone"
//https://github.com/NikValdez/react-dropzone-tut/blob/master/src/App.js

function Video () {

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

  return (
      <div>
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <div className="drag-drop-zone" width="48" height="48">
            <p>Drop Video Here</p>
            {videos}
          </div>
        </div>
      </div>
  );
}

export default Video
