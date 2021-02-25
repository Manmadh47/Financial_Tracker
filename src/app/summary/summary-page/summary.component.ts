import { Component, OnInit } from '@angular/core';
import { SummaryService } from 'src/app/shared/services/summary.service';
import { Resource } from 'src/app/shared/models/resource.model';
import { SummaryCalculations } from 'src/app/shared/models/summary_calculations';
import { UploadService } from 'src/app/shared/services/upload.service';
import { MatTableDataSource } from '@angular/material/table';
import { Chart } from 'angular-highcharts';
import { Summary } from 'src/app/shared/models/summary.model';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
  
  resourceData:Resource[]=[];
  monthValues: any[];
  rhsMonthValues:any[];
  yearValues:any[];
  rhsProjectValues:any[];
  projectValues: any[];
  tempRHSMonth:any[]=[];
  filteredRows:any[]=[];
  projectRows:any[]=[];
  revenue:number;
  ebitda: number;
  gpm:number;
  list:any[]=[];
  selectedYear:string;
  rhsselectedYear:string;
  chartData :any[]=[];
  latestMonth:string[];

  constructor(public summaryService:SummaryService,public uploadService:UploadService,
              private summary: SummaryCalculations) { }
              chart = new Chart;

  ngOnInit(): void {
    this.uploadService.resetSummary();
    this.summaryService.resetSummary();
    this.summary.resetArrays();
    this.revenue=0;this.ebitda=0;this.gpm=0;
    this.currentDateRecords();
    this.getAllYears();
  }

  currentDateRecords(){
    this.summaryService.getByCurrentDate().subscribe((res:any[])=>{console.log(res.map(x=>x.month));
      this.resourceData=res;

    this.projectValues=[...new Set(this.resourceData.map(item => item.project_id))];
    this.latestMonth=[...new Set(this.resourceData.map(item => item.month.toUpperCase()))];
    this.overallSummary();
    this.summaryService.resetSummary();
    })
  }

  getAllYears(){
    this.summaryService.getYears().subscribe((res:any[])=>
    this.yearValues=res);
  }
  onChangeYear(event){
    this.summaryService.getMonths(event).subscribe((months:any[])=>this.monthValues=months);
    this.selectedYear=event;
  }

  onChangeMonth(event){
    this.latestMonth=[];
    this.summaryService.getRecords(this.selectedYear,event).subscribe((res:any[])=>{
      this.resourceData=res;

    this.projectValues=[...new Set(this.resourceData.map(item => item.project_id))];
    this.overallSummary();
  
  })
  }

  overallSummary(){
    for(let project in this.projectValues){
      this.summaryCalculation(this.projectValues[project]); 

      this.clearArrays(this.projectRows);
    }
      this.summary.sumOfSummary(this.revenue,this.ebitda,this.gpm);
      this.getChart();
     
    this.list=[];
    this.resetTotal();
    this.chartData=[];
  }

   summaryCalculation(project){
       for(let row in this.resourceData){
         if(this.resourceData[row].project_id==project){
           this.projectRows.push(this.resourceData[row]);
         }
       }
      this.summary.dataByLocations(this.summaryService.sheetData=this.projectRows);
      this.viewSummary();
      this.columnBind(project);

      this.revenue=this.revenue+this.uploadService.data.global_revenue;
      this.ebitda=this.ebitda+this.uploadService.data.EBITDA;
      this.gpm=this.gpm+this.uploadService.data.GPM;
   }

  columnBind(project){
    this.list.push({project_id: project,revenue: this.uploadService.data.global_revenue,
      ebitda:this.uploadService.data.EBITDA,gpm:this.uploadService.data.GPM});
   }

  rhsYear(event){
    this.summaryService.getMonths(event).subscribe((months:any[])=>this.rhsMonthValues=months);
    this.rhsselectedYear=event;
  }
  rhsMonth(event){
    this.summaryService.getRecords(this.rhsselectedYear,event).subscribe((res:any[])=>{
      this.tempRHSMonth=res;

    this.rhsProjectValues=[...new Set(this.tempRHSMonth.map(item => item.project_id))];
  })
  }

  onChangeProject(event){
    for(let row in this.tempRHSMonth){
      if(this.tempRHSMonth[row].project_id==event){
        this.filteredRows.push(this.tempRHSMonth[row]);
      }
    }
    
    this.summary.dataByLocations(this.filteredRows);
    this.viewSummary();
    this.summary.copyData();

    this.clearArrays(this.filteredRows);
    this.summaryService.data.project_id=event;
  }

  viewSummary(){
    this.summary.dataByOnshoreCategory();
    this.summary.dataByOffshoreCategory();
    this.summary.totalCalculations();
  }

  clearArrays(arr){
    while(arr.length)//cleaning the filtered data inside list for fresh sheet data
    {
      this.filteredRows.pop();this.projectRows.pop();
    } 
    this.summary.resetArrays();
  }

  resetTotal(){
    this.revenue=this.gpm=this.ebitda=0;
  }

  getChart(){  
      for (var i = 0; i < this.list.length; i++) { 
          this.chartData.push({
            "name":this.list[i].project_id,
            "y": this.list[i].revenue,
            "gpm": this.list[i].gpm,
            "ebitda": this.list[i].ebitda 
            
          })  
        }

    Highcharts.chart('chartContainer', {
      chart: {
        spacingBottom: 15,
        spacingTop: 10,
        spacingLeft: 0,
        spacingRight: 10,
        width: 600,
        height: 350
      },
      title: {
        text: ''
      },
      xAxis: {
        title: {
          text: null
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: ''
        },
        labels: {
          overflow: 'justify'
        }
      },
      tooltip: {
        pointFormat:'Revenue: <b>${point.y}</b><br> GPM: <b>${point.gpm}</b><br> EBITDA: <b>${point.ebitda}</b>'
      },
      
      plotOptions: {
        pie: {
          allowPointSelect: true,
            cursor: 'pointer',
          dataLabels: {
            enabled: false
          },
          point:{
            events : {
             legendItemClick: function(e){
                 e.preventDefault();
             }
            }
        },
          showInLegend: true
        },
      },
      credits: {
        enabled: false
      },
      series: [{
        colorByPoint: true,
        type: 'pie',
        data:this.chartData
      }]
    })
  }
}
