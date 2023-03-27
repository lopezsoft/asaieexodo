import {Schools} from "./school-contract";

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

export interface UserTypes {
  id: number;
  profile_name: string;
  description: string;
  font: string;
  active: boolean;
}

export interface RolContract {
  id: number;
  school_id: number;
  user_id: number;
  profile_id: number;
  state: number;
  profile: ProfileContract;
}

export interface ProfileContract {
  id: number;
  profile_name: string;
  description: string;
  font: string;
  active: number;
}
