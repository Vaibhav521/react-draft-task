import { useState } from 'react'
import './App.css'
import MyEditor from './MyEditor'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <MyEditor />
    </>
  )
}

export default App
