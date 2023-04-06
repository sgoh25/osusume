import DisplayLayout from '../components/DisplayLayout';

export default function Profile({ token, saveToken, removeToken }) {
    return <DisplayLayout isProfile={true} tokenInfo={{ token, saveToken, removeToken }} />
}
