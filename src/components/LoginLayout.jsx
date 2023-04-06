import axios from 'axios';
import { Button } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import Layout from './Layout.jsx';

export default function LoginLayout({ isRegister, saveToken }) {
    const navigate = useNavigate();
    let [error, setError] = useState(null)
    const [loginForm, setLoginForm] = useState({
        username: "",
        password: ""
    })

    function handleChange(event) {
        const { value, name } = event.target
        setLoginForm(prevNote => ({
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
            let rsp = response.data
            console.log(rsp.msg)
            setError(null)
            !isRegister && saveToken(rsp.access_token, rsp.access_expiration)
            navigate(redirect, { replace: true })
        }).catch(function (error) {
            if (error.response) {
                console.log(error.response.data.msg)
                setError(error.response.data.msg)
            }
        })

        setLoginForm(({
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
                        {isRegister && <Button className="button" type="primary" onClick={() => handleSubmit(isRegister)}>Register</Button>}
                        {!isRegister && <Button className="button" type="primary" onClick={() => handleSubmit(isRegister)}>Log In</Button>}
                        <Button className="button" onClick={() => navigate('/', { replace: true })}>Cancel</Button>
                    </div>
                </form>
            </div>
        </>
    )

    return <Layout buttons={<></>} body={body} />
}
