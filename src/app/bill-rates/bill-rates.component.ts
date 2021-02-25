import { Component, OnInit, ViewChild } from '@angular/core';
import { BillRatesService } from '../shared/services/bill-rates.service';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmDialogComponent } from '../shared/confirm_dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-bill-rates',
  templateUrl: './bill-rates.component.html',
  styleUrls: ['./bill-rates.component.scss']
})
export class BillRatesComponent implements OnInit {

  displayedColumns: string[] = ['ID', 'BillRate'];
  dataSource: MatTableDataSource<any>;

  billRateForm:FormGroup;
  panelOpenState = false;

  existBillRates:number[]=[];
  errorMessage:boolean;

  constructor(private billRateService:BillRatesService,private formBuilder:FormBuilder,
              private dialog:MatDialog) { }

  ngOnInit(): void {
   this.getRecords();

   this.billRateForm = this.formBuilder.group({
    bill_rate:['',[Validators.required]],
   });
  }

  getRecords(){
    this.billRateService.getBillRates().subscribe((res:any[])=>{
      this.dataSource=new MatTableDataSource(res);

      this.existBillRates=res.map(r=>r.bill_rate);
      });
  }
  
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
checkDuplicate(){
    for(let bill in this.existBillRates){
      if(this.billRateForm.value==bill){
        this.errorMessage=true;
      }
    }
}
  onSubmit(){
    this.errorMessage=false;
    console.log(this.billRateForm.value)
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      disableClose:true,
      width:"20%",
      position:{'top':'0'}
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result==true){
        console.log(this.errorMessage)
        // if(this.errorMessage=false){
        //   this.billRateService.postRecords(this.billRateForm.value).subscribe((response)=>{
        //   })
        //   this.billRateForm.reset();
        // }
      
    this.getRecords();
      }
    }); 
  }

}
