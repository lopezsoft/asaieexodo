import {Profile, UserSchool} from "../models/users-model";
import {Role} from "../enums/profiel-enum";

export interface AccessToken {
  access_token  : string;
  token_type    : string;
  message       : string;
  user          : UserSchool;
  success       : boolean;
  profile       : Profile;
  currentRole   : Role;
}
