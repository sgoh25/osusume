import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Post.css';
import Layout from '../components/Layout.jsx';
import SinglePost from '../components/SinglePost.jsx';

export default function Profile({ token, saveToken, removeToken }) {
    const navigate = useNavigate();
    let posts = null;
    axios({
        method: "GET",
        url: "/post/profile",
        headers: { Authorization: "Bearer " + token }
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
                <button className="button" onClick={() => navigate('/', { replace: true })}>Home</button>
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
