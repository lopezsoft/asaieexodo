import {School, Schools} from "./school-contract";
import {Role} from "../enums/profiel-enum";

export interface Profile {
  id: number;
  name: string;
  description: string;
  active: boolean;
  profile_name: string;
  font: string;
  profile_type: Role
}

export interface Users {
  id: number;
  type_id: number;
  first_name: string;
  email_verified_at?: string;
  last_name: string;
  user_type: string;
  email: string;
  avatar: string;
  active: boolean;
  schools: Schools[];
}

export interface RolContract {
  id: number;
  school_id: number;
  user_id: number;
  profile_id: number;
  state: number;
  profile: Profile;
}


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

export interface UserSchool {
  id: number;
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  fullname?: string;
  avatar: string;
  active?: boolean;
  schools : School[];
}
