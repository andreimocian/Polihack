import Button from '@mui/material/Button';
import { loginWithGoogle } from '../services/loginService';

export default function Login() {
    return (
        <div>
            <h1>Login Page</h1>
            <Button variant="contained" onClick={loginWithGoogle}>Login with Google</Button>
            <Button variant='contained' onClick={() => window.location.href = '/citizen'}>Citizen actions</Button>
        </div>
    );
}