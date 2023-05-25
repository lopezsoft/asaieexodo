import React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { AccountBox } from '@mui/icons-material';

const Profile = () => {
  const styles = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '3rem',
  };


  const handleEditUser = () => {
    editUser();
  };

  const editUser = () => {
    const redirectURL = '/edit/user';

    window.location.href = redirectURL;
  };

  return (
    <Box className="content-right" sx={{ backgroundColor: '#F2F2F2', width: '100%', height: '100%', padding: '25px' }}>
      <Button
        variant="contained"
        color="primary"
        sx={{
          width: '6rem',
          height: '6rem',
          padding: '0.25rem',
          backgroundColor: '#2556a3',
          margin: '0.5rem',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={handleEditUser}>
          <Box sx={styles}>
            <AccountBox />
          </Box>
          Perfil
        </Box>
      </Button>
    </Box>
  );
};

export default Profile;
