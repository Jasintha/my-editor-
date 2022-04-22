import { Injectable } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {CreateApiComponent} from '@home/pages/create-api/create-api.component';
import {CreateSubruleComponent} from '@home/pages/create-subrule/create-subrule.component';
import {CreateModelComponent} from '@home/pages/create-model/create-model.component';
import {CreateEventComponent} from '@home/pages/create-event/create-event.component';
import {CreateHybridfunctionComponent} from '@home/pages/create-hybridfunction/create-hybridfunction.component';
import {CreateLamdafunctionComponent} from '@home/pages/create-lamdafunction/create-lamdafunction.component';
import {CreateTaskComponent} from '@home/pages/create-task/create-task.component';

@Injectable({ providedIn: 'root' })
export class AddOperationService {

    public constructor(public dialog: MatDialog) {}

    createPopups(node , projectUid) {
        if (node.type === 'PARENT_API') {
            this.createApi(projectUid);
        } else if (node.type === 'PARENT_PROCESS') {
            this.createSubrule(projectUid);
        } else if (node.type === 'PARENT_MODEL'){
            this.createModel(projectUid);
        } else if (node.type === 'PARENT_EVENT'){
            this.createEvent(projectUid);
        } else if (node.type === 'PARENT_HYBRID'){
            this.createHybridFunction(projectUid);
        } else if (node.type === 'PARENT_LAMBDA'){
            this.createLambdaFunction(projectUid);
        } else if (node.type === 'PARENT_TASK'){
            this.createTask(projectUid);
        }
    }

    createApi(projectUId) {
        const dialogRef = this.dialog.open(CreateApiComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUId
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }

    createSubrule(projectUId) {
        const dialogRef = this.dialog.open(CreateSubruleComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUId
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }

    createModel(projectUId) {
        const dialogRef = this.dialog.open(CreateModelComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUId
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }

    createEvent(projectUId) {
        const dialogRef = this.dialog.open(CreateEventComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUId
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }

    createHybridFunction(projectUId) {
        const dialogRef = this.dialog.open(CreateHybridfunctionComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUId
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }

    createLambdaFunction(projectUId) {
        const dialogRef = this.dialog.open(CreateLamdafunctionComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUId
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }

    createTask(projectUId) {
        const dialogRef = this.dialog.open(CreateTaskComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUId
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }

}
