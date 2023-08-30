import { Component, Inject, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UIBService } from '@app/core/projectservices/uib.service';
import { UibInternalService } from '../uib-internal-service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'virtuan-project-delete-dialog',
  styleUrls:  ['./delete-project.component.scss'],
  templateUrl: './delete-project.component.html',
})
export class DeleteProjectComponent implements OnInit{
  name: string;
  projectUid: string;
  delProject = new FormControl('');
  isDisabled = true

  constructor(
            private uibInternalService: UibInternalService,
            private uibService: UIBService,
            public snackbar: MatSnackBar,
              public dialogRef: MatDialogRef<DeleteProjectComponent>,
              @Inject(MAT_DIALOG_DATA)  public data: any) {
    this.name = this.data.name;
    this.projectUid = this.data.projectUid;
  }
  ngOnInit(): void {
    this.delProject.valueChanges.subscribe((val: string)=> {
      if(val === this.name){
        this.isDisabled = false
      } else {
        this.isDisabled = true
      }
    })
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  confirmDelete() {
    this.uibService.deleteUIBProject(this.projectUid).subscribe({
        next: (value) => {
          this.snackbar.open('Deleted Successfully', '', {
            duration: 1000,
            panelClass: 'snackbar-success',
            horizontalPosition: 'right',
            verticalPosition: 'top'
          })
        },
        error: (error) => {
          this.snackbar.open('Deletion Failed', '', {
            duration: 1000,
            panelClass: 'snackbar-failed',
            horizontalPosition: 'right',
            verticalPosition: 'top'
          })
        },
      });
    this.uibInternalService.setAction('delete')
    this.dialogRef.close(null);
  }
}

