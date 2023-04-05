import axios from 'axios';
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css'
import Layout from './Layout.jsx'

export default function LoginLayout({ isRegister, saveToken }) {
    const navigate = useNavigate();
    let [error, setError] = useState(null)
    const [loginForm, setloginForm] = useState({
        username: "",
        password: ""
    })

    function handleChange(event) {
        const { value, name } = event.target
        setloginForm(prevNote => ({
            ...prevNote, [name]: value
        })
        )
    }

    function handleSubmit(isRegister) {
        let url, redirect;
        if (isRegister) {
            url = "/auth/register";
            redirect = "/login";
        }
        else {
            url = "/auth/login";
            redirect = "/";
        }
        axios.post(url, {
            username: loginForm.username,
            password: loginForm.password
        }).then((response) => {
            console.log(response.data.msg)
            setError(null)
            if (!isRegister) {
                saveToken(response.data.access_token)
            }
            navigate(redirect, { replace: true })
        }).catch(function (error) {
            if (error.response) {
                console.log(error.response.data.msg)
                setError(error.response.data.msg)
            }
        })

        setloginForm(({
            username: "",
            password: ""
        }))
    }

    let body = (
        <>
            <div className="login_wrapper">
                {isRegister && <div className="title">Register New Account</div>}
                {!isRegister && <div className="title">Login</div>}
                <form>
                    <div className="label">Username:</div>
                    <input type="text" onChange={handleChange} placeholder="Username" name="username" text={loginForm.username} value={loginForm.username}></input>
                    <div className="label">Password:</div>
                    <input type="password" onChange={handleChange} placeholder="Password" name="password" text={loginForm.password} value={loginForm.password}></input>
                    {error != null && <div className="error">{error}</div>}
                    <div className="login_button">
                        {isRegister && <button className="button" type="button" onClick={() => handleSubmit(isRegister={isRegister})}>Register</button>}
                        {!isRegister && <button className="button" type="button" onClick={() => handleSubmit(isRegister={isRegister})}>Log In</button>}
                        <button className="button" onClick={() => navigate('/', { replace: true })}>Cancel</button>
                    </div>
                </form>
            </div>
        </>
    )

    return <Layout buttons={<></>} body={body} />
}
