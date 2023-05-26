// ** React Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid';

const Dashboard = () => {

  return (
    <Box className='content-right' sx={{ backgroundColor: '#F2F2F2', width: '100%', height: '100%', padding: '25px' }}>
      <Box sx={{ backgroundColor: '#fff', borderRadius: '5px', width: '100%' }}>
        <Grid container>
          <Grid item xs={12} sm={6} md={8} lg={10}>
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
          </Grid>
        </Grid>
      </Box>
        </Box>



  )
}


export default Dashboard
