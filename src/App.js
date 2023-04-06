import * as React from 'react';
import { Routes, Route } from 'react-router-dom';

import useToken from './useToken';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Create from './pages/Create';
import NotFound from './pages/NotFound';
import TimeOut from './pages/TimeOut';

export default function App() {
    const { token, removeToken, saveToken } = useToken();
    let tokenInfo = {token: token, saveToken: saveToken, removeToken: removeToken}

    return (
        <div className="App">
            <Routes>
                <Route exact path="/" element={<Home {...tokenInfo} />} />
                {!token && token !== "" && token !== undefined ?
                    <>
                        <Route path="login" element={<Login saveToken={saveToken} />} />
                        <Route path="register" element={<Register saveToken={saveToken} />} />
                    </> :
                    <>
                        <Route path="profile" element={<Profile {...tokenInfo} />} />
                        <Route path="profile/create" element={<Create {...tokenInfo} />} />
                    </>
                }
                <Route path="/timeout" element={<TimeOut removeToken={removeToken} />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
}