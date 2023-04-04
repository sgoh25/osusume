import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css'
import Layout from '../components/Layout.jsx'

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
  const navigate = useNavigate();

  function handleLogin() {
    // setUser(0)
    navigate('/login', { replace: true });
  }

  function handleLogout() {
    setUser(null)
  }

  let buttons = (
    <>
      {user == null &&
        <div className="button_wrapper">
          <button className="button" onClick={handleLogin}>Log In</button>
          <button className="button" onClick={() => navigate('/register', { replace: true })}>Register</button>
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
