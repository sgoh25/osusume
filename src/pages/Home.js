import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css'
import Layout from '../components/Layout.jsx'

export default function Home({ token, saveToken, removeToken }) {
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

  const navigate = useNavigate();

  function handleLogout() {
    axios.post("/auth/logout").then((response) => {
      console.log(response.data.msg)
      removeToken()
    }).catch(function (error) {
      if (error.response) {
        console.log(error.response.data.msg)
      }
    })
  }

  let buttons = (
    <>
      {token == null &&
        <div className="button_wrapper">
          <button className="button" onClick={() => navigate('/login', { replace: true })}>Log In</button>
          <button className="button" onClick={() => navigate('/register', { replace: true })}>Register</button>
        </div>
      }
      {token != null &&
        <div className="button_wrapper">
          <button className="button" onClick={() => navigate('/profile', { replace: true })}>Profile</button>
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

  return <Layout top_buttons={buttons} body={body} />
}
