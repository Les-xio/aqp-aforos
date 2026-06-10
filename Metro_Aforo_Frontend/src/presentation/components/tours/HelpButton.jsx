import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { Fab, Tooltip } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';

export function HelpButton({ steps, title = 'Ayuda del sistema' }) {
  const handleClick = () => {
    const driverObj = driver({
      animate: true,
      showProgress: true,
      progressText: '{{current}} de {{total}}',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
      overlayColor: '#003DA5',
      steps,
    });
    driverObj.drive();
  };

  return (
    <Tooltip title={title} placement="left">
      <Fab
        size="small"
        onClick={handleClick}
        sx={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          bgcolor: '#003DA5', color: '#fff',
          width: 44, height: 44, minHeight: 44,
          boxShadow: '0 4px 16px rgba(0,61,165,0.35)',
          '&:hover': { bgcolor: '#002d7a', transform: 'scale(1.05)' },
          transition: 'all 0.2s ease',
        }}
      >
        <HelpIcon sx={{ fontSize: 22 }} />
      </Fab>
    </Tooltip>
  );
}
