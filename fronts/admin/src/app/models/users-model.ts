export interface Users {
  id: number;
  type_id: number;
  first_name: string;
  last_name: string;
  user_type: string;
  email: string;
  avatar: string;
  active: boolean;
}

export interface UserTypes {
  id: number;
  user_type_name: string;
  type: number;
  active: boolean;
}
