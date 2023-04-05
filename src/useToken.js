import { useState } from 'react';

export default function useToken() {

    function getToken() {
        const userToken = localStorage.getItem("token");
        return userToken && userToken
    }

    const [token, setToken] = useState(null)

    function saveToken(userToken) {
        localStorage.setItem("token", userToken);
        setToken(userToken);
    }

    function removeToken(userToken) {
        localStorage.removeItem("token");
        setToken(null);
    }

    return {saveToken, token, removeToken}
}