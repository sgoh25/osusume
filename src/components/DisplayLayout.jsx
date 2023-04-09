import axios from 'axios';
import { Button, Dropdown, Pagination, Select } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { catchTimeout, getTagList, getMenuItems, refreshToken } from './utils';
import '../styles/Home.css';
import '../styles/Post.css';
import Layout from './Layout';
import SinglePostPreview from './SinglePostPreview.jsx';
import SingleComment from './SingleComment';

export default function DisplayLayout({ state, isProfile, tokenInfo }) {
    const navigate = useNavigate();
    let { token, saveToken, removeToken } = tokenInfo;
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [category, setCategory] = useState("My Posts");
    const [tag, setTag] = useState(state.tag_id);
    const [pg, setPg] = useState(state.pg_num);
    const [totalRows, setTotalRows] = useState(0);

    useEffect(() => {
        setPostsLoading(true);
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
            refreshToken(rsp, saveToken)
            rsp.posts && setPosts(rsp.posts);
            rsp.comments && setComments(rsp.comments);
            rsp.total_rows && setTotalRows(rsp.total_rows);
            if (totalRows && (
                (rsp.posts && category === "My Posts" && posts.length === 0)
                || (rsp.comments && category === "My Comments" && comments.length === 0)
            )) {
                handlePgChange(1);
            }
        }).catch((error) => catchTimeout(error, navigate, removeToken)).finally(function () {
            setPostsLoading(false);
        })
    }, [tag, pg, totalRows]);

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
            {isProfile && postsLoading && <div className="loading">Loading...</div>}
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
            setPg(1);
            url = `/post/profile/posts/${pg}`;
        }
        else {
            setCategory("My Comments");
            setPg(1);
            url = `/post/profile/comments/${pg}`;
        }
        axios({
            method: "GET",
            url: url,
            headers: { Authorization: "Bearer " + token }
        }).then((response) => {
            let rsp = response.data;
            refreshToken(rsp, saveToken)
            rsp.posts && setPosts(rsp.posts);
            rsp.comments && setComments(rsp.comments);
            rsp.total_rows && setTotalRows(rsp.total_rows);
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
                                    <div className="tag_title">{tag}</div>
                                </>
                            }
                        </div>
                        <Select className="tag" onSelect={handleTagSelect} placeholder="Tag" options={getTagList(tag != null)}
                        />
                    </div>
                </>
            }
            <div className="content">
                {content}
            </div>
            <Pagination className="pagination" current={pg} pageSize={localStorage.getItem("pg_size")}
                total={totalRows} onChange={handlePgChange} />
        </>
    )

    return <Layout top_buttons={buttons} body={body} />
}
