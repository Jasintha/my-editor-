import {Component, Inject, Input, OnChanges, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MessageService, SelectItem } from 'primeng/api';
import {IKeyData} from '@shared/models/model/keydata.model';
import {IFormField, ISourceTargetFieldsRequest} from '@shared/models/model/form-field.model';
import {IDatamodel} from '@shared/models/model/datamodel.model';
import {IProject} from '@shared/models/model/project.model';
import {Config} from '@shared/models/model/page-config.model';
import {EventManagerService} from '@shared/events/event.type';
import {BuiltInPageService} from '@core/projectservices/built-in-page.service';
import {ProjectService} from '@core/projectservices/project.service';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {filter, map} from 'rxjs/operators';
import {IPageApi} from '@home/pages/built-in-page/init-page-creation.component';
import {Observable} from 'rxjs';
import {FormControllers, IFormControllers} from '@shared/models/model/form-controllers.model';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {BuiltInWidgetService} from '@core/projectservices/built-in-widget.service';
import {MatTableDataSource} from '@angular/material/table';
import {ButtonEventHandleComponent} from '@home/pages/built-in-page/button-event-handle.component';
import {IButtonType} from '@shared/models/model/button-type.model';
import {MatDialog} from '@angular/material/dialog';


interface ControllerItem {
  label?: string;
  type?: string;
  value?: any;
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'add-form-controllers',
  templateUrl: './add-form-controllers.component.html',
  styleUrls: ['./built-in-page.component.scss'],
})
export class AddFormControllersComponent implements OnChanges {

  @Input('pageId') pageId: string;
  @Input('projectUid') projectUid: string;
  @Input('modelPropertyList') modelPropertyList: SelectItem[];
  keyValPairs: IKeyData[];
  isSaving: boolean;
  cols: any[];
  form: FormGroup;
  widgetId: string;
  sourceTargetFieldsRequest: ISourceTargetFieldsRequest;
  datamodel: IDatamodel;
  microserviceProjectItems: SelectItem[];
  microserviceProjects: IProject[];
  apiItems: SelectItem[];
  dropdownMappings = [];
  dataSourceDropdownMapp = new MatTableDataSource(this.dropdownMappings);
  dataSourceDropdownMapping : any [];

  eventactionMappings = [];
  eventActionMappDataSource = new MatTableDataSource(this.eventactionMappings);
  dataSourceEventActionMapping : any [];

  // cars2: Car[];
  clonedCars: { [s: string]: Config } = {};
  isFieldSelected: boolean;
  isChildFieldSelected: boolean;
  selectedFieldIndex: number;
  selectedChildIndex: number;
  choiceindex: number;
  sourceProperties: IFormField[];
  targetProperties: IFormField[];
  controllerTypeItems: ControllerItem[] = [
    { label: 'Textbox', value: 'Textbox' },
    { label: 'Radiobutton', value: 'Radiobutton' },
    { label: 'Checkbox', value: 'Checkbox' },
    { label: 'Dropdown', value: 'Dropdown' },
    { label: 'Label', value: 'Label' },
  ];
  displayedDrpParamColumns: string[] = ['dropdownField', 'attribute', 'actions'];
  choiceType: SelectItem[] = [
    { label: 'API', value: 'API' },
    { label: 'Static', value: 'Static' },
  ];
  displayEventMappingColumns: string[] = ['event', 'target', 'reference', 'actions'];
  componentEventType: SelectItem[] = [
    { label: 'API Call', value: 'API' },
    { label: 'Change Visibility', value: 'VISIBLE' },
  ];

  actionTypes: SelectItem[] = [
    { label: 'Assign', value: 'Assign'},
    { label: 'Visible', value: 'Visible'},
    { label: 'Hide', value: 'Hide'},
  ];

  dropdownFields: SelectItem[] = [
    { label: 'label', value: 'label'},
    { label: 'service_reference', value: 'service_reference'},
    { label: 'external_label', value: 'external_label'},
  ];

  @Input() public envuuid;

  constructor(
      private fb: FormBuilder,
      protected eventManager: EventManagerService,
      protected builtInPageService: BuiltInPageService,
      protected builtInWidgetService: BuiltInWidgetService,
      protected projectService: ProjectService,
      public dialog: MatDialog,
  ) {}

  clear() {
    // this.activeModal.dismiss('cancel');
  }

  ngOnChanges() {
    this.widgetId = '';
    this.isSaving = false;
    this.microserviceProjectItems = [];
    this.microserviceProjects = [];
    this.apiItems = [];
    this.selectedFieldIndex = 0;
    this.dataSourceDropdownMapping = [];
    this.dataSourceEventActionMapping = [];
    this.createForm();
    // if(this.data.widgetUid) {
    //   this.loadAllSourceTargetFormFieldsForWidget(this.data.widgetUid, this.data.projectUid);
    // } else {
    this.loadAllSourceTargetFormFieldsForPage(this.pageId, this.projectUid);
    // }

    this.isSaving = false;
    this.keyValPairs = [];
    this.cols = [
      { field: 'Field', header: 'Field' },
      { field: 'Controller', header: 'Controller' },
    ];
    this.loadMicroserviceProjects();
  }

  deleteParamMapping(param) {
    const indexnum = this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].dropdownMappings.value.indexOf(param);
    const dropdownMap = this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].dropdownMappings.value.splice(indexnum, 1);
    this.dataSourceDropdownMapp = new MatTableDataSource(dropdownMap);
    this.dataSourceDropdownMapping[this.selectedFieldIndex] =  this.dataSourceDropdownMapp;
  }

  deleteEventActionMapping(param) {
    const indexnum = this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].eventActions.value.indexOf(param);
    const eventmap = this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].eventActions.value.splice(indexnum, 1);
    this.eventActionMappDataSource = new MatTableDataSource(eventmap);
    this.dataSourceEventActionMapping[this.selectedFieldIndex] =  this.dataSourceDropdownMapp;
  }


  loadMicroserviceProjects() {
    this.projectService
        .findAllMicroserviceProjects()
        .pipe(
            filter((mayBeOk: HttpResponse<IProject[]>) => mayBeOk.ok),
            map((response: HttpResponse<IProject[]>) => response.body)
        )
        .subscribe(
            (res: IProject[]) => {
              this.microserviceProjects = res;
              this.loadMicroserviceProjectDropdownItems();
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
  }
  onChangeMicroserviceAPIInChild() {
    const microservice = this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].children['controls'][this.selectedChildIndex][
        'controls'
        ].microservice.value;
    const api = this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].children['controls'][this.selectedChildIndex]['controls']
        .api.value;
    const suggestedPath = this.getAPIPath(microservice, api);
    this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].children['controls'][this.selectedChildIndex][
        'controls'
        ].choiceUrl.patchValue(suggestedPath, { emitEvent: true });
  }
  onChangeMicroserviceAPI() {
    const microservice = this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].microservice.value;
    const api = this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].api.value;
    const suggestedPath = this.getAPIPath(microservice, api);
    this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].choiceUrl.patchValue(suggestedPath, { emitEvent: true });
  }

  onChangeMicroserviceAPI2() {
    const microservice = this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].microservice2.value;
    const api = this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].api2.value;
    const suggestedPath = this.getAPIPath(microservice, api);
    this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].url.patchValue(suggestedPath, { emitEvent: true });
  }

  getAPIPath(microservice, api) {
    if (api && api.api) {
      const apiStart: boolean = api.api.resourcePath.startsWith('/');
      let suggestedPath = '';
      if (apiStart) {
        suggestedPath = '/' + microservice.name + '/api' + api.api.resourcePath;
      } else {
        suggestedPath = '/' + microservice.name + '/api/' + api.api.resourcePath;
      }
      return suggestedPath;
    }
  }

  addDrpDownAttriuteMapping() {
    const dropdownField = this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].fieldType.value;
    const attribute = this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].fieldAttribute.value;

    if (dropdownField === null || attribute === '' || attribute === null) {
      // this.messageService.add({
      //   severity: 'warn',
      //   summary: 'Warn',
      //   detail: 'Please fill all the fields',
      // });
    } else {
      const param = {
        dropdownField,
        attribute,
      };
      if ( this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].dropdownMappings.value.indexOf(param) === -1) {
        this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].dropdownMappings.value.push(param);
        this.dataSourceDropdownMapp = new MatTableDataSource(this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].dropdownMappings.value);
        this.dataSourceDropdownMapping[this.selectedFieldIndex] =  this.dataSourceDropdownMapp;
      }
      this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].dropdownMappings.patchValue(this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].dropdownMappings.value,
          { emitEvent: true });
    }
  }


  addEventActionMapping() {
    const actionId = this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].eventType.value;
    const target = this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].eventTarget.value;
    const serviceReference = this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].eventServiceReference.value;

    if (!actionId || !target) {
      // this.messageService.add({
      //   severity: 'warn',
      //   summary: 'Warn',
      //   detail: 'Please fill all the fields',
      // });
    } else {
      const param = {
        actionId,
        target,
        serviceReference
      };
      if (this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].eventActions.value.indexOf(param) === -1) {
        this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].eventActions.value.push(param);
        this.eventActionMappDataSource = new MatTableDataSource(this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].eventActions.value);
        this.dataSourceEventActionMapping[this.selectedFieldIndex] =  this.eventActionMappDataSource;
      }
      this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].eventActions.patchValue(this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].eventActions.value,
          { emitEvent: true });
    }
  }

  loadMicroserviceProjectDropdownItems() {
    for (let i = 0; i < this.microserviceProjects.length; i++) {
      const dropdownLabel = this.microserviceProjects[i].displayName;
      this.microserviceProjectItems.push({ label: dropdownLabel, value: this.microserviceProjects[i] });
    }
  }

  onClickChildFormControl(id) {
    this.selectedChildIndex = id;
  }

  onChangeMicroserviceProjectInChild() {
    const microservice = this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].children['controls'][this.selectedChildIndex][
        'controls'
        ].microservice.value;
    this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].children['controls'][this.selectedChildIndex][
        'controls'
        ].choiceUrl.patchValue('', { emitEvent: true });
    this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].children['controls'][this.selectedChildIndex][
        'controls'
        ].api.patchValue([], { emitEvent: true });
    this.loadAPISforMS(microservice);
  }

  onChangeDropdownChoiceType() {
    const microservice = this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].children['controls'][this.selectedChildIndex][
        'controls'
        ].microservice.value;
    this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].children['controls'][this.selectedChildIndex][
        'controls'
        ].choiceUrl.patchValue('', { emitEvent: true });
    this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].children['controls'][this.selectedChildIndex][
        'controls'
        ].api.patchValue([], { emitEvent: true });
    this.loadAPISforMS(microservice);
  }

  onChangeMicroserviceProject() {
    const microservice = this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].microservice.value;
    this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].choiceUrl.patchValue('', { emitEvent: true });
    this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].api.patchValue([], { emitEvent: true });
    this.loadAPISforMS(microservice);
  }


  onChangeMicroserviceProject2() {
    const microservice = this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].microservice2.value;
    this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].url.patchValue('', { emitEvent: true });
    this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].api2.patchValue([], { emitEvent: true });
    this.loadAPISforMS(microservice);
  }

  loadAPISforMS(microservice) {
    this.apiItems = [];
    if (microservice.microserviceApis) {
      for (let i = 0; i < microservice.microserviceApis.length; i++) {
        const apiObj: IPageApi = {
          apiType: 'API',
          api: microservice.microserviceApis[i],
        };
        const dropdownLabel = microservice.microserviceApis[i].name;
        this.apiItems.push({ label: dropdownLabel, value: apiObj });
      }
    }

    if (microservice.commands) {
      for (let i = 0; i < microservice.commands.length; i++) {
        const commandObj: IPageApi = {
          apiType: 'COMMAND',
          api: microservice.commands[i],
        };
        const dropdownLabel = microservice.commands[i].name;
        this.apiItems.push({ label: dropdownLabel, value: commandObj });
      }
    }

    if (microservice.queries) {
      for (let i = 0; i < microservice.queries.length; i++) {
        const queryObj: IPageApi = {
          apiType: 'QUERY',
          api: microservice.queries[i],
        };
        const dropdownLabel = microservice.queries[i].name;
        this.apiItems.push({ label: dropdownLabel, value: queryObj });
      }
    }
  }

  onSelectController(value) {
    this.isFieldSelected = true;
    this.selectedFieldIndex = value;
  }

  backToFields() {
    this.isFieldSelected = false;
    if (this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].choiceType.value === 'Static') {
      this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].choiceUrl.reset();
    } else if (this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].choiceType.value === 'API') {
      this.choiceFormGroup.clear();
    }
    this.addFormControllers();
  }

  calcelEdit() {
    this.isFieldSelected = false;
  }

  onSelectChildController(value) {
    this.isChildFieldSelected = true;
    this.selectedChildIndex = value;
  }

  backToChildFields() {
    this.isChildFieldSelected = false;
    if (
        this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].children['controls'][this.selectedChildIndex]['controls']
            .choiceType.value == 'Static'
    ) {
      this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].children['controls'][this.selectedChildIndex][
          'controls'
          ].choiceUrl.reset();
    } else {
      this.childChoiceFormGroup.clear();
    }
  }

  // loadAllSourceTargetFormFieldsForWidget(widgetId: string, uuid: string) {
  //   if (!widgetId) {
  //     // this.loadAll();
  //   } else {
  //     // this.spinnerService.show();
  //     this.builtInWidgetService
  //         .findAllSourceTargetFormFieldsForWidget(widgetId, uuid)
  //         .pipe(
  //             filter((res: HttpResponse<ISourceTargetFieldsRequest>) => res.ok),
  //             map((res: HttpResponse<ISourceTargetFieldsRequest>) => res.body)
  //         )
  //         .subscribe(
  //             (res: ISourceTargetFieldsRequest) => {
  //               this.processFormControllerData(res);
  //             },
  //             (res: HttpErrorResponse) => this.onError(res.message)
  //         );
  //   }
  // }

  loadAllSourceTargetFormFieldsForPage(pageId: string, uuid: string) {
    if (!pageId) {
      // this.loadAll();
    } else {
      // this.spinnerService.show();
      this.builtInPageService
          .findAllSourceTargetFormFieldsForPage(pageId, uuid)
          .pipe(
              filter((res: HttpResponse<ISourceTargetFieldsRequest>) => res.ok),
              map((res: HttpResponse<ISourceTargetFieldsRequest>) => res.body)
          )
          .subscribe(
              (res: ISourceTargetFieldsRequest) => {
                this.processFormControllerData(res);
              },
              (res: HttpErrorResponse) => this.onError(res.message)
          );
    }
  }

  processFormControllerData(res: ISourceTargetFieldsRequest) {
    this.sourceTargetFieldsRequest = res;
    this.sourceProperties = this.sourceTargetFieldsRequest.sourceFormFields;
    this.targetProperties = this.sourceTargetFieldsRequest.targetFormFields.concat(this.sourceProperties);
    if (this.targetProperties) {
      for (let i = 0; i < this.targetProperties.length; i++) {
        const hasChild = this.targetProperties[i].children && this.targetProperties[i].children.length > 0;
        this.insertFormControllersGroup(this.targetProperties[i], hasChild, i);
        if (hasChild) {
          this.selectedFieldIndex = i;
          for (let j = 0; j < this.targetProperties[i].children.length; j++) {
            this.insertChildFormControllersGroup(i, this.targetProperties[i].children[j]);
          }
        }
      }
    }
  }

  protected onError(errorMessage: string) {
    // this.spinnerService.hide();
    //  this.logger.error(errorMessage);
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IFormControllers>>) {
    result.subscribe(
        () => this.onSaveSuccess(),
        () => this.onSaveError()
    );
  }

  protected onSaveSuccess() {
    // this.spinnerService.hide();
    this.isSaving = false;
    this.clear();
    this.eventManager.dispatch(
        new AppEvent(EventTypes.envAppListModification, { name: 'envAppListModification', content: 'List modified' })
    );
  }

  protected onSaveError() {
    // this.spinnerService.hide();
    this.isSaving = false;
  }

  private createFromForm(): IFormControllers {
    return {
      ...new FormControllers(),
      fieldList: this.formFieldsGroup.value,
    };
  }

  removeSpecialCharacters(event) {
    var k;
    k = event.charCode;
    return (k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57);
  }

  addFormControllers() {
    // this.spinnerService.show();
    this.isSaving = true;
    const formData = this.createFromForm();
    //  if(this.data.widgetId) {
    // //   this.subscribeToSaveResponse(this.builtInWidgetService.saveWidgetFormOrder(formData.fieldList, this.data.pageId, this.data.projectUid));
    //  } else {
    this.subscribeToSaveResponse(this.builtInPageService.savePageFormOrder(formData.fieldList, this.pageId, this.projectUid));
    //  }

  }

  deleteKeyVal(param) {
    const index = this.keyValPairs.indexOf(param);
    this.keyValPairs.splice(index, 1);
  }

  createForm() {
    this.form = this.fb.group({
      formFieldsGroup: this.fb.array([]),
    });
  }

  addFormFieldsGroup(values: any, type: string): FormGroup {
    if (values.fieldController === '' && values.propertyType) {
      switch (values.propertyType) {
        case 'TEXT': values.fieldController = 'Textbox';
          break;
        case 'NUMBER': values.fieldController = 'Textbox';
          break;
        case 'TRUE_OR_FALSE': values.fieldController = 'TRUE_OR_FALSE_PICKER';
          break;
        case 'DATE': values.fieldController = 'DATE_INPUT';
          break;
      }
    }
    return new FormGroup({
      propertyType: new FormControl(values.propertyType),
      propertyId: new FormControl(values.propertyId),
      propertyName: new FormControl(values.propertyName),
      fieldController: new FormControl(values.fieldController),
      fieldType: new FormControl(values.fieldType),
      fieldAttribute: new FormControl(values.fieldAttribute),
      fieldcategory: new FormControl(type),
      choiceUrl: new FormControl(values.choiceUrl),
      dropdownMappings: new FormControl(values.dropdownMappings ? values.dropdownMappings: []),
      eventActions: new FormControl(values.eventActions ? values.eventActions: []),
      selectType: new FormControl(values.selectType),
      isrequired: new FormControl(values.isrequired),
      defaultvalue: new FormControl(values.defaultValue),
      placeholder: new FormControl(values.placeholder),
      label: new FormControl(values.label),
      microservice: new FormControl(''),
      api: new FormControl(''),
      search: new FormControl(''),
      fieldValueChoices: this.fb.array(this.getChoicesGroups(values.fieldValueChoices ? values.fieldValueChoices : [])),
      children: this.fb.array([]),
      choiceType: new FormControl(values.choiceType),
      addUIEvents: new FormControl(values.addUIEvents),
      operation: new FormControl(values.operation),
      eventType: new FormControl(values.eventType),
      eventTarget: new FormControl(values.eventTarget),
      eventServiceReference: new FormControl(values.eventServiceReference),
      url: new FormControl(values.url),
      isVisible: new FormControl((values.isVisible)),
      initialVisible: new FormControl((values.initialVisible))
    });
  }
  getChoicesGroups(array) {
    const choicesAssay = [];
    if (array) {
      for (let i = 0; i < array.length; i++) {
        choicesAssay.push(this.getChoiceGroup(array[i]));
      }
    }
    return choicesAssay;
  }

  getChoiceGroup(choice) {
    return new FormGroup({
      choiceLabel: this.fb.control(choice.choiceLabel),
      event: this.fb.control('OnChangedValue'),
      events: this.fb.array(this.getEventsGroup(choice.events))
    });
  }

  getEventsGroup(eventsArray) {
    const events = [];
    if (eventsArray) {
      for (let i = 0; i < eventsArray.length; i++) {
        events.push(this.getEvents(eventsArray[i]));
      }
    }
    return events;
  }

  addChildFormFieldsGroup(values: any): FormGroup {
    if (values.fieldController === '' && values.propertyType) {
      switch (values.propertyType) {
        case 'TEXT': values.fieldController = 'Textbox';
        break;
        case 'NUMBER': values.fieldController = 'Textbox';
          break;
        case 'TRUE_OR_FALSE': values.fieldController = 'TRUE_OR_FALSE_PICKER';
          break;
        case 'DATE': values.fieldController = 'DATE_INPUT';
          break;
      }
    }
    return new FormGroup({
      propertyType: new FormControl(values.propertyType),
      propertyId: new FormControl(values.propertyId),
      propertyName: new FormControl(values.propertyName),
      fieldController: new FormControl(values.fieldController),
      eventActions: new FormControl(values.eventActions ? values.eventActions: []),
      choiceUrl: new FormControl(values.choiceUrl),
      isrequired: new FormControl(values.isrequired),
      defaultvalue: new FormControl(values.defaultValue),
      placeholder: new FormControl(values.placeholder),
      label: new FormControl(values.label),
      microservice: new FormControl(''),
      api: new FormControl(''),
      search: new FormControl(''),
      fieldValueChoices: this.fb.array(this.getChoicesGroups(values.fieldValueChoices)),
      addUIEvents: new FormControl(values.addUIEvents),
      operation: new FormControl(values.operation),
      eventType: new FormControl(values.eventType),
      eventTarget: new FormControl(values.eventTarget),
      eventServiceReference: new FormControl(values.eventServiceReference),
      url: new FormControl(values.url),
      choiceType: new FormControl(values.choiceType),
      isVisible: new FormControl((values.isVisible)),
      initialVisible: new FormControl((values.initialVisible))
    });
  }

  addChoiceFormFieldsGroup(): FormGroup {
    return new FormGroup({
      choiceLabel: new FormControl(),
      event: this.fb.control('OnChangedValue'),
      events: this.fb.array([])
    });
  }

  get formFieldsGroup() {
    return this.form.get('formFieldsGroup') as FormArray;
  }

  insertFormControllersGroup(values, hasChild, index) {
    const category = hasChild ? 'object' : 'property';
    this.formFieldsGroup.push(this.addFormFieldsGroup(values, category));
    if(values.fieldController === 'Dropdown') {
      this.dataSourceDropdownMapp = new MatTableDataSource(this.formFieldsGroup.controls[index]['controls'].dropdownMappings.value);
      this.dataSourceDropdownMapping[index] =  this.dataSourceDropdownMapp;
    }
  }

  get choiceFormGroup() {
    return this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].fieldValueChoices as FormArray;
  }

  get childChoiceFormGroup() {
    if (
        this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].children &&
        this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].children['controls'] &&
        this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].children['controls'][this.selectedChildIndex]
    ) {
      return this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].children['controls'][this.selectedChildIndex]['controls']
          .fieldValueChoices as FormArray;
    }
  }

   dropDownEvents(index) {
    return  this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].fieldValueChoices['controls'][index]
        ['controls'].events as FormArray;
  }

  get childFormGroup() {
    return this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].children as FormArray;
  }

  removeChoiceFormControllers(index: number) {
    this.choiceFormGroup.removeAt(index);
  }

  removeChildChoiceFormController(index: number) {
    this.childChoiceFormGroup.removeAt(index);
  }


  addEvents(index: number) {
    const dialogRef = this.dialog.open(ButtonEventHandleComponent, {
      panelClass: ['virtuan-dialog'],
      data: {
        fieldController: 'Radiobutton',
        formControllers: this.targetProperties,
        events: this.dropDownEvents(index).value
      }
    });
    dialogRef.afterClosed(
    ).subscribe(result => {
      if (result) {
        for (let i = 0; i < result.length; i++) {
          this.dropDownEvents(index).push(this.getEvents(result[i]));
        }
        // this.dataSource = new MatTableDataSource(this.BTN_ELEMENT_DATA);
        // this.savePageActions();
      }
    });
  }

  getEvents(event) {
    return new FormGroup({
      actionId: this.fb.control(event.actionId),
      value: this.fb.control(event.value),
      target: this.fb.control(event.target),
    });
  }
  insertChoiceFormControllersGroup(index) {
    this.selectedFieldIndex = index;
    this.choiceFormGroup.push(this.addChoiceFormFieldsGroup());
  }

  insertChildChoiceFormControllersGroup(index, childIndex) {
    this.selectedFieldIndex = index;
    this.selectedChildIndex = childIndex;
    this.childChoiceFormGroup.push(this.addChoiceFormFieldsGroup());
  }

  insertChildFormControllersGroup(index, values) {
    this.selectedFieldIndex = index;
    this.childFormGroup.push(this.addChildFormFieldsGroup(values));
  }
}
