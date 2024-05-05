import React, { useState } from 'react';
import Dropzone from 'react-dropzone';
import FileUpload from './pages/upload_ripe';
import './App.css';

function App() {
 
  return (
    <div className="file-uploader">
      <FileUpload/>
    </div>
  );
}

export default App;
