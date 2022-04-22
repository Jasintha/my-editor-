import {Component, Inject, OnInit} from '@angular/core';
import {HttpResponse, HttpErrorResponse} from "@angular/common/http";
import { IAggregate } from '@app/shared/models/model/aggregate.model';
import {filter, map} from "rxjs/operators";
// import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {AggregateService} from "@home/pages/aggregate/microservice-aggregate.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SelectItem} from "primeng/api";
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
@Component({
  selector: 'virtuan-microservice-add-model-dialog',
  templateUrl: './microservice-add-model-dialog.component.html',
  styleUrls: ['./microservice-add-model-dialog.component.scss']
})
export class MicroserviceAddModelDialogComponent implements OnInit {
  isSaving: boolean;
  edit: boolean;
  data: any;
  modelObject: any;
  aggregateList: SelectItem[] = [];
  entityList: SelectItem[] = [];
  propertyGroupList: SelectItem[] = [];
  modelId: string;
  // projectId: number;
  projectUid: string;
  editForm: FormGroup;
  propertytypeItems: SelectItem[] = [
    { label: 'TEXT', value: 'TEXT' },
    { label: 'NUMBER', value: 'NUMBER' },
    { label: 'FLOAT', value: 'FLOAT' },
    { label: 'EMAIL', value: 'EMAIL' },
    { label: 'TRUE_OR_FALSE', value: 'TRUE_OR_FALSE' },
    { label: 'DATE', value: 'DATE' },
  ];

  typeItems: SelectItem[] = [
    { label: 'PROPERTY', value: 'property' },
    { label: 'COLLECTION', value: 'collection' },
    { label: 'LIST', value: 'list' },
  ];



  constructor(
      // public activeModal: NgbActiveModal,
      // private logger: NGXLogger,
      protected aggregateService: AggregateService,
      private fb: FormBuilder,
      private dialogRef: MatDialogRef<MicroserviceAddModelDialogComponent>,
      @Inject(MAT_DIALOG_DATA)  public propdata: any,) {}

  clear() {
    // this.activeModal.dismiss('cancel');
  }

  buildForm() {
    this.editForm = this.fb.group({
      type: ['', [Validators.required]],
      name: ['', [Validators.required]],
      propertytype: [],
      selectedEntity: [],
      selectedPropGroup: [],
      isNotPersist: [],
    });
  }

  setPropertyTypeValidators() {
    this.editForm.get('type').valueChanges.subscribe(type => {
      if (type == 'property') {
        this.editForm.get('propertytype').setValidators([Validators.required]);
        this.editForm.get('propertytype').updateValueAndValidity();
      } else {
        this.editForm.get('propertytype').clearValidators();
        this.editForm.get('propertytype').updateValueAndValidity();
      }
    });
  }

  loadAllAggregates() {
    this.aggregateService
        .findByProjectUUId(this.propdata.modelId,this.propdata.projectUid)
        .pipe(
            filter((res: HttpResponse<IAggregate[]>) => res.ok),
            map((res: HttpResponse<IAggregate[]>) => res.body)
        )
        .subscribe(
            (res: IAggregate[]) => {
              if (res) {
                this.createEntityDropdown(res);
                this.createPropertyGroupDropdown(res);
              }
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
  }

  ngOnInit() {
    console.log(this.propdata)
    this.editForm = this.fb.group({
      type: [],
      name: [],
      propertytype: [],
      selectedEntity: [],
      selectedPropGroup: [],
      isNotPersist: [],
    });
    this.buildForm();
    this.setPropertyTypeValidators();
    this.isSaving = false;
    this.loadAllAggregates();
    if (this.propdata.edit) {
      this.editForm.patchValue({
        type: this.propdata.type,
        name: this.propdata.name,
        propertytype: this.propdata.propertytype,
        selectedEntity: this.propdata.selectedEntity,
        selectedPropGroup: this.propdata.selectedPropGroup,
        isNotPersist: this.propdata.isNotPersist,
      });
    }
  }
  protected onError(errorMessage: string) {
    // this.logger.error(errorMessage);
  }

  save() {
    const model = this.createFromForm();
    if (model.type === 'entity' || model.type === 'property-group') {
      model.name = this.getEntityName(model.type, model.selectedEntity);
    }
    const data = {
      name: model.name,
      type: model.type,
      propertytype: model.propertytype,
      isNotPersist: model.isNotPersist,
      status: 'new',
      fieldController: model.fieldController,
    };
    this.dialogRef.close(data);
    // this.activeModal.close(data);
  }

  private getEntityName(type, value) {
    const aggregateArray = type === 'entity' ? this.entityList : this.propertyGroupList;
    for (let i = 0; i < aggregateArray.length; i++) {
      if (aggregateArray[i].value === value) {
        return aggregateArray[i].label;
      }
    }
  }

  private createEntityDropdown(aggregates) {
    if (aggregates.length > 0) {
      for (let i = 0; i < aggregates.length; i++) {
        if (aggregates[i].type === 'ENTITY') {
          const aggregateObj = { label: '', value: '' };
          aggregateObj.value = aggregates[i].uuid;
          aggregateObj.label = aggregates[i].name;
          this.entityList.push(aggregateObj);
        }
      }
      if (this.entityList.length > 0) {
        this.typeItems.push({ label: 'ENTITY', value: 'entity' });
      }
    }
  }

  private createPropertyGroupDropdown(aggregates) {
    if (aggregates.length > 0) {
      for (let i = 0; i < aggregates.length; i++) {
        if (aggregates[i].type === 'PROPERTY-GROUP') {
          const aggregateObj = { label: '', value: '' };
          aggregateObj.value = aggregates[i].uuid;
          aggregateObj.label = aggregates[i].name;
          this.propertyGroupList.push(aggregateObj);
        }
      }
      if (this.propertyGroupList.length > 0) {
        this.typeItems.push({ label: 'PROPERTY-GROUP', value: 'property-group' });
      }
    }
  }

  private createFromForm(): IMicroserviceModel {
    const type = this.editForm.get(['type']).value;
    const propType = this.editForm.get(['propertytype']).value;
    const isPropNotPersist = this.editForm.get(['isNotPersist']).value === true;
    let propertyTypeToSave = '';
    let fieldController = '';
    if (type === 'property') {
      propertyTypeToSave = propType;
    } else if (type === 'property-group') {
      propertyTypeToSave = 'property-group';
    }
    if (propType) {
      switch (propType) {
        case 'TRUE_OR_FALSE':
          fieldController = 'TRUE_OR_FALSE_PICKER';
          break;
        case 'DATE':
          fieldController = 'DATE_INPUT';
          break;
        default:
          fieldController = 'Textbox';
          break;
      }
    }

    return {
      ...new MicroserviceModel(),
      name: this.editForm.get(['name']).value,
      type,
      propertytype: propertyTypeToSave,
      selectedEntity: this.editForm.get(['selectedEntity']).value,
      selectedPropGroup: this.editForm.get(['selectedPropGroup']).value,
      isNotPersist: isPropNotPersist,
      fieldController: fieldController,
    };
  }
}

export interface IMicroserviceModel {
  type?: string;
  name?: string;
  propertytype?: string;
  selectedEntity?: string;
  selectedPropGroup?: string;
  isNotPersist?: boolean;
  fieldController?: string;
}

export class MicroserviceModel implements IMicroserviceModel {
  constructor(
      public type?: string,
      public name?: string,
      public propertytype?: string,
      public selectedEntity?: string,
      public selectedPropGroup?: string,
      public isNotPersist?: boolean,
      public fieldController?: string
  ) {}
}
