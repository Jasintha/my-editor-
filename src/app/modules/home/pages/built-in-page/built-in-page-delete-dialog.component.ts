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
  selector: 'virtuan-built-in-page-delete-dialog',
  templateUrl: './built-in-page-delete-dialog.component.html',
})
export class BuiltInPageDeleteDialogComponent {
  builtInPage: IPage;
  projectUid: string;

  constructor(
    protected builtInPageService: BuiltInPageService,
    protected eventManager: EventManagerService,
    public dialogRef: MatDialogRef<BuiltInPageDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA)  public data: any,
  ) {}

  cancel() {
    this.dialogRef.close();
  }

  confirmDelete(id: string, projectUuid: string) {
    this.builtInPageService.delete(id, projectUuid).subscribe(response => {
      // this.eventManager.broadcast({
      //   name: 'builtInPageListModification',
      //   content: 'Deleted an built in page'
      // });
      this.eventManager.dispatch(
        new AppEvent(EventTypes.editorUITreeListModification, {
          name: 'editorUITreeListModification',
          content: 'Deleted an built in page',
        })
      );
      this.dialogRef.close();
    });
  }
}

// @Component({
//   selector: 'virtuan-built-in-page-delete-popup',
//   template: '',
// })
// export class BuiltInPageDeletePopupComponent implements OnInit, OnDestroy {
//
//   constructor(protected activatedRoute: ActivatedRoute, protected router: Router, ) {}
//
//   ngOnInit() {
//     this.activatedRoute.data.subscribe(({ builtInPage }) => {
//       setTimeout(() => {
//         this.ngbModalRef = this.modalService.open(BuiltInPageDeleteDialogComponent as Component, { size: 'lg', backdrop: 'static' });
//         this.ngbModalRef.componentInstance.builtInPage = builtInPage;
//         this.ngbModalRef.result.then(
//           result => {
//             this.router.navigate(['/model-page', { outlets: { popup: null } }]);
//             this.ngbModalRef = null;
//           },
//           reason => {
//             this.router.navigate(['/model-page', { outlets: { popup: null } }]);
//             this.ngbModalRef = null;
//           }
//         );
//       }, 0);
//     });
//   }
//
//   ngOnDestroy() {
//     this.ngbModalRef = null;
//   }
// }
