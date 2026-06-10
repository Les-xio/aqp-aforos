import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { appTheme } from './theme';
import { AuthProvider } from './application/context/AuthContext';
import { TurnoProvider } from './application/context/TurnoContext';
import { SyncProvider } from './infrastructure/storage/SyncContext';
import { SwUpdateBanner } from './presentation/components/SwUpdateBanner';
import { InstallPrompt } from './presentation/components/InstallPrompt';
import { AppRoutes } from './presentation/routes/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30000 },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <TurnoProvider>
              <SyncProvider>
                <SwUpdateBanner />
                <InstallPrompt />
                <AppRoutes />
              </SyncProvider>
            </TurnoProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
