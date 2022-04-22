import { Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import {TaskService} from '@core/projectservices/microservice-task.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { EventManagerService } from '@shared/events/event.type';
import { AppEvent } from '@shared/events/app.event.class';
import { EventTypes } from '@shared/events/event.queue';

@Component({
  selector: 'virtuan-task-delete-dialog',
  templateUrl: './task-delete-dialog.component.html',
})
export class TaskDeleteDialogComponent {
  uuid: string;
  name: string;
  projectUid: string;

  constructor(protected taskService: TaskService,
              protected eventManager: EventManagerService,
              public dialogRef: MatDialogRef<TaskDeleteDialogComponent>,
              @Inject(MAT_DIALOG_DATA)  public data: any) {
    this.uuid = this.data.uuid;
    this.name = this.data.name;
    this.projectUid = this.data.projectUid;
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  confirmDelete(id: string) {
    this.taskService.delete(id, this.projectUid, "TASK").subscribe(response => {
      // this.eventManager.broadcast({
      //   name: 'lamdafunctionListModification',
      //   content: 'Deleted an lamdafunction'
      // });
      this.eventManager.dispatch(
        new AppEvent(EventTypes.editorTreeListModification, {
          name: 'editorTreeListModification',
          content: 'Deleted an task',
        })
      );
      this.dialogRef.close(this.uuid);
    });
  }
}

