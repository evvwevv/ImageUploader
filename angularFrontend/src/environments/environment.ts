// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  amplify: {
    Auth: {
      region: 'us-west-2',
      userPoolId: 'us-west-2_FzbgfsUaC',
      userPoolWebClientId: '738iqpt7l4vojqptqis1pqj9hc',
      identityPoolId: 'us-west-2:01f59b76-1146-44cf-9d85-1db4c50e3f9e'
    },
    Storage: {
      bucket: 'imageuploader-main-bucket'
    },
    Api: {
      region: 'us-east-1',
      url: 'https://c2ecjqoud4.execute-api.us-east-1.amazonaws.com/test/'
    }
  },
  production: false,
  localstorageBaseKey: 'CognitoIdentityServiceProvider.738iqpt7l4vojqptqis1pqj9hc'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
