import '../styles/Home.css';

export default function Layout({ top_buttons, body }) {
    return (
        <>
            <div className="top">
                <div className="logo">Osusume</div>
                {top_buttons}
            </div>

            <div className="header"></div>

            <div className="wrapper">
                <main className="main">
                    {body}
                </main>
            </div>

            <div className="footer"></div>
        </>
    )
}