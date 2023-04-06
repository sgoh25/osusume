import EditLayout from '../components/EditLayout.jsx';

export default function Create({ token, saveToken, removeToken }) {
    return <EditLayout post_id={null} tokenInfo={{ token, saveToken, removeToken }} />
}
