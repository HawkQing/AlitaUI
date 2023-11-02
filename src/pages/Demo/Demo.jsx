import { useCallback, useState } from 'react'
import reactLogo from '../../assets/react.svg'
import './Demo.css'

const Demo = () => {
    const [count, setCount] = useState(0)
    const onClick = useCallback(
        () => setCount((count) => count + 1),
        [],
    )

    return (
        <div id='demoContainer'>
            Goodbye
            <div>
                <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
                    <img src="./vite.svg" className="logo" alt="Vite logo" />
                </a>
                <a href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={onClick}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.jsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </div>
    )
}

export default Demo