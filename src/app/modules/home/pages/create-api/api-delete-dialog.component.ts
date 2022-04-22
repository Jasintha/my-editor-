import { Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import {ApiService} from '@core/projectservices/api.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { EventManagerService } from '@shared/events/event.type';
import { AppEvent } from '@shared/events/app.event.class';
import { EventTypes } from '@shared/events/event.queue';

@Component({
  selector: 'virtuan-api-delete-dialog',
  templateUrl: './api-delete-dialog.component.html',
})
export class ApiDeleteDialogComponent {
  uuid: string;
  name: string;
  projectUid: string;
  apitype: string;

  constructor(protected apiService: ApiService,
              protected eventManager: EventManagerService,
              public dialogRef: MatDialogRef<ApiDeleteDialogComponent>,
              @Inject(MAT_DIALOG_DATA)  public data: any) {
    this.uuid = this.data.uuid;
    this.name = this.data.name;
    this.projectUid = this.data.projectUid;
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  confirmDelete(id: string) {
   if (this.apitype === 'COMMAND') {
      this.apiService.deleteCommand(id, this.projectUid).subscribe(response => {
        // this.eventManager.broadcast({
        //   name: 'apiListModification',
        //   content: 'Deleted an api'
        // });
        this.eventManager.dispatch(
          new AppEvent(EventTypes.editorTreeListModification, { name: 'editorTreeListModification', content: 'Deleted an api' })
        );
        this.dialogRef.close(this.uuid);
      });
    } else if (this.apitype === 'QUERY') {
      this.apiService.deleteQuery(id, this.projectUid).subscribe(response => {
        // this.eventManager.broadcast({
        //   name: 'apiListModification',
        //   content: 'Deleted an api'
        // });
        this.eventManager.dispatch(
          new AppEvent(EventTypes.editorTreeListModification, { name: 'editorTreeListModification', content: 'Deleted an api' })
        );
        this.dialogRef.close(this.uuid);
      });
    } else {
      this.apiService.delete(id, this.projectUid).subscribe(response => {
        // this.eventManager.broadcast({
        //   name: 'apiListModification',
        //   content: 'Deleted an api'
        // });
        this.eventManager.dispatch(
          new AppEvent(EventTypes.editorTreeListModification, { name: 'editorTreeListModification', content: 'Deleted an api' })
        );
        this.dialogRef.close(this.uuid);
      });
    }

  }
}

