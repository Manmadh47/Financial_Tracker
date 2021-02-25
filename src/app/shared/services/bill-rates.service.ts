import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BillRates } from '../models/bill-rates.model';

@Injectable({
  providedIn: 'root'
})
export class BillRatesService {

  constructor(private http: HttpClient) { }

  getBillRates():Observable<any>{
    return this.http.get<any>(environment.billRatesURL);
  }
  postRecords(data:BillRates):Observable<BillRates>{
    return this.http.post<BillRates>(environment.billRatesURL,data);
  }
}
