import { useState, useRef } from 'react'

import VideoCanvas from './components/video-canvas';
import VantaCanvas from './components/vanta-canvas';
import Controller from './components/controller';
import './App.css';

function App() {
  const [ _started, setStarted ] = useState({ started: false, mode: "FACE" })
  const _vantaRef = useRef()
  
  return (
    <div className="App">
      <main>
        { _started.started && (
        <div className='wrapper'>
          <VideoCanvas 
            mode={ _started.mode } 
            onDetected={ point => { 
              if( _vantaRef.current ) {
                _vantaRef.current.setPoint( point )
              }
            }} 
          />
        </div>
        )}
        <div className='wrapper'>
          <VantaCanvas ref={_vantaRef} />
        </div>
        { !_started.started && (
        <div className='wrapper'>
          <Controller onStartBtnPressed={ mode => setStarted( { started: true, mode } )} />
        </div>
        )}
      </main>
    </div>
  );
}

export default App;
