import axios from 'axios';
import { Button, Dropdown } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMenuItems } from '../components/utils';
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

    let invalidToken = (!token && token !== "" && token !== undefined);
    let menuProps;
    if (invalidToken) {
        const items = getMenuItems({ home: 1, divider: 1, login: 1, register: 1 }, navigate, removeToken);
        menuProps = { items };
    }
    else {
        const items = getMenuItems({ home: 1, profile: 1, logout: 1 }, navigate, removeToken);
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
                    tokenInfo={{ token, saveToken, removeToken }} isPreview={false} key={`${comment}${idx}`} />)
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
                {post.tag && <Button className="post_tag" onClick={() => navigate(`/tag/${post.tag}`, { replace: true, state: { tag_id: post.tag } })}>{post.tag}</Button>}
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
