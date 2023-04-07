import axios from 'axios';
import { Button, Modal } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Post.css';

export default function SinglePostPreview({ postInfo, tokenInfo, isProfile }) {
    const navigate = useNavigate();
    let post = postInfo.post

    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
        axios({
            method: "DELETE",
            url: `/post/${post.id}`,
            headers: { Authorization: "Bearer " + tokenInfo.token }
        }).then((response) => {
            let rsp = response.data;
            console.log(rsp.msg)
            rsp.access_token && tokenInfo.saveToken(rsp.access_token, rsp.access_expiration)
            isProfile && postInfo.setPosts(rsp.profile_posts)
            !isProfile && postInfo.setPosts(rsp.home_posts)
        }).catch(function (error) {
            if (error.response) {
                console.log(error.response.data.msg)
                if (error.response.status === 401) {
                    tokenInfo.removeToken()
                    navigate('/timeOut', { replace: true })
                }
            }
        })
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="preview_wrapper">
                <div className="preview" onClick={() => navigate(`/post/${post.id}`, { replace: true, state: { post_id: post.id } })}>
                    <h2>{post.title}</h2>
                    <p>By: {post.author} - {post.created && post.created.slice(0, -7)}</p>
                </div>
                {isProfile &&
                    <div className="edit_buttons">
                        <Button className="button" onClick={() => navigate('/profile/update', { replace: true, state: { post_id: post.id } })}>Update</Button>
                        <Button className="button" onClick={showModal} danger>Delete</Button>
                    </div>
                }
                <Modal title="Delete Confirmation" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                    <p>Are you sure you want to delete this post?</p>
                </Modal>
            </div>
        </>
    )
}