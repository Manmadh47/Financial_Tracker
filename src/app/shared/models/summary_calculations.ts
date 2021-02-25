
import { UploadService } from 'src/app/shared/services/upload.service';
import { Injectable } from '@angular/core';
import { SummaryService } from '../services/summary.service';

@Injectable({
    providedIn: 'root'
  })
export class SummaryCalculations{
    constructor(private uploadService:UploadService,private summaryService:SummaryService){}

    on_hpr:any[];
    off_hpr:any[];
    onshore:any[]=[];
    offshore:any[]=[];
    onshore_nb_category_v:any[]=[];
    onshore_nb_category_k:any[]=[];
    onshore_nb_category_p:any[]=[];
    onshore_nb_category_c:any[]=[];
    onshore_nb_category_r:any[]=[];
    onshore_nb_category_a:any[]=[];
    onshore_nb_category_n:any[]=[];
    offshore_nb_category_v:any[]=[];
    offshore_nb_category_k:any[]=[];
    offshore_nb_category_p:any[]=[];
    offshore_nb_category_c:any[]=[];
    offshore_nb_category_r:any[]=[];
    offshore_nb_category_a:any[]=[];
    offshore_nb_category_n:any[]=[];

//seperating Onshore and offshore resourse
    dataByLocations(sheetwiseData){
      for(let item in sheetwiseData){
        if(sheetwiseData[item].location==("onshore"||"Onshore"||"ONSHORE"))
          {
            this.onshore.push(sheetwiseData[item]);
          }
          else 
            this.offshore.push(sheetwiseData[item]);
        }
      }

    //sperating based on NB Category in onshore
    dataByOnshoreCategory(){
    for(let resource in this.onshore){
      if(this.onshore[resource].nb_category==("v" || "V")){
        this.onshore_nb_category_v.push(this.onshore[resource]);
      }
      else if(this.onshore[resource].nb_category==("k"||"K")){
        this.onshore_nb_category_k.push(this.onshore[resource]);
      }
      else if(this.onshore[resource].nb_category==("p"|| "P")){
        this.onshore_nb_category_p.push(this.onshore[resource]);
      }
      else if(this.onshore[resource].nb_category==("c"||"C")){
        this.onshore_nb_category_c.push(this.onshore[resource]);
      }
      else if(this.onshore[resource].nb_category==("r"||"R")){
        this.onshore_nb_category_r.push(this.onshore[resource]);
      }
      else if(this.onshore[resource].nb_category==("a"||"A")){
        this.onshore_nb_category_a.push(this.onshore[resource]);
      }
      else if(this.onshore[resource].nb_category==("n"||"N")){
        this.onshore_nb_category_n.push(this.onshore[resource]);
      }
    }
    }

//sperating based on NB Category in offshore
    dataByOffshoreCategory(){
    for(let resource in this.offshore){
      if(this.offshore[resource].nb_category==("v" || "V")){
        this.offshore_nb_category_v.push(this.offshore[resource]);
      }
      else if(this.offshore[resource].nb_category==("k"||"K")){
        this.offshore_nb_category_k.push(this.offshore[resource]);
      }
      else if(this.offshore[resource].nb_category==("p"|| "P")){
        this.offshore_nb_category_p.push(this.offshore[resource]);
      }
      else if(this.offshore[resource].nb_category==("c"||"C")){
        this.offshore_nb_category_c.push(this.offshore[resource]);
      }
      else if(this.offshore[resource].nb_category==("r"||"R")){
        this.offshore_nb_category_r.push(this.offshore[resource]);
      }
      else if(this.offshore[resource].nb_category==("a"||"A")){
        this.offshore_nb_category_a.push(this.offshore[resource]);
      }
      else if(this.offshore[resource].nb_category==("n"||"N")){
        this.offshore_nb_category_n.push(this.offshore[resource]);
      }
    }
     }

    totalCalculations(){
    //seperating Onshore and offshore available hours
      this.on_hpr=this.onshore;//filtered array of onshore
      this.off_hpr=this.offshore;//filtered array of offshore
  
      //getting max values for onshore and offshore
      this.uploadService.data.on_available_hours=Math.max.apply(Math, this.on_hpr.map(function(o) 
      { return o.available_hours }));
      
      this.uploadService.data.off_available_hours=Math.max.apply(Math, this.off_hpr.map(function(o) 
      { return o.available_hours }));
      
      this.billableFTE();
    
      this.billedFTE();
    
      this.nonBilledFTE();
  
      this.vacationFTE();
  
      this.knowledgeTransferFTE();
  
      this.plannedBufferFTE();
  
      this.contractualFTE();
    
      this.releasedFTE();

      this.accountManagement();

      this.noCostFresher();
  
      this.totalRevenue();
    
      this.resourceCost();
  
      this.directCost();
  
      this.totalCost();
  
      this.seatCost();
  
      this.gpm_ebitda();
    }
  
     billableFTE(){
        //onshore
        const on_billable_fte=this.on_hpr.map(sr => sr.available_hours)
        .reduce((a, b) => parseFloat(a) + parseFloat(b),0)/this.uploadService.data.on_available_hours;
        this.uploadService.data.onshore_billable_fte=parseFloat(on_billable_fte.toFixed(2));
      //offshore
        const off_billable_fte=this.off_hpr.map(sr => sr.available_hours)
        .reduce((a, b) => parseFloat(a) + parseFloat(b),0)/this.uploadService.data.off_available_hours;
        this.uploadService.data.offshore_billable_fte=parseFloat(off_billable_fte.toFixed(2));
  
      //global
        const global_billable_fte = this.uploadService.data.onshore_billable_fte + this.uploadService.data.offshore_billable_fte;
        this.uploadService.data.global_billable_fte=parseFloat(global_billable_fte.toFixed(2));
    }
  
  // Billed FTE
     billedFTE(){
      //onshore
        const on_billed_fte=this.on_hpr.map(sr => sr.billed_hours)
        .reduce((a, b) => parseFloat(a) + parseFloat(b),0)/this.uploadService.data.on_available_hours;
        this.uploadService.data.onshore_billed_fte=parseFloat(on_billed_fte.toFixed(2));
     
      //offshore
        const off_billed_fte=this.off_hpr.map(sr => sr.billed_hours)
        .reduce((a, b) => parseFloat(a) + parseFloat(b),0)/this.uploadService.data.off_available_hours;
        this.uploadService.data.offshore_billed_fte=parseFloat(off_billed_fte.toFixed(2));
  
      //global
        const global_bill_fte = on_billed_fte + off_billed_fte;
        this.uploadService.data.global_billed_fte=parseFloat(global_bill_fte.toFixed(2));
        }
  
      nonBilledFTE(){
      //onshore
      const on_nb_fte = this.uploadService.data.onshore_billable_fte - this.uploadService.data.onshore_billed_fte;
      this.uploadService.data.onshore_nb_fte=parseFloat(on_nb_fte.toFixed(2));
     
      //offshore
      const off_nb_fte = this.uploadService.data.offshore_billable_fte - this.uploadService.data.offshore_billed_fte;
      this.uploadService.data.offshore_nb_fte=parseFloat(off_nb_fte.toFixed(2));
  
      //global
      const global_nb_fte = on_nb_fte + off_nb_fte;
      this.uploadService.data.global_nb_fte=parseFloat(global_nb_fte.toFixed(2));
        }
  
      vacationFTE(){
      //onshore
      const on_vacation_fte=this.onshore_nb_category_v.map(sr => sr.nb_hours)
      .reduce((a, b) => parseFloat(a) + parseFloat(b),0)/this.uploadService.data.on_available_hours;
      this.uploadService.data.onshore_vacation_fte=parseFloat(on_vacation_fte.toFixed(2));
  
    //offshore
      const offshore_vacation_fte=this.offshore_nb_category_v.map(sr => sr.nb_hours)
      .reduce((a, b) => parseFloat(a) + parseFloat(b),0)/this.uploadService.data.off_available_hours;
      this.uploadService.data.offshore_vacation_fte=parseFloat(offshore_vacation_fte.toFixed(2));
  
    //global
      const global_vacation_fte = on_vacation_fte + offshore_vacation_fte;
      this.uploadService.data.global_vacation_fte=parseFloat(global_vacation_fte.toFixed(2));
        }
  
      knowledgeTransferFTE(){
      //onshore
        const on_kt_fte=this.onshore_nb_category_k.map(sr => sr.nb_hours)
        .reduce((a, b) => parseFloat(a) + parseFloat(b),0)/this.uploadService.data.on_available_hours;
        this.uploadService.data.onshore_knowledge_fte=parseFloat(on_kt_fte.toFixed(2));
  
      //offshore
        const offshore_kt_fte=this.offshore_nb_category_k.map(sr => sr.nb_hours)
        .reduce((a, b) => parseFloat(a) + parseFloat(b),0)/this.uploadService.data.off_available_hours;
        this.uploadService.data.offshore_knowledge_fte=parseFloat(offshore_kt_fte.toFixed(2));
  
      //global
        const global_kt_fte = on_kt_fte + offshore_kt_fte;
        this.uploadService.data.global_knowledge_fte=parseFloat(global_kt_fte.toFixed(2));
        }
  
      plannedBufferFTE(){
      //onshore
      const on_pb_fte=this.onshore_nb_category_p.map(sr => sr.nb_hours)
      .reduce((a, b) => parseFloat(a) + parseFloat(b),0)/this.uploadService.data.on_available_hours;
      this.uploadService.data.onshore_planned_fte=parseFloat(on_pb_fte.toFixed(2));
  
    //offshore
      const offshore_pb_fte=this.offshore_nb_category_p.map(sr => sr.nb_hours)
      .reduce((a, b) => parseFloat(a) + parseFloat(b),0)/this.uploadService.data.off_available_hours;
      this.uploadService.data.offshore_planned_fte=parseFloat(offshore_pb_fte.toFixed(2));
  
    //global
      const global_pb_fte = on_pb_fte + offshore_pb_fte;
      this.uploadService.data.global_planned_fte=parseFloat(global_pb_fte.toFixed(2));
        }
  
      contractualFTE(){
      //onshore
        const on_contract_fte=this.onshore_nb_category_c.map(sr => sr.nb_hours)
        .reduce((a, b) => parseFloat(a) + parseFloat(b),0)/this.uploadService.data.on_available_hours;
        this.uploadService.data.onshore_contract_fte=parseFloat(on_contract_fte.toFixed(2));
  
      //offshore
        const offshore_contract_fte=this.offshore_nb_category_c.map(sr => sr.nb_hours)
        .reduce((a, b) => parseFloat(a) + parseFloat(b),0)/this.uploadService.data.off_available_hours;
        this.uploadService.data.offshore_contract_fte=parseFloat(offshore_contract_fte.toFixed(2));
  
      //global
        const global_contract_fte = on_contract_fte + offshore_contract_fte;
        this.uploadService.data.global_contract_fte=parseFloat(global_contract_fte.toFixed(2));
        }
    
    releasedFTE(){
      //onshore
      const on_released_fte=this.onshore_nb_category_r.map(sr => sr.nb_hours)
      .reduce((a, b) => parseFloat(a) + parseFloat(b),0)/this.uploadService.data.on_available_hours;
      this.uploadService.data.onshore_released_fte=parseFloat(on_released_fte.toFixed(2));
  
    //offshore
      const offshore_released_fte=this.offshore_nb_category_r.map(sr => sr.nb_hours)
      .reduce((a, b) => parseFloat(a) + parseFloat(b),0)/this.uploadService.data.off_available_hours;
      this.uploadService.data.offshore_released_fte=parseFloat(offshore_released_fte.toFixed(2));
  
    //global
      const global_released_fte = on_released_fte + offshore_released_fte;
      this.uploadService.data.global_released_fte=parseFloat(global_released_fte.toFixed(2));
        }

    accountManagement(){
          //onshore
      const on_account=this.onshore_nb_category_a.map(sr => sr.nb_hours)
       .reduce((a, b) => parseFloat(a) + parseFloat(b),0)/this.uploadService.data.on_available_hours;
      this.uploadService.data.onshore_account_manage=parseFloat(on_account.toFixed(2));
      
        //offshore
      const offshore_account=this.offshore_nb_category_a.map(sr => sr.nb_hours)
        .reduce((a, b) => parseFloat(a) + parseFloat(b),0)/this.uploadService.data.off_available_hours;
      this.uploadService.data.offshore_account_manage=parseFloat(offshore_account.toFixed(2));
      
        //global
      const global_acc_manage = on_account + offshore_account;
      this.uploadService.data.global_account_manage=parseFloat(global_acc_manage.toFixed(2));
    }

    noCostFresher(){
      //onshore
        const on_noCost=this.onshore_nb_category_n.map(sr => sr.nb_hours)
        .reduce((a, b) => parseFloat(a) + parseFloat(b),0)/this.uploadService.data.on_available_hours;
        this.uploadService.data.onshore_noCost_fresher=parseFloat(on_noCost.toFixed(2));
        
          //offshore
        const offshore_noCost=this.offshore_nb_category_n.map(sr => sr.nb_hours)
          .reduce((a, b) => parseFloat(a) + parseFloat(b),0)/this.uploadService.data.off_available_hours;
        this.uploadService.data.offshore_noCost_fresher=parseFloat(offshore_noCost.toFixed(2));
        
          //global
        const global_no_cost = on_noCost + offshore_noCost;
        this.uploadService.data.global_noCost_fresher=parseFloat(global_no_cost.toFixed(2));
      }

       totalRevenue(){
      //onshore
        const on_revenue=this.onshore.map(sr => sr.total_revenue)
        .reduce((a, b) => parseFloat(a) + parseFloat(b),0);
        this.uploadService.data.onshore_revenue=parseFloat(on_revenue.toFixed(2));
  
      //offshore
        const offshore_revenue=this.offshore.map(sr => sr.total_revenue)
        .reduce((a, b) => parseFloat(a) + parseFloat(b),0);
        this.uploadService.data.offshore_revenue=parseFloat(offshore_revenue.toFixed(2));
  
      //global
        const global_revenue = on_revenue + offshore_revenue;
        this.uploadService.data.global_revenue=parseFloat(global_revenue.toFixed(2));
        }
    
      resourceCost(){
      //onshore
        const on_resource=this.onshore.map(sr => sr.cost_rate* sr.cost_hours)
        .reduce((a, b) => a + b,0);
        this.uploadService.data.onshore_resource_cost=parseFloat(on_resource.toFixed(2));
      //offshore
        const off_resource=this.offshore.map(sr => sr.cost_rate* sr.cost_hours)
        .reduce((a, b) => a + b,0);
        this.uploadService.data.offshore_resource_cost=parseFloat(off_resource.toFixed(2));
      //global
        const global_resource=on_resource + off_resource;
        this.uploadService.data.global_resource_cost=parseFloat(global_resource.toFixed(2));
        }
  
      directCost(){
      //onshore
        const on_direct=this.uploadService.data.onshore_revenue*0.01
        this.uploadService.data.onshore_direct_cost=parseFloat(on_direct.toFixed(2));
        
      //offshore
        const off_direct=this.uploadService.data.offshore_revenue*0.01
        this.uploadService.data.offshore_direct_cost=parseFloat(off_direct.toFixed(2));
  
      //global
        const global_direct=on_direct + off_direct;
        this.uploadService.data.global_direct_cost=parseFloat(global_direct.toFixed(2));
        }
  
       totalCost(){
      const tot_cost=this.uploadService.data.global_resource_cost + this.uploadService.data.global_direct_cost
      this.uploadService.data.total_cost=parseFloat(tot_cost.toFixed(2));
        }
  
      seatCost(){
      const offshore_seat=this.uploadService.data.offshore_billable_fte*204;
      this.uploadService.data.offshore_seat_cost=parseFloat(offshore_seat.toFixed(2));
      this.uploadService.data.seat_cost=this.uploadService.data.offshore_seat_cost;
        }
       gpm_ebitda(){
      //GPM
        const gpm=this.uploadService.data.global_revenue-this.uploadService.data.total_cost;
        this.uploadService.data.GPM=parseFloat(gpm.toFixed(2));
      //GPM %
        const gpm_percent=(this.uploadService.data.GPM * 100) / this.uploadService.data.global_revenue 
        this.uploadService.data.gpm_percent=parseFloat(gpm_percent.toFixed(2));
      //EBITDA Amount
        const ebidta=this.uploadService.data.GPM - this.uploadService.data.seat_cost;
        this.uploadService.data.EBITDA=parseFloat(ebidta.toFixed(2));
      //EBITDA %
        const ebitda_percent=(this.uploadService.data.EBITDA * 100)/ this.uploadService.data.global_revenue 
        this.uploadService.data.ebitda_percent=parseFloat(ebitda_percent.toFixed(2));
        }

      sumOfSummary(revenue,ebitda,gpm){
        this.uploadService.data.sum_of_revenue=revenue;
        this.uploadService.data.sum_of_ebitda=ebitda;
        this.uploadService.data.sum_of_gpm=gpm;
      }

      copyData(){
        this.summaryService.data=Object.assign({},this.uploadService.data);
      }

      resetArrays(){
        this.on_hpr=[];this.off_hpr=[];this.onshore=[];this.offshore=[];
        this.onshore_nb_category_v=[];this.onshore_nb_category_k=[];
        this.onshore_nb_category_p=[];this.onshore_nb_category_c=[];
        this.onshore_nb_category_r=[];this.offshore_nb_category_v=[];
        this.offshore_nb_category_k=[];this.offshore_nb_category_p=[];
        this.offshore_nb_category_c=[];this.offshore_nb_category_r=[];
        this.offshore_nb_category_a=[];this.onshore_nb_category_a=[];
        this.offshore_nb_category_n=[];this.onshore_nb_category_n=[];
      }
}