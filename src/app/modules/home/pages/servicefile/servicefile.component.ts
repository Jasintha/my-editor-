import { Component, OnInit, Inject } from '@angular/core';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {IProject} from '@shared/models/model/project.model';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ServiceFileService} from '@core/projectservices/servicefile.service';
import {EventManagerService} from '@shared/events/event.type';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {IApi} from '@shared/models/model/microservice-api.model';
import {NgxSpinnerService} from 'ngx-spinner';
import { UIBService } from '@app/core/projectservices/uib.service';
import { UibInternalService } from '../uib/uib-internal-service';

@Component({
  selector: 'virtuan-servicefile',
  templateUrl: './servicefile.component.html',
  styleUrls: ['./servicefile.component.scss']
})
export class ServicefileComponent implements OnInit {
  title: string
  isSaving: boolean;
  project: IProject;
  editForm: FormGroup;
  projectUid: string;
  currentFile: any;
  projectType: string;

  buildServiceFileForm() {
    this.editForm = this.fb.group({
      id: [],
      name: ['', [Validators.required]]
    });
  }
  constructor(
      protected serviceFileService: ServiceFileService,
      protected activatedRoute: ActivatedRoute,
      private fb: FormBuilder,
      protected eventManager: EventManagerService,
      public dialogRef: MatDialogRef<ServicefileComponent>,
      @Inject(MAT_DIALOG_DATA)  public data: any,
      private spinnerService: NgxSpinnerService,
      private uibService: UIBService,
      private uibInternalService: UibInternalService
  ) { }

  ngOnInit(): void {
    this.spinnerService.hide();
    this.getServiceFileData();
  }
  
  getServiceFileData() {
    this.projectUid = this.data.projectUid;
    this.projectType = this.data.type;
    this.title = this.data.title
    this.buildServiceFileForm();
    this.isSaving = false;
    if (this.data.createStatus === 'Update') {
      this.loadUpdateForm();
    }
  }


  loadUpdateForm() {
    this.serviceFileService
        .find(this.data.uuid ,this.projectUid)
        .pipe(
            filter((mayBeOk: HttpResponse<any>) => mayBeOk.ok),
            map((response: HttpResponse<any>) => response.body)
        )
        .subscribe(
            (res: any) => {
              this.currentFile = res;
              this.updateForm(res);
            }
        );
  }

  updateForm(serFile: any) {
    this.editForm.patchValue({
      id: serFile.uuid,
      name: serFile.name
    });
  }

  save() {
    this.spinnerService.show();
    this.isSaving = true;

    const serviceFile = this.createFromForm();
    if (serviceFile.uuid) {
      serviceFile.status = this.currentFile.status;
      // this.subscribeToSaveResponse(this.serviceFileService.update(serviceFile, this.projectUid));
      this.subscribeToSaveResponse(this.uibService.createUIBFlowProject(serviceFile, this.projectUid))
    } else {
     // this.subscribeToSaveResponse(this.serviceFileService.create(serviceFile, this.projectUid));
     if(this.projectType === 'PARENT_PROCESS'){
      this.subscribeToSaveResponse(this.uibService.createUIBFlowProject(serviceFile, this.projectUid))
     } else if(this.projectType === 'PARENT_LAMBDA'){
      this.subscribeToSaveResponse(this.uibService.createUIBLambdaProject(serviceFile, this.projectUid))
     } else if(this.projectType === 'PARENT_MODEL'){
      this.subscribeToSaveResponse(this.uibService.createUIBModelProject(serviceFile, this.projectUid))
     }
    }
  }

  private createFromForm(): any {
    if(this.projectType === 'PARENT_PROCESS'){
    return {
      uuid: this.editForm.get(['id']).value,
      name: this.editForm.get(['name']).value,
      projectUuid: this.projectUid,
      params: [],
      returnRecordType: 's',
      returnObj: {
        id: '',
        paramType: "RETURN",
        inputType: "TEXT",
        inputName: "_s"
      }
    };
  } else if(this.projectType === 'PARENT_LAMBDA'){
    return {
      uuid: this.editForm.get(['id']).value,
      name: this.editForm.get(['name']).value,
      projectUuid: this.projectUid,
      language: "javascript",
      params: [],
      returnRecordType: 's',
      returnObj: {
        id: '',
        paramType: "RETURN",
        inputType: "TEXT",
        inputName: "_s"
      }
    };
  }  else if(this.projectType === 'PARENT_MODEL'){
    return {
      uuid: this.editForm.get(['id']).value,
      name: this.editForm.get(['name']).value,
      projectUuid: this.projectUid,
      description: null,
      template: null,
      type: 'DTO',
      isComplexObj: false
    };
  }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<any>>) {
    result.subscribe(
        () => this.onSaveSuccess(),
        () => this.onSaveError()
    );
  }

  protected onSaveSuccess() {
    this.uibInternalService.setAction('update')
    this.spinnerService.hide();
    this.isSaving = false;
    this.eventManager.dispatch(
        new AppEvent(EventTypes.editorTreeListModification, {
          name: 'editorTreeListModification',
          content: 'Add an ServiceFile',
        })
    );
    this.dialogRef.close();
    // this.previousState();
  }

  protected onSaveError() {
    this.spinnerService.hide();
    this.isSaving = false;
  }
  protected onError(errorMessage: string) {
    // this.logger.error(errorMessage);
  }

}
