import { Injectable } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {LamdafunctionDeleteDialogComponent} from '@home/pages/create-lamdafunction/function-delete-dialog.component';
import {MicroserviceModelDeleteDialogComponent} from '@home/pages/create-model/microservice-model-delete-dialog.component';
import {SubruleDeleteDialogComponent} from '@home/pages/create-subrule/subrule-delete-dialog.component';
import {TaskDeleteDialogComponent} from '@home/pages/create-task/task-delete-dialog.component';
import {HybridfunctionDeleteDialogComponent} from '@home/pages/create-hybridfunction/hybrid-function-delete-dialog.component';
import {EventDeleteDialogComponent} from '@home/pages/create-event/event-delete-dialog.component';
import {ApiDeleteDialogComponent} from '@home/pages/create-api/api-delete-dialog.component';
import {BuiltInPageDeleteDialogComponent} from '@home/pages/built-in-page/built-in-page-delete-dialog.component';
import {MainMenuDeleteDialogComponent} from '@home/pages/main-menu/main-menu-delete-dialog.component';

@Injectable({ providedIn: 'root' })
export class DeleteOperationService {

  public constructor(public dialog: MatDialog) {}
  
    delete(item, projectUid) {
        if (item.type === 'API' || item.type === 'COMMAND' || item.type === 'QUERY') {
            this.deleteApi(item, projectUid);
        } else if (item.type === 'WORKFLOW') {
            this.deleteSubrule(item, projectUid);
        } else if (item.type === 'MODEL'){
            this.deleteModel(item, projectUid);
        } else if (item.type === 'EVENT'){
            this.deleteEvent(item, projectUid);
        } else if (item.type === 'HYBRID'){
            this.deleteHybridFunction(item, projectUid);
        } else if (item.type === 'LAMBDA'){
            this.deleteLambdaFunction(item, projectUid);
        } else if (item.type === 'TASK'){
            this.deleteTask(item, projectUid);
        }else if (item.type === 'UI_PAGE'){
            this.deleteUIPages(item, projectUid);
        } else if (item.type === 'UI_MAIN_MENU'){
            this.deleteMainMenu(item, projectUid);
        }
    }

    deleteUIPages(item, projectUid) {
        const dialogRef = this.dialog.open(BuiltInPageDeleteDialogComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUid,
                uuid: item.uuid,
                name: item.name
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
//         return false;
    }

    deleteMainMenu(item, projectUid) {
        const dialogRef = this.dialog.open(MainMenuDeleteDialogComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUid,
                uuid: item.uuid,
                name: item.name
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
//         return false;
    }

    deleteLambdaFunction(item, projectUid) {
        const dialogRef = this.dialog.open(LamdafunctionDeleteDialogComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUid,
                uuid: item.uuid,
                name: item.name
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
//         return false;
    }

    deleteApi(item, projectUid) {
        const dialogRef = this.dialog.open(ApiDeleteDialogComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUid,
                uuid: item.uuid,
                name: item.name,
                apitype: item.type
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
//         return false;
    }

    deleteEvent(item, projectUid) {
        const dialogRef = this.dialog.open(EventDeleteDialogComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUid,
                uuid: item.uuid,
                name: item.name
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
//         return false;
    }

    deleteHybridFunction(item, projectUid) {
        const dialogRef = this.dialog.open(HybridfunctionDeleteDialogComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUid,
                uuid: item.uuid,
                name: item.name
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
//         return false;
    }

    deleteTask(item, projectUid) {
        const dialogRef = this.dialog.open(TaskDeleteDialogComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUid,
                uuid: item.uuid,
                name: item.name
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
//         return false;
    }

    deleteSubrule(item, projectUid) {
        const dialogRef = this.dialog.open(SubruleDeleteDialogComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUid,
                uuid: item.uuid,
                name: item.name
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
//         return false;
    }

    deleteModel(item, projectUid) {
        const dialogRef = this.dialog.open(MicroserviceModelDeleteDialogComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUid,
                uuid: item.uuid,
                name: item.name
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
//         return false;
    }

}
