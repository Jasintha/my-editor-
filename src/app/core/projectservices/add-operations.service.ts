import { Injectable } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {CreateApiComponent} from '@home/pages/create-api/create-api.component';
import {CreateSubruleComponent} from '@home/pages/create-subrule/create-subrule.component';
import {CreateModelComponent} from '@home/pages/create-model/create-model.component';
import {CreateEventComponent} from '@home/pages/create-event/create-event.component';
import {CreateHybridfunctionComponent} from '@home/pages/create-hybridfunction/create-hybridfunction.component';
import {CreateLamdafunctionComponent} from '@home/pages/create-lamdafunction/create-lamdafunction.component';
import {CreateTaskComponent} from '@home/pages/create-task/create-task.component';
import {CreateServiceComponent} from '@home/pages/create-service/create-service.component';
import {CreateRequirementComponent} from '@home/pages/rulechain/design-editor/create-requirement.component';
import {InitPageCreationComponent} from '@home/pages/built-in-page/init-page-creation.component';
import {MainMenuComponent} from '@home/pages/main-menu/main-menu.component';
import {PageNavigationComponent} from '@home/pages/page-navigation/page-navigation.component';
import {ServicefileComponent} from '@home/pages/servicefile/servicefile.component';
import {SubMenuComponent} from '@home/pages/sub-menu/sub-menu.component';

@Injectable({ providedIn: 'root' })
export class AddOperationService {

    public constructor(public dialog: MatDialog) {}

    createPopups(node , projectUid, status) {
        if (node.type === 'PARENT_API') {
            this.createApi(node ,projectUid , status);
        } else if (node.type === 'PARENT_PROCESS') {
            this.createSubrule(node ,projectUid , status);
        } else if (node.type === 'PARENT_MODEL'){
            this.createModel(node ,projectUid , status, 'microservice');
        } else if (node.type === 'PARENT_EVENT'){
            this.createEvent(node ,projectUid , status);
        } else if (node.type === 'PARENT_HYBRID'){
            this.createHybridFunction(node ,projectUid , status);
        } else if (node.type === 'PARENT_LAMBDA'){
            this.createLambdaFunction(node ,projectUid , status);
        } else if (node.type === 'PARENT_TASK'){
            this.createTask(node ,projectUid , status);
        } else if (node === 'PARENT_SERVICE'){
            this.createService(node ,projectUid , status);
        } else if (node.type === 'PARENT_REQUIREMENT'){
            this.createRequirement(node ,projectUid , status);
        } else if (node.type === 'PARENT_UI_PAGES'){
            this.createUIPages(node ,projectUid , status);
        }  else if (node.type === 'PARENT_UI_MAIN_MENU'){
            this.createMainMenu(node ,projectUid , status);
        } else if (node.type === 'PARENT_UI_SUB_MENU'){
            this.addASubMenu(node ,projectUid , status);
        } else if (node.type === 'PARENT_UI_MODEL'){
            this.createModel(node ,projectUid , status, 'task.ui');
        } else if (node.type === 'PARENT_PAGE_NAVIGATIONS'){
            this.createNavigation(node ,projectUid , status);
        } else if (node.type === 'PARENT_SERVICEFILE'){
            this.createServiceFile(node ,projectUid , status);
        } else if (node.type === 'UIB'){
            this.createServiceFile(node ,projectUid , status);
        }
    }

    editPopups(item, projectUid, status) {
        if (item.type === 'API') {
           this.createApi(item, projectUid , status);
        } else if (item.type === 'WORKFLOW') {
            this.createSubrule(item, projectUid , status);
        } else if (item.type === 'MODEL'){
            this.createModel(item, projectUid , status, 'microservice');
        } else if (item.type === 'EVENT'){
            this.createEvent(item, projectUid , status);
        } else if (item.type === 'HYBRID'){
            this.createHybridFunction(item, projectUid , status);
        } else if (item.type === 'LAMBDA'){
            this.createLambdaFunction(item, projectUid , status);
        } else if (item.type === 'TASK'){
            this.createTask(item,projectUid , status);
        } else if (item.type === 'UI_NAVIGATION'){
            this.createNavigation(item,projectUid , status);
        } else if (item.type === 'UI_MAIN_MENU'){
            this.createMainMenu(item,projectUid , status);
        } else if (item.type === 'UI_SUB_MENU'){
            this.addASubMenu(item,projectUid , status);
        } else if (item.type === 'UIB'){
            this.createServiceFile(item ,projectUid , status);
        }
    }

    createService(item, projectUId , status) {
        const dialogRef = this.dialog.open(CreateServiceComponent, {
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

    createNavigation(item, projectUId , status) {
        const dialogRef = this.dialog.open(PageNavigationComponent, {
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

    createMainMenu(item, projectUId , status) {
        const dialogRef = this.dialog.open(MainMenuComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUId,
                createStatus: status,
                uuid: item.uuid,
                formTree: true
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }

    addASubMenu(item, projectUId , status) {
        const dialogRef = this.dialog.open(SubMenuComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUId,
                createStatus: status,
                mainMenuId: item.isParent === false ? item.parentUUID : item.uuid,
                uuid: item.isParent === false ? item.uuid : null,
                formTree: true
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }


    createUIPages(item, projectUId , status) {
        const dialogRef = this.dialog.open(InitPageCreationComponent, {
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

    createRequirement(item, projectUId , status) {
        const dialogRef = this.dialog.open(CreateRequirementComponent, {
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

    createModel(item, projectUId , status, appType) {
        const dialogRef = this.dialog.open(CreateModelComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: projectUId,
                createStatus: status,
                uuid: item.uuid,
                appType
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

    createServiceFile(item, projectUId , status) {
        const dialogRef = this.dialog.open(ServicefileComponent, {
            width: '800px',
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                title: item.type === 'UIB'? `${status} New File` : `${status} Service File`,
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
