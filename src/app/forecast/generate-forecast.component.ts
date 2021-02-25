import { Component, OnInit } from '@angular/core';
import { SummaryService } from '../shared/services/summary.service';
import { Resource } from '../shared/models/resource.model';
import { ForcastServiceService } from "../shared/services/forcaste.service";
import { Holidays } from '../shared/models/holidays.model';
import { ConfirmDialogComponent } from '../shared/confirm_dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-generate-forecast',
  templateUrl: './generate-forecast.component.html',
  styleUrls: ['./generate-forecast.component.scss']
})
export class GenerateForecastComponent implements OnInit {

  resourceData: Resource[] = [];
  projectValues: any[];
  uniqueMonths: string[];
  uniqueYears: string[];
  latestMonth: string;
  latestYear: string;
  futureMonths: string[] = [];
  endMonths: string[] = [];
  additionalOption: any;
  projectData: Resource[] = [];
  startMonth:string;
  startMonthIndex: number;
  endMonthIndex: number;
  selctedMonthDate: Date;
  firstDayDate: Date;
  lastDayDate: Date;
  holidays: Holidays[];
  weekDaysCount: number;
  selectedMonthValue: number;
  holidayCount_Full: number;
  holidayCount_Part1: number;
  holidayCount_Part2: number;
  billing_hours: number;
  tempData:any[]=[];
  finalMonthData:Resource[] = [];
  message:string;
  constructor(public summaryService: SummaryService, private forecastService: ForcastServiceService,
                private dialog:MatDialog) { }

  monthMap = new Map()
    .set("january", 1).set("february", 2).set("march", 3).set("april", 4).set("may", 5).set("june", 6)
    .set("july", 7).set("august", 8).set("september", 9).set("october", 10).set("november", 11)
    .set("december", 12);

  ngOnInit(): void {
    this.additionalOption = "All Projects";
    this.latestDateRecords();
    this.holidaysList();
  }

  holidaysList() {
    this.forecastService.getHolidayList().subscribe(res => this.holidays = res);
  }

  latestDateRecords() {
    this.summaryService.getByCurrentDate().subscribe((res: any[]) => {
      
      this.resourceData = res;
      this.resourceData.map(res=> delete res.id);

      this.projectValues = [...new Set(this.resourceData.map(item => item.project_id))];
      if (this.projectValues.length != 0) {
        this.projectValues.push(this.additionalOption);
      }

      this.uniqueMonths = [...new Set(this.resourceData.map(item => item.month.toUpperCase()))];
      this.uniqueYears = [...new Set(this.resourceData.map(item => item.year))];

      if (this.uniqueMonths.length == 1 && this.uniqueYears.length == 1) {
        this.latestMonth = this.uniqueMonths[0];
        this.latestYear = this.uniqueYears[0];

        this.months();
        this.fromMonth();
      }
      if(this.latestMonth.toLowerCase()=="december"){
        this.message="No future months to forecast in this year."
      }
      else{
        this.message="";
      }
    });
  }

  onChangeProject(project) {
    this.projectData = [];
    this.finalMonthData=[];
    this.tempData=[];
    if (project != this.additionalOption) {
      for (let row in this.resourceData) {
        if (this.resourceData[row].project_id == project) {
          this.projectData.push(this.resourceData[row]);
        }
      }
    }
    else if (project == this.additionalOption) {
      for (let row in this.resourceData) {
          this.projectData.push(this.resourceData[row]);
      }
    }
    this.projectData.forEach(res=>this.tempData.push(Object.assign({},res)));
  }

  months() {
    for (var [key, value] of this.monthMap.entries()) {
      if (key == this.latestMonth.toLowerCase()) {
        for (var [month, monthNo] of this.monthMap.entries()) {
          if (monthNo > value) {
            this.futureMonths.push(month);
          }
        }
      }
    }
  }

  fromMonth() {
    this.futureMonths=[];
    this.endMonths = [];
    this.months();
    this.startMonth = this.futureMonths[0];
    if (this.startMonth != null || this.startMonth != "" || this.futureMonths!=[]) {
      for (let row in this.futureMonths) {
        if (this.futureMonths[row] == this.startMonth) {
          this.startMonthIndex = parseInt(row);
        }
      }
    }
    else{this.startMonth="";}
    this.endMonths = this.futureMonths.slice(this.startMonthIndex);
  }

  endMonth(month) {
    this.finalMonthData=[];
    if (month != "null") {
      for (let row in this.futureMonths) {
        if (this.futureMonths[row] == month) {
          this.endMonthIndex = parseInt(row);
        }
      }
    }
    for (let m = this.startMonthIndex; m <= this.endMonthIndex; m++) {
      this.columnBind(this.futureMonths[m]);
    }
  }

  upload(){
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      disableClose:true,
      width:"20%",
      position:{'top':'0'}
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result==true){
        this.forecastService.postRecords(this.finalMonthData).subscribe(res=>console.log(res));
        this.reset();
      }
    }); 
  }
  reset(){
    this.projectValues=[];
    this.futureMonths = [];
    this.endMonths=[];
    this.finalMonthData=[];
    
    this.latestDateRecords();
  }
  columnBind(forecastMonth) {
    if(this.projectData=[]){
      this.tempData.forEach(res=>this.projectData.push(Object.assign({},res)))
    }
    this.projectData.map(m => m.month = forecastMonth);

    for (var [key, monthValue] of this.monthMap.entries()) {
      if (key == forecastMonth.toLowerCase()) {
        this.selectedMonthValue = monthValue;
        var dateString = (this.latestYear +'/'+ monthValue +'/'+'01').toString();
        this.selctedMonthDate = new Date(new Date(dateString).toDateString());
        this.lastDayDate = new Date(this.selctedMonthDate.getFullYear(), this.selctedMonthDate.getMonth() + 1, 0);
      }
    }
    this.weekDaysCount=0;
    this.weekDaysCount = this.getWeekdaysInMonth(this.selectedMonthValue - 1, this.latestYear);
    this.avilableHours();
    this.billedHrs();
    this.costHrs();
    this.nbHours();
    this.nbCategory();
    this.revenueAndExpense();
    
    for(let row in this.projectData){
      if(new Date(new Date(this.projectData[row].end_date).toDateString()) >= this.selctedMonthDate){
       
        this.finalMonthData.push(this.projectData[row]);
      }
    }
    console.log(this.finalMonthData)
  
    this.projectData=[];
  }

  daysInMonth(iMonth, iYear) {
    return 32 - new Date(iYear, iMonth, 32).getDate();
  }
  isWeekday(year, month, dayParam) {
    var day = new Date(year, month, dayParam).getDay();
    return day != 0 && day != 6;
  }
  getWeekdaysInMonth(month, year) {
    var days = this.daysInMonth(month, year);
    this.weekDaysCount = 0;
    for (var i = 0; i < days; i++) {
      if (this.isWeekday(year, month, i + 1)) this.weekDaysCount++;
    }
    return this.weekDaysCount;
  }

  getBusinessDatesCount(startDate, endDate) {
    var count = 0;
    var curDate = new Date(startDate);
    while (curDate <= endDate) {
      var dayOfWeek = curDate.getDay();
      if (!((dayOfWeek == 6) || (dayOfWeek == 0))) {
        count++;
      }
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  }

  holidayCountFull(projectDataRow) {
    for (let row in this.holidays) {
      if (this.holidays[row].location.toLowerCase() == projectDataRow.city.toLowerCase()) {
        if (new Date(new Date(this.holidays[row].holiday_date).toDateString()) >= this.selctedMonthDate &&
          new Date(new Date(this.holidays[row].holiday_date).toDateString()) <= this.lastDayDate) {
          if (new Date(this.holidays[row].holiday_date).getDay() != 0 && new Date(this.holidays[row].holiday_date).getDay() != 6) {
            this.holidayCount_Full = this.holidayCount_Full + 1;
          }
        }
      }
    }
  }

  holidayCountPart1(projectDataRow) {
    for (let row in this.holidays) {
      if (this.holidays[row].location.toLowerCase() == projectDataRow.city.toLowerCase()) {
        if (new Date(this.holidays[row].holiday_date) >= new Date(projectDataRow.start_date)
          && new Date(new Date(this.holidays[row].holiday_date).toDateString()) <= this.lastDayDate) {
          if (new Date(this.holidays[row].holiday_date).getDay() != 0 && new Date(this.holidays[row].holiday_date).getDay() != 6) {
            this.holidayCount_Part1 = this.holidayCount_Part1 + 1;
          }
        }
      }
    }
  }

  holidayCountPart2(projectDataRow) {
    for (let row in this.holidays) {
      if (this.holidays[row].location.toLowerCase() == projectDataRow.city) {
        if (new Date(this.holidays[row].holiday_date) >= new Date(projectDataRow.end_date)
          && new Date(new Date(this.holidays[row].holiday_date).toDateString()) <= this.lastDayDate) {
          if (new Date(this.holidays[row].holiday_date).getDay() != 0 && new Date(this.holidays[row].holiday_date).getDay() != 6) {
            this.holidayCount_Part2 = this.holidayCount_Part2 + 1;
          }
        }
      }
    }
  }

  billingHours(projectDataRow) {
    if (projectDataRow.engagement_type.toLowerCase().replace(/\s/g, "") == "t&monshore"
      || projectDataRow.engagement_type.toLowerCase().replace(/\s/g, "") == "t&moffshore8hrs") {
      this.billing_hours = 8;
    }
    else if (projectDataRow.engagement_type.toLowerCase().replace(/\s/g, "") == "t&moffshore9hrs") {
      this.billing_hours = 9;
    }
  }

  avilableHours() {
    for (let row in this.projectData) { 
      if (this.projectData[row].engagement_type.toLowerCase().replace(/\s/g, "") == "managedcapacity") {
        if (this.projectData[row].location.toLowerCase().replace(/\s/g, "") == "onshore") {
          this.projectData[row].available_hours = 172;
        }
        else if (this.projectData[row].location.toLowerCase().replace(/\s/g, "") == "offshore") {
          this.projectData[row].available_hours = 180;
        }
      }
      else {
        if (new Date(new Date(this.projectData[row].start_date).toDateString()) < this.selctedMonthDate &&
          new Date(new Date(this.projectData[row].end_date).toDateString()) > this.lastDayDate) {
           
          this.holidayCount_Full = this.billing_hours = 0;
          this.holidayCountFull(this.projectData[row]);
          this.billingHours(this.projectData[row]);
         
          this.projectData[row].available_hours = (this.weekDaysCount - this.holidayCount_Full) * this.billing_hours;
         }
        else if (new Date(new Date(this.projectData[row].start_date).toDateString()) >= this.selctedMonthDate &&
          new Date(new Date(this.projectData[row].end_date).toDateString()) > this.lastDayDate) {
         
          var endDate = new Date(this.lastDayDate);
          let numOfDays = this.getBusinessDatesCount(new Date(new Date(this.projectData[row].start_date).toDateString()),  this.lastDayDate);
          
          this.holidayCount_Part1 = this.billing_hours = 0;
          this.holidayCountPart1(this.projectData[row]);
          this.billingHours(this.projectData[row]);

          this.projectData[row].available_hours = (numOfDays - this.holidayCount_Part1) * this.billing_hours;
          }
        else if(new Date(new Date(this.projectData[row].start_date).toDateString()) < this.selctedMonthDate &&
          new Date(new Date(this.projectData[row].end_date).toDateString()) <= this.lastDayDate) {

          var startDate1 = this.selctedMonthDate;
          var endDate = new Date(new Date(this.projectData[row].end_date).toDateString());
          let numOfWeekDays = this.getBusinessDatesCount(startDate1,endDate);
         
          this.holidayCount_Part2 = this.billing_hours = 0;
          this.holidayCountPart2(this.projectData[row]);
          this.billingHours(this.projectData[row]);

          this.projectData[row].available_hours = (numOfWeekDays - this.holidayCount_Part2) * this.billing_hours;
        }
      }
    }
  }

  billedHrs() {
    for(let row in this.projectData) {
      if(this.projectData[row].billed_hours > 0){
        this.projectData[row].billed_hours = this.projectData[row].available_hours;
      }
      else if(this.projectData[row].billed_hours == 0){
        this.projectData[row].billed_hours = 0;
      }
    }
  }

  costHrs() {
    for (let row in this.projectData) {
      if (this.projectData[row].employee_type.toLowerCase().replace(/\s/g, "") == "contractor") {
        this.projectData[row].cost_hours = this.projectData[row].billed_hours;
      }
      else if (this.projectData[row].employee_type.toLowerCase().replace(/\s/g, "") == "fulltimer") {
        if (new Date(new Date(this.projectData[row].start_date).toDateString()) < this.selctedMonthDate &&
        new Date(new Date(this.projectData[row].end_date).toDateString()) > this.lastDayDate) {
          this.projectData[row].cost_hours = 160;
        }
        else if (new Date(new Date(this.projectData[row].start_date).toDateString()) >= this.selctedMonthDate &&
          new Date(new Date(this.projectData[row].end_date).toDateString()) > this.lastDayDate) {
          this.projectData[row].cost_hours=((31-new Date(this.projectData[row].start_date).getDate())/30) * 160;
        }
        else if(new Date(new Date(this.projectData[row].start_date).toDateString()) < this.selctedMonthDate &&
          new Date(new Date(this.projectData[row].end_date).toDateString()) <= this.lastDayDate) {
            this.projectData[row].cost_hours=1-((31-new Date(this.projectData[row].end_date).getDate())/30) * 160;
          }
      }
    }
  }

  nbHours(){
    for(let row in this.projectData) {
      this.projectData[row].nb_hours =  this.projectData[row].available_hours -  this.projectData[row].billed_hours;
    }
  }

  nbCategory(){
    for(let row in this.projectData) {
      if(this.projectData[row].nb_hours == 0){
      this.projectData[row].nb_category = " ";
      }
    }
  }
  revenueAndExpense(){
    for(let row in this.projectData) {
     const revenue= (this.projectData[row].bill_rate * this.projectData[row].billed_hours);
     this.projectData[row].total_revenue=parseFloat(revenue.toFixed(2));

     const expenses=(this.projectData[row].cost_rate * this.projectData[row].cost_hours);
     this.projectData[row].total_expenses=parseFloat(expenses.toFixed(2));
    }
  }
}
