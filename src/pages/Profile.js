import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Post.css'
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
                <button className="button" onClick={handleLogout}>Log Out</button>
            </div>
        </>
    )

    let body = (
        <>
            <div className="top_profile">
                <div className="profile_title">Your Posts</div>
                <div className="create_button">
                    <button className="button" onClick={() => navigate('/profile/create', { replace: true })}>Create Post</button>
                </div>
            </div>
            
            <div className="content">
                {content}
            </div>
        </>
    )

    return <Layout top_buttons={buttons} body={body} />
}
