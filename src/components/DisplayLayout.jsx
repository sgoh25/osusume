import axios from 'axios';
import { Button, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
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

    let menuProps;
    if (isProfile) {
        const items = [
            { label: "Home", key: "1", onClick: () => navigate('/', { replace: true }) },
            { label: "Logout", key: "3", danger: true, onClick: handleLogout }
        ];
        menuProps = { items };
    }
    else {
        const items = [
            { label: "Profile", key: "2", onClick: () => navigate('/profile', { replace: true }) },
            { label: "Logout", key: "3", danger: true, onClick: handleLogout }
        ];
        menuProps = { items };
    }

    let invalidToken = (!token && token !== "" && token !== undefined);
    let buttons = (
        <>
            {invalidToken ?
                <div className="button_wrapper">
                    <Button className="button" onClick={() => navigate('/login', { replace: true })}>Log In</Button>
                    <Button className="button" onClick={() => navigate('/register', { replace: true })}>Register</Button>
                </div>
                : <Dropdown menu={menuProps}>
                    <Button className="button">Menu<DownOutlined /></Button>
                </Dropdown>
            }
        </>
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
