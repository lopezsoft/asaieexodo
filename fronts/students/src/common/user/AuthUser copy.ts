import { AuthController as Auth } from '../controllers/AuthController'
import UserContract from '../contracts/AuthContract'

// import DataUpdate  from '../contracts/AuthContract';

import  {HttpController as Http}  from '../controllers/HttpController';
import axios, { AxiosResponse } from 'axios'
import { JsonResponse } from '../contracts/JsonResponseContract'
import { AvrApiServerUrl } from '../core/Settings'
import DataUpdate from '../../common/contracts/AuthContract'


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




  public static async updateUser(id: number, data: Record<string, any>) {

    const baseUrl    = `/auth/user/update/${id}`;

    const response   = await Http.put(baseUrl, data);


    const dataU      = response.data as unknown as DataUpdate;
    if (response.data.success) {
     console.log(1);
      console.log(dataU);
    }

    return response;
  }





}


