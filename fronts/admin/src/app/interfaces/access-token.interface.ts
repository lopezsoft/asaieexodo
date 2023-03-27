export interface  School {
  id: number;
  school_id: number;
  state: number;
  user_id: number;
  active: boolean;
  school: {
    id: number;
    country_id: number;
    database_name: string;
    folder_name: string;
    lockdate: string;
    nameschool: string;
    state: number;
    statecode: string;
    active: boolean;
  }
}

export interface User {
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

export interface AccessToken {
  access_token  : string;
  token_type    : string;
  message       : string;
  user          : User;
  success       : boolean;
}
