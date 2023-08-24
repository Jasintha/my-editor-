import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UIBService } from '@app/core/projectservices/uib.service';

@Component({
  selector: 'virtuan-project-delete-dialog',
  styleUrls:  ['./delete-project.component.scss'],
  templateUrl: './delete-project.component.html',
})
export class DeleteProjectComponent {
  name: string;
  projectUid: string;

  constructor(
            private uibService: UIBService,
            public snackbar: MatSnackBar,
              public dialogRef: MatDialogRef<DeleteProjectComponent>,
              @Inject(MAT_DIALOG_DATA)  public data: any) {
    this.name = this.data.name;
    this.projectUid = this.data.projectUid;
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  confirmDelete() {
    this.uibService.deleteUIBProject(this.projectUid).subscribe({
        next: (value) => {
          this.snackbar.open('Deleted Successfully', '', {
            duration: 500,
            panelClass: 'snackbar-success',
            horizontalPosition: 'right',
            verticalPosition: 'top'
          })
        },
        error: (error) => {
          console.log(error);
        },
      });
  }
}

