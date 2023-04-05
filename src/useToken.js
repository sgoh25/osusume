import { useState } from 'react';

export default function useToken() {
    function getToken() {
        const userToken = localStorage.getItem("token");
        return userToken && userToken
    }

    const [token, setToken] = useState(getToken())

    function saveToken(userToken, tokenExp) {
        localStorage.setItem("token", userToken);
        localStorage.setItem("expiration", tokenExp);
        setToken(userToken);
    }

    function removeToken() {
        localStorage.removeItem("token");
        localStorage.removeItem("expiration");
        setToken(getToken());
    }

    return { saveToken, token, removeToken }
}