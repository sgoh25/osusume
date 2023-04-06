import axios from 'axios';
import { Button } from 'antd';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import '../styles/Post.css';
import Layout from '../components/Layout.jsx';
import SinglePost from '../components/SinglePost.jsx';

export default function DisplayLayout({ isProfile, tokenInfo }) {
    const navigate = useNavigate();
    let { token, saveToken, removeToken } = tokenInfo;
    const [posts, setPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(false);

    useEffect(() => {
        setPostsLoading(true);
        let url;
        if (isProfile) {
            url = "/post/profile"
        }
        else {
            url = "/post/home"
        }
        axios({
            method: "GET",
            url: url,
            headers: { Authorization: "Bearer " + token }
        }).then((response) => {
            let rsp = response.data;
            console.log(rsp.msg)
            rsp.access_token && saveToken(rsp.access_token, rsp.access_expiration)
            if (rsp.posts) {
                setPosts(rsp.posts);
            }
        }).catch(function (error) {
            if (error.response) {
                console.log(error.response.data.msg)
                if (error.response.status === 401) {
                    removeToken()
                    navigate('/timeOut', { replace: true })
                }
            }
        }).finally(function () {
            setPostsLoading(false);
        })
    }, []);

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

    let invalidToken = (!token && token !== "" && token !== undefined);
    let buttons = (
        <div className="button_wrapper">
            {isProfile ?
                <>
                    <Button className="button" onClick={() => navigate('/', { replace: true })}>Home</Button>
                    <Button className="button" onClick={handleLogout}>Log Out</Button>
                </>
                : <>
                    {invalidToken &&
                        <>
                            <Button className="button" onClick={() => navigate('/login', { replace: true })}>Log In</Button>
                            <Button className="button" onClick={() => navigate('/register', { replace: true })}>Register</Button>
                        </>
                    }
                    {!invalidToken &&
                        <>
                            <Button className="button" onClick={() => navigate('/profile', { replace: true })}>Profile</Button>
                            <Button className="button" onClick={handleLogout}>Log Out</Button>
                        </>
                    }
                </>
            }
        </div>
    )

    let content = (
        <>
            {postsLoading && <div className="loading">Loading...</div>}
            {
                posts && posts.length !== 0 &&
                posts.map((post, idx) => <SinglePost postInfo={{ post, setPosts }}
                    tokenInfo={{ token, saveToken, removeToken }} isProfile={isProfile} key={`${post}${idx}`} />)
            }
        </>
    )

    let body = (
        <>
            {isProfile ?
                <>
                    <div className="top_profile">
                        <div className="profile_title">Your Posts</div>
                        <div className="create_button">
                            <Button className="button" onClick={() => navigate('/profile/create', { replace: true })}>Create Post</Button>
                        </div>
                    </div>
                </>
                : <>
                    <div className="center">
                        <h1>Welcome to Osusume!</h1>
                    </div>
                </>
            }
            <div className="content">
                {content}
            </div>
        </>
    )

    return <Layout top_buttons={buttons} body={body} />
}
