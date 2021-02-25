// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiURL : 'https://localhost:44304/api/Revenuetracker',
  yearsURL:'https://localhost:44304/api/Revenuetracker/year',
  monthsURL:'https://localhost:44304/api/Revenuetracker/monthsByYear',
  dataByValues:'https://localhost:44304/api/Revenuetracker/resourceByYearAndMonth',
  latestData:'https://localhost:44304/api/Revenuetracker/getLatestRecords',
  holidaysURL:'https://localhost:44304/api/Holidays',
  billRatesURL:'https://localhost:44304/api/BillRate',
  forecastURL:'https://localhost:44304/api/Revenuetracker/forecast',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
