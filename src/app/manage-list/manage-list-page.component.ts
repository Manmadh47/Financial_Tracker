import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ManageListService } from '../shared/services/manage-list.service';
import { Resource } from '../shared/models/resource.model';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/confirm_dialog/confirm-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SummaryService } from '../shared/services/summary.service';
import { BillRatesService } from '../shared/services/bill-rates.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-manage-list-page',
  templateUrl: './manage-list-page.component.html',
  styleUrls: ['./manage-list-page.component.scss']
})
export class ManageListPageComponent implements OnInit {

  tableFormArray:FormArray
   resourceData:Resource[];
   monthValues: any[];
   yearValues:any[];
   projectValues: any[];
   tempMonth:any[]=[];
   filteredRows:any[]=[];
   readonly: boolean;
   buttonText:string;
   selectedColor:string;
   toolTip:string;
   disable: boolean;
   latestMonth:string[];
  selectedYear:string;
  selectedMonth:string;
  selectedProject:string;
  names:any[];
  trackValues:any[];
  locations:any[];
  cityValues:any[];
  eng_types:any[];
  emp_types:any[];
  billRates:any[];
  defaultValue:string;
  numberPattern:any;
  stringPattern:any;
  
   listData:MatTableDataSource<any>;
  displayedColumns: string[] = ['UID', 'EmployeeName','Track','Location','City','EngagementType',
                  'EmployeeType','AvailableHours','BilledHours','NBHours','NBCategory','BillRate',
                  'TotalRevenue','CostRate','CostHours','TotalExpenses','Month','Year','StartDate','EndDate','Remarks','star'];
  temp: number[];

  constructor(private listService:ManageListService,private formBuilder: FormBuilder,
              public summaryService:SummaryService,private billRateService:BillRatesService,
              private dialog:MatDialog,public datepipe: DatePipe) { }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  ngOnInit(): void {
    this.currentDateRecords();
    this.getAllYears();
    this.controls();
    this.getAllBillRates();
    this.validationPatterns();
    this.filteredRows=[];
  }

  validationPatterns(){
    this.numberPattern='^-?[0-9]\\d*(\\.\\d{1,2})?$'; //includes decimal validation
    this.stringPattern="[a-zA-Z][a-zA-Z ]+";
  }
  
  controls(){
    this.disable=true;
    this.readonly = true;
    this.buttonText="edit";
    this.selectedColor="primary";
    this.toolTip="Edit Records";
  }

  getAllYears(){
    this.summaryService.getYears().subscribe((res:any[])=>
    this.yearValues=res);
  }

  currentDateRecords(){
    this.summaryService.getByCurrentDate().subscribe((res:any[])=>{
      for(let row in res){
         res[row].start_date=res[row].start_date.toString().split('T')[0];
         res[row].end_date=res[row].end_date.toString().split('T')[0];
      }
      this.tableFormArray=this.formBuilder.array(res.map(resource => this.setUsersFormArray(resource)));
      
      this.listData=new MatTableDataSource(this.tableFormArray.controls);
      this.listData.paginator = this.paginator;

      this.resourceData=res;

      this.latestMonth=[...new Set(res.map(item => item.month.toUpperCase()))];
      
     this.dropdownValues(this.resourceData);
    });
  }

  getAllBillRates(){
    this.billRateService.getBillRates().subscribe(result=>{
    this.billRates=[...new Set(result.map(item => item.bill_rate).sort())];
    })
  }

  private setUsersFormArray(resource: any){
    return this.formBuilder.group({
      id:[resource.id],
      project_id:[resource.project_id],
      location:[resource.location],
      city:[resource.city,[Validators.required,Validators.pattern(this.stringPattern)]],
      track:[resource.track,[Validators.required]],
      uid:[resource.uid,[Validators.required]],
      employee_name:[resource.employee_name,[Validators.required,Validators.pattern(this.stringPattern)]], 
      engagement_type:[resource.engagement_type,[Validators.required]],
      employee_type:[resource.employee_type,[Validators.required]],
      available_hours:[resource.available_hours,[Validators.required,
                          Validators.pattern(this.numberPattern)]],
      nb_hours:[resource.nb_hours],
      bill_rate:[resource.bill_rate,[Validators.required,
                  Validators.pattern(this.numberPattern)]],
      nb_category:[resource.nb_category],
      billed_hours:[resource.billed_hours,[Validators.required,
                      Validators.pattern(this.numberPattern)]],
      total_revenue:[resource.total_revenue],
      cost_rate:[resource.cost_rate,[Validators.required,
                  Validators.pattern(this.numberPattern)]],
      cost_hours:[resource.cost_hours,[Validators.required,
                    Validators.pattern(this.numberPattern)]],
      total_expenses:[resource.total_expenses],
      month:[resource.month,[Validators.required,Validators.pattern(this.stringPattern)]],
      year:[resource.year,[Validators.required,Validators.pattern("^[0-9]*$"),Validators.minLength(4)]],
      start_date:[resource.start_date],
      end_date:[resource.end_date],
      remarks:[resource.remarks]
    });
  }

  getActualIndex(index : number)    {
    return index + this.paginator.pageSize * this.paginator.pageIndex;
  }

  onChangeYear(event){
    this.monthValues=[];
    this.summaryService.getMonths(event).subscribe((months:any[])=>this.monthValues=months);
    this.selectedYear=event;
  }

  onChangeMonth(event){
    this.tempMonth= new Array;
    this.projectValues=[];
    this.summaryService.getRecords(this.selectedYear,event).subscribe((res:any[])=>{
    for(let record in res){
      this.tempMonth.push(res[record]);
      }
      this.selectedMonth=event;
      this.projectValues=[...new Set(this.resourceData.map(item => item.project_id))];
    });
  }

  onChangeProject(event){
    this.latestMonth=[];this.filteredRows=[];
    this.defaultValue="all";

    for(let row in this.tempMonth){
      if(this.tempMonth[row].project_id==event){
        this.tempMonth[row].start_date=this.tempMonth[row].start_date.toString().split('T')[0];
        this.tempMonth[row].end_date=this.tempMonth[row].end_date.toString().split('T')[0];

        this.filteredRows.push(this.tempMonth[row]);
      }
    }
    this.tableFormArray=this.formBuilder.array(this.filteredRows.map(resource => this.setUsersFormArray(resource)));
    this.listData=new MatTableDataSource(this.tableFormArray.controls);
    this.listData.paginator = this.paginator;

    this.dropdownValues(this.filteredRows);
    this.selectedProject=event;
  }

  dropdownValues(resourceData){
    this.names=[...new Set(resourceData.map(item => item.employee_name).sort())];
    this.trackValues=[...new Set(resourceData.map(item => item.track).sort())];
    this.locations=[...new Set(resourceData.map(item => item.location).sort())];
    this.cityValues=[...new Set(resourceData.map(item => item.city).sort())];
    this.eng_types=[...new Set(resourceData.map(item => item.engagement_type).sort())];
    this.emp_types=[...new Set(resourceData.map(item => item.employee_type).sort())];
   }
  
  onFilter(name:string,track:any,location:string,city:string,eng_type,emp_type){
    console.log(location)
    var arr=new Array;
    arr=[];
    if(name=="all" || track=="all" || location=="all" || city=="all" || eng_type=="all" || emp_type=="all"){
    this.defaultValue="all";
      if(!this.filteredRows.length){ 
        this.tableFormArray=this.formBuilder.array(this.resourceData.map(resource => this.setUsersFormArray(resource)));

        this.listData=new MatTableDataSource(this.tableFormArray.controls);
        this.listData.paginator = this.paginator;
        
        this.dropdownValues(this.resourceData);
      }
      else{
        this.tableFormArray=this.formBuilder.array(this.filteredRows.map(resource => this.setUsersFormArray(resource)));
        this.listData=new MatTableDataSource(this.tableFormArray.controls);
        this.listData.paginator = this.paginator;
        this.dropdownValues(this.filteredRows);
      }
    }
    else{
      for (let i = 0; i < this.tableFormArray.length; i++) {
        if(this.tableFormArray.at(i).get('employee_name').value==name || this.tableFormArray.at(i).get('track').value==track ||
          this.tableFormArray.at(i).get('location').value==location || this.tableFormArray.at(i).get('city').value==city ||
          this.tableFormArray.at(i).get('engagement_type').value==eng_type || this.tableFormArray.at(i).get('employee_type').value==emp_type){
          arr.push(this.tableFormArray.at(i).value);
        }
      }
      this.tableFormArray=this.formBuilder.array(arr.map(resource => this.setUsersFormArray(resource)));
      this.listData=new MatTableDataSource(this.tableFormArray.controls);
      this.listData.paginator = this.paginator;
      this.dropdownValues(arr);
    }
  }

  toggleEdit(): void {
    this.readonly = !this.readonly;
    if(this.buttonText === 'edit') { 
      this.buttonText = 'cancel';
      this.selectedColor='warn';
      this.toolTip="Cancel";
    } else {
      this.buttonText = 'edit';
      this.selectedColor='primary';
      this.toolTip="Edit Records";
      if(this.selectedProject!=(null||""||undefined)){
       this.onChangeProject(this.selectedProject);
     }
     else{this.currentDateRecords();}
    }
    this.disable = !this.disable;
  }

  updateData(){
    this.listService.touchedRows = this.tableFormArray.controls.filter(row => row.touched).map(row => row.value);
    const available_hours_col= this.listService.touchedRows.map(res=>Number(res.available_hours));
    const billed_hours_col= this.listService.touchedRows.map(res=>Number(res.billed_hours));
    const bill_rate_col= this.listService.touchedRows.map(res=>Number(res.bill_rate));
    const cost_rate_col= this.listService.touchedRows.map(res=>Number(res.cost_rate));
    const cost_hours_col= this.listService.touchedRows.map(res=>Number(res.cost_hours));
    const start_date_col=this.listService.touchedRows.map(res=>new Date(new Date(res.start_date).toUTCString()));
    const end_date_col=this.listService.touchedRows.map(res=>new Date(new Date(res.end_date).toUTCString()));

    for(let row in this.listService.touchedRows){
      this.listService.touchedRows[row].available_hours=available_hours_col[row];
      this.listService.touchedRows[row].billed_hours=billed_hours_col[row];
      this.listService.touchedRows[row].bill_rate=bill_rate_col[row];
      this.listService.touchedRows[row].cost_rate=cost_rate_col[row];
      this.listService.touchedRows[row].cost_hours=cost_hours_col[row];
      this.listService.touchedRows[row].start_date=start_date_col[row];
      this.listService.touchedRows[row].end_date=end_date_col[row]; console.log(this.listService.touchedRows[row].start_date);
    }

    this.listService.touchedRows.map(res=>res.nb_hours=res.available_hours-res.billed_hours);
    this.listService.touchedRows.map(res=>res.total_revenue=res.billed_hours * res.bill_rate);
    this.listService.touchedRows.map(res=>res.total_expenses= res.cost_rate * res.cost_hours);

    this.listService.touchedRows.map(res=>
      {
        if(res.nb_hours<=0){res.nb_category=""}
      });
      console.log(this.listService.touchedRows)
     
  }
  
  confirmDialog(){
    var arr= new Array;var arr1= new Array;
    this.updateData();
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      disableClose:true,
      width:"20%",
      position:{'top':'0'}
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result==true){
        this.listService.postRecords(this.listService.touchedRows).subscribe(fn=>{
          if(this.filteredRows.length){this.listService.touchedRows=[];
            this.summaryService.getUpd(this.selectedYear,this.selectedMonth).subscribe((res1:any[])=>{
              console.log("assc");
              console.log(res1);
              for(let row in res1){
                if(res1[row].project_id==this.selectedProject){
                  arr1.push(res1[row]);
                }
              }
              this.tableFormArray=this.formBuilder.array(arr1.map(resource => this.setUsersFormArray(resource)));
              this.listData.data=this.tableFormArray.controls;
              this.listData.paginator = this.paginator;
          
          });
        }
        else{this.currentDateRecords()};
        this.controls();
      });
      
       }
    });
  }
}
