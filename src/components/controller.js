import { useState } from 'react'
import { Button, Radio, Space, Typography } from 'antd'
import './controller.css'

const { Title } = Typography

type Props = {
  onStartBtnPressed: Function
}
export default function Controller( props:Props ) {
  const { onStartBtnPressed } = { 
    onStartBtnPressed: () => { alert('MUST set `onStartBtnPressed!!`')},
    ...props
  }

  const [ _mode:"FACE"|"GESTURE", setMode ] = useState("FACE")

  return (
    <div className='Controller'>
      <Space direction='vertical'>
        <div>
          <Title level={2}>
            <span className='text'>
              Birds around face.
            </span>
          </Title>
        </div>
        <div>
          <Radio.Group onChange={ e => setMode(e.target.value) } value={_mode}>
            <Radio value="FACE">
              <span className='text'>Face detection</span>
            </Radio>
            <Radio value="GESTURE">
              <span className='text'>Gesture detection</span>
            </Radio>
          </Radio.Group>
        </div>
        <div>
          <Button type='primary' onClick={() => onStartBtnPressed(_mode)} danger>
            Start
          </Button>
        </div>
      </Space>
    </div>
  )
}