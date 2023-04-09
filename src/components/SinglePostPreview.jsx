import axios from 'axios';
import { Button, Modal } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { catchTimeout, getTagMap, refreshToken } from './utils';
import '../styles/Post.css';

export default function SinglePostPreview({ postInfo, pgInfo, tokenInfo, isProfile }) {
    const navigate = useNavigate();
    let post = postInfo.post;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
        axios({
            method: "DELETE",
            url: `/post/${post.id}/${pgInfo.pg}`,
            headers: { Authorization: "Bearer " + tokenInfo.token }
        }).then((response) => {
            let rsp = response.data;
            refreshToken(rsp, tokenInfo.saveToken);
            pgInfo.setTotalRows(rsp.total_rows);
            isProfile && postInfo.setPosts(rsp.profile_posts);
        }).catch((error) => catchTimeout(error, navigate, tokenInfo.removeToken))
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="preview_wrapper">
                <div className="preview" onClick={() => navigate(`/post/${post.id}`, { replace: true, state: { post_id: post.id, pg_num: 1 } })}>
                    <h2>{post.title}</h2>
                    <div class="preview_bottom">
                        <p>By: {post.author} - {post.created && post.created.slice(0, -7)}</p>
                        {post.tag && <Button className={`preview_tag${getTagMap()[post.tag]}`} onClick={() => navigate(`/tag/${post.tag}`, { replace: true, state: { tag_id: post.tag } })}>{post.tag}</Button>}
                    </div>
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