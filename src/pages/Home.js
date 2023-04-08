import { useLocation } from 'react-router-dom';
import { ensureValidState } from '../components/utils';
import DisplayLayout from '../components/DisplayLayout';

export default function Home({ token, saveToken, removeToken }) {
    let { state } = useLocation();
    state = ensureValidState(state);
    return <DisplayLayout state={state} isProfile={false} tokenInfo={{ token, saveToken, removeToken }} />
}
