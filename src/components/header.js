import xLogo from '../assets/x-logo/logo-white.png'
import ghLogo from '../assets/github-mark/github-mark-white.png'

import './header.css'

type Props = {
  started: Boolean
}

export default function Header(props:Props) {
  const { started } = {
    started: false,
    ...props
  }

  return (
    <div className="Header">
      <div>
        <a href="/" alt="top">
          <div className='text' style={{fontWeight: "bold", visibility: started ? "visible": "hidden"}}>
            Birds around face.
          </div>
        </a>
      </div>
      <div className='item'>
        <a href="https://twitter.com/komasshu">
          <div className='item'>
            <img src={xLogo} alt="X" height={32}/>&nbsp;&nbsp; <span className="text">@komasshu</span>
          </div>
        </a>
        &nbsp;&nbsp; &nbsp;&nbsp; 
        <a href="https://github.com/KensakuKOMATSU/vanta-gestured">
          <img src={ghLogo} alt="github" height={32}/>
        </a>
      </div>
    </div>
  )
}