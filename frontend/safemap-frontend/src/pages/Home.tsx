import { fetchCurrentUser } from "../services/loginService";
import { useEffect, useState } from "react";
import { Box, Container, Paper, Typography, List, ListItem, ListItemText, Divider, Chip, Stack } from "@mui/material";
import { getReportsApi } from "../services/api";

export function useCurrentUser() {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    fetchCurrentUser().then(setUser);
  }, []);

  return user;
}

export function getAllReports() {
  const [reports, setReports] = useState<any>([]);

  useEffect(() => {
    getReportsApi().then(setReports);
  }, []);
  
  return reports;
} 

export default function Home() {
  const user = useCurrentUser();
  const reports = getAllReports();

  const totalReports = typeof reports?.results === 'number' ? reports.results : Array.isArray(reports?.data) ? reports.data.length : 0;
  const pendingCount = Array.isArray(reports?.data) ? reports.data.filter((r: any) => r.status === 'pending').length : 0;

  const roleMessage =
    user?.role === "autoritate"
      ? "Rolul tău: autoritate — gestionezi rapoartele și coordonezi intervențiile."
      : user?.role === "voluntar"
      ? "Rolul tău: voluntar — ajuți la evaluarea situațiilor și sprijini echipele din teren."
      : null;

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="md">
        <Paper elevation={2} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main' }}>
              SafeMap
            </Typography>

            {user ? (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Bine ai venit, {user.name}!
                </Typography>
                {roleMessage && (
                  <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    {roleMessage}
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Te rugăm să te autentifici pentru a accesa toate funcționalitățile.
              </Typography>
            )}

            {user ? (
              <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                  <strong>Nume:</strong> {user.name}
                </Typography>
                {user.email && (
                  <Typography variant="subtitle1" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    <strong>Email:</strong> {user.email}
                  </Typography>
                )}
                <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                  <strong>Rol:</strong> {user.role ?? '—'}
                </Typography>
              </Paper>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                Te rugăm să te autentifici pentru a vedea informațiile tale.
              </Typography>
            )}

            {/* Stats + Latest 5 reports box */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <Typography variant="h6" sx={{ mb: { xs: 0, sm: 0 } }}>
                  Cele mai recente rapoarte
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip label={`Total: ${totalReports}`} color="primary" size="small" />
                  <Chip label={`Pending: ${pendingCount}`} color={pendingCount > 0 ? 'secondary' : 'default'} size="small" />
                </Stack>
              </Stack>

              <Paper variant="outlined" sx={{ p: 2 }}>
              {Array.isArray(reports?.data) && reports.data.length > 0 ? (
                <List disablePadding>
                  {reports.data
                    .slice()
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5)
                    .map((r: any, idx: number) => (
                      <div key={r._id || r.id || idx}>
                        <ListItem alignItems="flex-start">
                          <ListItemText
                            primary={`${r.type} — ${new Date(r.createdAt).toLocaleString()}`}
                            secondary={
                              <span>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {r.description ? (r.description.length > 120 ? r.description.slice(0, 120) + '…' : r.description) : 'Fără descriere'}
                                </Typography>
                                <br />
                                <Typography component="span" variant="caption" color="text.secondary">
                                  {typeof r.lat === 'number' && typeof r.lng === 'number' ? `${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}` : 'Locație necunoscută'}
                                </Typography>
                              </span>
                            }
                          />
                        </ListItem>
                        {idx < Math.min(4, (reports.data || []).length - 1) && <Divider component="li" />}
                      </div>
                    ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">Nu există rapoarte recente.</Typography>
              )}
            </Paper>
              </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
