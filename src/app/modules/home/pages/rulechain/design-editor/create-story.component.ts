import {Component, Inject, OnInit} from '@angular/core';
import {AggregateService} from '@core/projectservices/microservice-aggregate.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import { IRequirement, Requirement, IEpic, IStory } from '@shared/models/model/requirement.model';
import {StoryService} from '@core/projectservices/story-technical-view.service';

import {IProject} from '@shared/models/model/project.model';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EventManagerService} from '@shared/events/event.type';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {IApi} from '@shared/models/model/microservice-api.model';
import {SelectItem} from 'primeng/api';

interface Item {
  value: any;
  label: string;
}
@Component({
  selector: 'virtuan-create-story',
  templateUrl: './create-story.component.html',
  styleUrls: ['./design-editor.component.scss']
})
export class CreateStoryComponent implements OnInit {

  isSaving: boolean;
  project: IProject;
  editForm: FormGroup;
  projectUid: string;
  epic: any;
  currentStory: any;
  existingTemplates: any;
  stories: SelectItem[];
  selectedLabel = '';
  descriptions: string;
  existingStory: IStory;
  selectedTemp :string;
 selectedStoryCategory = 'custom'
  buildEventForm() {
    this.editForm = this.fb.group({
      id: [],
      name: ['', [Validators.required]],
      description:  '',
      storyTemplate: [''],
    });
  }

  constructor(
      private storyService: StoryService,
      protected activatedRoute: ActivatedRoute,
      private fb: FormBuilder,
      protected eventManager: EventManagerService,
      public dialogRef: MatDialogRef<CreateStoryComponent>,
      @Inject(MAT_DIALOG_DATA)  public data: any,
  ) {}

  ngOnInit(): void {
    this.existingStory = this.data.story;
    this.getStoryData();
    this.epic = this.data.epic;
    this.descriptions = this.epic.requirements[0].description;
    if (this.data.createStatus !== 'Update'){
      this.selectedTemp = 'custom'
      this.selectedStoryCategory = 'custom'
      this.editForm.patchValue({
        description:  this.descriptions,
      })
    }
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (this.isVisible) {
  //     this.getEventData();
  //   }
  // }
  changeStory(storyCategory) {
    this.selectedStoryCategory = storyCategory;
  }
  changeSelectedTemp(selectedTemp) {
        this.selectedTemp = selectedTemp;
    }

  storyTemplates(){
    this.stories = [
      {label: 'Custom', value: 'custom'},
      {label: 'Login', value: 'login'},
      {label: 'Email', value: 'email'},
    ];
    // this.stories.push('custom');
    // this.stories.push('login');
    // this.stories.push('email');
  }

  getStoryData() {
    this.projectUid = this.data.projectUid;
    this.epic = this.data.epic;
    this.buildEventForm();
    // this.setEventCategoryValidators();
    this.isSaving = false;
    this.storyTemplates();


      if (this.data.createStatus === 'Update') {
        // this.loadUpdateForm();
        this.updateForm(this.existingStory);
      }

  }

  loadUpdateForm() {
    this.storyService
        .find(this.data.uuid ,this.projectUid)
        .pipe(
            filter((mayBeOk: HttpResponse<any>) => mayBeOk.ok),
            map((response: HttpResponse<any>) => response.body)
        )
        .subscribe(
            (res: IStory) => {
              this.currentStory = res;
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
      description: req.description,
      storyTemplate: req.storyTemplate
    });
    this.selectedTemp = req.storyTemplate;
  }

  previousState() {
    // this.isVisibleEvent.emit(false);
  }

  save() {
    // this.spinnerService.show();
    this.isSaving = true;

    const req = this.createFromForm();
    if (req.uuid) {
      // req.status = this.currentStory.status;
      this.subscribeToSaveResponse(this.storyService.update(req, this.projectUid));
    } else {
      this.subscribeToSaveResponse(this.storyService.create(req, this.projectUid));
    }
  }

  private createFromForm(): any {
      return {
        uuid: this.editForm.get(['id']).value,
        name: this.editForm.get(['name']).value,
        description: this.editForm.get(['description']).value,
        projectUuid: this.projectUid,
        serviceUUID: this.epic.serviceUUID,
        serviceMasterUUID:  this.epic.serviceMasterUUID,
        epicUUID:  this.epic.uuid,
        storyTemplate: this.editForm.get(['storyTemplate']).value,
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
//     this.eventManager.dispatch(
//         new AppEvent(EventTypes.editorTreeListModification, {
//           name: 'editorTreeListModification',
//           content: 'Add an Event',
//         })
//     );
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

  createStory(val){
    this.selectedLabel = val
    if (this.selectedLabel !== 'custom'){
      this.save();
    }
  }

  changeEvent(val){
    this.selectedTemp = val;
  }

}
