import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Aggregate, IAggregate} from '@shared/models/model/aggregate.model';
import {IProject} from '@shared/models/model/project.model';
import {ActivatedRoute, Router} from '@angular/router';
import {ProjectService} from '@core/projectservices/project.service';
import {AggregateService} from '@core/projectservices/microservice-aggregate.service';
import {filter, map} from 'rxjs/operators';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {EventManagerService} from '@shared/events/event.type';
import {IHybridfunction} from '@shared/models/model/hybridfunction.model';
import {IApi} from '@shared/models/model/microservice-api.model';
import {NgxSpinnerService} from 'ngx-spinner';
import { FileUpload } from 'primeng/fileupload';

interface Item {
  value: any;
  label: string;
}
@Component({
  selector: 'virtuan-import-model',
  templateUrl: './import-model.component.html',
  styleUrls: ['./create-model.component.scss']
})
export class ImportModelComponent implements OnInit {

  isSaving: boolean;
  project: IProject;
  projectUid: string;
  appType: string;

  @ViewChild('fileInput')
  fileInput: FileUpload;

  typeItems: Item[] = [
    { label: 'MODEL', value: 'MODEL' },
    { label: 'DTO', value: 'DTO' },
  ];
  editForm: FormGroup;

  buildAggreForm(type) {
    this.editForm = this.fb.group({
    type: "MODEL",
    isCreateDefaultFields: false,
    });
  }

  constructor(
      protected aggregateService: AggregateService,
      protected projectService: ProjectService,
      protected activatedRoute: ActivatedRoute,
      private fb: FormBuilder,
      private router: Router,
      public dialogRef: MatDialogRef<ImportModelComponent>,
      @Inject(MAT_DIALOG_DATA)  public data: any,
      protected eventManager: EventManagerService,
      private spinnerService: NgxSpinnerService,
  ) {
  }

  ngOnInit(): void {
    this.spinnerService.hide();
    this.buildAggreForm('MODEL');
  }

  previousState() {
    // this.isVisibleEvent.emit(false);
  }


  save() {
    this.isSaving = true;
    const formData = new FormData();
    this.fileInput.files.forEach(file => {
      formData.append('file', file);
    });

    let isCreateDefaultFields = this.editForm.get(['isCreateDefaultFields']).value;

    if (isCreateDefaultFields) {
      isCreateDefaultFields = true;
    } else {
      isCreateDefaultFields = false;
    }

    let modelData: string = '';
//     if (this.apptype === 'task.ui' || this.apptype === 'dashboard') {
//       modelData = 'MODEL';
//     } else {
      modelData = this.editForm.get(['type']).value;
//     }
    let type = { type: modelData, isCreateDefaultFields: isCreateDefaultFields };

    formData.append(
      'modeldata',
      new Blob([JSON.stringify(type)], {
        type: 'application/json',
      })
    );

    this.subscribeToSaveResponse(this.aggregateService.uploadDomainModelsFile(formData, this.projectUid));
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<any>>) {
    result.subscribe(
        res => this.onSaveSuccess(res),
        () => this.onSaveError()
    );
  }

  protected onSaveSuccess(res) {
    this.spinnerService.hide();
    const createdAggregate: IAggregate = res.body;
    this.isSaving = false;
    this.eventManager.dispatch(
        new AppEvent(EventTypes.editorTreeListModification, {
          name: 'editorTreeListModification',
          content: 'Add an Model',
        })
    );
    this.eventManager.dispatch(
        new AppEvent(EventTypes.editorUITreeListModification, {
          name: 'editorUITreeListModification',
          content: 'Add an Model',
        })
    );
    this.dialogRef.close();
  }

  protected onSaveError() {
    this.spinnerService.hide();
    this.isSaving = false;
  }
  protected onError(errorMessage: string) {
    // this.logger.error(errorMessage);
  }

}
