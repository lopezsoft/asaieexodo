import { Injectable } from '@angular/core';
import { ErrorResponse } from 'app/interfaces';
import { Cities, Countries } from 'app/interfaces/location/location';
import { HttpServerService, MessagesService } from 'app/utils';

@Injectable({
    providedIn: 'root'
})
export class LocationService {

    public Countries: Countries[] = [];
    public Cities: Cities[] = [];

    constructor(
        private _http: HttpServerService,
        private _msg : MessagesService
    ) { 
        this.Cities     = [];
        this.Countries  = [];
    }


    getCities(params: any = {}): Cities[] {
        const ts = this;
        if(ts.Cities.length == 0){
            ts._http.get('/cities', params)
                .subscribe({
                    next: (resp) => {
                        this.Cities = resp.records;
                        return ts.Cities;
                    },
                    error: (err: ErrorResponse) => {
                        this.Cities = [];
                        console.log(err);
                        ts._msg.toastMessage('', err.error.message, 4);
                        return ts.Cities;
                    }
                });
        }else{
            return ts.Cities;
        }
    }

    getCountries(params: any = {}): Countries[] {
        const ts = this;
        if(ts.Countries.length == 0){
            ts._http.get('/countries', params)
                .subscribe({
                    next: (resp) => {
                        ts.Countries    = resp.records;
                        return ts.Countries;
                    },
                    error: (err: ErrorResponse) => {
                        ts.Countries    = [];
                        console.log(err);
                        ts._msg.toastMessage('', err.error.message, 4);
                        return ts.Countries;
                    }
                });
        }else{
            return ts.Countries;
        }
    }
}
