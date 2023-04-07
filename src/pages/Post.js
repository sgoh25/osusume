import axios from 'axios';
import { Button, Dropdown, Tag } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Post.css';
import Layout from '../components/Layout.jsx';
import SingleComment from '../components/SingleComment';

export default function Post({ token, saveToken, removeToken }) {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { post_id } = state;
    let [error, setError] = useState(null)
    let [post, setPost] = useState({})
    let [comments, setComments] = useState([])
    let [commentForm, setCommentForm] = useState({ comment: "" })

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
        }).catch(function (error) {
            if (error.response) {
                console.log(error.response.data.msg)
                if (error.response.status === 401) {
                    removeToken()
                    navigate('/timeOut', { replace: true })
                }
            }
        })

        axios({
            method: "GET",
            url: `/post/${post_id}/comment`,
            headers: { Authorization: "Bearer " + token }
        }).then((response) => {
            let rsp = response.data;
            console.log(rsp.msg)
            rsp.access_token && saveToken(rsp.access_token, rsp.access_expiration)
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
    }, []);

    function handleChange(event) {
        const { value, name } = event.target
        setCommentForm(prevNote => ({
            ...prevNote, [name]: value
        })
        )
    }

    function handleSubmit() {
        axios({
            method: "POST",
            url: `/post/${post_id}/comment`,
            data: { comment: commentForm.comment },
            headers: { Authorization: "Bearer " + token }
        }).then((response) => {
            let rsp = response.data
            console.log(rsp.msg)
            setError(null)
            rsp.access_token && saveToken(rsp.access_token, rsp.access_expiration)
            if (rsp.comments) {
                setComments(rsp.comments);
            }
        }).catch(function (error) {
            if (error.response) {
                console.log(error.response.data.msg)
                setError(error.response.data.msg)
            }
        })

        setCommentForm(({ comment: "" }))
    }

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

    let comment_block = (
        <>
            {
                comments && comments.length !== 0 &&
                comments.map((comment, idx) => <SingleComment post_id={post_id} commentInfo={{ comment, setComments }}
                    tokenInfo={{ token, saveToken, removeToken }} key={`${comment}${idx}`} />)
            }
        </>
    )

    let body = (
        <>
            <div className="post">
                <div className="post_title">{post.title}</div>
                <div className="post_author">By: {post.author} - {post.created && post.created.slice(0, -7)}</div>
                <hr />
                <div className="post_body">{post.description}</div>
                <Button className="post_tag">TagButton{post.tag}</Button>
            </div>
            {!invalidToken &&
                <div className="comment">
                    <form>
                        <div className='comment_text_wrapper'>
                            <textarea className="comment_text" onChange={handleChange} placeholder="Comment" name="comment" text={commentForm.comment} value={commentForm.comment}></textarea>

                            {error != null && <div className="error">{error}</div>}
                            <div className="comment_button">
                                <Button className="button" type="primary" onClick={() => handleSubmit()}>Submit</Button>
                            </div>
                        </div>
                    </form>
                </div>
            }
            <>{comment_block}</>
        </>
    )

    return <Layout top_buttons={buttons} body={body} />
}
