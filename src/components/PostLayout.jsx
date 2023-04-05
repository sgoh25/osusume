import { useNavigate } from 'react-router-dom';
import '../styles/Post.css'
import Layout from './Layout.jsx'

export default function PostLayout({ isCreate }) {
    const navigate = useNavigate();

    let body = (
        <>
            <div className="login_wrapper">
                {isCreate && <div className="title">Create New Post</div>}
                {!isCreate && <div className="title">Edit Post</div>}
                <div className="label">Title:</div>
                <input type="text" placeholder="Title"></input>
                <div className="label">Body:</div>
                <input type="text" placeholder="Body"></input>
                <div className="login_button">
                    <button className="button">Submit</button>
                    <button className="button" onClick={() => navigate('/', { replace: true })}>Cancel</button>
                </div>
            </div>
        </>
    )

    return <Layout top_buttons={<></>} body={body} />
}
