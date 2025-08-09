import { useState, useEffect } from 'react'
import './App.css'

function DebugApp() {
  const [message, setMessage] = useState('React is working!')
  
  useEffect(() => {
    console.log('DebugApp component mounted successfully')
    setTimeout(() => {
      setMessage('React hooks and state management working!')
    }, 2000)
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🛠️ Debug App</h1>
      <p>{message}</p>
      <div style={{ background: '#f0f0f0', padding: '15px', marginTop: '20px', borderRadius: '5px' }}>
        <h3>System Check:</h3>
        <ul>
          <li>✅ React component rendering</li>
          <li>✅ CSS imports working</li>
          <li>✅ JavaScript hooks functional</li>
          <li>✅ State management active</li>
        </ul>
      </div>
      <button onClick={() => setMessage('Button click works!')}>
        Test Button Click
      </button>
    </div>
  )
}

export default DebugApp
