import { Injectable } from '@angular/core';
import { Summary } from '../models/summary.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Resource } from '../models/resource.model';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  data:Summary;
  finalData:Resource[]=[];
  constructor(private http: HttpClient) { }

  resetSummary(){
    this.data={
      project_id:'',
      month:'',
      on_available_hours:0,
      off_available_hours:0,
      onshore_billable_fte:0,
      offshore_billable_fte:0,
      global_billable_fte:0,
      onshore_billed_fte:0,
      offshore_billed_fte:0,
      global_billed_fte:0,
      offshore_nb_fte:0,
      onshore_nb_fte:0,
      global_nb_fte:0,
      onshore_vacation_fte:0,
      offshore_vacation_fte:0,
      global_vacation_fte:0,
      onshore_knowledge_fte:0,
      offshore_knowledge_fte:0,
      global_knowledge_fte:0,
      onshore_planned_fte:0,
      offshore_planned_fte:0,
      global_planned_fte:0,
      onshore_contract_fte:0,
      offshore_contract_fte:0,
      global_contract_fte:0,
      onshore_released_fte:0,
      offshore_released_fte:0,
      global_released_fte:0,
      onshore_account_manage:0,
      offshore_account_manage:0,
      global_account_manage:0,
      onshore_noCost_fresher:0,
      offshore_noCost_fresher:0,
      global_noCost_fresher:0,
      onshore_revenue:0,
      offshore_revenue:0,
      global_revenue:0,
      onshore_resource_cost:0,
      offshore_resource_cost:0,
      global_resource_cost:0,
      visa_expense:0,
      misc_expense:0,
      onshore_direct_cost:0,
      offshore_direct_cost:0,
      global_direct_cost:0,
      total_cost:0,
      GPM:0,
      gpm_percent:0,
      offshore_seat_cost:0,
      seat_cost:0,
      EBITDA:0,
      ebitda_percent:0,
      sum_of_ebitda:0,
      sum_of_gpm:0,
      sum_of_revenue:0,
    }
  }

  postRecords(finalData):Observable<any[]>{
    console.log(finalData)
    return this.http.post<any[]>(environment.apiURL,finalData);
  }

}
