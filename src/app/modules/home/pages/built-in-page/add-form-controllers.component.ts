import {Component, Inject, Input, OnDestroy, OnInit} from '@angular/core';
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
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';


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
export class AddFormControllersComponent implements OnInit {
  keyValPairs: IKeyData[];
  isSaving: boolean;
  cols: any[];
  form: FormGroup;
  sourceTargetFieldsRequest: ISourceTargetFieldsRequest;
  datamodel: IDatamodel;
  microserviceProjectItems: SelectItem[];
  microserviceProjects: IProject[];
  apiItems: SelectItem[];

  // cars2: Car[];
  clonedCars: { [s: string]: Config } = {};
  projectUid: string;
  pageId: string;
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
  ];

  choiceType: SelectItem[] = [
    { label: 'Add API for get Choices', value: 'API' },
    { label: 'Add Choices for manually', value: 'Manually' },
  ];

  @Input() public envuuid;

  constructor(
    private fb: FormBuilder,
    protected eventManager: EventManagerService,
    protected pageService: BuiltInPageService,
    protected builtInPageService: BuiltInPageService,
    protected projectService: ProjectService,
    @Inject(MAT_DIALOG_DATA)  public data: any,
  ) {}

  clear() {
    // this.activeModal.dismiss('cancel');
  }

  ngOnInit() {
    this.isSaving = false;
    this.microserviceProjectItems = [];
    this.microserviceProjects = [];
    this.apiItems = [];
    this.createForm();
    this.loadAllSourceTargetFormFieldsForPage(this.data.pageId, this.data.projectUid);
    this.isSaving = false;
    this.keyValPairs = [];
    this.cols = [
      { field: 'Field', header: 'Field' },
      { field: 'Controller', header: 'Controller' },
    ];
    this.loadMicroserviceProjects();
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

  onChangeMicroserviceProject() {
    const microservice = this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].microservice.value;
    this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].choiceUrl.patchValue('', { emitEvent: true });
    this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].api.patchValue([], { emitEvent: true });
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
    if (this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].choiceType.value === 'Manually') {
      this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].choiceUrl.reset();
    } else if (this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].choiceType.value === 'API') {
      this.choiceFormGroup.clear();
    }
  }

  onSelectChildController(value) {
    this.isChildFieldSelected = true;
    this.selectedChildIndex = value;
  }

  backToChildFields() {
    this.isChildFieldSelected = false;
    if (
      this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].children['controls'][this.selectedChildIndex]['controls']
        .choiceType.value == 'Manually'
    ) {
      this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].children['controls'][this.selectedChildIndex][
        'controls'
      ].choiceUrl.reset();
    } else {
      this.childChoiceFormGroup.clear();
    }
  }

  loadAllSourceTargetFormFieldsForPage(pageId: string, uuid: string) {
    if (!pageId) {
      // this.loadAll();
    } else {
      // this.spinnerService.show();
      this.pageService
        .findAllSourceTargetFormFieldsForPage(pageId, uuid)
        .pipe(
          filter((res: HttpResponse<ISourceTargetFieldsRequest>) => res.ok),
          map((res: HttpResponse<ISourceTargetFieldsRequest>) => res.body)
        )
        .subscribe(
          (res: ISourceTargetFieldsRequest) => {
            this.sourceTargetFieldsRequest = res;
            this.sourceProperties = this.sourceTargetFieldsRequest.sourceFormFields;
            this.targetProperties = this.sourceTargetFieldsRequest.targetFormFields;
            if (this.targetProperties) {
              for (let i = 0; i < this.targetProperties.length; i++) {
                const hasChild = this.targetProperties[i].children && this.targetProperties[i].children.length > 0;
                this.insertFormControllersGroup(this.targetProperties[i], hasChild);
                if (hasChild) {
                  this.selectedFieldIndex = i;
                  for (let j = 0; j < this.targetProperties[i].children.length; j++) {
                    this.insertChildFormControllersGroup(i, this.targetProperties[i].children[j]);
                  }
                }
              }
            }
            // this.spinnerService.hide();
          },
          (res: HttpErrorResponse) => this.onError(res.message)
        );
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
    this.subscribeToSaveResponse(this.builtInPageService.savePageFormOrder(formData.fieldList, this.data.pageId, this.data.projectUid));
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
    return new FormGroup({
      propertyType: new FormControl(values.propertyType),
      propertyName: new FormControl(values.propertyName),
      fieldController: new FormControl(values.fieldController),
      fieldcategory: new FormControl(type),
      choiceUrl: new FormControl(values.choiceUrl),
      isrequired: new FormControl(values.isrequired),
      defaultvalue: new FormControl(values.defaultValue),
      placeholder: new FormControl(values.placeholder),
      label: new FormControl(values.label),
      microservice: new FormControl(''),
      api: new FormControl(''),
      search: new FormControl(''),
      fieldValueChoices: this.fb.array(this.getChoicesGroups(values.fieldValueChoices)),
      children: this.fb.array([]),
      choiceType: new FormControl(values.choiceType),
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
    });
  }

  addChildFormFieldsGroup(values: any): FormGroup {
    return new FormGroup({
      propertyType: new FormControl(values.propertyType),
      propertyName: new FormControl(values.propertyName),
      fieldController: new FormControl(values.fieldController),
      choiceUrl: new FormControl(values.choiceUrl),
      isrequired: new FormControl(values.isrequired),
      defaultvalue: new FormControl(values.defaultValue),
      placeholder: new FormControl(values.placeholder),
      label: new FormControl(values.label),
      microservice: new FormControl(''),
      api: new FormControl(''),
      search: new FormControl(''),
      fieldValueChoices: this.fb.array(this.getChoicesGroups(values.fieldValueChoices)),
      choiceType: new FormControl(values.choiceType),
    });
  }

  addChoiceFormFieldsGroup(): FormGroup {
    return new FormGroup({
      choiceLabel: new FormControl(),
    });
  }

  get formFieldsGroup() {
    return this.form.get('formFieldsGroup') as FormArray;
  }

  insertFormControllersGroup(values, hasChild) {
    const category = hasChild ? 'object' : 'property';
    this.formFieldsGroup.push(this.addFormFieldsGroup(values, category));
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

  get childFormGroup() {
    return this.formFieldsGroup.controls[this.selectedFieldIndex]['controls'].children as FormArray;
  }

  removeChoiceFormControllers(index: number) {
    this.choiceFormGroup.removeAt(index);
  }

  removeChildChoiceFormController(index: number) {
    this.childChoiceFormGroup.removeAt(index);
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
