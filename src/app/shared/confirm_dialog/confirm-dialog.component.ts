import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UploadService } from 'src/app/shared/services/upload.service';
import { MatSnackBar, MatSnackBarHorizontalPosition } from '@angular/material/snack-bar';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { empty } from 'rxjs';
import { ManageListService } from 'src/app/shared/services/manage-list.service';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {

  horizontalPosition: MatSnackBarHorizontalPosition;

  constructor(@Inject(MAT_DIALOG_DATA) public data: string,private listService:ManageListService,
              public dialogRef: MatDialogRef<ConfirmDialogComponent>,private snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }
  closeDialog() {
    this.dialogRef.close(false);
  }
  confirm(){ 
    // if(this.uploadService.finalData!=[]){
    //   this.uploadService.postRecords(this.uploadService.finalData).subscribe();
      
    // }
   // this.listService.postRecords(this.listService.touchedRows).subscribe(res=>this.ngOnInit());
    this.dialogRef.close(true);
    this.snackBar.open('Uploaded Successfully!!','', {
      duration: 1200,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: ['snackbar_color'],
    });
}
}
