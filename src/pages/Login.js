import LoginLayout from '../components/LoginLayout.jsx'

export default function Login({ saveToken }) {
  return <LoginLayout isRegister={false} saveToken={saveToken} />
}
