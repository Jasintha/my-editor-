import {
  AfterViewInit,
  Component,
  ComponentRef,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  EventEmitter,
  ViewChild,
  Inject,
  ViewContainerRef
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR,
  Validators,
  AbstractControl
} from '@angular/forms';
import {
  IRuleNodeConfigurationComponent,
  RuleNodeConfiguration,
  RuleNodeDefinition
} from '@shared/models/rule-node.models';
import {ModelSelectionFields, QuestionBase, ValueProperty} from '@shared/models/question-base.models';
import {Subscription} from 'rxjs';
import {RuleChainService} from '@core/http/rule-chain.service';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {TranslateService} from '@ngx-translate/core';
import {JsonObjectEditComponent} from '@shared/components/json-object-edit.component';
import {deepClone} from '@core/utils';
import {Observable} from 'rxjs';
import {PageComponent} from '@shared/components/page.component';
import {Store} from '@ngrx/store';
import {AppState} from '@core/core.state';
import {MatTableDataSource} from '@angular/material/table';
import {B} from "@angular/cdk/keycodes";



@Component({
  selector: 'tb-connector-node-config',
  templateUrl: './connector-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ConnectorNodeConfigComponent),
    multi: true
  }]
})
export class ConnectorNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

  @ViewChild('definedConfigContent', {read: ViewContainerRef, static: true}) definedConfigContainer: ViewContainerRef;

  @Input() fields: QuestionBase[] = [];

  connectorConfigFormGroup: FormGroup;

  private requiredValue: boolean;

  get required(): boolean {
    return this.requiredValue;
  }

  @Input()
  set required(value: boolean) {
    this.requiredValue = coerceBooleanProperty(value);
  }

  @Input()
  disabled: boolean;

  @Input()
  ruleNodeId: string;

  @Input()
  nodeClazz: string;

  @Input()
  inputEntities: any[];

  @Input()
  ruleEntities: any[];

  @Input()
  inputCustomobjects: any[];

  @Input()
  inputProperties: any[];

  @Input()
  allFields: any[];

  @Input()
  allConstants: any[];

  @Input()
  allSavedObjects: any[];

  @Input()
  allVariables: any[];

  @Input()
  allValueObjectProperties: any[];

  @Input() branchAvailability: any;

  tabledatasource = {} ;
  allRuleProperties:ModelValueproperties[] =[
    {
      type: "PROPERTY",
      name: "cusname",
      valuetype: "primitive"
    },
    {
      type: "PROPERTY",
      name: "cusproduct",
      valuetype: "object"
    },
    {
      type: "PROPERTY",
      name: "cusorders",
      valuetype: "list"
    },
    {
      type: "CONSTANT",
      name: "useremail",
      valuetype: "primitive"
    },
    {
      type: "PARAM",
      name: "id",
      valuetype: "primitive"
    }
  ];


  nodeDefinitionValue: RuleNodeDefinition;


  testfields: QuestionBase[] = [
    {
      controlType: "textbox",
      key: "firstName",
      label: "First name",
      order: 1,
      required: true,
      value: ""
    },
    {
      controlType: "textbox",
      key: "emailAddress",
      label: "Email",
      value: "",
      type: "email",
      order: 2,
      required: true
    },
    {
      controlType: "dropdown",
      type: "multiple",
      key: "brave",
      value: "",
      label: "Bravery Rating",
      options: [
        {
          key: "solid",
          value: "Solid"
        }
      ],
      order: 5,
      required: true
    },
    {
      controlType: "dynamic_object",
      key: "prices",
      label: "price",
      order: 6
    }
  ];

  @Input()
  set nodeDefinition(nodeDefinition: RuleNodeDefinition) {
    if (this.nodeDefinitionValue !== nodeDefinition) {
      this.nodeDefinitionValue = nodeDefinition;
      if (this.nodeDefinitionValue) {
        // this.validateDefinedDirective();
      }
    }
  }

  get nodeDefinition(): RuleNodeDefinition {
    return this.nodeDefinitionValue;
  }

  definedDirectiveError: string;

  changeSubscription: Subscription;

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => {
  };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder)
  {
  }


  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  ngOnInit(): void {
    this.fields.forEach(question =>{
      if (question.controlType == "table"){
        this.tabledatasource[question.key] = new MatTableDataSource<any>();
      }
    });

    if(this.fields){
        for(let i = 0; i < this.fields.length; i++){
            if (this.checkControlType(this.fields[i].controlType)){
                this.fields[i].options = this.generatePropertyArray(this.fields[i].controlType);
            } else if(this.checkType(this.fields[i].controlType)){
                this.fields[i].options = this.generatePrimitiveArray(this.fields[i].controlType);
            }

            if (this.fields[i].controlType == "table"){
                for (let j = 0; j < this.fields[i].tableFields.length; j++){
                  if (this.checkControlType(this.fields[i].tableFields[j].controlType)){
                    this.fields[i].tableFields[j].options = this.generatePropertyArray(this.fields[i].tableFields[j].controlType);
                  } else if(this.checkType(this.fields[i].tableFields[j].controlType)){
                    this.fields[i].tableFields[j].options = this.generatePrimitiveArray(this.fields[i].tableFields[j].controlType);
                  }
                }
            }

        }
    }

    this.connectorConfigFormGroup = this.toFormGroup(this.fields);
  }

  checkIfControlTypeOrType(tableField: QuestionBase):boolean{
    return this.checkControlType(tableField.controlType) || this.checkType(tableField.controlType);
  }

  getTableDataSource(tableField: QuestionBase):any{
    return this.tabledatasource[tableField.key]
  }

  setDisplayedColumns(tableField: QuestionBase[]):string[]{
    const displayedColumns: string[] = [];
    for (let i = 0; i < tableField.length ; i++) {
      displayedColumns.push(tableField[i].key)
    }
    displayedColumns.push("actions")
    return displayedColumns
  }

  addTable(tableField: QuestionBase):void{
    let table={}
    for (let i = 0; i < tableField.tableFields.length ; i++) {
      table[tableField.tableFields[i].key] = this.connectorConfigFormGroup.get(tableField.tableFields[i].key).value
    }
    this.configuration.connector[tableField.key].push(table);
    this.updateModel(this.configuration);
    this.tabledatasource[tableField.key] = new MatTableDataSource(this.configuration.connector[tableField.key]);
    tableField.tableFields.forEach(question =>{
      this.connectorConfigFormGroup.get(question.key).patchValue("", {emitEvent: false});
      if (question.controlType == "textbox" ){
        this.configuration.connector[question.key]= "";
      } else if (question.controlType == "dropdown"){
        this.configuration.connector[question.key]={};
      } else if (question.controlType == "table"){
        this.configuration.connector[question.key]=[];
      }
    });
  }

  deleteRow(index: number, tableField: QuestionBase): void{
    this.configuration.connector[tableField.key].splice(index, 1);
    this.tabledatasource[tableField.key] = new MatTableDataSource(this.configuration.connector[tableField.key]);
    this.updateModel(this.configuration);
  }


  toFormGroup(questions: QuestionBase[]) {
    const group: any = {};

    questions.forEach(question => {
      if (question.controlType == "table"){
        question.tableFields.forEach(tableField => {
          group[tableField.key] = tableField.required ? new FormControl(tableField.value || '', Validators.required)
              : new FormControl(tableField.value || '');
        })
      }else {
        group[question.key] = question.required ? new FormControl(question.value || '', Validators.required)
            : new FormControl(question.value || '');
      }
    });
    return new FormGroup(group);
  }

  ngOnDestroy(): void {
    if (this.definedConfigComponentRef) {
      this.definedConfigComponentRef.destroy();
    }
  }

  ngAfterViewInit(): void {

  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.connectorConfigFormGroup.disable({emitEvent: false});
    } else {
      this.connectorConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);

    this.fields.forEach(question => {
      if (question.controlType == "table"){
        if (this.configuration.connector[question.key] == null || this.configuration.connector[question.key] == undefined){
          this.configuration.connector[question.key] = [];
        } else {
          this.tabledatasource[question.key] = new MatTableDataSource(this.configuration.connector[question.key]);
        }
      }
    });

    if (this.changeSubscription) {
      this.changeSubscription.unsubscribe();
      this.changeSubscription = null;
    }
    if (this.definedConfigComponent) {
      this.definedConfigComponent.configuration = this.configuration;
      this.changeSubscription = this.definedConfigComponent.configurationChanged.subscribe((configuration) => {
        this.updateModel(configuration);
      });
    } else {

      this.fields.forEach(question => {
        if (question.controlType == "table"){
          question.tableFields.forEach(tableField => {
            let fieldValue = this.configuration.connector[tableField.key];
            if (this.checkControlType(tableField.controlType)) {
              if (fieldValue) {
                fieldValue = tableField.options.find(x => x.type === fieldValue.type && x.name === fieldValue.name);
              }
            } else if (this.checkType(tableField.controlType)) {
              if (fieldValue) {
                fieldValue = tableField.options.find(x => x.type === fieldValue.type && x.name === fieldValue.name);
              }
            }
            this.connectorConfigFormGroup.get(tableField.key).patchValue(fieldValue, {emitEvent: false});

            //this.connectorConfigFormGroup.get(tableField.key).patchValue(this.configuration.connector[tableField.key], {emitEvent: false});
            this.changeSubscription = this.connectorConfigFormGroup.get(tableField.key).valueChanges.subscribe(
                (configuration: RuleNodeConfiguration) => {
                  this.configuration.connector[tableField.key] = configuration;
                  this.updateModel(this.configuration);
                }
            );
          });
        }else {
          let fieldValue = this.configuration.connector[question.key];
          if (this.checkControlType(question.controlType)) {
            if (fieldValue) {
              fieldValue = question.options.find(x => x.type === fieldValue.type && x.name === fieldValue.name);
            }
          } else if (this.checkType(question.controlType)) {
            if (fieldValue) {
              fieldValue = question.options.find(x => x.type === fieldValue.type && x.name === fieldValue.name);
            }
          }
          this.connectorConfigFormGroup.get(question.key).patchValue(fieldValue, {emitEvent: false});

          //this.connectorConfigFormGroup.get(question.key).patchValue(this.configuration.connector[question.key], {emitEvent: false});
          this.changeSubscription = this.connectorConfigFormGroup.get(question.key).valueChanges.subscribe(
              (configuration: RuleNodeConfiguration) => {
                this.configuration.connector[question.key] = configuration;
                this.updateModel(this.configuration);
              }
          );
        }
      });

    }


  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.connectorConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

  checkControlType(contain: string):boolean{
    //contain.includes static||dynamic_object||dynamic_value--->true
    return contain.includes('static') || contain.includes('dynamic_object') || contain.includes('dynamic_value') || contain.includes('reference_value') || contain.includes('reference_object');
  }

  checkType(contain: string):boolean{
    return contain.includes('type_object') || contain.includes('type_primitive');
  }

  generatePropertyArray(controlType: string): Array<any> {
    let proArray = [];
    let isStatic = controlType.includes('static');
    let isDynamic_object = controlType.includes('dynamic_object');
    let isDynamic_value = controlType.includes('dynamic_value');
    let isReference_object = controlType.includes('reference_object');
    let isReference_value = controlType.includes('reference_value');
    if(this.allValueObjectProperties){
        let A_Array = this.allValueObjectProperties.filter(property =>
            property.type == 'PARAM' || (property.type == 'PROPERTY' && property.valueType == 'primitive' ));

        let B_Array = this.allValueObjectProperties.filter(property =>
            property.type == 'PROPERTY' && property.valueType == 'object');

        let C_Array = this.allValueObjectProperties.filter(property =>
            property.type == 'CONSTANT');

        let D_Array = this.allValueObjectProperties.filter(property =>
            property.type == 'REFERENCE' && property.valueType == 'primitive' );

        let E_Array = this.allValueObjectProperties.filter(property =>
            property.type == 'REFERENCE' && property.valueType == 'object');

        if (isDynamic_value === true){proArray = proArray.concat(A_Array);}
        if (isDynamic_object === true){proArray =proArray.concat(B_Array);}
        if (isStatic === true){proArray =proArray.concat(C_Array);}
        if (isReference_value === true){proArray =proArray.concat(D_Array);}
        if (isReference_object === true){proArray =proArray.concat(E_Array);}

    }
  return proArray;
  }

  generatePrimitiveArray(type: string): Array<any> {
    let primArray = [];
    let isPrimitive = type.includes('type_primitive');
    let isDTO = type.includes('type_object');

    let A_Array: ModelPrimitiveObjectProperty[] = [
    {
        type: 'PRIMITIVE',
        name: 'TEXT'
    },
    {
        type: 'PRIMITIVE',
        name: 'NUMBER'
    },
    {
        type: 'PRIMITIVE',
        name: 'FLOAT'
    },
    {
        type: 'PRIMITIVE',
        name: 'DATE'
    },
    {
        type: 'PRIMITIVE',
        name: 'TRUE_OR_FALSE'
    }
    ];


    let B_Array : ModelPrimitiveObjectProperty[] = [];

    if(this.inputCustomobjects){
        for(let i= 0; i < this.inputCustomobjects.length; i++){
            let dto: ModelPrimitiveObjectProperty = {
                type: 'DTO',
                name: this.inputCustomobjects[i].name
            };
            B_Array.push(dto);
        }
    }

    if(this.inputEntities){
        for(let i= 0; i < this.inputEntities.length; i++){
            let model: ModelPrimitiveObjectProperty = {
                type: 'MODEL',
                name: this.inputEntities[i].name
            };
            B_Array.push(model);
        }
    }

    if (isPrimitive === false && isDTO === false) {
      //primArray = [];
    } else if (isPrimitive === false && isDTO === true) {
      primArray = B_Array;
    } else if (isPrimitive === true && isDTO === false) {
      primArray = A_Array;
    } else if (isPrimitive === true && isDTO === true) {
      primArray = A_Array.concat(B_Array);
    }
    return primArray;
  }

}

class ModelValueproperties{
  type: string;
  name: string;
  valuetype: string;
}

class ModelPrimitiveObjectProperty{
  type: string;
  name: string;
}


