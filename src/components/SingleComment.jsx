import axios from 'axios';
import { Button, Modal } from 'antd';
import { DislikeOutlined, LikeOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { catchTimeout, refreshToken } from './utils';
import '../styles/Post.css';

export default function SingleComment({ post_id, commentInfo, pgInfo, tokenInfo, isPreview }) {
    const navigate = useNavigate();
    let comment = commentInfo.comment;
    let { token, saveToken, removeToken } = tokenInfo;
    const [score, setScore] = useState(comment.score);
    const [currVote, setCurrVote] = useState(0);

    useEffect(() => {
        axios({
            method: "GET",
            url: `/post/${post_id}/comment/${comment.id}/vote`,
            headers: { Authorization: "Bearer " + token }
        }).then((response) => {
            let rsp = response.data;
            refreshToken(rsp, saveToken);
            setCurrVote(rsp.voteScore);
        }).catch((error) => catchTimeout(error, navigate, removeToken))
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
        axios({
            method: "DELETE",
            url: `/post/${post_id}/comment/${comment.id}/${pgInfo.pg}`,
            headers: { Authorization: "Bearer " + token }
        }).then((response) => {
            let rsp = response.data;
            refreshToken(rsp, saveToken);
            setCurrVote(0);
            pgInfo.setTotalRows(rsp.total_rows);
            isPreview && commentInfo.setComments(rsp.profile_comments);
            !isPreview && commentInfo.setComments(rsp.post_comments);
        }).catch((error) => catchTimeout(error, navigate, removeToken))
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    function sendUpdate(success_score, next_vote, prev_vote) {
        axios({
            method: "POST",
            url: `/post/${post_id}/comment/${comment.id}/vote`,
            data: { score: success_score, next_vote: next_vote, prev_vote: prev_vote },
            headers: { Authorization: "Bearer " + token }
        }).then((response) => {
            let rsp = response.data;
            refreshToken(rsp, saveToken);
        }).catch(function (error) {
            if (error.response) {
                if (currVote + next_vote !== 0) {
                    setScore((next_vote === 1) ? score - 1 : score + 1);
                    setCurrVote(0);
                }
                catchTimeout(error, navigate, removeToken);
            }
        })
    }

    function handleVote(next_vote) {
        let success_score = (next_vote === 1) ? score + 1 : score - 1;
        let prev_vote = currVote;
        if (currVote + next_vote === 0) {
            setScore(success_score);
            setCurrVote(0);
            axios({
                method: "DELETE",
                url: `/post/${post_id}/comment/${comment.id}/vote`,
                headers: { Authorization: "Bearer " + token }
            }).then((response) => {
                let rsp = response.data;
                refreshToken(rsp, saveToken);
                sendUpdate(success_score, next_vote, prev_vote);
            }).catch(function (error) {
                if (error.response) {
                    setScore((next_vote === 1) ? score - 1 : score + 1);
                    setCurrVote(prev_vote);
                    catchTimeout(error, navigate, removeToken);
                }
            })
        }
        else {
            setScore(success_score);
            setCurrVote(next_vote);
            sendUpdate(success_score, next_vote, prev_vote);
        }
    }

    let invalidToken = (!token && token !== "" && token !== undefined);
    let score_class;
    if (score === 0) {
        score_class = "score";
    }
    else {
        score_class = score > 0 ? "pos_score" : "neg_score";
    }
    return (
        <>
            {isPreview ?
                <div className="comment_preview_wrapper">
                    <div className="comment_preview" onClick={() => navigate(`/post/${post_id}`, { replace: true, state: { post_id: post_id, pg_num: 1 } })}>
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
                        <Button className="vote_button" onClick={() => handleVote(-1)}
                            disabled={invalidToken || (currVote === -1)}>
                            <DislikeOutlined style={{ fontSize: '12px' }} />
                        </Button>
                        <div className={score_class}>{score}</div>
                        <Button className="vote_button" onClick={() => handleVote(1)}
                            disabled={invalidToken || (currVote === 1)}>
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