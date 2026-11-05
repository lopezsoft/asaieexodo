import {Menu} from "../../interfaces/menu";
import {Role} from "../../enums/profiel-enum";

export const fullMenu: Menu[] = [
  {
    id: 1,
    name: 'Dashboard',
    translatedName: 'menu.dashboard', // Clave para Transloco
    icon: 'dashboard',
    link: '/dashboard',
    active: true,
  },
  {
    id: 2,
    name: 'Profile',
    translatedName: 'menu.user.profile',
    icon: 'account_circle',
    link: '/profile',
    active: true
  }
  // Student Menu
  ,{
    id: 3,
    name: 'Notas Académicas',
    translatedName: 'menu.student.academicNote',
    icon: 'school',
    link: '/student/academic-notes',
    isExternal: true,
    active: true,
    roles: [Role.Student],
  },
  {
    id: 4,
    name: 'Informes Académicos',
    translatedName: 'menu.student.academicReport',
    icon: 'assignment',
    link: '/student/academic-reports',
    active: true,
    roles: [Role.Student],
  },
  {
    id: 5,
    name: 'Actividades académicas',
    translatedName: 'menu.student.academicActivities',
    icon: 'assignment_turned_in',
    link: '/student/academic-activities',
    active: true,
    roles: [Role.Student],
  },
  {
    id: 6,
    name: 'Elecciones escolares',
    translatedName: 'menu.student.schoolElections',
    icon: 'how_to_vote',
    link: '/student/school-elections',
    active: true,
    roles: [Role.Student],
  },

];
