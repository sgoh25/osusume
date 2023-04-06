import { useLocation } from 'react-router-dom';
import EditLayout from '../components/EditLayout.jsx';

export default function Update({ token, saveToken, removeToken }) {
    const { state } = useLocation();
    const { post_id } = state;
    return <EditLayout post_id={post_id} tokenInfo={{ token, saveToken, removeToken }} />
}
