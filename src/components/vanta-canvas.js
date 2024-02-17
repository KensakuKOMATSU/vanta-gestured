import { forwardRef, useEffect, useRef, useImperativeHandle  } from 'react'
import BIRDS from 'vanta/src/vanta.birds'
import './vanta-canvas.css'

type Point = {
  x: Number, y: Number, width: Number
}

const VantaCanvas = forwardRef( function VantaCanvas( props, ref ) {
  const _vanta = useRef()
  const _nodeRef = useRef()

  useImperativeHandle( ref, () => {
    return {
      setPoint( point:Point ) {
        if( _vanta.current && _nodeRef.current ) {
          const { x, y, width } = point
          const ratio = width / _nodeRef.current.offsetWidth
          _vanta.current.onMouseMove( ( x - 0.5 ) * ratio + 0.5 , y )
        }
      }
    }
  }, [])

  useEffect(() => {
    if( !_nodeRef.current || _vanta.current ) return

    _vanta.current = BIRDS({
      el: _nodeRef.current,
      backgroundAlpha: 0
    })

    return function cleanup() {
      if( _vanta.current ) {
        _vanta.current.destroy()
        _vanta.current = null
      }
    }
  }, [])

  //useEffect(() => {
  //  const st = Date.now()
  //  const r = 0.5
  //  let reqId

  //  const move = () => {
  //    if( _vanta.current && _nodeRef.current ) {
  //      const delta = ( Date.now() - st ) * 0.001
  //      const x = Math.cos( delta ) * r
  //      const y = Math.sin( delta ) * r

  //      _vanta.current.onMouseMove( x, y )
  //    }

  //    reqId = requestAnimationFrame( move )
  //  }
  //  move()

  //  return function cleaup() {
  //    if( reqId ) cancelAnimationFrame( reqId )
  //  }
  //}, [])
  return (
    <div className="VantaCanvas" ref={_nodeRef} />
  )
});

export default VantaCanvas;