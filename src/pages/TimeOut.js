import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { handleLogout } from '../components/utils';
import '../styles/Home.css';
import Layout from '../components/Layout.jsx';
import kanna from '../styles/kanna.png';

export default function TimeOut({ removeToken }) {
    const navigate = useNavigate();

    let buttons = (
        <>
            <div className="button_wrapper">
                <Button className="button" onClick={() => handleLogout(navigate, removeToken)}>Home</Button>
            </div>
        </>
    )

    let body = (
        <>
            <div className="center">
                <div className="timeout">You have been logged out due to inactivity.</div>
                <img src={kanna} alt="timeout" className="kanna" />
            </div>
        </>
    )

    return <Layout top_buttons={buttons} body={body} />
}
