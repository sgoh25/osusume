import { Button, Modal } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Post.css';

export default function SinglePost({ post, isProfile }) {
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="post">
                <div className="title_wrapper">
                    <h2>{post.title}</h2>
                    {isProfile &&
                        <div className="update_buttons">
                            <Button className="button" onClick={() => navigate('/profile/update', { replace: true })}>Update</Button>
                            <Button className="button" onClick={showModal}>Delete</Button>
                        </div>
                    }
                </div>
                <p>By: {post.author} - {post.created}</p>
                <Modal title="Delete Confirmation" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                    <p>Are you sure you want to delete this post?</p>
                    <p>Some contents...</p>
                    <p>Some contents...</p>
                </Modal>
            </div>
        </>
    )
}