import { Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { EventManagerService } from '@shared/events/event.type';
import { AppEvent } from '@shared/events/app.event.class';
import { EventTypes } from '@shared/events/event.queue';
import {SubruleService} from '@core/projectservices/sub-rule.service';

@Component({
  selector: 'virtuan-subrule-delete-dialog',
  templateUrl: './subrule-delete-dialog.component.html',
})
export class SubruleDeleteDialogComponent {
  uuid: string;
  name: string;
  projectUid: string;

  constructor(protected subruleService: SubruleService,
              protected eventManager: EventManagerService,
              public dialogRef: MatDialogRef<SubruleDeleteDialogComponent>,
              @Inject(MAT_DIALOG_DATA)  public data: any) {
    this.uuid = this.data.uuid;
    this.name = this.data.name;
    this.projectUid = this.data.projectUid;
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  confirmDelete(id: string) {
    this.subruleService.delete(id, this.projectUid).subscribe(response => {
      // this.eventManager.broadcast({
      //   name: 'lamdafunctionListModification',
      //   content: 'Deleted an lamdafunction'
      // });
      this.eventManager.dispatch(
        new AppEvent(EventTypes.editorTreeListModification, {
          name: 'editorTreeListModification',
          content: 'Deleted an subrule',
        })
      );
      this.dialogRef.close(this.uuid);
    });
  }
}

