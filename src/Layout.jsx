import './styles/Home.css'

export default function Layout({ buttons, body }) {
  return (
    <>
      <div className="top">
        <div className="logo">The Bready Bakery</div>
        {buttons}
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