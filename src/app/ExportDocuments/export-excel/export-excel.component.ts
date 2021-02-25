import { Component, OnInit, ViewChild, ɵConsole, ElementRef } from '@angular/core';
import * as XLSX from 'xlsx';
import { MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { UploadService } from 'src/app/shared/services/upload.service';
import { ConfirmDialogComponent } from 'src/app/shared/confirm_dialog/confirm-dialog.component';
import { SummaryCalculations } from "src/app/shared/models/summary_calculations";
import { ViewSummaryDialogComponent } from '../summary_dialog/view-summary-dialog.component';
import { newArray } from '@angular/compiler/src/util';

@Component({
  selector: 'app-export-excel',
  templateUrl: './export-excel.component.html',
  styleUrls: ['./export-excel.component.scss']
})
export class ExportExcelComponent implements OnInit {
  monthValues: string[];
  project_id: string;
  sheetwiseData: any[];
 
  constructor(private dialog:MatDialog,private uploadService:UploadService,
              private summary: SummaryCalculations) { }

  @ViewChild('fileEvent')myInputVariable: ElementRef;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  listData:MatTableDataSource<any>;
  displayedColumns: string[] = ['UID', 'EmployeeName','Track','Location','City','EngagementType',
                  'EmployeeType','BillRate','AvailableHours','NBHours','NBCategory','BilledHours','TotalRevenue',
                  'CostRate','CostHours','TotalExpenses','Month','Year','StartDate','EndDate','Remarks','star'];
  //variable declarations
  arrayBuffer:any;
  file:File;
  json:any;
  totalSheets:string[]=[];
  list: any[]=[];
  temp:any[]=[];
  sheetwise_list:any[]=[]
  total_revenue_col:number[];
  total_expenses_col:number[];
  nb_hours_col:any[];
  projects:any[]=[];
  validate_message:string;
  disable:boolean;
  selectedDupProject:string;
  duplCount:number;

  ngOnInit(): void {
    this.disable=false;
    this.temp=[];
    this.uploadService.resetSummary();
  }

  incomingfile(event) 
  {
    this.file= event.target.files[0];
    this.temp=[];
    this.disable=true;
  }

  fileVlidation(){
    var ext = this.file.name.substring(this.file.name.lastIndexOf('.') + 1)
    if (ext.toLowerCase() == 'xlsx') {
      return true;    
    }
    else {return false;}
  }

  Upload(sheetNo:number) {
    let fileReader = new FileReader();
      fileReader.onload = (e) => {
          this.arrayBuffer = fileReader.result;
          var data = new Uint8Array(this.arrayBuffer);
          var arr = new Array();
          for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
          var bstr = arr.join("");
          var workbook = XLSX.read(bstr, {type:"binary",cellDates:true, cellNF: false, cellText:false});
          var workbook1 = XLSX.read(bstr, {type:"binary",cellDates:true, cellNF: false, cellText:false});
          this.totalSheets=workbook.SheetNames;//total number of sheets
          this.totalSheets.pop();
          
          this.selectSheet(workbook1,sheetNo);//to view sheetwise data
          this.project_id='project_id';
        for(let sheet in this.totalSheets){//to upload all sheets
         
          var sheetName = workbook.SheetNames[sheet];
          if(sheetName!="Summary")
          {
            var worksheet = workbook.Sheets[sheetName];
            this.json=XLSX.utils.sheet_to_json(worksheet,{blankrows:false,defval:null,raw:false,dateNF:"YYYY-MM-DD"});
            
            for(var row in this.json)//logic for storing rows with employee records only
            {
              if(this.json[row]["Sl No"]!=null && this.json[row]["UID"]!=null)
              {
              this.list.push(JSON.parse(JSON.stringify(this.json[row]).replace(/\s(?=\w+":)/g, "_")));
              this.projects.push(sheetName);
              }
            } 
          this.keysToLowerCase(this.list);

          this.uploadService.finalData=this.list;
          console.log(this.uploadService.finalData);
          }
        }
        this.columnCalculation();
        this.columnBinding();
        this.viewSummary();
        this.month_col();
      }
      if(this.fileVlidation())
        { fileReader.readAsArrayBuffer(this.file); this.validate_message=''}
      else
        {this.validate_message='Please select "Excel File" type only!!.';
        this.disable=false;
      }
      this.clearArrays();
}

  keysToLowerCase(arrayOfObj){
    for (var row in arrayOfObj) {
      var key, keys = Object.keys(arrayOfObj[row]);
      var n = keys.length;
      var newobj={}
      while (n--) {
        key = keys[n];
        newobj[key.toLowerCase()] = arrayOfObj[row][key];
      }
      arrayOfObj[row]=Object.assign({},newobj);
    }
  }

  clearArrays(){
    while(this.list.length)//cleaning the filtered data inside list for fresh sheet data
    {
      this.list.pop(); 
    } 
    this.sheetwise_list=[];
    this.summary.resetArrays();
  }

  selectSheet(workbook1,sheetNo){
    this.uploadService.data.project_id=workbook1.SheetNames[sheetNo];
    var selectedSheet = workbook1.Sheets[this.uploadService.data.project_id];
    var j=XLSX.utils.sheet_to_json(selectedSheet,{blankrows:false,defval:null,raw:false,dateNF:"YYYY-MM-DD"});
    
    for(var row in j){
      if(j[row]["Sl No"]!=null && j[row]["UID"]){
        this.sheetwise_list.push(JSON.parse(JSON.stringify(j[row]).replace(/\s(?=\w+":)/g, "_")));
      }
    } 
     this.keysToLowerCase(this.sheetwise_list);
    this.sheetwiseData=this.sheetwise_list;
    this.summary.dataByLocations(this.sheetwise_list);
    this.listData=new MatTableDataSource(this.sheetwiseData);
    this.listData.paginator = this.paginator;
 }

//calculating new total revenue, NBHours column and assigning to fina json data
  columnCalculation(){
    //removing total revenue, NB hours column data from excel
      this.uploadService.finalData.map(rev=>rev.total_revenue=0);
      this.uploadService.finalData.map(rev=>rev.nb_hours=0);
      this.uploadService.finalData.map(rev=>rev.total_expenses=0);
      
    //calculating new columns
      this.total_revenue_col=this.uploadService.finalData.map(rem=>rem.bill_rate * rem.billed_hours);
      this.nb_hours_col=this.uploadService.finalData.map(rem=>rem.available_hours - rem.billed_hours);
      this.total_expenses_col=this.uploadService.finalData.map(rem=>rem.cost_rate * rem.cost_hours);
  }

  columnBinding(){
      const available_hours_col=this.uploadService.finalData.map(res=>Number(res.available_hours));
      const bill_rate_col=this.uploadService.finalData.map(res=>Number(res.bill_rate)); 
      const billed_hours_col=this.uploadService.finalData.map(res=>Number(res.billed_hours));
      const cost_rate_col=this.uploadService.finalData.map(res=>Number(res.cost_rate));
      const cost_hours_col=this.uploadService.finalData.map(res=>Number(res.cost_hours));
       const start_date_col=this.list.map(res=>new Date(new Date(res.start_date).toUTCString()));
       const end_date_col=this.list.map(res=>new Date(new Date(res.end_date).toUTCString()));

    for(let item in this.uploadService.finalData)
    {
      this.uploadService.finalData[item].total_revenue=this.total_revenue_col[item];
      this.uploadService.finalData[item].nb_hours=this.nb_hours_col[item];
      this.uploadService.finalData[item].available_hours=available_hours_col[item];
      this.uploadService.finalData[item].bill_rate=bill_rate_col[item];
      this.uploadService.finalData[item].billed_hours=billed_hours_col[item];
      this.uploadService.finalData[item].cost_rate=cost_rate_col[item];
      this.uploadService.finalData[item].cost_hours=cost_hours_col[item];
      this.uploadService.finalData[item].total_expenses=this.total_expenses_col[item];
      this.uploadService.finalData[item].project_id=this.projects[item];
      this.uploadService.finalData[item].start_date=start_date_col[item];
      this.uploadService.finalData[item].end_date=end_date_col[item];
      if(this.uploadService.finalData[item].nb_hours<=0){
        this.uploadService.finalData[item].nb_category="";
      }else if(this.uploadService.finalData[item].nb_hours>0 && this.uploadService.finalData[item].nb_category==null){
        //console.log(this.uploadService.finalData[item]);
        }
        else{
          var nb_cat_col= this.uploadService.finalData[item].nb_category.toUpperCase();
          this.uploadService.finalData[item].nb_category=nb_cat_col;
        }
    }
  }

  viewSummary(){
 
  this.summary.dataByOnshoreCategory();
  this.summary.dataByOffshoreCategory();
  this.summary.totalCalculations();
}
  month_col(){
    this.monthValues=[...new Set(this.uploadService.finalData.map(item => item.month))];
    this.uploadService.data.month=(this.monthValues.toString()).toUpperCase();
  }

  reset() {
    this.disable=false;this.duplCount=null;
    this.myInputVariable.nativeElement.value = "";
    this.totalSheets=this.sheetwise_list=this.list=this.temp=[];
    this.listData=new MatTableDataSource();
    console.log(this.myInputVariable.nativeElement.files);
}

  summaryDialog(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose=true;
    dialogConfig.autoFocus=true;
    dialogConfig.width="60%";
    this.dialog.open(ViewSummaryDialogComponent,dialogConfig);
  }

  confirmDialog(){
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      disableClose:true,
      width:"20%",
      position:{'top':'0'}
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result==true){
        console.log(this.uploadService.finalData);
        this.uploadService.postRecords(this.uploadService.finalData).subscribe((dup:any[])=>{
          console.log(dup)
          this.temp=dup;
          if(dup!=[]){
            this.uploadService.resetSummary();
            this.duplCount=dup.length;
            this.totalSheets=[];
            this.listData=new MatTableDataSource(dup);
            this.listData.paginator = this.paginator;

            this.totalSheets=[...new Set(dup.map(item => item.project_id))];
          }
          else{
            this.duplCount=null;
            this.reset();
          }
        });
      }
    });
}

dupProjects(event){
  var arr=new Array;
  arr=this.temp;
  
  this.listData.data = arr.filter(data => {return data.project_id ==event});
  this.listData.paginator = this.paginator;
}

}
