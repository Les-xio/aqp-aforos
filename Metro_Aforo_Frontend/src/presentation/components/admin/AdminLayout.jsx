import { Box } from '@mui/material';
import { Sidebar } from './Sidebar';

export function AdminLayout({ children }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar />
      <Box component="main" sx={{ flex: 1, p: 3, ml: { md: '260px' }, mt: { xs: 5, md: 0 } }}>
        {children}
      </Box>
    </Box>
  );
}
