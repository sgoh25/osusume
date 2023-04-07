import axios from 'axios';
import { Button, Modal } from 'antd';
import { DislikeOutlined, LikeOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Post.css';

export default function SingleComment({ post_id, commentInfo, tokenInfo, isPreview }) {
    const navigate = useNavigate();
    let comment = commentInfo.comment
    let { token, saveToken, removeToken } = tokenInfo
    let [score, setScore] = useState(comment.score)
    let [canVote, setCanVote] = useState(false)
    let [isUpvote, setIsUpvote] = useState(null)

    useEffect(() => {
        axios({
            method: "GET",
            url: `/post/${post_id}/comment/${comment.id}/getvote`,
            headers: { Authorization: "Bearer " + token }
        }).then((response) => {
            let rsp = response.data;
            console.log(rsp.msg)
            rsp.access_token && saveToken(rsp.access_token, rsp.access_expiration)
            setCanVote(rsp.canVote)
            if (rsp.isUpvote != null) {
                setIsUpvote(rsp.isUpvote)
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
            headers: { Authorization: "Bearer " + token }
        }).then((response) => {
            let rsp = response.data;
            console.log(rsp.msg)
            rsp.access_token && saveToken(rsp.access_token, rsp.access_expiration)
            commentInfo.setComments(rsp.comments)
        }).catch(function (error) {
            if (error.response) {
                console.log(error.response.data.msg)
                if (error.response.status === 401) {
                    removeToken()
                    navigate('/timeOut', { replace: true })
                }
            }
        })
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    function sendUpdate(is_upvote, remove_vote, success_score) {
        axios({
            method: "POST",
            url: `/post/${post_id}/comment/${comment.id}/vote`,
            data: { is_upvote: is_upvote, remove_vote: remove_vote, score: success_score },
            headers: { Authorization: "Bearer " + token }
        }).then((response) => {
            let rsp = response.data;
            console.log(rsp.msg);
            rsp.access_token && saveToken(rsp.access_token, rsp.access_expiration);
        }).catch(function (error) {
            if (error.response) {
                if (!remove_vote) {
                    setScore(is_upvote ? score - 1 : score + 1);
                    setCanVote(true);
                    setIsUpvote(null);
                }
                console.log(error.response.data.msg)
                if (error.response.status === 401) {
                    removeToken();
                    navigate('/timeOut', { replace: true });
                }
            }
        })
    }

    function handleVote(is_upvote) {
        let success_score = is_upvote ? score + 1 : score - 1;
        let remove_vote = (isUpvote != null && is_upvote !== isUpvote);
        if (remove_vote) {
            let prev_vote = isUpvote;
            setScore(success_score);
            setCanVote(true);
            setIsUpvote(null);
            axios({
                method: "DELETE",
                url: `/post/${post_id}/comment/${comment.id}/deletevote`,
                headers: { Authorization: "Bearer " + token }
            }).then((response) => {
                let rsp = response.data;
                console.log(rsp.msg);
                rsp.access_token && saveToken(rsp.access_token, rsp.access_expiration);
                sendUpdate(is_upvote, remove_vote, success_score);
            }).catch(function (error) {
                if (error.response) {
                    setScore(is_upvote ? score - 1 : score + 1);
                    setCanVote(false);
                    setIsUpvote(prev_vote);
                    console.log(error.response.data.msg);
                    if (error.response.status === 401) {
                        removeToken()
                        navigate('/timeOut', { replace: true })
                    }
                }
            })
        }
        else {
            setScore(success_score);
            setCanVote(false);
            setIsUpvote(is_upvote);
            sendUpdate(is_upvote, remove_vote, success_score);
        }
    }

    let invalidToken = (!token && token !== "" && token !== undefined);
    let score_class;
    if (score == 0) {
        score_class = "score";
    }
    else {
        score_class = score > 0 ? "pos_score" : "neg_score";
    }
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
                    <div className="vote_wrapper">
                        <Button className="vote_button" onClick={() => handleVote(false)}
                            disabled={invalidToken || (!canVote && !isUpvote && isUpvote != null)}>
                            <DislikeOutlined style={{ fontSize: '12px' }} />
                        </Button>
                        <div className={score_class}>{score}</div>
                        <Button className="vote_button" onClick={() => handleVote(true)}
                            disabled={invalidToken || (!canVote && isUpvote && isUpvote != null)}>
                            <LikeOutlined style={{ fontSize: '12px' }} />
                        </Button>
                    </div>
                    <Modal title="Delete Confirmation" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                        <p>Are you sure you want to delete this comment?</p>
                    </Modal>
                </div>
            }
        </>
    )
}