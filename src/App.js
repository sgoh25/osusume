import * as React from 'react';
import { Routes, Route } from 'react-router-dom';

import useToken from './useToken';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

export default function App() {
  const { token, removeToken, saveToken } = useToken();

  return (
    <div className="App">
      <Routes>
        <Route exact path="/" element={<Home token={token} saveToken={saveToken} removeToken={removeToken}/>} />
        {!token && token !== "" && token !== undefined ?
          <>
            <Route path="login" element={<Login saveToken={saveToken} />} />
            <Route path="register" element={<Register saveToken={saveToken} />} /> 
          </> :
          <Route path="profile" element={<Profile token={token} saveToken={saveToken} removeToken={removeToken}/>} />
        }
      </Routes>
    </div>
  );
}