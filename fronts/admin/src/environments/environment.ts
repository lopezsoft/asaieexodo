// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production  : false,
  hmr         : false,
  APIURL      : 'http://asaieexodo.test/api/v1',
  APPURL      : 'http://asaieexodo.test',
  SOCKET_URL  : 'http://localhost:3001',
  APIJWT      : 'asaie-exodo-jwt',
  VERSION     : '2.1.13'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
