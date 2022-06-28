import {Component, Inject, OnInit} from '@angular/core';
import {HttpResponse, HttpErrorResponse} from "@angular/common/http";
import { IAggregate } from '@app/shared/models/model/aggregate.model';
import {filter, map} from "rxjs/operators";
// import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {AggregateService} from "@core/projectservices/microservice-aggregate.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SelectItem} from "primeng/api";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
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
  customField = false;
  valueObjReference: string;
  valueObjects: IValueObject[];
  valueObjectsList: SelectItem[];
  editForm: FormGroup;
  selectedValueObj:IValueObject;
  showForm = false;
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
      public dialog: MatDialog,
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
      alphabeticChar: [],
      specialChar: [],
      numericChar:[],
      whiteSpaces:[],
      casSensitivity:[],
      requiredChar: [],
      allowedAlphabeticChar:[],
      format: [],
      length: [],
      range: [],
      dataType: [],
      domain: [],
      encrypt: [],
      fieldName: [],
      selectedValidateType:[],
      regexString: [],
      validations: [],
      unique: [],
      encript:[],
      required:[],
      datatype:[]
    });
  }

  setPropertyTypeValidators() {
    this.editForm.get('type').valueChanges.subscribe(type => {
      if (type === 'property') {
        if (this.customField){
          this.editForm.get('propertytype').clearValidators();
          this.editForm.get('propertytype').updateValueAndValidity();
        }else {
          this.editForm.get('propertytype').setValidators([Validators.required]);
          this.editForm.get('propertytype').updateValueAndValidity();
        }

        this.editForm.get('name').clearValidators();
        this.editForm.get('name').updateValueAndValidity();
      } else {
        this.editForm.get('propertytype').clearValidators();
        this.editForm.get('propertytype').updateValueAndValidity();

        this.editForm.get('name').setValidators([Validators.required]);
        this.editForm.get('name').updateValueAndValidity();
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
      alphabeticChar: [],
      specialChar: [],
      numericChar:[],
      whiteSpaces:[],
      casSensitivity:[],
      requiredChar: [],
      allowedAlphabeticChar:[],
      format: [],
      length: [],
      range: [],
      dataType: [],
      domain: [],
      encrypt: [],
      fieldName: [],
      selectedValidateType:[],
      regexString: [],
      validations: [],
      unique: [],
      encript:[],
      required:[],
      datatype:[]
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
      this.updateModel();
    }
    this.loadRetrieveValueObj();
  }
  protected onError(errorMessage: string) {
    // this.logger.error(errorMessage);
  }

  updateModel(){
    this.aggregateService
        .findValueObj(this.propdata.projectUid,this.propdata.valueObjReference)
        .pipe(
            filter((mayBeOk: HttpResponse<IValueObject[]>) => mayBeOk.ok),
            map((response: HttpResponse<IValueObject[]>) => response.body)
        )
        .subscribe(
            (res: IValueObject[]) => {
             const valueObj = res;
             this.editForm.patchValue({
               propertytype: valueObj
             })
             this.updateValidations(this.propdata.valueUpdate);
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
  }
  updateValidations(value){
    this.showForm = true;
    let validationType;
    if (value.validationType === ''){
      validationType = 'custom';
    }else {
      validationType = value.validationType;
    }
    this.valueObjReference = value.valueObjectReference;
    this.editForm.patchValue({
      alphabeticChar: value.hasAlphabeticChar,
      specialChar: value.hasSpecialChar,
      numericChar:value.hasNumericChar,
      whiteSpaces:value.hasWhiteSpaces,
      casSensitivity:value.hasCaseSensitivity,
      requiredChar: value.requiredChar,
      format: value.format,
      length: value.charLength,
      range: value.range,
      unique: value.isUnique,
      allowedAlphabeticChar: value.allowedAlphabeticChar,
      encript: value.isEncrypted,
      required: value.isrequired,
      regexString : value.regexString,
      selectedValidateType: validationType
    })
  }

  loadRetrieveValueObj() {
    this.aggregateService
        .findAllRetrieveValueObj(this.propdata.projectUid)
        .pipe(
            filter((mayBeOk: HttpResponse<IValueObject[]>) => mayBeOk.ok),
            map((response: HttpResponse<IValueObject[]>) => response.body)
        )
        .subscribe(
            (res: IValueObject[]) => {
              this.valueObjectsList = [];
              this.valueObjects = res;
              for (let i=0; i<this.valueObjects.length; i++){
                const valueName = this.valueObjects[i].name;
                this.valueObjectsList.push({label:valueName, value:this.valueObjects[i]})
              }
              // this.selectedValueObj = this.valueObjects[0]
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
  }

  // createCustomValueObj(){
  //   const dialogRef = this.dialog.open(CustomValueObjectComponent, {
  //     panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
  //     data: {
  //       projectUid : this.propdata.projectUid,
  //     }
  //   });
  //   dialogRef.afterClosed().subscribe((result: any) => {
  //     this.loadRetrieveValueObj();
  //   });
  //
  // }

  changedValueObject(val){
    this.showForm = true;
    const validationType = 'custom';
    const validation = val.validations;
    this.valueObjReference = val.uuid;
    this.editForm.patchValue({
      alphabeticChar: validation.alphabeticChar,
      specialChar: validation.specialChar,
      numericChar:validation.numericChar,
      whiteSpaces:validation.whiteSpaces,
      casSensitivity:validation.casSensitivity,
      requiredChar: validation.requiredChar,
      format: validation.format,
      length: validation.charLength,
      range: validation.range,
      unique: val.unique,
      allowedAlphabeticChar: validation.allowedAlphabeticChar,
      encript: val.encrypt,
      required: val.required,
      regexString : val.regexString,
      selectedValidateType: validationType
    })

  }

  changeCreateType(val){
    if (val){
      this.customField = true;
      this.editForm.get('propertytype').clearValidators();
      this.editForm.get('propertytype').updateValueAndValidity();
    }else {
      this.customField = false;
      this.editForm.get('propertytype').setValidators([Validators.required]);
      this.editForm.get('propertytype').updateValueAndValidity();
    }
    this.showForm = false;
    this.editForm.get('propertytype').reset();
    this.editForm.get('alphabeticChar').reset();
    this.editForm.get('specialChar').reset();
    this.editForm.get('numericChar').reset();
    this.editForm.get('whiteSpaces').reset();
    this.editForm.get('casSensitivity').reset();
    this.editForm.get('requiredChar').reset();
    this.editForm.get('format').reset();
    this.editForm.get('length').reset();
    this.editForm.get('range').reset();
    this.editForm.get('required').reset();
    this.editForm.get('isNotPersist').reset();
    this.editForm.get('unique').reset();
    this.editForm.get('encript').reset();
    this.editForm.get('allowedAlphabeticChar').reset();
    this.editForm.get('regexString').reset();
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
      valueObjectType: model.valueObjectType,
      requiredChar: model.requiredChar,
      range: model.range,
      isEncrypted: model.isEncrypted,
      isUnique: model.isUnique,
      domain: model.domain,
      hasAlphabeticChar: model.hasAlphabeticChar,
      charLength: model.charLength,
      format: model.format,
      hasWhiteSpaces: model.hasWhiteSpaces,
      regexString: model.regexString,
      hasCaseSensitivity: model.hasCaseSensitivity,
      valueObjectStatus : model.valueObjectStatus,
      isrequired: model.isrequired,
      hasSpecialChar: model.hasSpecialChar,
      hasNumericChar: model.hasNumericChar,
      allowedAlphabeticChar: model.allowedAlphabeticChar,
      valueObjectReference: model.valueObjectReference,
      validationType: model.validationType,
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
    let name = this.editForm.get(['name']).value;
    const isPropNotPersist = this.editForm.get(['isNotPersist']).value === true;
    let propType;
    let valueObjType;
    let range = this.editForm.get(['range']).value;
    let requiredChar = this.editForm.get(['requiredChar']).value;;
    let encript = this.editForm.get(['encript']).value;;
    let unique = this.editForm.get(['unique']).value;
    let domain;
    let hasAlpchar = this.editForm.get(['alphabeticChar']).value;
    let allowdAlpChar = this.editForm.get(['allowedAlphabeticChar']).value;;
    let charLen = this.editForm.get(['length']).value;
    let format  = this.editForm.get(['format']).value;
    let hasWhiteSpc = this.editForm.get(['whiteSpaces']).value;
    let regxStr;
    let caseSensitive  = this.editForm.get(['casSensitivity']).value;
    let valueObjStatus;
    let required = this.editForm.get(['required']).value;
    let hasnumericchar = this.editForm.get(['numericChar']).value;
    let hasspecialchar = this.editForm.get(['specialChar']).value;
    let propertyTypeToSave = '';
    let valueObjReference = '';
    const validationType = this.editForm.get(['selectedValidateType']).value;
    let valObjType;
    if (this.customField){
      valObjType = 'custom'
    }else {
      valObjType = this.editForm.get(['propertytype']).value.valueObjectType;
    }
    if (validationType === 'regexString' && valObjType === 'custom' ){
      regxStr = this.editForm.get(['regexString']).value;
      if (this.editForm.get(['propertytype']).value){
        const regex = this.editForm.get(['propertytype']).value.regexString;
        if ( regex !== regxStr){
          hasnumericchar = false;
          hasspecialchar = false;
          caseSensitive = false;
          hasWhiteSpc = false;
          format = '';
          charLen = '';
          hasAlpchar = false;
          allowdAlpChar = '';
          range= '';
          requiredChar= '';
        }
      }
    } else {
      regxStr = '';
    }

    if (type === 'property'){
      if (this.customField){
        valueObjType = 'custom';
        domain = this.editForm.get(['domain']).value;
        name = this.editForm.get(['fieldName']).value;
        valueObjStatus = 'new';
        propertyTypeToSave = this.editForm.get(['datatype']).value;
        propType = this.editForm.get(['datatype']).value;
      }else {
        if (this.editForm.get(['propertytype']).value.dataType === 'string'){
          propType = 'TEXT';
        }else if (this.editForm.get(['propertytype']).value.dataType === 'integer'){
          propType = 'NUMBER';
        }else if(this.editForm.get(['propertytype']).value.dataType === 'float'){
          propType = 'FLOAT';
        }else if(this.editForm.get(['propertytype']).value.dataType === 'date'){
          propType = 'DATE';
        }else if(this.editForm.get(['propertytype']).value.dataType === 'email'){
          propType = 'EMAIL';
        }else if(this.editForm.get(['propertytype']).value.dataType === 'bool'){
          propType = 'TRUE_OR_FALSE';
        }
        valueObjType = this.editForm.get(['propertytype']).value.valueObjectType;
        name = this.editForm.get(['propertytype']).value.name;
        domain = this.editForm.get(['propertytype']).value.domain;
        valueObjStatus = 'existing';
        propertyTypeToSave = propType;
        valueObjReference = this.valueObjReference;
      }
    }

    let fieldController = '';
    if (type === 'property-group') {
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
      name: name,
      type,
      propertytype: propertyTypeToSave,
      selectedEntity: this.editForm.get(['selectedEntity']).value,
      selectedPropGroup: this.editForm.get(['selectedPropGroup']).value,
      isNotPersist: isPropNotPersist,
      fieldController: fieldController,
      valueObjectType: valueObjType,
      requiredChar: requiredChar,
      range: range,
      isEncrypted: encript,
      isUnique: unique,
      domain: domain,
      hasAlphabeticChar: hasAlpchar,
      charLength: charLen,
      format: format,
      hasWhiteSpaces: hasWhiteSpc,
      regexString: regxStr,
      hasCaseSensitivity: caseSensitive,
      valueObjectStatus : valueObjStatus,
      isrequired: required,
      hasSpecialChar: hasspecialchar,
      hasNumericChar: hasnumericchar,
      allowedAlphabeticChar: allowdAlpChar,
      valueObjectReference: valueObjReference,
      validationType: validationType
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
  valueObjectType?: string;
  valueObjectReference?: string;
  range?: string;
  requiredChar?: string;
  isEncrypted?: boolean;
  isUnique?: boolean;
  domain?: string;
  hasAlphabeticChar?: boolean;
  hasSpecialChar?: boolean;
  allowedAlphabeticChar?: string;
  hasCaseSensitivity?: boolean;
  charLength?: boolean;
  hasWhiteSpaces?: boolean;
  format?: string;
  regexString?: string;
  valueObjectStatus?: string;
  isrequired?: boolean;
  hasNumericChar?: boolean;
  validationType?:string;
}

export class MicroserviceModel implements IMicroserviceModel {
  constructor(
      public type?: string,
      public name?: string,
      public propertytype?: string,
      public selectedEntity?: string,
      public selectedPropGroup?: string,
      public isNotPersist?: boolean,
      public fieldController?: string,
      public valueObjectType?: string,
      public valueObjectReference?: string,
      public range?: string,
      public requiredChar?: string,
      public isEncrypted?: boolean,
      public isUnique?: boolean,
      public domain?: string,
      public isAlphabeticChar?: boolean,
      public isSpecialChar?: boolean,
      public allowedAlphabeticChar?: string,
      public hasCaseSensitivity?: boolean,
      public charLength?: boolean,
      public hasWhiteSpaces?: boolean,
      public format?: string,
      public regexString?: string,
      public valueObjectStatus?: string,
      public isrequired?: boolean,
      public hasNumericChar?: boolean,
      public validationType?:string
  ) {}
}

export interface IValueObject {
  dataType?: string;
  domain?: string;
  encrypt?: boolean;
  name?: string;
  regexString?: string;
  validations?: Validation;
}

export class ValueObject implements IValueObject {
  constructor(
      public dataType?: string,
      public domain?: string,
      public encrypt?: boolean,
      public name?: string,
      public regexString?: string,
      public validations?: Validation,
  ) {}
}

export interface IValidation {
  alphabeticChar?: boolean;
  specialChar?: boolean;
  numericChar?: boolean;
  whiteSpaces?: boolean;
  casSensitivity?: boolean;
  requiredChar?: string;
  allowedAlphabeticChar?: string;
  format?: string;
  length?: string;
  range?: string;
}

export class Validation implements IValidation {
  constructor(
      public alphabeticChar?: boolean,
      public specialChar?: boolean,
      public numericChar?: boolean,
      public whiteSpaces?: boolean,
      public casSensitivity?: boolean,
      public requiredChar?: string,
      public allowedAlphabeticChar?: string,
      public format?: string,
      public length?: string,
      public range?: string,
  ) {}
}
