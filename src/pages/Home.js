import axios from 'axios';
import { Button } from 'antd';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import Layout from '../components/Layout.jsx';
import SinglePost from '../components/SinglePost.jsx';

export default function Home({ token, saveToken, removeToken }) {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(false);

    useEffect(() => {
        setPostsLoading(true);
        axios({
            method: "GET",
            url: "/post/home",
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

    let content = (
        <>
            {postsLoading && <div className="loading">Loading...</div>}
            {
                posts && posts.length !== 0 &&
                posts.map((post, idx) => <SinglePost postInfo={{ post, setPosts }}
                    tokenInfo={{ token, saveToken, removeToken }} isProfile={false} key={`${post}${idx}`} />)
            }
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
                    <Button className="button" onClick={() => navigate('/login', { replace: true })}>Log In</Button>
                    <Button className="button" onClick={() => navigate('/register', { replace: true })}>Register</Button>
                </div>
            }
            {token != null &&
                <div className="button_wrapper">
                    <Button className="button" onClick={() => navigate('/profile', { replace: true })}>Profile</Button>
                    <Button className="button" onClick={handleLogout}>Log Out</Button>
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
