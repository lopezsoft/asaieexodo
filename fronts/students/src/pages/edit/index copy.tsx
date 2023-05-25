import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AuthUser } from 'src/common/user/AuthUser';
import { AuthClient } from 'src/common/auth/AuthClient';
import DataUpdate from '../../common/contracts/AuthContract'




const schema = yup.object().shape({
  first_name: yup.string().required('El nombre es requerido'),
  last_name: yup.string().required('Los apellidos son requeridos'),
  email: yup.string().email('El email es inválido').required('El email es requerido'),
});

const Edit = () => {
  const {
    handleSubmit,
    control,
  } = useForm<DataUpdate>({
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: DataUpdate) => {
    const id = AuthClient.TokenUserId();

    AuthUser.updateUser(id, data)
      .then((response) => {
        if (response && response.data.success) {
          // const redirectURL = '/Home';
          // window.location.href = redirectURL;
          // alert("bien")
          console.log("actualizado??")


        } else {
          console.error('Error en actualizar');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <Box className='content-right' sx={{ backgroundColor: '#F2F2F2', width: '100%', height: '100%', padding: '25px' }}>
      <Box className='content-right' sx={{ backgroundColor: 'background.paper' }}>
        <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name='first_name'
            control={control}
            defaultValue=''
            render={({ field }) => (
              <TextField
                {...field}
                autoFocus
                fullWidth
                sx={{ mb: 4 }}
                label='Nombres'
                placeholder='juan pablo'
              />
            )}
          />

          <Controller
            name='last_name'
            control={control}
            defaultValue=''
            render={({ field }) => (
              <TextField
                {...field}
                autoFocus
                fullWidth
                sx={{ mb: 4 }}
                label='Apellidos'
                placeholder='torres'
              />
            )}
          />

          <Controller
            name='email'
            control={control}
            defaultValue=''
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Email'
                sx={{ mb: 4 }}
                placeholder='user@example.com'
              />
            )}
          />

          <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 4 }}>
            actualizar
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default Edit;
