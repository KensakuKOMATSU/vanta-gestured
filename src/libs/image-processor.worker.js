export default function processor () {
  const colors = [ 0, 96, 162, 255 ]
  let i, gray, idx, color 

  onmessage = e => {
    const imgData = new ImageData( new Uint8ClampedArray( e.data.buffer ), e.data.width, e.data.height )

    for( i = 0; i < imgData.data.length; i += 4 ) {
      gray = Math.floor(( imgData.data[i] + imgData.data[i+1] + imgData.data[i+2] ) / 3 )
      idx = Math.floor( gray / 64 )
      color = colors[idx]

      imgData.data[i]     = idx === 3 ? 255 : 0
      imgData.data[i + 1] = idx === 3 ? 255 : 0 //color
      imgData.data[i + 2] = color
    }  


    postMessage({
      width: imgData.width,
      height: imgData.height,
      buffer: imgData.data.buffer
    }, [imgData.data.buffer])
  }
}