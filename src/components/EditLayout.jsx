import axios from 'axios';
import { Button, Select } from 'antd';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { catchTimeout, getTagList, refreshToken } from './utils';
import '../styles/Login.css';
import '../styles/Post.css';
import Layout from './Layout.jsx';

export default function EditLayout({ post_id, tokenInfo }) {
    const navigate = useNavigate();
    let { token, saveToken, removeToken } = tokenInfo;
    let isCreate = (post_id == null);
    const [error, setError] = useState(null);
    const [postForm, setPostForm] = useState({
        title: "",
        description: "",
        tag: ""
    });

    useEffect(() => {
        if (!isCreate) {
            axios({
                method: "GET",
                url: `/post/${post_id}`,
                headers: { Authorization: "Bearer " + token }
            }).then((response) => {
                let rsp = response.data;
                refreshToken(rsp, saveToken)
                setPostForm({ title: rsp.title, description: rsp.description, tag: rsp.tag })
            }).catch((error) => catchTimeout(error, navigate, removeToken))
        }
    }, []);

    function handleChange(event) {
        const { value, name } = event.target;
        setPostForm(prevNote => ({
            ...prevNote, [name]: value
        })
        );
    }

    function handleSelect(value) {
        setPostForm(prevNote => ({
            ...prevNote, tag: value
        })
        );
    }

    function handleSubmit(isCreate) {
        let url;
        if (isCreate) {
            url = "/post/create";
        }
        else {
            url = `/post/${post_id}`;
        }
        axios({
            method: "POST",
            url: url,
            data: {
                title: postForm.title,
                description: postForm.description,
                tag: postForm.tag
            },
            headers: { Authorization: "Bearer " + token }
        }).then((response) => {
            let rsp = response.data;
            refreshToken(rsp, saveToken);
            setError(null);
            navigate("/profile", { replace: true });
        }).catch(function (error) {
            if (error.response) {
                console.log(error.response.data.msg);
                setError(error.response.data.msg);
            }
        })

        setPostForm(({
            title: "",
            description: "",
            tag: ""
        }));
    }

    let body = (
        <>
            <div className="edit_wrapper">
                {isCreate && <div className="form_title">Create New Post</div>}
                {!isCreate && <div className="form_title">Update Post</div>}
                <form>
                    <div className="label">Title:</div>
                    <input type="text" onChange={handleChange} placeholder="Title" name="title" text={postForm.title} value={postForm.title}></input>
                    <div className="label">Description:</div>
                    <textarea onChange={handleChange} placeholder="Description" name="description" text={postForm.description} value={postForm.description}></textarea>
                    <div className="label">Tag:</div>
                    <Select className="tag_create" onSelect={handleSelect} placeholder="Tag" value={postForm.tag ? postForm.tag : null} options={getTagList(false)} />
                    {error != null && <div className="error">{error}</div>}
                    <div className="login_button">
                        <Button className="button" type="primary" onClick={() => handleSubmit(isCreate)}>Submit</Button>
                        <Button className="button" onClick={() => navigate('/profile', { replace: true })}>Cancel</Button>
                    </div>
                </form>
            </div>
        </>
    )

    return <Layout top_buttons={<></>} body={body} />
}
