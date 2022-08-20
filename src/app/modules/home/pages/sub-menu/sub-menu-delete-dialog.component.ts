import {Component, OnInit, OnDestroy, Inject} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import {IMainMenu} from '@shared/models/model/main-menu.model';
import {MainMenuService} from '@core/projectservices/main-menu.service';
import {EventManagerService} from '@shared/events/event.type';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';


@Component({
  selector: 'virtuan-main-menu-delete-dialog',
  templateUrl: './sub-menu-delete-dialog.component.html',
})
export class SubMenuDeleteDialogComponent {
  mainmenu: IMainMenu;
  projectUid: string;

  constructor(
    protected mainmenuService: MainMenuService,
    protected eventManager: EventManagerService,
    public dialogRef: MatDialogRef<SubMenuDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA)  public data: any
  ) {}

  cancel() {
    this.dialogRef.close(null);
  }

  confirmDelete(projectUid: string, id: string) {
    this.mainmenuService.delete(id, projectUid).subscribe(response => {
      // this.eventManager.broadcast({
      //   name: 'mainmenuListModification',
      //   content: 'Deleted an mainmenu'
      // });
      this.eventManager.dispatch(
          new AppEvent(EventTypes.editorUITreeListModification, {
            name: 'editorUITreeListModification',
            content: 'Deleted an mainmenu',
          })
      );
      this.dialogRef.close(null);
    });
  }
}

// @Component({
//   selector: 'virtuan-main-menu-delete-popup',
//   template: '',
// })
// export class MainMenuDeletePopupComponent implements OnInit, OnDestroy {
//   protected ngbModalRef: NgbModalRef;
//
//   constructor(protected activatedRoute: ActivatedRoute, protected router: Router, protected modalService: NgbModal) {}
//
//   ngOnInit() {
//     this.activatedRoute.data.subscribe(({ mainmenu }) => {
//       setTimeout(() => {
//         this.ngbModalRef = this.modalService.open(SubMenuDeleteDialogComponent as Component, { size: 'lg', backdrop: 'static' });
//         this.ngbModalRef.componentInstance.mainmenu = mainmenu;
//         this.ngbModalRef.result.then(
//           result => {
//             this.router.navigate(['/main-menu', { outlets: { popup: null } }]);
//             this.ngbModalRef = null;
//           },
//           reason => {
//             this.router.navigate(['/main-menu', { outlets: { popup: null } }]);
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
