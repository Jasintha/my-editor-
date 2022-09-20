import {Component, Inject, OnInit} from '@angular/core';
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
interface Item {
  value: any;
  label: string;
}
@Component({
  selector: 'virtuan-create-model',
  templateUrl: './create-model.component.html',
  styleUrls: ['./create-model.component.scss']
})
export class CreateModelComponent implements OnInit {

  isSaving: boolean;
  project: IProject;
  projectUid: string;
  appType: string;
  currentAggregate: IAggregate;
  aggregateModelKey: string[];
  aggregateModelKeyItems: Item[];
  typeSelected: string;

  typeItems: Item[] = [
    { label: 'MODEL', value: 'MODEL' },
    { label: 'DTO', value: 'DTO' },
  ];
  editForm: FormGroup;

  buildAggreForm(type) {
    this.editForm = this.fb.group({
      id: [],
      name: ['', [Validators.required]],
      description: [],
      type: [type, [Validators.required]],
      representation: ['TREE', [Validators.required]],
      template: [],
    });
  }

  setAggreCategoryValidators() {
    if (this.projectUid) {
      this.projectService
          .find(this.projectUid)
          .pipe(
              filter((mayBeOk: HttpResponse<IProject>) => mayBeOk.ok),
              map((response: HttpResponse<IProject>) => response.body)
          )
          .subscribe((res: IProject) => {
            this.project = res;

            if (this.project.apptypesID === 'task.ui' || this.project.apptypesID === 'dashboard') {
              this.editForm.get('type').clearValidators();
              this.editForm.get('type').updateValueAndValidity();
            } else {
              this.editForm.get('type').setValidators([Validators.required]);
              this.editForm.get('type').updateValueAndValidity();
            }

            if (this.data.createStatus === 'Update') {
              this.loadUpdateForm();
            }
          });
    } else {
      if (this.data.createStatus === 'Update') {
        this.loadUpdateForm();
      }
    }
  }

  constructor(
      protected aggregateService: AggregateService,
      protected projectService: ProjectService,
      protected activatedRoute: ActivatedRoute,
      private fb: FormBuilder,
      private router: Router,
      public dialogRef: MatDialogRef<CreateModelComponent>,
      @Inject(MAT_DIALOG_DATA)  public data: any,
      protected eventManager: EventManagerService,
      private spinnerService: NgxSpinnerService,
  ) {
    this.typeSelected = 'square-jelly-box';
  }

  ngOnInit(): void {
    this.spinnerService.hide();
    this.getAggregateData();
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (this.isVisible) {
  //     this.getAggregateData();
  //   }
  // }

  getAggregateData() {
    this.projectUid = this.data.projectUid;
    this.appType = this.data.appType;
    if(this.appType === 'task.ui') {
      this.buildAggreForm('MODEL');
    } else {
      this.buildAggreForm('DTO');
    }
    this.aggregateModelKeyItems = [];
    this.setAggreCategoryValidators();
    this.isSaving = false;

    this.aggregateService
        .findAggregateModelMapKeys(null, this.projectUid)
        .pipe(
            filter((mayBeOk: HttpResponse<string[]>) => mayBeOk.ok),
            map((response: HttpResponse<string[]>) => response.body)
        )
        .subscribe(
            (res: string[]) => {
              this.aggregateModelKey = res;
              this.loadAggregateModelKeys();
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
  }

  loadAggregateModelKeys() {
    for (let i = 0; i < this.aggregateModelKey.length; i++) {
      this.aggregateModelKeyItems.push({ label: this.aggregateModelKey[i], value: this.aggregateModelKey[i] });
    }
  }

  loadUpdateForm() {
    this.aggregateService
        .find(this.data.uuid ,this.projectUid)
        .pipe(
            filter((mayBeOk: HttpResponse<IHybridfunction>) => mayBeOk.ok),
            map((response: HttpResponse<IHybridfunction>) => response.body)
        )
        .subscribe(
            (res: IApi) => {
              this.currentAggregate = res;
              this.updateForm(res);
            }
        );
    // const obj = JSON.parse(this.rowData);
  }

  updateForm(aggregate: IAggregate) {
    let modelType: string = aggregate.type;
    if (aggregate.uuid === null || aggregate.uuid === undefined || aggregate.uuid === '') {
      modelType = 'MODEL';
    }
    this.editForm.patchValue({
      id: aggregate.uuid,
      name: aggregate.name,
      type: modelType,
      description: aggregate.description,
      isComplexObj: aggregate.isComplexObj,
      projectUuid: aggregate.projectUuid,
    });
    if (aggregate.isComplexObj) {
      this.editForm.patchValue({
        representation: 'JSON',
      });
    } else {
      this.editForm.patchValue({
        representation: 'TREE',
      });
    }
  }

  previousState() {
    // this.isVisibleEvent.emit(false);
  }

  save(aggregate: IAggregate) {
    this.isSaving = true;
    this.spinnerService.show();

    if (aggregate.uuid) {
      aggregate.status = this.currentAggregate.status;
      this.subscribeToSaveResponse(this.aggregateService.update(aggregate, this.projectUid));
    } else {
      this.subscribeToSaveResponse(this.aggregateService.create(aggregate, this.projectUid));
    }
    this.editForm.reset();
  }

  private createFromForm(): IAggregate {
    let type = '';
    if (this.project.apptypesID === 'task.ui' || this.project.apptypesID === 'dashboard') {
      type = 'MODEL';
    } else {
      type = this.editForm.get(['type']).value;
    }

    return {
      ...new Aggregate(),
      uuid: this.editForm.get(['id']).value,
      name: this.editForm.get(['name']).value,
      description: this.editForm.get(['description']).value,
      type,
      projectUuid: this.projectUid,
      isComplexObj: this.editForm.get(['representation']).value === 'JSON',
      template: this.editForm.get(['template']).value,
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IAggregate>>) {
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
    // if (createdAggregate.uuid) {
    //   if (createdAggregate.isComplexObj) {
    //     const url = 'aggregate/proj/' + this.projectUid + '/' + createdAggregate.uuid + '/complex-design-view';
    //     this.router.navigate([url]);
    //   } else {
    //     const url = 'aggregate/proj/' + this.projectUid + '/' + createdAggregate.uuid + '/design-view';
    //     this.router.navigate([url]);
    //   }
    // } else {
    //   this.previousState();
    // }
  }

  protected onSaveError() {
    this.spinnerService.hide();
    this.isSaving = false;
  }
  protected onError(errorMessage: string) {
    // this.logger.error(errorMessage);
  }

  trackProjectById(index: number, item: IProject) {
    return item.projectUuid;
  }

  checkNameAvailability() {
    const aggregate = this.createFromForm();
    if(aggregate.uuid) {
      this.aggregateService
          .findNameAvailability(aggregate.name, this.projectUid, aggregate.uuid)
          .pipe(
              filter((res: HttpResponse<any>) => res.ok),
              map((res: HttpResponse<any>) => res.body)
          )
          .subscribe(
              (res: any) => {
                if (res.IsNameExist) {
                } else {
                  this.save(aggregate);
                }
              },
              (res: HttpErrorResponse) => this.onError(res.message)
          );
    } else {
      this.aggregateService
          .findNameAvailabilityNew(aggregate.name, this.projectUid)
          .pipe(
              filter((res: HttpResponse<any>) => res.ok),
              map((res: HttpResponse<any>) => res.body)
          )
          .subscribe(
              (res: any) => {
                if (res.IsNameExist) {
                } else {
                  this.save(aggregate);
                }
              },
              (res: HttpErrorResponse) => this.onError(res.message)
          );
    }

  }

}
