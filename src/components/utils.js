import axios from "axios";

export function getTagList(showHome) {
    if (showHome) {
        return [
            { value: 'Home', label: '<Home>' },
            { value: 'Food', label: 'Food' },
            { value: 'Entertainment', label: 'Entertainment' },
        ]
    }
    else {
        return [
            { value: 'Food', label: 'Food' },
            { value: 'Entertainment', label: 'Entertainment' },
        ]
    }
}

export function handleLogout(navigate, removeToken) {
    axios.post("/auth/logout").then((response) => {
        console.log(response.data.msg)
        removeToken()
        navigate("/", { replace: true })
    }).catch(function (error) {
        if (error.response) {
            console.log(error.response.data.msg)
        }
    })
}

export function getMenuItems(items, navigate, removeToken) {
    let menu = [];
    if (!items) {
        return menu
    }
    if ("home" in items) {
        menu.push({ label: "Home", key: "1", onClick: () => navigate('/', { replace: true }) })
    }
    if ("profile" in items) {
        menu.push({ label: "Profile", key: "2", onClick: () => navigate('/profile', { replace: true }) })
    }
    if ("logout" in items) {
        menu.push({ label: "Logout", key: "3", danger: true, onClick: () => handleLogout(navigate, removeToken) })
    }
    if ("divider" in items) {
        menu.push({ type: 'divider' })
    }
    if ("login" in items) {
        menu.push({ label: "Log In", key: "4", onClick: () => navigate('/login', { replace: true }) })
    }
    if ("register" in items) {
        menu.push({ label: "Register", key: "5", onClick: () => navigate('/register', { replace: true }) })
    }
    return menu
}

export function catchTimeout(error, navigate, removeToken) {
    if (error.response) {
        console.log(error.response.data.msg)
        if (error.response.status === 401) {
            removeToken()
            navigate('/timeOut', { replace: true })
        }
    }
}

export function refreshToken(rsp, saveToken) {
    console.log(rsp.msg);
    rsp.access_token && saveToken(rsp.access_token, rsp.access_expiration);
}

export function ensureValidState(state) {
    if (!state) {
        return { pg_num: 1, tag_id: null }
    }
    if (!("pg_num" in state)) {
        state["pg_num"] = 1;
    }
    if (!("tag_id" in state)) {
        state["tag_id"] = null;
    }
    return state
}