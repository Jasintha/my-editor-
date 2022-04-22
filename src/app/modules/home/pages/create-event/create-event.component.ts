import {Component, Inject, OnInit} from '@angular/core';
import {AggregateService} from '@core/projectservices/microservice-aggregate.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {IAggregate} from '@shared/models/model/aggregate.model';
import {Event, IEvent} from '@shared/models/model/microservice-event.model';
import {IProject} from '@shared/models/model/project.model';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EventService} from '@core/projectservices/microservice-event.service';
import {EventManagerService} from '@shared/events/event.type';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
interface Item {
  value: any;
  label: string;
}
@Component({
  selector: 'virtuan-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss']
})
export class CreateEventComponent implements OnInit {

  isSaving: boolean;
  project: IProject;
  currentEvent: IEvent;
  aggregates: IAggregate[];
  aggregateItems: Item[];
  typeItems: Item[] = [
    { label: 'Domain', value: 'DOMAIN' },
    { label: 'Integration', value: 'INTEGRATION' },
  ];
  editForm: FormGroup;
  projectUid: string;

  buildEventForm() {
    this.editForm = this.fb.group({
      id: [],
      type: ['', [Validators.required]],
      isSyncOrAsync: [],
      selectedAggregate: ['', [Validators.required]],
      name: ['', [Validators.required]],
      description: [],
    });
  }

  setEventCategoryValidators() {
    this.editForm.get('type').valueChanges.subscribe(type => {
      if (type === 'DOMAIN') {
        this.editForm.get('isSyncOrAsync').setValidators([Validators.required]);
        this.editForm.get('isSyncOrAsync').updateValueAndValidity();
      } else {
        this.editForm.get('isSyncOrAsync').clearValidators();
        this.editForm.get('isSyncOrAsync').updateValueAndValidity();
      }
    });
  }

  constructor(
      protected eventService: EventService,
      protected aggregateService: AggregateService,
      protected activatedRoute: ActivatedRoute,
      private fb: FormBuilder,
      protected eventManager: EventManagerService,
      public dialogRef: MatDialogRef<CreateEventComponent>,
      @Inject(MAT_DIALOG_DATA)  public data: any,
  ) {}


  ngOnInit(): void {
    this.getEventData();
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (this.isVisible) {
  //     this.getEventData();
  //   }
  // }

  getEventData() {
    this.projectUid = this.data.projectUid;
    this.buildEventForm();
    // this.setEventCategoryValidators();
    this.isSaving = false;
    this.aggregateItems = [];

    // this.toolbarTrackerService.setProjectUUID(this.projectUid);
    if (this.projectUid) {
      this.aggregateService
          .findByProjectUUId(this.projectUid, this.projectUid)
          .pipe(
              filter((mayBeOk: HttpResponse<IAggregate[]>) => mayBeOk.ok),
              map((response: HttpResponse<IAggregate[]>) => response.body)
          )
          .subscribe(
              (res: IAggregate[]) => {
                this.aggregates = this.filterModels(res);
                this.loadAggregates();
                // if (this.createStatus == 'update') {
                //   this.loadUpdateForm();
                // }
              },
              (res: HttpErrorResponse) => this.onError(res.message)
          );
    } else {
      // if (this.createStatus == 'update') {
      //   this.loadUpdateForm();
      // }
    }
  }

  // loadUpdateForm() {
  //   const obj = JSON.parse(this.rowData);
  //   this.currentEvent = obj;
  //   this.updateForm(obj);
  // }

  filterModels(aggregateList: any) {
    const entArr = [];
    if (aggregateList) {
      for (let i = 0; i < aggregateList.length; i++) {
        if (aggregateList[i].type !== 'ENTITY' && aggregateList[i].type !== 'PROPERTY-GROUP') {
          entArr.push(aggregateList[i]);
        }
      }
    }
    return entArr;
  }

  loadAggregates() {
    if (this.aggregates) {
      for (let i = 0; i < this.aggregates.length; i++) {
        if (this.aggregates[i].status === 'ENABLED') {
          const dropdownLabel = this.aggregates[i].name + ' - ' + this.aggregates[i].type;
          this.aggregateItems.push({ label: dropdownLabel, value: this.aggregates[i] });
        }
      }
    }
  }

  updateForm(event: IEvent) {
    let aggregate: IAggregate;
    if (event.aggregate) {
      aggregate = this.aggregates.find(item => item.uuid === event.aggregate.uuid);
    } else {
      aggregate = event.aggregate;
    }
    let isSyncOrAsync = event.isSyncOrAsync;
    if (event.uuid === null || event.uuid === undefined || event.uuid === '') {
      isSyncOrAsync = 'synchronous';
    }

    this.editForm.patchValue({
      id: event.uuid,
      selectedAggregate: aggregate,
      type: event.type,
      name: event.name,
      description: event.description,
      isSyncOrAsync,
    });
  }

  previousState() {
    // this.isVisibleEvent.emit(false);
  }

  save() {
    // this.spinnerService.show();
    this.isSaving = true;

    const event = this.createFromForm();
    if (event.type === 'INTEGRATION') {
      event.isSyncOrAsync = 'asynchronous';
    }
    if (event.uuid) {
      event.status = this.currentEvent.status;
      this.subscribeToSaveResponse(this.eventService.update(event, this.projectUid));
    } else {
      this.subscribeToSaveResponse(this.eventService.create(event, this.projectUid));
    }
  }

  private createFromForm(): IEvent {
    return {
      ...new Event(),
      uuid: this.editForm.get(['id']).value,
      type: this.editForm.get(['type']).value,
      aggregate: this.editForm.get(['selectedAggregate']).value,
      name: this.editForm.get(['name']).value,
      isSyncOrAsync: this.editForm.get(['isSyncOrAsync']).value,
      description: this.editForm.get(['description']).value,
      projectUuid: this.projectUid,
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IEvent>>) {
    result.subscribe(
        () => this.onSaveSuccess(),
        () => this.onSaveError()
    );
  }

  protected onSaveSuccess() {
    // this.spinnerService.hide();
    this.isSaving = false;
    this.eventManager.dispatch(
        new AppEvent(EventTypes.editorTreeListModification, {
          name: 'editorTreeListModification',
          content: 'Add an Event',
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

  trackProjectById(index: number, item: IProject) {
    return item.projectUuid;
  }
}
