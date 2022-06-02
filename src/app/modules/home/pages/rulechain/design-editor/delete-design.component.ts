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
import {StoryService} from '@core/projectservices/story-technical-view.service';

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
    @Inject(MAT_DIALOG_DATA)  public data: any,
      private storyService: StoryService,
  ) {}

  cancel() {
    this.dialogRef.close();
  }

  confirmDelete(id: string, uuid: string) {
    if (this.data.type === 'requirement'){
      this.requirementService.delete(id, uuid).subscribe(response => {
          this.eventManager.dispatch(
              new AppEvent(EventTypes.editorDesignTreeListModification, {
                  name: 'editorDesignTreeListModification',
                  content: 'Add an requirement',
              })
          );
        this.dialogRef.close();
      });
    } else if (this.data.type === 'story'){
      this.storyService.delete(id, uuid).subscribe(response => {
          const res = {
              uuid: id,
              type: this.data.type
          }
        this.dialogRef.close(res);
      });
    }else if (this.data.type === 'epic'){
      this.storyService.deleteEpic(id, uuid).subscribe(response => {
        this.dialogRef.close(this.data.type);
      });
    }

  }
}
