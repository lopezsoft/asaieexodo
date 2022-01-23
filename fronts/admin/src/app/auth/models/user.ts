import { Role } from './role';

export class User {
  id: number;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  avatar: string;
  role: Role;
  token?: string;
}
