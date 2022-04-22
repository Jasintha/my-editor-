import { Injectable } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {LamdafunctionDeleteDialogComponent} from '@home/pages/create-lamdafunction/function-delete-dialog.component';

@Injectable({ providedIn: 'root' })
export class DeleteOperationService {

  public constructor(public dialog: MatDialog) {}
  
    delete(item, projectUid) {
        if (item.type === 'API') {
//             this.deleteApi();
        } else if (item.type === 'PROCESS') {
//             this.deleteSubrule();
        } else if (item.type === 'MODEL'){
//             this.deleteModel();
        } else if (item.type === 'EVENT'){
//             this.deleteEvent();
        } else if (item.type === 'HYBRID'){
//             this.deleteHybridFunction();
        } else if (item.type === 'LAMBDA'){
            this.deleteLambdaFunction(item, projectUid);
        } else if (item.type === 'TASK'){
//             this.deleteTask();
        }
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

}
