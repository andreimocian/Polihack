import { Box, Button, Container, Paper, Typography } from '@mui/material';
import { loginWithGoogle } from '../services/loginService';

export default function Login() {
    return (
        <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default', display: 'flex', alignItems: 'center' }}>
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 2 }}>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            Welcome to SafeMap
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
                            Sign in to access institutional features and report or view safe places.
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'grid', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => (window.location.href = '/citizen')}
                            sx={{ py: 1.25, textTransform: 'none' }}
                        >
                            Continue as Citizen
                        </Button>

                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={loginWithGoogle}
                            sx={{ py: 1.5, textTransform: 'none', fontWeight: 600 }}
                        >
                            Continue with Google (Authority/Volunteer)
                        </Button>

                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}