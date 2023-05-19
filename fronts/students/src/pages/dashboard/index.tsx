// ** React Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'


const Dashboard = () => {

  return (
    <Box className='content-right' sx={{ backgroundColor: '#F2F2F2', width: '100%', height: '100%', padding: '25px' }}>
      <Box sx={{ backgroundColor: '#fff', width: '98%', height: '11%', borderRadius: '5px' }}>
      <Typography
        sx={{
          color: 'text.primary',
          textAlign: 'left',
          variant: 'subtitle1',
          lineHeight: '2.7',
          margin: '3px 0px 14px',
          padding: '6px',
        }}
      >
        ESTIMADO USUARIO USTED TIENE ACCESO A:
      </Typography>
      </Box>

  </Box>



  )
}


export default Dashboard
