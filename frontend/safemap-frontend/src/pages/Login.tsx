import Button from '@mui/material/Button';
import { loginWithGoogle } from '../services/loginService';

export default function Login() {
    return (
        <div>
            <h1>Login Page</h1>
            <Button variant="contained" onClick={loginWithGoogle}>Login</Button>
        </div>
    );
}