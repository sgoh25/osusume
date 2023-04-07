import axios from 'axios';
import { Button, Dropdown, Tag } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Post.css';
import Layout from '../components/Layout.jsx';

export default function Post({ token, saveToken, removeToken }) {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { post_id } = state;
    let [error, setError] = useState(null)
    let [post, setPost] = useState({})
    // let [commentForm, setCommentForm] = useState({
    //     comment: "",
    // })

    useEffect(() => {
        axios({
            method: "GET",
            url: `/post/${post_id}`,
            headers: { Authorization: "Bearer " + token }
        }).then((response) => {
            let rsp = response.data;
            console.log(rsp.msg)
            rsp.access_token && saveToken(rsp.access_token, rsp.access_expiration)
            setPost(rsp)
            // setCommentForm({ title: rsp.title, description: rsp.description, tag: rsp.tag })
        }).catch(function (error) {
            if (error.response) {
                console.log(error.response.data.msg)
                if (error.response.status === 401) {
                    removeToken()
                    navigate('/timeOut', { replace: true })
                }
            }
        })
    }, []);

    // function handleChange(event) {
    //     const { value, name } = event.target
    //     setCommentForm(prevNote => ({
    //         ...prevNote, [name]: value
    //     })
    //     )
    // }

    // function handleSubmit() {
    //     let url;
    //     url = `/post/${post_id}/comment`;
    //     axios({
    //         method: "POST",
    //         url: url,
    //         data: { comment: commentForm.comment },
    //         headers: { Authorization: "Bearer " + token }
    //     }).then((response) => {
    //         let rsp = response.data
    //         console.log(rsp.msg)
    //         setError(null)
    //         rsp.access_token && saveToken(rsp.access_token, rsp.access_expiration)
    //         navigate('/post', { replace: true, state: { post_id: post.id } })
    //     }).catch(function (error) {
    //         if (error.response) {
    //             console.log(error.response.data.msg)
    //             setError(error.response.data.msg)
    //         }
    //     })

    //     setCommentForm(({ comment: "" }))
    // }

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

    let invalidToken = (!token && token !== "" && token !== undefined);
    let menuProps;
    if (invalidToken) {
        const items = [
            { label: "Home", key: "1", onClick: () => navigate('/', { replace: true }) },
            { type: 'divider' },
            { label: "Log In", key: "4", onClick: () => navigate('/login', { replace: true }) },
            { label: "Register", key: "5", onClick: () => navigate('/register', { replace: true }) }
        ];
        menuProps = { items };
    }
    else {
        const items = [
            { label: "Home", key: "1", onClick: () => navigate('/', { replace: true }) },
            { label: "Profile", key: "2", onClick: () => navigate('/profile', { replace: true }) },
            { label: "Logout", key: "3", danger: true, onClick: handleLogout }
        ];
        menuProps = { items };
    }

    let buttons = (
        <>
            <Dropdown menu={menuProps}>
                <Button className="button">Menu<MenuOutlined /></Button>
            </Dropdown>
        </>
    )

    let body = (
        <>
            <div className="post">
                <div className="post_title">{post.title}</div>
                <div className="post_author">By: {post.author} - {post.created && post.created.slice(0, -7)}</div>
                <hr/>
                <div className="post_body">{post.description}</div>
                <Button className="post_tag">TagButton{post.tag}</Button>
            {/* <form>
                    <div className="label">Title:</div>
                    <input type="text" onChange={handleChange} placeholder="Title" name="title" text={postForm.title} value={postForm.title}></input>
                    <div className="label">Description:</div>
                    <textarea onChange={handleChange} placeholder="Description" name="description" text={postForm.description} value={postForm.description}></textarea>
                    {error != null && <div className="error">{error}</div>}
                    <div className="login_button">
                        <Button className="button" type="primary" onClick={() => handleSubmit(isCreate)}>Submit</Button>
                        <Button className="button" onClick={() => navigate('/profile', { replace: true })}>Cancel</Button>
                    </div>
                </form> */}
            </div>
        </>
    )

    return <Layout top_buttons={buttons} body={body} />
}
