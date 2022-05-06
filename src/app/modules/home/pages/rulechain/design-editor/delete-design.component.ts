import {Component, OnInit, OnDestroy, Inject} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {IPageNavigation} from '@shared/models/model/page-navigation.model';
import {PageNavigationService} from '@core/projectservices/page-navigation.service';
import {EventManagerService} from '@shared/events/event.type';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {RequirementService} from '@core/projectservices/requirement.service';

@Component({
  selector: 'virtuan-delete-design-dialog',
  templateUrl: './delete-design.component.html',
})
export class DeleteDesignComponent {
  pageNavigation: IPageNavigation;
  projectUid: string;
  type: string;

  constructor(
      private requirementService: RequirementService,
    protected eventManager: EventManagerService,
    public dialogRef: MatDialogRef<DeleteDesignComponent>,
    @Inject(MAT_DIALOG_DATA)  public data: any
  ) {}

  cancel() {
    this.dialogRef.close();
  }

  confirmDelete(id: string, uuid: string) {
    this.requirementService.delete(id, uuid).subscribe(response => {
      // this.eventManager.broadcast({
      //   name: 'pageNavigationListModification',
      //   content: 'Deleted an pageNavigation'
      // });
      this.eventManager.dispatch(
          new AppEvent(EventTypes.editorUITreeListModification, {
            name: 'editorUITreeListModification',
            content: 'Deleted an page navigation',
          })
      );
      this.dialogRef.close();
    });
  }
}
