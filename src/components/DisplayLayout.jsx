import axios from 'axios';
import { Button, Dropdown, Select } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { catchTimeout, getTagList, getMenuItems, refreshToken } from './utils';
import '../styles/Home.css';
import '../styles/Post.css';
import Layout from './Layout';
import SinglePostPreview from './SinglePostPreview.jsx';
import SingleComment from './SingleComment';

export default function DisplayLayout({ tag_id, isProfile, tokenInfo }) {
    const navigate = useNavigate();
    let { token, saveToken, removeToken } = tokenInfo;
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [category, setCategory] = useState("My Posts");
    const [tag, setTag] = useState(tag_id)

    useEffect(() => {
        setPostsLoading(true);
        let url;
        if (isProfile) {
            url = (category === "My Posts") ? "/post/profile/posts" : "/post/profile/comments";
        }
        else {
            url = tag ? `/post/home/${tag}` : "/post/home";
        }
        axios({
            method: "GET",
            url: url,
            headers: { Authorization: "Bearer " + token }
        }).then((response) => {
            let rsp = response.data;
            refreshToken(rsp, saveToken)
            if (rsp.posts) {
                setPosts(rsp.posts);
            }
        }).catch((error) => catchTimeout(error, navigate, removeToken)).finally(function () {
            setPostsLoading(false);
        })
    }, [tag]);

    let menuProps;
    if (isProfile) {
        const items = getMenuItems({ home: 1, logout: 1 }, navigate, removeToken);
        menuProps = { items };
    }
    else {
        const items = getMenuItems({ profile: 1, logout: 1 }, navigate, removeToken);
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
                posts.map((post, idx) => <SinglePostPreview postInfo={{ post, setPosts }}
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
            refreshToken(rsp, saveToken)
            if (rsp.posts) {
                setPosts(rsp.posts);
            }
            if (rsp.comments) {
                setComments(rsp.comments);
            }
        }).catch((error) => catchTimeout(error, navigate, removeToken))
    }

    function handleTagSelect(value) {
        if (value === "Home") {
            setTag(null)
            navigate(`/`, { replace: true, state: { tag_id: value } })
        }
        else {
            setTag(value)
            navigate(`/tag/${value}`, { replace: true, state: { tag_id: value } })
        }
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
                                { value: 'My Posts', label: 'My Posts' },
                                { value: 'My Comments', label: 'My Comments' },
                            ]}
                        />
                    </div>
                </>
                : <>
                    <div className="center">
                        <h1>Welcome to Osusume!</h1>
                    </div>
                    <div className="top_profile">
                        <div className="tag_title_wrapper">
                            {tag &&
                                <>
                                    <div className="tag_pretitle">Tag: </div>
                                    <div className="tag_title">{tag}</div>
                                </>
                            }
                        </div>
                        <Select className="tag" onSelect={handleTagSelect} placeholder="Tag" options={getTagList(tag != null)}
                        />
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
