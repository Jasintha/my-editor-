import { Overlay } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core";
import { UIBService } from "@app/core/projectservices/uib.service";
import {Application} from 'src/app/modules/home/pages/uib/uib-application/uib-application.component'
import { CreateProjectComponent } from "../create-project/create-project.component";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { DeleteProjectComponent } from "../delete-project/delete-project.component";

@Component({
    selector: 'grid-tile',
    templateUrl: './grid-tile.component.html',
    styleUrls: ['./grid-tile.component.scss'],
    encapsulation: ViewEncapsulation.None
  })
  export class GridTileComponent implements OnInit {
  @Input()app: Application;

  isSynced = false;
    constructor(private dialog: MatDialog,
        private uibService: UIBService,
       private overlay: Overlay, private router: Router){}

    ngOnInit(){
      console.log(this.app.data)
    }

    getColor(color){
      return color;
    }

    editGridTiles(app){
      const overlayRef = this.overlay.create({
        hasBackdrop: true,
        backdropClass: 'cdk-overlay-transparent-backdrop',
        panelClass: 'mat-elevation-z8',
        positionStrategy: this.overlay
          .position()
          .global()
          .right('0')
          .width('900px'),
      });
      const component = new ComponentPortal(CreateProjectComponent);
      const componentRef = overlayRef.attach(component);
      componentRef.instance.projectUuid = app.projectUuid
      componentRef.instance.projectForm.patchValue({
        projectName: app.title.name,
        description: app.description,
      })
      componentRef.instance.dismiss.subscribe(()=> overlayRef.detach())
      overlayRef.backdropClick().subscribe(() => overlayRef.detach());
    }

    deleteGridTiles(app){
      const dialogRef = this.dialog.open(DeleteProjectComponent, {
        panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
        data: {
            projectUid: app.projectUuid,
            name: app.title.name
        }
    });
    dialogRef.afterClosed(
    ).subscribe(result => {
        console.log(`Dialog result: ${result}`);
    });
    }

    syncGridTile(app){
      this.isSynced = true;
      this.uibService.syncUIBProject(app.projectUuid).subscribe(
      {
        next: (res) => {
          this.isSynced = false
          console.log(res)
        },
        error: (error) => {
          this.isSynced = false
          console.log(error)
        }
      })
    }

    openbox(app) {
      this.router.navigate(["uib-editor"], {
        queryParams: {
          projectUid: app.projectUuid
        }
      })
    }
  }
  