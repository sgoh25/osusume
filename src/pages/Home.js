import DisplayLayout from '../components/DisplayLayout';

export default function Home({ token, saveToken, removeToken }) {
    return <DisplayLayout isProfile={false} tokenInfo={{ token, saveToken, removeToken }} />
}
