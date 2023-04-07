import DisplayLayout from '../components/DisplayLayout';

export default function Profile({ token, saveToken, removeToken }) {
    return <DisplayLayout tag_id={null} isProfile={true} tokenInfo={{ token, saveToken, removeToken }} />
}
