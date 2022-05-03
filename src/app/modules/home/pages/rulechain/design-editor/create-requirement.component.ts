import {Component, Inject, OnInit} from '@angular/core';
import {AggregateService} from '@core/projectservices/microservice-aggregate.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import { IRequirement, Requirement, IEpic, IStory } from '@shared/models/model/requirement.model';
import {RequirementService} from '@core/projectservices/requirement.service';

import {IProject} from '@shared/models/model/project.model';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EventManagerService} from '@shared/events/event.type';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {IApi} from '@shared/models/model/microservice-api.model';
interface Item {
  value: any;
  label: string;
}
@Component({
  selector: 'virtuan-create-requirement',
  templateUrl: './create-requirement.component.html',
  styleUrls: ['./design-editor.component.scss']
})
export class CreateRequirementComponent implements OnInit {

  isSaving: boolean;
  project: IProject;
  editForm: FormGroup;
  projectUid: string;
  currentReq : IRequirement;

  buildEventForm() {
    this.editForm = this.fb.group({
      id: [],
      name: ['', [Validators.required]],
      description:  ['', [Validators.required]]
    });
  }


  constructor(
      private requirementService: RequirementService,
      protected activatedRoute: ActivatedRoute,
      private fb: FormBuilder,
      protected eventManager: EventManagerService,
      public dialogRef: MatDialogRef<CreateRequirementComponent>,
      @Inject(MAT_DIALOG_DATA)  public data: any,
  ) {}


  ngOnInit(): void {
    this.getReqData();
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (this.isVisible) {
  //     this.getEventData();
  //   }
  // }

  getReqData() {
    this.projectUid = this.data.projectUid;
    this.buildEventForm();
    // this.setEventCategoryValidators();
    this.isSaving = false;


      if (this.data.createStatus === 'Update') {
        this.loadUpdateForm();
      }

  }

  loadUpdateForm() {
    this.requirementService
        .find(this.data.uuid ,this.projectUid)
        .pipe(
            filter((mayBeOk: HttpResponse<IRequirement>) => mayBeOk.ok),
            map((response: HttpResponse<IRequirement>) => response.body)
        )
        .subscribe(
            (res: IRequirement) => {
              this.currentReq = res;
              this.updateForm(res);
            }
        );
    // const obj = JSON.parse(this.rowData);
    // this.currentEvent = obj;
  }

  updateForm(req: any) {

    this.editForm.patchValue({
      id: req.uuid,
      name: req.name,
      description: req.description
    });
  }

  previousState() {
    // this.isVisibleEvent.emit(false);
  }

  save() {
    // this.spinnerService.show();
    this.isSaving = true;

    const req = this.createFromForm();
    if (req.uuid) {
      req.status = this.currentReq.status;
      this.subscribeToSaveResponse(this.requirementService.update(req, this.projectUid));
    } else {
      this.subscribeToSaveResponse(this.requirementService.create(req, this.projectUid));
    }
  }

  private createFromForm(): IRequirement {
    return {
      ...new Requirement(),
      uuid: this.editForm.get(['id']).value,
      name: this.editForm.get(['name']).value,
      description: this.editForm.get(['description']).value,
      projectUuid: this.projectUid,
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IRequirement>>) {
    result.subscribe(
        () => this.onSaveSuccess(),
        () => this.onSaveError()
    );
  }

  protected onSaveSuccess() {
    // this.spinnerService.hide();
    this.isSaving = false;
    this.eventManager.dispatch(
        new AppEvent(EventTypes.editorDesignTreeListModification, {
          name: 'editorDesignTreeListModification',
          content: 'Add an requirement',
        })
    );
    this.dialogRef.close();
    // this.previousState();
  }

  protected onSaveError() {
    // this.spinnerService.hide();
    this.isSaving = false;
  }
  protected onError(errorMessage: string) {
    // this.logger.error(errorMessage);
  }

}
