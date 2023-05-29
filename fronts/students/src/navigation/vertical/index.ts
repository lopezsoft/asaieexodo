// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Home',
      path: '/home',
      icon: 'tabler:smart-home'
    },

    {
      title: 'dashboard',
      path: '/dashboard',
      icon: 'tabler:smart-home',

    },
    {
      title: 'usuario',
      path: '/profile',
      icon: 'tabler:user',

      children: [
        {
          title: 'perfil',
          path: '/edit',
          icon: 'tabler:eye-edit'
        },]

    },

    // {
    //   title: 'edit',
    //   path: '/edit',
    //   icon: 'tabler:eye-edit'
    // },


  ]

}

export default navigation
