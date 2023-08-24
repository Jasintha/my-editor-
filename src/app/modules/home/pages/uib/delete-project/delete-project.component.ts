import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { UIBService } from '@app/core/projectservices/uib.service';

@Component({
  selector: 'virtuan-project-delete-dialog',
  templateUrl: './delete-project.component.html',
})
export class DeleteProjectComponent {
  name: string;
  projectUid: string;

  constructor(
            private uibService: UIBService,
              public dialogRef: MatDialogRef<DeleteProjectComponent>,
              @Inject(MAT_DIALOG_DATA)  public data: any) {
    this.name = this.data.name;
    this.projectUid = this.data.projectUid;
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  confirmDelete(id: string) {
    this.uibService.deleteUIBProject(id).subscribe({
        next: (value) => {
          console.log(value)
        },
        error: (error) => {
          console.log(error);
        },
      });
  }
}

