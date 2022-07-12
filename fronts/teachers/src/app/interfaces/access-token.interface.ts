export interface  School {
  statecode: string;
  nameschool: string;
  lockdate: string;
}

export interface User {
  id: number;
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  user_name?: string;
  avatar: string;
  active?: boolean;
}

export interface AccessToken {
  access_token  : string;
  token_type    : string;
  message       : string;
  user          : User;
  success       : boolean;
  school        : School;
}
