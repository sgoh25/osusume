import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import Layout from '../components/Layout.jsx';
import munchlax from '../styles/munchlax.png';

export default function NotFound() {
    const navigate = useNavigate();

    let buttons = (
        <>
            <div className="button_wrapper">
                <Button className="button" onClick={() => navigate('/', { replace: true })}>Home</Button>
            </div>
        </>
    )

    let body = (
        <>
            <div className="center">
                <h1>404: Page Not Found!</h1>
                <img src={munchlax} alt="404" style={{ width: 400, height: 400 }} />
            </div>
        </>
    )

    return <Layout top_buttons={buttons} body={body} />
}
