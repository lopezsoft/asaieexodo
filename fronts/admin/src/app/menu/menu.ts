import { CoreMenu } from '@core/types'

export const menu: CoreMenu[] = [
  {
    id: 'home',
    title: 'Dashboard',
    // translate: 'MENU.HOME',
    type: 'item',
    icon: 'home',
    url: 'dashboard'
  },
  {
    id: 'admin',
    title: 'Administrativo',
    // translate: 'MENU.ADMIN',
    type: 'item',
    icon: 'file',
    url: 'administrative'
  },
  {
    id: 'academic',
    title: 'Academico',
    // translate: 'MENU.ACADEMIC',
    type: 'item',
    icon: 'file',
    url: 'academic'
  },
  {
    id: 'promotion',
    title: 'Promoción',
    // translate: 'MENU.PROMOTION',
    type: 'item',
    icon: 'file',
    url: 'promotion'
  },
  {
    id: 'reports',
    title: 'Informes académicos',
    type: 'item',
    icon: 'file',
    url: 'reports'
  },
  {
    id: 'vote',
    title: 'Elecciones escolares',
    // translate: 'MENU.VOTE',
    type: 'item',
    icon: 'file',
    url: 'elections'
  },
  {
    id: 'setting',
    title: 'Configuración',
    // translate: 'MENU.SETTING',
    type: 'item',
    icon: 'file',
    url: 'settings'
  },
]
