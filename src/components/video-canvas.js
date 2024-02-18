import { useCallback, useEffect, useRef } from 'react'
import { FilesetResolver, FaceLandmarker, GestureRecognizer } from '@mediapipe/tasks-vision'
import { message } from 'antd'

import WorkerLoader from '../libs/worker-loader'
import ProcessingWorker from '../libs/image-processor.worker'

import './video-canvas.css'

const videoConstraints = {
  width: { min: 640, ideal: 1920, max: 1920 },
  height: { min: 400, ideal: 1080 }
}

type Props = {
  onDetected: Function,
  mode: "FACE" | "GESTURE"
}

const worker = new WorkerLoader( ProcessingWorker );

export default function VideoCanvas( props:Props ) {
  const { mode, onDetected } = { 
    onDetected: () => {},
    mode: "FACE",
    ...props
  }

  const _videoNode = useRef()
  const _canvasNode = useRef()
  const _stream = useRef()
  const _faceLandmarker = useRef()
  const _gestureRecognizer = useRef()

  const startDetection = useCallback( async () => {
    if( _faceLandmarker.current || _gestureRecognizer.current || !_videoNode.current ) return

    message.info(`starting ${mode} AI detection...`)
    const video = _videoNode.current

    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    _faceLandmarker.current = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        delegate: "GPU"
      },
      outputFaceBlendshapes: true,
      runningMode: "VIDEO",
      numFaces: 1
    });
    
    _gestureRecognizer.current = await GestureRecognizer.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
        delegate: "GPU"
      },
      runningMode: "VIDEO"
    });

    let lastVideoTime = -1;
    let results
    let timer

    async function predictWebcam() {
      let startTimeMs = performance.now()

      if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;

        if( mode === "FACE" ) {
          results = _faceLandmarker.current.detectForVideo(video, startTimeMs);
          
          if( results.faceLandmarks && results.faceLandmarks instanceof Array && results.faceLandmarks.length > 0 ) {

            const center = FaceLandmarker.FACE_LANDMARKS_FACE_OVAL
              .reduce( ( prev, curr, idx ) => {
                const start = results.faceLandmarks[0][curr.start]
                return {
                  x: 1 / ( idx + 1 ) * ( idx * prev.x + start.x ),
                  y: 1 / ( idx + 1 ) * ( idx * prev.y + start.y ),
                }
              }, { x: 0, y: 0 } ) 
            onDetected( { x: 1 - center.x, y: 1 - center.y, width: video.offsetWidth } )
          }
        }

        if( mode === "GESTURE" ) {
          if( timer ) clearInterval( timer )
          results = _gestureRecognizer.current.recognizeForVideo( video, startTimeMs )

          if( results.landmarks && results.landmarks instanceof Array && results.landmarks.length > 0 ) {
            const center = results.landmarks[0]
              .reduce( ( prev, curr, idx ) => {
                return {
                  x: 1 / ( idx + 1 ) * ( idx * prev.x + curr.x ),
                  y: 1 / ( idx + 1 ) * ( idx * prev.y + curr.y ),
                }
              }, { x: 0, y: 0 } ) 
            onDetected( { x: 1 - center.x, y: 1 - center.y, width: video.offsetWidth } )

            timer = setInterval(() => {
              onDetected( { 
                x: 1 - center.x + Math.random() * 0.1, 
                y: 1 - center.y + Math.random() * 0.1, 
                width: video.offsetWidth 
              } )
            }, 30)
          }
        }
      }
      requestAnimationFrame( predictWebcam )
    }

    message.info("Ready & Enjoy!!")
    predictWebcam()
  }, [ mode, onDetected ])

  useEffect(() => {
    if( !_videoNode.current ) return;

    const video = _videoNode.current;

    ( async () => {
      message.info('obtaining video from your cam...')
      const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: false })
        .catch( async () => {
          return await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .catch( err => { 
              alert( err.message )
              return false
            })
        })
      if( !stream ) return

      _stream.current = stream

      video.srcObject = _stream.current

      video.onloadedmetadata = async () => {
        await video.play()
        startDetection();
      }

      const tmpVideo = document.createElement('video')
      tmpVideo.srcObject = stream

      tmpVideo.onloadedmetadata = async () => {
        await tmpVideo.play()

        const tmpCvs = document.createElement('canvas')
        tmpCvs.width = video.videoWidth
        tmpCvs.height = video.videoHeight
        const tmpCtx = tmpCvs.getContext('2d')

        _canvasNode.current.width = video.videoWidth
        _canvasNode.current.height = video.videoHeight
        const ctx = _canvasNode.current.getContext('2d')

        let imgData

        const draw = () => {
          tmpCtx.drawImage( video, 0, 0, video.videoWidth, video.videoHeight )
          imgData = tmpCtx.getImageData( 0, 0, video.videoWidth, video.videoHeight )

          worker.postMessage( {
            width: imgData.width,
            height: imgData.height,
            settings: imgData.settings,
            buffer: imgData.data.buffer
          }, [imgData.data.buffer] )

        }
        draw()

        worker.onmessage = e => {
          const imgData = new ImageData( new Uint8ClampedArray(e.data.buffer), e.data.width, e.data.height )
          ctx.putImageData( imgData, 0, 0 )
          requestAnimationFrame( draw )
        }
      }
    })();

    return function cleanup() {
      if( video && _stream.current ) {
        for( const t of _stream.current.getTracks() ) {
          t.stop()
        }
        video.srcObject = null
        _stream.current = null
      }
    }
  }, [ startDetection ])


  return (
    <div className='VideoCanvas'>
      <div className='wrapper' style={{visibility: 'hidden'}}>
        <video ref={_videoNode} playsInline/>
      </div>
      <div className='wrapper'>
        <canvas ref={_canvasNode}/>
      </div>
    </div>
  )
}