import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {IRequirement, Requirement, IEpic, IStory, IStoryUpdateReq} from '@shared/models/model/requirement.model';

import {IProject} from '@shared/models/model/project.model';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EventManagerService} from '@shared/events/event.type';
import { StoryService } from '@core/projectservices/story-technical-view.service';
interface Item {
  value: any;
  label: string;
}
@Component({
  selector: 'virtuan-create-text',
  templateUrl: './create-text.component.html',
  styleUrls: ['./design-editor.component.scss']
})
export class CreateTextComponent implements OnInit {

  isSaving: boolean;
  project: IProject;
  editForm: FormGroup;
  projectUid: string;
  epic: any;
  currentStory: any;
  existingTemplates: any;
  stories: any[];
  selectedLabel = '';

  buildEventForm() {
    this.editForm = this.fb.group({
      id: [],
      description:  ['', [Validators.required]]
    });
  }


  constructor(
    private storyService: StoryService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    protected eventManager: EventManagerService,
      public dialogRef: MatDialogRef<CreateTextComponent>,
      @Inject(MAT_DIALOG_DATA)  public data: any,
  ) {}


  ngOnInit(): void {
    this.epic = this.data.epic
    this.getStoryData();
  }

  storyTemplates(){
    this.stories = [];
    this.stories.push('custom');
    this.stories.push('login');
    this.stories.push('email');
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
      this.updateForm(this.data.story);
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
      // name: req.name,
      description: req.storyText
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
      // req.status = this.currentStory.status;
      this.subscribeToSaveResponse(this.storyService.storyTextUpdateReq(req, this.projectUid));
    } else {
      this.subscribeToSaveResponse(this.storyService.storyTextUpdateReq(req, this.projectUid));
    }
  }

  private createFromForm(): IStoryUpdateReq {
    let uuid = '';
    if (this.data.createStatus === 'Update'){
      uuid = this.data.story.uuid;
    }else {
      uuid = this.data.uuid
    }
    return {
      uuid,
      storyText: this.editForm.get(['description']).value,
      projectUuid: this.projectUid
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
    this.dialogRef.close(true);
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

}
