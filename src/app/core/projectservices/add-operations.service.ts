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

    createPopups(node , projectUid, status) {
        if (node.type === 'PARENT_API') {
            this.createApi(node ,projectUid , status);
        } else if (node.type === 'PARENT_PROCESS') {
            this.createSubrule(node ,projectUid , status);
        } else if (node.type === 'PARENT_MODEL'){
            this.createModel(node ,projectUid , status);
        } else if (node.type === 'PARENT_EVENT'){
            this.createEvent(node ,projectUid , status);
        } else if (node.type === 'PARENT_HYBRID'){
            this.createHybridFunction(node ,projectUid , status);
        } else if (node.type === 'PARENT_LAMBDA'){
            this.createLambdaFunction(node ,projectUid , status);
        } else if (node.type === 'PARENT_TASK'){
            this.createTask(node ,projectUid , status);
        }
    }

    editPopups(item, projectUid, status) {
        if (item.type === 'API') {
           this.createApi(item, projectUid , status);
        } else if (item.type === 'WORKFLOW') {
            this.createSubrule(item, projectUid , status);
        } else if (item.type === 'MODEL'){
            this.createModel(item, projectUid , status);
        } else if (item.type === 'EVENT'){
            this.createEvent(item, projectUid , status);
        } else if (item.type === 'HYBRID'){
            this.createHybridFunction(item, projectUid , status);
        } else if (item.type === 'LAMBDA'){
            this.createLambdaFunction(item, projectUid , status);
        } else if (item.type === 'TASK'){
            this.createTask(item,projectUid , status);
        }
    }

    createApi(item, projectUId , status) {
        const dialogRef = this.dialog.open(CreateApiComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUId,
                createStatus: status,
                uuid: item.uuid,
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }

    createSubrule(item, projectUId , status) {
        const dialogRef = this.dialog.open(CreateSubruleComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUId,
                createStatus: status,
                uuid: item.uuid,
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }

    createModel(item, projectUId , status) {
        const dialogRef = this.dialog.open(CreateModelComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUId,
                createStatus: status,
                uuid: item.uuid,
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }

    createEvent(item, projectUId , status) {
        const dialogRef = this.dialog.open(CreateEventComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUId,
                createStatus: status,
                uuid: item.uuid,
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }

    createHybridFunction(item, projectUId , status) {
        const dialogRef = this.dialog.open(CreateHybridfunctionComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUId,
                createStatus: status,
                uuid: item.uuid,
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }

    createLambdaFunction(item, projectUId , status) {
        const dialogRef = this.dialog.open(CreateLamdafunctionComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUId,
                createStatus: status,
                uuid: item.uuid,
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }

    createTask(item, projectUId , status) {
        const dialogRef = this.dialog.open(CreateTaskComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUId,
                createStatus: status,
                uuid: item.uuid,
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }

}
