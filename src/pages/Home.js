import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css'
import Layout from '../components/Layout.jsx';
import SinglePost from '../components/SinglePost.jsx';

export default function Home({ token, saveToken, removeToken }) {
    const navigate = useNavigate();
    let posts = null;
    axios({
        method: "GET",
        url: "/post/all"
    }).then((response) => {
        let rsp = response.data
        console.log(rsp.msg)
        rsp.access_token && saveToken(rsp.access_token, rsp.access_expiration)
        posts = rsp.posts
    }).catch(function (error) {
        if (error.response) {
            console.log(error.response.data.msg)
            if (error.response.status === 401) {
                removeToken()
                navigate('/timeOut', { replace: true })
            }
        }
    })

    let content = (
        <>
            {posts != null && posts.map((element) => <SinglePost post={element} key={element} />)}
        </>
    )

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
