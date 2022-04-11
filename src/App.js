import { useState } from 'react';
import axiosInstance from './utils/axios';
import React from 'react';
import FileUploadResponse from './interfaces/FileUploadResponse';
import { ProgressBar } from 'react-bootstrap';

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [progress, setProgress] = useState();
  const [error, setError] = useState();
  const [uploadedFileId, setUploadFileId] = useState();
  const imageTypes = ['image/gif', 'image/jpeg', 'image/png'];
  const [isImage, setIsImage] = useState();

  const imgStyle = {
    width: '100px', // note the capital 'W' here
    height: '100px', // 'ms' is the only lowercase vendor prefix
  };

  const submitHandler = (e) => {
    e.preventDefault(); //prevent the form from submitting
    let formData = new FormData();
    formData.append('files[]', selectedFiles[0]);

    setIsImage(imageTypes.includes(selectedFiles[0]['type']));

    setError('');
    axiosInstance
      .post('https://cdn.everscale.network/method/data.upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (data) => {
          //Set the progress value to show the progress bar
          setProgress(Math.round((100 * data.loaded) / data.total));
          console.log(progress, 'progress');
        },
      })
      .then(function (response) {
        console.log(response, response.data.file_id, 'response');
        setUploadFileId(response.data.file_id);
        console.log(isImage, uploadedFileId, 'uploadedFileId');
      })
      .catch((error) => {
        const { code } = error?.response?.data;
        switch (code) {
          case 'FILE_MISSING':
            setError('Please select a file before uploading!');
            break;
          case 'LIMIT_FILE_SIZE':
            setError('File size is too large. Please upload files below 1MB!');
            break;
          case 'INVALID_TYPE':
            setError(
              'This file type is not supported! Only .png, .jpg and .jpeg files are allowed'
            );
            break;

          default:
            setError('Sorry! Something went wrong. Please try again later');
            break;
        }
      });
  };

  return (
    <form method="post" encType="multipart/form-data" onSubmit={submitHandler}>
      <label>Select a File</label>
      <input
        type="file"
        name="file"
        onChange={(e) => {
          console.log(e.target.files, 'e.target.files');
          setSelectedFiles(e.target.files);
        }}
      />
      <button type="submit" variant="info" type="submit">
        Upload
      </button>
      {error && <div variant="danger">{error}</div>}
      {!error && progress && (
        <div>
          <ProgressBar now={progress} label={`${progress}%`} />
          {`${progress}%`}{' '}
        </div>
      )}
      {uploadedFileId && isImage && (
        <img
          style={imgStyle}
          src={
            'https://cdn.everscale.network/method/get.data?file_id=' +
            uploadedFileId
          }
        />
      )}
      {uploadedFileId && !isImage && (
        <a
          href={
            'https://cdn.everscale.network/method/get.data?file_id=' +
            uploadedFileId
          }
        >
          Download
        </a>
      )}
    </form>
  );
}

export default App;
