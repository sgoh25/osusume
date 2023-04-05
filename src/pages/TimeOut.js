import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css'
import Layout from '../components/Layout.jsx'

export default function TimeOut({ removeToken }) {
    const navigate = useNavigate();

    function handleLogout() {
        axios.post("/auth/logout").then((response) => {
            console.log(response.data.msg)
            removeToken()
            navigate("/", { replace: true })
        }).catch(function (error) {
            if (error.response) {
                console.log(error.response.data.msg)
            }
        })
    }

    let buttons = (
        <>
            <div className="button_wrapper">
                <button className="button" onClick={handleLogout}>Home</button>
            </div>
        </>
    )

    let body = (
        <>
            <div className="center">
                <h1>You have been logged out due to inactivity.</h1>
            </div>
        </>
    )

    return <Layout top_buttons={buttons} body={body} />
}
