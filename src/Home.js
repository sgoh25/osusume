import './styles/Home.css'
import { useState } from 'react'

import Layout from './Layout.jsx'

export default function Home() {
  let content = (
    <>
      <div className="post">
        <h2>Post #1</h2>
        <p>details</p>
      </div>
      <div className="post">
        <h2>Post #2</h2>
        <p>details</p>
      </div>
    </>
  )

  let [user, setUser] = useState(null)

  function handleLogin() {
    setUser(0)
  }

  function handleLogout() {
    setUser(null)
  }

  let buttons = (
    <>
      {user == null &&
        <div className="button_wrapper">
          <button className="button" onClick={handleLogin}>Log In</button>
          <button className="button">Register</button>
        </div>
      }
      {user != null &&
        <div className="button_wrapper">
          <button className="button" onClick={handleLogout}>Log Out</button>
        </div>
      }
    </>
  )

  let body = (
    <>
      <div className="center">
        <h1>Welcome to Osusume!</h1>
      </div>
      <div className="content">
        {content}
      </div>
    </>
  )

  return <Layout buttons={buttons} body={body} />
}
