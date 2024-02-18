  const history = []
  let i, gray, cond
  let imgData

/* eslint-disable-next-line no-restricted-globals */
  self.onmessage = e => {
    const arr = new Uint8ClampedArray( e.data.buffer )
    history.unshift( arr )
    if( history.length > 5 ) history.pop()
    imgData = new ImageData( e.data.width, e.data.height )

    for( i = 0; i < arr.length; i += 4 ) {
      gray = Math.floor(( arr[i] + arr[i+1] + arr[i+2] ) / 3 )

      cond = gray > 164

      imgData.data[i]     = cond ? 255 : ( history[2] ? Math.floor( history[2][i] - arr[i] ) : 0 )
      imgData.data[i + 1] = cond ? 255 : ( history[4] ? Math.floor( history[4][i + 1 ] - arr[i + 1]) : 0)
      imgData.data[i + 2] = cond ? 255 : gray
      imgData.data[i + 3] = 255
    }  


    postMessage({
      width:  imgData.width,
      height: imgData.height,
      buffer: imgData.data.buffer
    }, [imgData.data.buffer])
  }