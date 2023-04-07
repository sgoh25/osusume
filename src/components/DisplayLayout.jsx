import axios from 'axios';
import { Button, Dropdown, Select } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import '../styles/Post.css';
import Layout from './Layout';
import SinglePost from './SinglePost.jsx';
import SingleComment from './SingleComment';

export default function DisplayLayout({ isProfile, tokenInfo }) {
    const navigate = useNavigate();
    let { token, saveToken, removeToken } = tokenInfo;
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [category, setCategory] = useState("My Posts");

    useEffect(() => {
        setPostsLoading(true);
        let url;
        if (isProfile) {
            if (category === "My Posts") {
                url = "/post/profile/posts";
            }
            else {
                url = "/post/profile/comments";
            }
        }
        else {
            url = "/post/home";
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
                    <Button className="button">Menu<MenuOutlined /></Button>
                </Dropdown>
            }
        </>
    )

    let content = (
        <>
            {postsLoading && <div className="loading">Loading...</div>}
            {
                category === "My Posts" && posts && posts.length !== 0 &&
                posts.map((post, idx) => <SinglePost postInfo={{ post, setPosts }}
                    tokenInfo={{ token, saveToken, removeToken }} isProfile={isProfile} key={`${post}${idx}`} />)
            }
            {
                category === "My Comments" && comments && comments.length !== 0 &&
                comments.map((comment, idx) => <SingleComment post_id={comment.post_id} commentInfo={{ comment, setComments }}
                    tokenInfo={{ token, saveToken, removeToken }} isPreview={true} key={`${comment}${idx}`} />)
            }
        </>
    )

    function handleCategorySelect(value) {
        let url;
        if (value === "My Posts") {
            setCategory("My Posts");
            url = "/post/profile/posts";
        }
        else {
            setCategory("My Comments");
            url = "/post/profile/comments";
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
            if (rsp.comments) {
                setComments(rsp.comments);
            }
        }).catch(function (error) {
            if (error.response) {
                console.log(error.response.data.msg)
                if (error.response.status === 401) {
                    removeToken()
                    navigate('/timeOut', { replace: true })
                }
            }
        })
    }

    let body = (
        <>
            {isProfile ?
                <>
                    <div className="top_profile">
                        <div className="profile_title">{category}</div>
                        <div className="create_button">
                            <Button className="button" onClick={() => navigate('/profile/create', { replace: true })}>Create Post</Button>
                        </div>
                    </div>
                    <div className="category_wrapper">
                        <Select className="category"
                            defaultValue={category}
                            onChange={handleCategorySelect}
                            options={[
                                {
                                    value: 'My Posts',
                                    label: 'My Posts',
                                },
                                {
                                    value: 'My Comments',
                                    label: 'My Comments',
                                },
                            ]}
                        />
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
