import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resource } from '../models/resource.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ManageListService {

  touchedRows: Resource[];
  data:Resource[];
  constructor(private http: HttpClient) { }

  getRecords():Observable<any>{
    return this.http.get<Resource[]>(environment.apiURL);
  }

  postRecords(data:Resource[]):Observable<Resource[]>{
    console.log(data)
    return this.http.post<Resource[]>(environment.apiURL,data);
  }
 
}
