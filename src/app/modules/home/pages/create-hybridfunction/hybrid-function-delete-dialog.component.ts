import { Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import {HybridfunctionService} from '@core/projectservices/hybrid-function.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { EventManagerService } from '@shared/events/event.type';
import { AppEvent } from '@shared/events/app.event.class';
import { EventTypes } from '@shared/events/event.queue';

@Component({
  selector: 'virtuan-hybrid-function-delete-dialog',
  templateUrl: './hybrid-function-delete-dialog.component.html',
})
export class HybridfunctionDeleteDialogComponent {
  uuid: string;
  name: string;
  projectUid: string;

  constructor(protected hybridfunctionService: HybridfunctionService,
              protected eventManager: EventManagerService,
              public dialogRef: MatDialogRef<HybridfunctionDeleteDialogComponent>,
              @Inject(MAT_DIALOG_DATA)  public data: any) {
    this.uuid = this.data.uuid;
    this.name = this.data.name;
    this.projectUid = this.data.projectUid;
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  confirmDelete(id: string) {
    this.hybridfunctionService.delete(id, this.projectUid).subscribe(response => {
      // this.eventManager.broadcast({
      //   name: 'lamdafunctionListModification',
      //   content: 'Deleted an lamdafunction'
      // });
      this.eventManager.dispatch(
        new AppEvent(EventTypes.editorTreeListModification, {
          name: 'editorTreeListModification',
          content: 'Deleted an hybridfunction',
        })
      );
      this.dialogRef.close(this.uuid);
    });
  }
}

