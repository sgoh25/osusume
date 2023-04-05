import * as React from 'react';
import { Routes, Route } from 'react-router-dom';

import useToken from './useToken';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

export default function App() {
  const { token, removeToken, saveToken } = useToken();

  return (
    <div className="App">
      <Routes>
        {!token && token !== "" && token !== undefined ?
          <>
            <Route exact path="/" element={<Home token={null} saveToken={saveToken} removeToken={removeToken} />} />
            <Route path="login" element={<Login saveToken={saveToken} />} />
            <Route path="register" element={<Register saveToken={saveToken} />} />
          </> :
          <>
            <Route exact path="/" element={<Home token={token} saveToken={saveToken} removeToken={removeToken} />} />
            <Route path="profile" element={<Profile token={token} saveToken={saveToken} removeToken={removeToken} />} />
          </>
        }
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}