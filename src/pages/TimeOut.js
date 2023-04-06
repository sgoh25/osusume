import axios from 'axios';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import Layout from '../components/Layout.jsx';

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
                <Button className="button" onClick={handleLogout}>Home</Button>
            </div>
        </>
    )

    let body = (
        <>
            <div className="center">
                <div className="timeout">You have been logged out due to inactivity.</div>
            </div>
        </>
    )

    return <Layout top_buttons={buttons} body={body} />
}
