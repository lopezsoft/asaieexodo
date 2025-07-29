
// Enum profileEnum
export enum Role {
  Admin = 'Admin',
  Teacher = 'Teacher',
  Student = 'Student',
  Family = 'Family',
  Monitor = 'Monitor',
  Coordinator = 'Coordinator',
  Rector = 'Rector',
  Secretary = 'Secretary',
}

// Enum profileEnum description
export const ProfileEnumDescription: { [key in Role]: string } = {
  [Role.Admin]: 'Administrador',
  [Role.Teacher]: 'Docente',
  [Role.Student]: 'Estudiante',
  [Role.Family]: 'Familiar',
  [Role.Monitor]: 'Monitor',
  [Role.Coordinator]: 'Coordinador',
  [Role.Rector]: 'Rector',
  [Role.Secretary]: 'Secretario/a',
}
