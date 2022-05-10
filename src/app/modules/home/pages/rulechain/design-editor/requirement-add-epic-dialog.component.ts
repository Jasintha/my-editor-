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
  selector: 'requirement-add-epic-dialog',
  templateUrl: './requirement-add-epic-dialog.component.html',
  styleUrls: ['./design-editor.component.scss']
})
export class RequirementAddEpicDialogComponent implements OnInit {

  isSaving: boolean;
  projectUid: string;
  requuid: string;
  reqdesc: string;
  existingEpics: any[];
  editForm: FormGroup;
  disable = true;

  buildEventForm() {
    this.editForm = this.fb.group({
        epicCreateType: ['new', [Validators.required]],
        name: ['', [Validators.required]],
        description: '',
        reqdescription: '',
        epicselection: null,
        referencename: ''
    });
  }

  constructor(
      private requirementService: RequirementService,
      private fb: FormBuilder,
      public dialogRef: MatDialogRef<RequirementAddEpicDialogComponent>,
      @Inject(MAT_DIALOG_DATA)  public data: any,
  ) {}

  enableEdit(){
    this.disable = !this.disable;
  }

  setApiCategoryValidators() {
    this.editForm.get(['epicCreateType']).valueChanges.subscribe(type => {
      if (type === 'existing') {
        this.editForm.get('name').clearValidators();
        this.editForm.get('name').updateValueAndValidity();

        this.editForm.get('epicselection').setValidators([Validators.required]);
        this.editForm.get('epicselection').updateValueAndValidity();
      } else if (type === 'new'){
        this.editForm.get('epicselection').clearValidators();
        this.editForm.get('epicselection').updateValueAndValidity();

        this.editForm.get('name').setValidators([Validators.required]);
        this.editForm.get('name').updateValueAndValidity();
      }
    });
  }

  ngOnInit(): void {
    this.buildEventForm();
    this.reqdesc = this.data.reqdesc;
    this.requuid = this.data.requuid;
    this.projectUid = this.data.projectUid;
    this.existingEpics = [];
//     this.epicitems = [];
    this.loadEpics();
    this.isSaving = false;
    this.editForm.patchValue({
      reqdescription: this.reqdesc,
    });
  }

  loadEpics() {
    this.requirementService
      .findEpicsByProjectId(this.projectUid, this.projectUid)
      .pipe(
        filter((res: HttpResponse<any[]>) => res.ok),
        map((res: HttpResponse<any[]>) => res.body)
      )
      .subscribe(
        (res: any[]) => {
          if (res) {
            this.existingEpics = res;
//             for (let i = 0; i < this.existingEpics.length; i++) {
//               let epicitem = { label: this.existingEpics[i].name, value: this.existingEpics[i] };
//               this.epicitems.push(epicitem);
//             }
          } else {
            this.existingEpics = [];
          }
        },
        (res: HttpErrorResponse) => this.onError(res.message)
      );
  }

  save() {
    let epicCreateType = this.editForm.get(['epicCreateType']).value;
    let reqdescription = this.editForm.get(['reqdescription']).value;
    let epicname = '';
    let description = '';
    let epicuuid = '';
    let epicRequirements = [];
    let refname = '';

    if (epicCreateType === 'new') {
      epicname = this.editForm.get(['name']).value;
      refname = this.editForm.get(['referencename']).value;
      description = this.editForm.get(['description']).value;
    } else {
      let epicselection = this.editForm.get(['epicselection']).value;
      if (epicselection) {
        epicname = epicselection.name;
        description = epicselection.description;
        epicuuid = epicselection.uuid;
      }
    }

    epicRequirements.push({ requirementUUID: this.requuid, description: reqdescription });

    let epicReq = {
      requirements: epicRequirements,
      name: epicname,
      projectUuid: this.projectUid,
      epicCreateType: epicCreateType,
      description: description,
      status: 'NEW',
      epicuuid: epicuuid,
      referenceName : refname
    };
    this.requirementService
      .addEpicToReq(epicReq, this.projectUid)
      .pipe(
        filter((res: HttpResponse<any>) => res.ok),
        map((res: HttpResponse<any>) => res.body)
      )
      .subscribe(
            (res: any) => {
                this.dialogRef.close(epicReq);
            },
            (res: HttpErrorResponse) => this.onSaveError()
      );

  }

  handleEpicCreateTypeChange() {
    this.setApiCategoryValidators();
    let epicCreateType = this.editForm.get(['epicCreateType']).value;
    if (epicCreateType === 'new') {
      this.editForm.patchValue({
        epicselection: null,
      });
    }
  }

  protected onSaveError() {
    this.isSaving = false;
  }
  protected onError(errorMessage: string) {
    // this.logger.error(errorMessage);
  }

}
