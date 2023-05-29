import { AuthController as Auth } from '../controllers/AuthController'
import UserContract from '../contracts/AuthContract'

// import DataUpdate  from '../contracts/AuthContract';

import  {HttpController as Http}  from '../controllers/HttpController';

// import  {HttpController}  from '../controllers/HttpController';
import axios, { AxiosResponse } from 'axios'
import { JsonResponse } from '../contracts/JsonResponseContract'
import { AvrApiServerUrl } from '../core/Settings'



export const axiosInstance = axios.create({
  baseURL: `${AvrApiServerUrl}`,
  withCredentials: false
})

export class AuthUser {
  private static apiUrl = process.env.NEXT_PUBLIC_API_URL



  public static async registerPersonUser(data: Record<string, any>) {
    console.log(data);
    const baseUrl = `${AuthUser.apiUrl}/auth/register`
    const response: AxiosResponse<JsonResponse> = await axios.post(baseUrl, data)
    const dataU = response.data as unknown as UserContract
    if (response.data.success) {
      Auth.saveAuthData(dataU)
    }


    return response
  }




 // public static async updateUser(id: number, userData: Record<string, any>) {
  public static async updateUser(id: number, userData: UserContract) {

    console.log("peticion Http "+id);

    console.log("info que se recoge",userData);

    const baseUrl    = `${AuthUser.apiUrl}/auth/user/update/${id}`;
    const response   = await Http.put(baseUrl, userData);

    const dataU      = response.data as unknown as UserContract;

    console.log(dataU);


    if (response.data.success) {
        Auth.updateUserAuthData(userData);
        Auth.setUserUpdatedAction(this.updateUser);


    }

    return response;
  }

}









