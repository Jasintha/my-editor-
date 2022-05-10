import {Component, Inject, OnInit} from '@angular/core';
import {IProject} from '@shared/models/model/project.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {StoryService} from '@core/projectservices/story-technical-view.service';
import {ActivatedRoute} from '@angular/router';
import {EventManagerService} from '@shared/events/event.type';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {filter, map} from 'rxjs/operators';
import {HttpResponse} from '@angular/common/http';
import {IRequirement} from '@shared/models/model/requirement.model';
import {Observable} from 'rxjs';

@Component({
  selector: 'virtuan-edit-story',
  templateUrl: './edit-epic.component.html',
  styleUrls: ['./edit-epic.component.scss']
})
export class EditEpicComponent implements OnInit {

  constructor(
  ) {}


  ngOnInit(): void {
  }

}
