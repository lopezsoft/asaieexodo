import {RolContract} from "./users-model";

export interface Schools {
    id: number;
    user_id: number;
    school_id: number;
    state: number;
    school: SchoolContract;
}
export interface SchoolContract {
    id: number;
    country_id: number;
    statecode: string;
    nameschool: string;
    database_name: string;
    folder_name: string;
    lockdate: string;
    state: number;
    active: boolean;
    roles: RolContract[];
}
