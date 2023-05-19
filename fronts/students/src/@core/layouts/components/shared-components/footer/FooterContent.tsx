// ** Next Import
// import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import { Theme } from '@mui/material/styles'

// import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'

// const LinkStyled = styled(Link)(({ theme }) => ({
//   textDecoration: 'none',
//   color: theme.palette.primary.main
// }))

const FooterContent = () => {
  // ** Var
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
       <Typography sx={{ mr: 2 }}>
       COPYRIGHT © 2014 - 2023 LOPEZSOFT S.A.S

        {/* <LinkStyled target='_blank' href='https://pixinvent.com'>
          Pixinvent
        </LinkStyled> */}
      </Typography>

      {hidden ? null : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', '& :not(:last-child)': { mr: 4 } }}>
           <Typography sx={{ mr: 2 }}>
        {`© ${new Date().getFullYear()}, Hecho con `}

        <Box component='span' sx={{ color: 'error.main' }}>
          ❤️
        </Box>


      </Typography>
        </Box>
      )}
    </Box>
  )
}

export default FooterContent
