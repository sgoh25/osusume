import axios from 'axios';
import { Button, Modal } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Post.css';

export default function SingleComment({ post_id, commentInfo, tokenInfo, isPreview }) {
    const navigate = useNavigate();
    let comment = commentInfo.comment

    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
        let url;
        if (isPreview) {
            url = `/post/comment/${comment.id}`;
        }
        else {
            url = `/post/${post_id}/comment/${comment.id}`;
        }
        axios({
            method: "DELETE",
            url: url,
            headers: { Authorization: "Bearer " + tokenInfo.token }
        }).then((response) => {
            let rsp = response.data;
            console.log(rsp.msg)
            rsp.access_token && tokenInfo.saveToken(rsp.access_token, rsp.access_expiration)
            commentInfo.setComments(rsp.comments)
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
            {isPreview ?
                <div className="comment_preview_wrapper">
                    <div className="comment_preview" onClick={() => navigate(`/post/${post_id}`, { replace: true, state: { post_id: post_id } })}>
                        <div className="comment_author">By: {comment.author} - {comment.created && comment.created.slice(0, -7)}</div>
                        <hr />
                        <div className="comment_body">{comment.comment}</div>
                    </div>
                    <div className="comment_edit_buttons">
                        <Button className="button" onClick={showModal} danger>Delete</Button>
                    </div>
                    <Modal title="Delete Confirmation" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                        <p>Are you sure you want to delete this post?</p>
                    </Modal>
                </div>
                : <div className="comment">
                    <div className="comment_wrapper">
                        <div className="comment_author">By: {comment.author} - {comment.created && comment.created.slice(0, -7)}</div>
                        {comment.canEdit &&
                            <div className="comment_delete">
                                <Button className="button" onClick={showModal} danger>Delete</Button>
                            </div>
                        }
                    </div>
                    <hr />
                    <div className="comment_body">{comment.comment}</div>
                    <Modal title="Delete Confirmation" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                        <p>Are you sure you want to delete this comment?</p>
                    </Modal>
                </div>
            }
        </>
    )
}