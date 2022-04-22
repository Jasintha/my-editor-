import { Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import {ILamdafunction, ILamdafunctionParameter, Lamdafunction, LamdafunctionParameter} from '@shared/models/model/lamdafunction.model';
import {LamdafunctionService} from '@core/projectservices/function.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { EventManagerService } from '@shared/events/event.type';
import { AppEvent } from '@shared/events/app.event.class';
import { EventTypes } from '@shared/events/event.queue';

@Component({
  selector: 'virtuan-lamdafunction-delete-dialog',
  templateUrl: './function-delete-dialog.component.html',
})
export class LamdafunctionDeleteDialogComponent {
  uuid: string;
  name: string;
  projectUid: string;

  constructor(protected lamdafunctionService: LamdafunctionService,
              protected eventManager: EventManagerService,
              public dialogRef: MatDialogRef<LamdafunctionDeleteDialogComponent>,
              @Inject(MAT_DIALOG_DATA)  public data: any) {
    this.uuid = this.data.uuid;
    this.name = this.data.name;
    this.projectUid = this.data.projectUid;
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  confirmDelete(id: string) {
    this.lamdafunctionService.delete(id, this.projectUid).subscribe(response => {
      // this.eventManager.broadcast({
      //   name: 'lamdafunctionListModification',
      //   content: 'Deleted an lamdafunction'
      // });
      this.eventManager.dispatch(
        new AppEvent(EventTypes.editorTreeListModification, {
          name: 'editorTreeListModification',
          content: 'Deleted an lamdafunction',
        })
      );
      this.dialogRef.close(this.uuid);
    });
  }
}

