// ** React Imports
import { ReactNode, useState } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Components
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Box, { BoxProps } from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import useMediaQuery from '@mui/material/useMediaQuery'
import OutlinedInput from '@mui/material/OutlinedInput'
import { styled, useTheme } from '@mui/material/styles'
import InputAdornment from '@mui/material/InputAdornment'
import MuiFormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Demo Imports
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'

import { useForm,Controller} from 'react-hook-form'
import { AuthUser } from 'src/common/user/AuthUser'

// import { SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

// ** Styled Components
const RegisterIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  maxHeight: 600,
  marginTop: theme.spacing(12),
  marginBottom: theme.spacing(12),
  [theme.breakpoints.down(1540)]: {
    maxHeight: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxHeight: 500
  }
}))

const RightWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    maxWidth: 450
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: 600
  },
  [theme.breakpoints.up('xl')]: {
    maxWidth: 750
  }
}))

const LinkStyled = styled(Link)(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const FormControlLabel = styled(MuiFormControlLabel)<FormControlLabelProps>(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  marginBottom: theme.spacing(1.75),
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary
  }
}))

const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().min(5).required()
})

// const defaultValues = {
//   first_name: 'Roberto',
//   last_name:'moncada',
//   email:'moncada1234@gmal.com',
//   password:'123456784',
//   password_confirmation:'123456784'


// }

interface FormDataRegister {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}


const Register = () => {
  // ** States
  const [showPassword, setShowPassword] = useState<boolean>(false)

  // ** Hooks
  const theme = useTheme()
  const { settings } = useSettings()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  // ** Vars
  const { skin } = settings


  // const {
  //   // control,

  //   handleSubmit,

  // } = useForm({
  //   // defaultValues,
  //   mode: 'onBlur',
  //   resolver: yupResolver(schema)

  // })
  const {
    control,
    setError,
    handleSubmit,
    formState: { errors }
  } = useForm({
    // defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  // const onSubmit: SubmitHandler<FormData> = (data) => {
  //   const { first_name, last_name, email, password, password_confirmation } = data;

  //   AuthUser.registerPersonUser({ first_name, last_name, email, password, password_confirmation })
  //     .then((response) => {
  //       if (response && response.data.success) {
  //         const redirectURL = '/login';
  //         window.location.href = redirectURL;
  //         console.log("usuario registrado correctamente")
  //       } else {
  //         console.error('Error en el registro');
  //       }
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });
  // };


  // const { first_name, last_name, email, password, password_confirmation } = data;

  //   AuthUser.registerPersonUser({ first_name, last_name, email, password, password_confirmation })

  const onSubmit = (data: FormDataRegister) => {
    const { first_name, last_name, email, password, password_confirmation } = data;

    AuthUser.registerPersonUser({ first_name, last_name, email, password, password_confirmation })
      .then((response) => {
        if (response && response.data.success) {
          const redirectURL = '/login';
          window.location.href = redirectURL;
          console.log("usuario registrado correctamente")
        } else {
          console.error('Error en el registro');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };





  const imageSource = skin === 'bordered' ? 'auth-v2-register-illustration-bordered' : 'auth-v2-register-illustration'

  return (
    <Box className='content-right' sx={{ backgroundColor: 'background.paper' }}>
      {!hidden ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            position: 'relative',
            alignItems: 'center',
            borderRadius: '20px',
            justifyContent: 'center',
            backgroundColor: 'customColors.bodyBg',
            margin: theme => theme.spacing(8, 0, 8, 8)
          }}
        >
          <RegisterIllustration
            alt='register-illustration'
            src={`/images/pages/${imageSource}-${theme.palette.mode}.svg`}
          />
          <FooterIllustrationsV2 />
        </Box>
      ) : null}
      <RightWrapper>
        <Box
          sx={{
            p: [6, 12],
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <Box sx={{ my: 2 }}>
              <Typography
                sx={{
                  margin: 0,
                  fontFamily:
                    'Public Sans, sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                  fontWeight: 500,
                  fontSize: '1.286rem',
                  lineHeight: 1.385,
                  textAlign: 'center',
                  color: 'rgba(51, 48, 60, 0.87)'
                }}
                variant='subtitle1'
              >
                Crear cuenta
              </Typography>
              <Typography
                sx={{ color: 'text.secondary', textAlign: 'left', variant: 'subtitle1', margin: '0px 0px 14px' }}
              >
                Complete el siguiente formulario para crear una nueva cuenta.
              </Typography>
              <Typography
                sx={{
                  fontWeight: 400,
                  fontSize: '2rem',
                  lineHeight: 1.2,
                  textAlign: 'center',
                  variant: 'subtitle1'
                }}
              >
                Formulario de Registro
              </Typography>
            </Box>
            <Typography
              variant='subtitle1'
              sx={{ textAlign: 'center', fontSize: '0.9rem', textTransform: 'uppercase', variant: 'subtitle1' }}
            >
              Datos del usuario
            </Typography>
            <Divider
              sx={{
                fontSize: '0.875rem',
                color: 'text.disabled',
                '& .MuiDivider-wrapper': { px: 9 },
                my: theme => `${theme.spacing(3)} !important`
              }}
            ></Divider>

              <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
                <Controller
                  name='first_name'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      autoFocus
                      fullWidth
                      sx={{ mb: 4 }}
                      label='Nombre'
                      placeholder='johndoe'
                      {...field}
                      error={Boolean(errors.first_name)}
                    />
                  )}
                />

                <Controller
                  name='last_name'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      autoFocus
                      fullWidth
                      sx={{ mb: 4 }}
                      label='Apellidos'
                      placeholder='torres'
                      {...field}
                      error={Boolean(errors.last_name)}
                    />
                  )}
                />

                <Controller
                  name='email'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      label='Email'
                      sx={{ mb: 4 }}
                      placeholder='user@email.com'
                      {...field}
                      error={Boolean(errors.email)}
                    />
                  )}
                />

                <Controller
                  name='password'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <FormControl fullWidth sx={{ mb: 4 }}>
                      <InputLabel htmlFor='auth-login-v2-password'>Contraseña</InputLabel>
                      <OutlinedInput
                        label='Password'
                        id='auth-login-v2-password'
                        type={showPassword ? 'text' : 'password'}
                        endAdornment={
                          <InputAdornment position='end'>
                            <IconButton
                              edge='end'
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              <Icon icon={showPassword ? 'tabler:eye' : 'tabler:eye-off'} fontSize={20} />
                            </IconButton>
                          </InputAdornment>
                        }
                        {...field}
                        error={Boolean(errors.password)}
                      />
                    </FormControl>
                  )}
                />

                <Controller
                  name='password_confirmation'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      type='password'
                      label='Confirmar contraseña'
                      sx={{ mb: 4 }}
                      placeholder='contraseña'
                      {...field}
                      error={Boolean(errors.password_confirmation)}
                    />
                  )}
                />

              <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 4 }}>
                              Registrarse
              </Button>
              </form>
          </Box>
        </Box>
      </RightWrapper>
    </Box>
  )
}

Register.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

Register.guestGuard = true

export default Register
