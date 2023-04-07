import { useLocation } from 'react-router-dom';
import DisplayLayout from '../components/DisplayLayout';

export default function Home({ token, saveToken, removeToken }) {
    const { state } = useLocation();
    const { tag_id } = state ? state : {tag_id: null};
    return <DisplayLayout tag_id={tag_id} isProfile={false} tokenInfo={{ token, saveToken, removeToken }} />
}
