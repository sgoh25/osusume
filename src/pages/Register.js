import LoginLayout from '../components/LoginLayout.jsx';

export default function Register({ saveToken }) {
  return <LoginLayout isRegister={true} saveToken={saveToken} />
}
