import * as React from 'react';
import { Routes, Route } from 'react-router-dom';

import useToken from './useToken';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Create from './pages/Create';
import Update from './pages/Update';
import Post from './pages/Post';
import NotFound from './pages/NotFound';
import TimeOut from './pages/TimeOut';

export default function App() {
    const { token, removeToken, saveToken } = useToken();
    let tokenInfo = { token: token, saveToken: saveToken, removeToken: removeToken }
    localStorage.setItem("pg_size", 5);

    return (
        <div className="App">
            <Routes>
                <Route exact path="/" element={<Home {...tokenInfo} />} />
                <Route path="pg/:pg_num" element={<Home {...tokenInfo} />} />
                <Route path="post/:post_id" element={<Post {...tokenInfo} />} />
                <Route path="post/:post_id/pg/:pg_num" element={<Post {...tokenInfo} />} />
                <Route path="tag/:tag_id" element={<Home {...tokenInfo} />} />
                <Route path="tag/:tag_id/pg/:pg_num" element={<Home {...tokenInfo} />} />
                {!token && token !== "" && token !== undefined ?
                    <>
                        <Route path="login" element={<Login saveToken={saveToken} />} />
                        <Route path="register" element={<Register saveToken={saveToken} />} />
                    </>
                    : <>
                        <Route path="profile" element={<Profile {...tokenInfo} />} />
                        <Route path="profile/pg/:pg_num" element={<Profile {...tokenInfo} />} />
                        <Route path="profile/create" element={<Create {...tokenInfo} />} />
                        <Route path="profile/update" element={<Update {...tokenInfo} />} />
                    </>
                }
                <Route path="/timeout" element={<TimeOut removeToken={removeToken} />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
}