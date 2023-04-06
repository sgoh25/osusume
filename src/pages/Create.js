import EditLayout from '../components/EditLayout.jsx';

export default function Create({ token, saveToken }) {
    return <EditLayout isCreate={true} token={token} saveToken={saveToken} />
}
