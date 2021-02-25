import { Component, OnInit } from '@angular/core';
import { UploadService } from '../../shared/services/upload.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-view-summary-dialog',
  templateUrl: './view-summary-dialog.component.html',
  styleUrls: ['./view-summary-dialog.component.scss']
})
export class ViewSummaryDialogComponent implements OnInit {

  constructor(public uploadService:UploadService,public dialogRef: MatDialogRef<ViewSummaryDialogComponent>) { }
  displayedColumns: string[] = ['item','global','onshore','offshore']

  ngOnInit(): void {
  }
 
  closeDialog() {
    this.dialogRef.close();
  }

}
