import {Component, Inject, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import { filter, map } from 'rxjs/operators';
import {SelectItem} from 'primeng/api';
import {ProjectService} from '@core/projectservices/project.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AggregateService} from "@core/projectservices/microservice-aggregate.service";
import { IProject } from '@app/shared/models/model/project.model';


// tslint:disable-next-line:class-name
interface controllerItem {
  label?: string;
  type?: string;
  value?: any;
}
export interface IPageApi {
  apiType?: string;
  api?: any;
}


@Component({
  selector: 'virtuan-microservice-add-model-constraints-dialog',
  templateUrl: './microservice-add-model-constraints-dialog.component.html',
  styleUrls: ['./microservice-add-model-constraints-dialog.component.scss']
})
export class MicroserviceAddModelConstraintsDialogComponent implements OnInit {

  isSaving: boolean;
  edit: boolean;
  propertyType: string;
  project: IProject;
  projectUid: string;
  projectType: string;
  microserviceProjectItems: SelectItem[];
  microserviceProjects: IProject[];
  apiItems: SelectItem[];
  controllerTypeItems: controllerItem[] = [
    { label: 'Textbox', value: 'Textbox' },
    { label: 'Radiobutton', value: 'Radiobutton' },
    { label: 'Checkbox', value: 'Checkbox' },
    { label: 'Dropdown', value: 'Dropdown' },
  ];

  constraintForm = this.fb.group({
    isPropertyUnique: [],
    isPropertyEncrypted: [],
    propertyLength: [],
    propertyDefaultValue: [],
    fieldController: [],
    isRequired: [],
    placeholder: [],
    label: [],
    resourcePath: [],
    microservice: [],
    api: [],
    search: false,
    choicesGroup: this.fb.array([]),
  });

  constructor(
      // public activeModal: NgbActiveModal,
      // private logger: NGXLogger,
      private fb: FormBuilder,
      // protected toolbarTrackerService: ToolbarTrackerService,
      protected projectService: ProjectService,
      protected aggregateService: AggregateService,
      private dialogRef: MatDialogRef<MicroserviceAddModelConstraintsDialogComponent>,
      @Inject(MAT_DIALOG_DATA)  public data: any,) {}

  /**
   * clear form
   */
  clear() {
    // this.activeModal.dismiss('cancel');
  }

  ngOnInit() {
    this.isSaving = false;
    this.microserviceProjectItems = [];
    this.microserviceProjects = [];
    this.apiItems = [];
    this.loadMicroserviceProjects();
    if (this.data.edit) {
      console.log(this.data)
      this.constraintForm.patchValue({

        isPropertyUnique: this.data.data.isUnique,
        isPropertyEncrypted: this.data.data.isEncrypted,
        propertyLength: this.data.data.length,
        propertyDefaultValue: this.data.data.defaultValue,
        fieldController: this.data.data.fieldController,
        isRequired: this.data.data.isRequired,
        placeholder: this.data.data.placeholder,
        label: this.data.data.label,
        choiceUrl: this.data.data.choiceUrl,
      });
    }
    if (this.data && this.data.propertytype && this.projectType === 'task.ui') {
      this.propertyType = this.data.propertytype;
      switch (this.propertyType) {
        case 'TRUE_OR_FALSE':
          this.constraintForm.patchValue({
            fieldController: 'TRUE_OR_FALSE_PICKER',
          });
          break;
        case 'DATE':
          this.constraintForm.patchValue({
            fieldController: 'DATE_INPUT',
          });
          break;
        default:
          this.constraintForm.patchValue({
            fieldController: 'Textbox',
          });
          break;
      }
    }
    if (this.data && this.data.fieldValueChoices) {
      this.updateChoicesGroup(this.data.fieldValueChoices);
    }
  }

  protected onError(errorMessage: string) {
    // this.logger.error(errorMessage);
  }

  /**
   * save data
   */
  save() {
    const model = this.createFromForm();
    const data = {
      isUnique: model.isUnique,
      isEncrypted: model.isEncrypted,
      length: model.length,
      defaultValue: model.defaultValue,
      fieldController: model.fieldController,
      isRequired: model.isRequired,
      placeholder: model.placeholder,
      label: model.label,
      choiceUrl: model.choiceUrl,
      fieldValueChoices: model.fieldValueChoices,
    };
    this.dialogRef.close(data);
  }

  updateChoicesGroup(array) {
    for (let i = 0; i < array.length; i++) {
      this.insertChoiceFormControllersGroup(array[i].choiceLabel);
    }
  }

  get choiceFormGroup() {
    return this.constraintForm.get('choicesGroup') as FormArray;
  }

  removeChoiceFormControllers(index: number) {
    this.choiceFormGroup.removeAt(index);
  }

  loadMicroserviceProjects() {
    this.aggregateService
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

  onChangeMicroserviceAPI() {
    const microservice = this.constraintForm.get(['microservice']).value;
    const api = this.constraintForm.get(['api']).value;
    if (api && api.api) {
      const apiStart: boolean = api.api.resourcePath.startsWith('/');
      let suggestedPath = '';
      if (apiStart) {
        suggestedPath = '/' + microservice.name + '/api' + api.api.resourcePath;
      } else {
        suggestedPath = '/' + microservice.name + '/api/' + api.api.resourcePath;
      }

      this.constraintForm.get('resourcePath').patchValue(suggestedPath, { emitEvent: true });
    }
  }

  loadMicroserviceProjectDropdownItems() {
    for (let i = 0; i < this.microserviceProjects.length; i++) {
      const dropdownLabel = this.microserviceProjects[i].displayName;
      this.microserviceProjectItems.push({ label: dropdownLabel, value: this.microserviceProjects[i] });
    }
  }

  onChangeMicroserviceProject() {
    this.apiItems = [];
    const microservice = this.constraintForm.get(['microservice']).value;
    this.constraintForm.get('resourcePath').patchValue('', { emitEvent: true });
    this.constraintForm.get('api').patchValue([], { emitEvent: true });

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
      for(let i = 0; i < microservice.commands.length; i++) {
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

  insertChoiceFormControllersGroup(value) {
    this.choiceFormGroup.push(this.addChoiceFormFieldsGroup(value));
  }

  addChoiceFormFieldsGroup(value): FormGroup {
    return new FormGroup({
      choiceLabel: this.fb.control(value),
    });
  }

  /**
   * create constraint form
   * @private
   */
  private createFromForm(): IMicroserviceModel {
    const isUnique = this.constraintForm.get(['isPropertyUnique']).value === true;
    const isEncrypted = this.constraintForm.get(['isPropertyEncrypted']).value === true;
    const length = this.constraintForm.get(['propertyLength']).value;
    const defaultValue = this.constraintForm.get(['propertyDefaultValue']).value;
    const fieldController = this.constraintForm.get(['fieldController']).value;
    const isRequired = this.constraintForm.get(['isRequired']).value;
    const placeholder = this.constraintForm.get(['placeholder']).value;
    const label = this.constraintForm.get(['label']).value;
    const choiceUrl = this.constraintForm.get(['resourcePath']).value;
    const fieldValueChoices = this.constraintForm.get(['choicesGroup']).value;
    return {
      ...new MicroserviceModel(),
      isUnique,
      isEncrypted,
      length,
      defaultValue,
      fieldController,
      isRequired,
      placeholder,
      label,
      choiceUrl,
      fieldValueChoices,
    };
  }
}

export interface IMicroserviceModel {
  isUnique?: boolean;
  isEncrypted?: boolean;
  length?: string;
  defaultValue?: string;
  fieldController?: string;
  isRequired?: string;
  placeholder?: string;
  label?: string;
  choiceUrl?: string;
  fieldValueChoices?: any;
}

export class MicroserviceModel implements IMicroserviceModel {
  constructor(
      public isUnique?: boolean,
      public isEncrypted?: boolean,
      public length?: string,
      public defaultValue?: string,
      public fieldController?: string,
      public isRequired?: string,
      public placeholder?: string,
      public label?: string,
      public choiceUrl?: string,
      public fieldValueChoices?: any
  ) {}
}
