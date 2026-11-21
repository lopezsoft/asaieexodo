
import {environment} from "../../environments/environment";

export function getApiUrl(): string {
  return environment.APIURL;
}

export function getAppUrl(): string {
  return environment.APPURL;
}

export function getSocketUrl(): string {
  return environment.SOCKET_URL;
}
export function getApiJwt(): string {
  return environment.APIJWT;
}

export function getBaseUrl(): string {
  return environment.baseUrl;
}

export function getVersion(): string {
  return environment.VERSION;
}

export function isProduction(): boolean {
  return environment.production;
}
