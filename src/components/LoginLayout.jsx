import { useNavigate } from 'react-router-dom';
import '../styles/Login.css'
import Layout from './Layout.jsx'

export default function LoginLayout({ isRegister }) {
    const navigate = useNavigate();

    let body = (
        <>
            <div className="login_wrapper">
                {isRegister && <div className="title">Register New Account</div>}
                {!isRegister && <div className="title">Login</div>}
                <form>
                    <div className="label">Username:</div>
                    <input type="text" placeholder="Username" name="username"></input>
                    <div className="label">Password:</div>
                    <input type="password" placeholder="Password" name="password"></input>
                    <div className="login_button">
                        {isRegister && <button className="button" >Register</button>}
                        {!isRegister && <button className="button">Log In</button>}
                        <button className="button" onClick={() => navigate('/', { replace: true })}>Cancel</button>
                    </div>
                </form>
            </div>
        </>
    )

    return <Layout buttons={<></>} body={body} />
}
