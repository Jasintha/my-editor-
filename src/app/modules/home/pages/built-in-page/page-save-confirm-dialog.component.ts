import {Component, OnInit, OnDestroy, Inject} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import {IPage} from '@shared/models/model/page.model';
import {EventManagerService} from '@shared/events/event.type';
import {BuiltInPageService} from '@core/projectservices/built-in-page.service';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';



@Component({
  selector: 'virtuan-page-save-confirm-dialog',
  templateUrl: './page-save-confirm-dialog.component.html',
})
export class PageSaveConfirmDialogComponent {
  builtInPage: IPage;
  projectUid: string;

  constructor(
    protected builtInPageService: BuiltInPageService,
    protected eventManager: EventManagerService,
    public dialogRef: MatDialogRef<PageSaveConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA)  public data: any,
  ) {}

  cancel() {
    this.dialogRef.close(false);
  }

  confirmChange() {
    this.dialogRef.close(true);
}
}