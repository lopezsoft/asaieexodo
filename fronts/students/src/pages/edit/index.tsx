import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import Button from '@mui/material/Button';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AuthUser } from 'src/common/user/AuthUser';
import { AuthClient } from 'src/common/auth/AuthClient';
import UserContract from '../../common/contracts/AuthContract';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// import LoginContract from '../../common/contracts/AuthContract';

const schema = yup.object().shape({
  first_name: yup.string().required('El nombre es requerido'),
  last_name: yup.string().required('Los apellidos son requeridos'),
  email: yup.string().email('El email es inválido').required('El email es requerido'),
});

const defaultValues = {

  first_name: 'sebastian',
  last_name:'aguirre',
  email:'sebastianactualizado@gmal.com',

  fullname:  'sebastian' + ' ' + 'aguirre'


}


const Edit = () => {
  const {
    handleSubmit,
    control,
  } = useForm({
    mode: 'onBlur',
     defaultValues,
    resolver: yupResolver(schema),
  });

  const onSubmit = (data:UserContract) => {
  // const onSubmit = () => {
    const id = AuthClient.TokenUserId();

    // const storedToken = window.localStorage.getItem('AvrJwtApi');
    // const userT = storedToken ? JSON.parse(storedToken).user : null;


    AuthUser.updateUser(id, data)
      .then((response) => {
        if (response && response.data.success) {
          console.log("interfaz de updateUser");
          console.log(data);

          toast.success('Usuario actualizado correctamente');
        } else {
          toast.error('Error al intentar actualizar usuario');
          console.error('Error en actualizar');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <Box className='content-right' sx={{ backgroundColor: '#F2F2F2', width: '100%', height: '100%', padding: '25px' }}>
      <ToastContainer position="bottom-right" />
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
