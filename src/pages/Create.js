import PostLayout from '../components/PostLayout.jsx'

export default function Create({ token, saveToken }) {
    return <PostLayout isCreate={true} token={token} saveToken={saveToken} />
}
