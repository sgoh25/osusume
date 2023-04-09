import axios from 'axios';
import { Button, Dropdown, Modal, Pagination, Select } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { catchTimeout, getMenuItems, getTagList, getTagMap, handleLogout, refreshToken } from './utils';
import '../styles/Home.css';
import '../styles/Post.css';
import '../styles/Settings.css';
import Layout from './Layout';
import SinglePostPreview from './SinglePostPreview.jsx';
import SingleComment from './SingleComment';

export default function DisplayLayout({ state, isProfile, tokenInfo }) {
    const navigate = useNavigate();
    let { token, saveToken, removeToken } = tokenInfo;
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [category, setCategory] = useState("My Posts");
    const [tag, setTag] = useState(state.tag_id);
    const [pg, setPg] = useState(state.pg_num);
    const [totalRows, setTotalRows] = useState(0);
    const [username, setUsername] = useState("");
    const [passwordForm, setPasswordForm] = useState({
        curr_password: "",
        new_password: ""
    });
    const [passMsg, setPassMsg] = useState(null);
    const [passError, setPassError] = useState(null);

    useEffect(() => {
        let url;
        if (isProfile) {
            url = (category === "My Posts") ? `/post/profile/posts/${pg}` : `/post/profile/comments/${pg}`;
        }
        else {
            url = tag ? `/post/home/${tag}/${pg}` : `/post/home/${pg}`;
        }
        axios({
            method: "GET",
            url: url,
            headers: { Authorization: "Bearer " + token }
        }).then((response) => {
            let rsp = response.data;
            refreshToken(rsp, saveToken);
            rsp.posts && setPosts(rsp.posts);
            rsp.comments && setComments(rsp.comments);
            rsp.total_rows && setTotalRows(rsp.total_rows);
            if (totalRows && (
                (rsp.posts && category === "My Posts" && posts.length === 0)
                || (rsp.comments && category === "My Comments" && comments.length === 0)
            )) {
                handlePgChange(1);
            }
        }).catch((error) => catchTimeout(error, navigate, removeToken))
    }, [tag, pg, totalRows]);

    function handleChange(event) {
        const { value, name } = event.target;
        setPasswordForm(prevNote => ({
            ...prevNote, [name]: value
        })
        );
    }

    function handleSubmit() {
        axios({
            method: "POST",
            url: '/auth/settings',
            data: {
                curr_password: passwordForm.curr_password,
                new_password: passwordForm.new_password
            },
            headers: { Authorization: "Bearer " + token }
        }).then((response) => {
            let rsp = response.data;
            refreshToken(rsp, saveToken);
            setPassMsg(rsp.msg);
            setPassError(null);
        }).catch(function (error) {
            if (error.response) {
                console.log(error.response.data.msg);
                setPassError(error.response.data.msg);
                setPassMsg(null);
            }
        })

        setPasswordForm(({
            curr_password: "",
            new_password: ""
        }));
    }

    let menuProps;
    if (isProfile) {
        const items = getMenuItems({ home: 1, logout: 1 }, navigate, removeToken);
        menuProps = { items };
    }
    else {
        const items = getMenuItems({ profile: 1, logout: 1 }, navigate, removeToken);
        menuProps = { items };
    }

    let invalidToken = (!token && token !== "" && token !== undefined);
    let buttons = (
        <>
            {invalidToken ?
                <div className="button_wrapper">
                    <Button className="button" onClick={() => navigate('/login', { replace: true })}>Log In</Button>
                    <Button className="button" onClick={() => navigate('/register', { replace: true })}>Register</Button>
                </div>
                : <Dropdown menu={menuProps}>
                    <Button className="button">Menu<MenuOutlined /></Button>
                </Dropdown>
            }
        </>
    )

    let content = (
        <>
            {
                category === "My Posts" && posts && posts.length !== 0 &&
                posts.map((post, idx) => <SinglePostPreview postInfo={{ post, setPosts }} pgInfo={{ pg, setPg, setTotalRows }}
                    tokenInfo={{ token, saveToken, removeToken }} isProfile={isProfile} key={`${post}${idx}`} />)
            }
            {
                category === "My Comments" && comments && comments.length !== 0 &&
                comments.map((comment, idx) => <SingleComment post_id={comment.post_id} commentInfo={{ comment, setComments }}
                    pgInfo={{ pg, setPg, setTotalRows }} tokenInfo={{ token, saveToken, removeToken }} isPreview={true} key={`${comment}${idx}`} />)
            }
        </>
    )

    function handleCategorySelect(value) {
        let url;
        if (value === "My Posts") {
            setCategory("My Posts");
            url = `/post/profile/posts/${pg}`;
        }
        else if (value === "My Comments") {
            setCategory("My Comments");
            url = `/post/profile/comments/${pg}`;
        }
        else {
            setCategory("Settings");
            url = `/auth/settings`;
        }
        setPg(1);
        setPassMsg(null);
        setPassError(null);
        setPasswordForm(({
            curr_password: "",
            new_password: ""
        }));
        axios({
            method: "GET",
            url: url,
            headers: { Authorization: "Bearer " + token }
        }).then((response) => {
            let rsp = response.data;
            refreshToken(rsp, saveToken);
            rsp.posts && setPosts(rsp.posts);
            rsp.comments && setComments(rsp.comments);
            rsp.total_rows && setTotalRows(rsp.total_rows);
            rsp.username && setUsername(rsp.username);
        }).catch((error) => catchTimeout(error, navigate, removeToken))
    }

    function handleTagSelect(value) {
        if (value === "Home") {
            setTag(null);
            setPg(1);
            navigate(`/`, { replace: true, state: { pg_num: 1, tag_id: value } });
        }
        else {
            setTag(value);
            setPg(1);
            navigate(`/tag/${value}`, { replace: true, state: { pg_num: 1, tag_id: value } });
        }
    }

    function handlePgChange(page) {
        setPg(page);
        !isProfile && tag == null && navigate(`/pg/${page}`, { replace: true, state: { pg_num: page, tag_id: tag } });
        !isProfile && tag != null && navigate(`/tag/${tag}/pg/${page}`, { replace: true, state: { pg_num: page, tag_id: tag } });
        isProfile && navigate(`/profile/pg/${page}`, { replace: true, state: { pg_num: page, tag_id: tag } });
    }

    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
        axios({
            method: "DELETE",
            url: '/auth/settings',
            headers: { Authorization: "Bearer " + token }
        }).then(() => {
            handleLogout(navigate, removeToken);
        }).catch((error) => catchTimeout(error, navigate, removeToken))
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    let body = (
        <>
            {isProfile ?
                <>
                    <div className="top_profile">
                        <div className="profile_title">{category}</div>
                        <div className="create_button">
                            <Button className="button" onClick={() => navigate('/profile/create', { replace: true })}>Create Post</Button>
                        </div>
                    </div>
                    <div className="category_wrapper">
                        <Select className="category"
                            defaultValue={category}
                            onChange={handleCategorySelect}
                            options={[
                                { value: 'My Posts', label: 'My Posts' },
                                { value: 'My Comments', label: 'My Comments' },
                                { value: 'Settings', label: 'Settings' },
                            ]}
                        />
                    </div>
                </>
                : <>
                    <div className="center">
                        <h1>Welcome to Osusume!</h1>
                    </div>
                    <div className="top_profile">
                        <div className="tag_title_wrapper">
                            {tag &&
                                <>
                                    <div className="tag_pretitle">Tag: </div>
                                    <div className={`tag_title${getTagMap()[tag]}`}>{tag}</div>
                                </>
                            }
                        </div>
                        <Select className="tag" onSelect={handleTagSelect} placeholder="Tag" options={getTagList(tag != null)}
                        />
                    </div>
                </>
            }
            {category !== "Settings" ?
                <>
                    <div className="content">
                        {content}
                    </div>
                    <Pagination className="pagination" current={pg} pageSize={localStorage.getItem("pg_size")}
                        total={totalRows} onChange={handlePgChange} />
                </>
                : <>
                    <div className="settings_wrapper">
                        <form>
                            <div className="settings_label">Username:</div>
                            <input type="text" name="username" text={username} value={username} disabled></input>
                            <div className="settings_label">Current Password:</div>
                            <input type="password" onChange={handleChange} placeholder="Current Password"
                                name="curr_password" text={passwordForm.curr_password} value={passwordForm.curr_password}></input>
                            <div className="settings_label">New Password:</div>
                            <input type="password" onChange={handleChange} placeholder="New Password"
                                name="new_password" text={passwordForm.new_password} value={passwordForm.new_password}></input>
                            {passError != null && <div className="error">{passError}</div>}
                            {passMsg != null && <div className="msg">{passMsg}</div>}
                            <div className="settings_button">
                                <Button className="button" type="primary" onClick={handleSubmit}>Update Password</Button>
                            </div>
                            <div className="delete_button">
                                <Button className="button" type="primary" onClick={showModal} danger>Delete Account</Button>
                            </div>
                            <Modal title="Delete Confirmation" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                                <p>Are you sure you want to delete your account?</p>
                            </Modal>
                        </form>
                    </div>
                </>
            }
        </>
    )

    return <Layout top_buttons={buttons} body={body} />
}
