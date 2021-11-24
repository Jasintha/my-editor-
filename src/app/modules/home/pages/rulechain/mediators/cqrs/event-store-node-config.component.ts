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
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, Validators, AbstractControl } from '@angular/forms';
import {
  IRuleNodeConfigurationComponent,
  RuleNodeConfiguration,
  RuleNodeDefinition
} from '@shared/models/rule-node.models';
import { Subscription } from 'rxjs';
import { RuleChainService } from '@core/http/rule-chain.service';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { TranslateService } from '@ngx-translate/core';
import { JsonObjectEditComponent } from '@shared/components/json-object-edit.component';
import { deepClone } from '@core/utils';
import { Observable } from 'rxjs';
import { PageComponent } from '@shared/components/page.component';
import { Store } from '@ngrx/store';
import { AppState } from '@core/core.state';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'virtuan-event-store-node-config',
  templateUrl: './event-store-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => EventStoreNodeConfigComponent),
    multi: true
  }]
})
export class EventStoreNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

  @ViewChild('definedConfigContent', {read: ViewContainerRef, static: true}) definedConfigContainer: ViewContainerRef;

  private requiredValue: boolean;
  get required(): boolean {
    return this.requiredValue;
  }
  @Input()
  set required(value: boolean) {
    this.requiredValue = coerceBooleanProperty(value);
  }

  @Input()
  inputEntities: any[];

  @Input()
  allVariables: any[];

  @Input()
  inputProperties: any[];

  @Input()
  allConstants: any[];

  @Input()
  inputCustomobjects: any[];

  @Input()
  disabled: boolean;

  @Input()
  ruleNodeId: string;

  @Input()
  queryDb: string;

  @Input()
  commandDb: string;

  @Input()
  allRuleInputs: any[];

  @Input()
  allEvents: any[];

  @Input() branchAvailability: any;
  
  @Input()
  allReferenceProperties: any[];
  
  @Input()
  allModelProperties: any[];

  @Input()
  allErrorBranches: any[];

  errordatasource: MatTableDataSource<ErrorFunctionParameters>;
  displayErroredColumns: string[] = ['parameterName', 'inputType', 'input', 'property', 'actions'];

  @Input()
  apptype: string;

  readOnlyDbType: boolean;

  domainModelProperties: any[];
  viewModelProperties: any[];

  nodeDefinitionValue: RuleNodeDefinition;

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

  eventStoreNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;
  
  selectedVariableProperties: any[];
  selectedEntityProperties: any[];
  selectedCustomObjectProperties: any[];

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.eventStoreNodeConfigFormGroup = this.fb.group({
    //  dbType:[],
      dbAction: [],
      event: [],
      errorMsg: "",
      errorAction: "",
      inputType: "",
      constant: [],
      param: [],
      property: [],
      branchparam: [],
      assignedProperty: [],
      assignedtoinputType: "",
      assignedReference: [],
      errorBranch: [],
      errorInputType: [],
      errorIsAsync: false,
      errorBranchparameter: [],
      errorParameterinputType: [],
      errorParameterparam: [],
      errorParameterproperty: [],
      errorParameterbranchparam: []
    });
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  ngOnInit(): void {
    this.readOnlyDbType = false;

  }

  ngOnDestroy(): void {
    if (this.definedConfigComponentRef) {
      this.definedConfigComponentRef.destroy();
    }
  }

  refreshErrorParameterInputTypes(){
    let errorInputType: string = this.eventStoreNodeConfigFormGroup.get('errorParameterinputType').value;
    this.configuration.errorParameterinputType = errorInputType;
    if (errorInputType === 'RULE_INPUT'){
      this.configuration.errorParameterproperty= {};
      this.configuration.errorParameterbranchparam= {};
      this.eventStoreNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
      this.eventStoreNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});
    } else if (errorInputType === 'PROPERTY'){
      this.configuration.errorParameterparam= {};
      this.configuration.errorParameterbranchparam= {};
      this.eventStoreNodeConfigFormGroup.get('parameterbranchparam').patchValue([], {emitEvent: false});
      this.eventStoreNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});
    } else if (errorInputType === 'BRANCH_PARAM'){
      this.configuration.errorParameterparam= {};
      this.configuration.errorParameterproperty= {};
      this.eventStoreNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
      this.eventStoreNodeConfigFormGroup.get('errorParameterparam').patchValue([], {emitEvent: false});
    }
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  deleteErrorRow(index: number): void{
    this.configuration.errorFunctionParameters.splice(index, 1);
    this.errordatasource = new MatTableDataSource(this.configuration.errorFunctionParameters);
    this.updateModel(this.configuration);
  }

  addErrorParameter(): void{

    let errorInputType: string = this.eventStoreNodeConfigFormGroup.get('errorParameterinputType').value;
    let errorBranchparameter = this.eventStoreNodeConfigFormGroup.get('errorBranchparameter').value;

    if (errorInputType === 'RULE_INPUT'){
      let selectedErrorParameterParam = this.eventStoreNodeConfigFormGroup.get('errorParameterparam').value;
      let propName = '';
      if(selectedErrorParameterParam.paramName && selectedErrorParameterParam.paramName != ''){
        propName = selectedErrorParameterParam.paramName;
      } else {
        propName = selectedErrorParameterParam.inputName;
      }
      let errorParameter = {
        'parameterName': errorBranchparameter.name,
        'inputType': errorInputType,
        'input': '-',
        'property': propName
      };
      this.configuration.errorFunctionParameters.push(errorParameter);
      this.updateModel(this.configuration);
    } else if (errorInputType === 'PROPERTY'){
      let selectedErrorParameterProperty = this.eventStoreNodeConfigFormGroup.get('errorParameterproperty').value;
      let errorParameterproperty = {
        'parameterName': errorBranchparameter.name,
        'inputType': errorInputType,
        'input': '-',
        'property': selectedErrorParameterProperty.name
      };
      this.configuration.errorFunctionParameters.push(errorParameterproperty);
      this.updateModel(this.configuration);
    } else if (errorInputType === 'BRANCH_PARAM'){
      let selectedErrorParameterBranch = this.eventStoreNodeConfigFormGroup.get('errorParameterbranchparam').value;
      let errorParameterbranchparam = {
        'parameterName': errorBranchparameter.name,
        'inputType': errorInputType,
        'input': '-',
        'property': selectedErrorParameterBranch.name
      };
      this.configuration.errorFunctionParameters.push(errorParameterbranchparam);
      this.updateModel(this.configuration);
    }

    this.errordatasource = new MatTableDataSource(this.configuration.errorFunctionParameters);

    this.configuration.errorParameterinputType = '';
    this.configuration.errorParameterproperty= {};
    this.configuration.errorParameterparam= {};
    this.configuration.errorBranchparameter= {};
    this.configuration.errorParameterbranchparam= {};

    this.eventStoreNodeConfigFormGroup.get('errorParameterinputType').patchValue([], {emitEvent: false});
    this.eventStoreNodeConfigFormGroup.get('errorParameterparam').patchValue([], {emitEvent: false});
    this.eventStoreNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
    this.eventStoreNodeConfigFormGroup.get('errorBranchparameter').patchValue([], {emitEvent: false});
    this.eventStoreNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});

  }

  refreshInputTypes(){
    let inputType: string = this.eventStoreNodeConfigFormGroup.get('inputType').value;
    this.configuration.inputType = inputType;

     if (inputType === 'CONSTANT'){
      this.configuration.param= {};
      this.configuration.property= {};
      this.configuration.branchparam= {};
      
      this.eventStoreNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.eventStoreNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
      this.eventStoreNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
      
    } else if (inputType === 'RULE_INPUT'){
      this.configuration.constant= {};
      this.configuration.property= {};
      this.configuration.branchparam= {};
      
      this.eventStoreNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.eventStoreNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
      this.eventStoreNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.constant= {};
      this.configuration.param= {};
      this.configuration.branchparam= {};
      this.eventStoreNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.eventStoreNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.eventStoreNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.constant= {};
      this.configuration.param= {};
      this.configuration.property= {};
      this.eventStoreNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.eventStoreNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.eventStoreNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  refreshDbActions(){

    let action: string = this.eventStoreNodeConfigFormGroup.get('dbAction').value;
    this.configuration.dbAction = action;

    if(action === 'FIND' || action === 'DELETE'){

    } else {
    /*
      this.configuration.crudinputType= '';
      this.configuration.crudentity= {};
      this.configuration.crudentityProperty = {};
      this.configuration.crudcustomObject= {};
      this.configuration.crudcustomObjectProperty = {};
      this.configuration.crudparam= {};
      this.configuration.crudvariable= {};
      this.configuration.crudvariableProperty= {};

      this.eventStoreNodeConfigFormGroup.get('crudinputType').patchValue([], {emitEvent: false});
      this.eventStoreNodeConfigFormGroup.get('crudentity').patchValue([], {emitEvent: false});
      this.eventStoreNodeConfigFormGroup.get('crudentityProperty').patchValue([], {emitEvent: false});
      this.eventStoreNodeConfigFormGroup.get('crudcustomObject').patchValue([], {emitEvent: false});
      this.eventStoreNodeConfigFormGroup.get('crudcustomObjectProperty').patchValue([], {emitEvent: false});
      this.eventStoreNodeConfigFormGroup.get('crudparam').patchValue([], {emitEvent: false});
      this.eventStoreNodeConfigFormGroup.get('crudvariable').patchValue([], {emitEvent: false});
      this.eventStoreNodeConfigFormGroup.get('crudvariableProperty').patchValue([], {emitEvent: false});
      */

    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  ngAfterViewInit(): void {
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.eventStoreNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.eventStoreNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {
    this.configuration = deepClone(value);
    
    if(this.configuration.errorFunctionParameters === null || this.configuration.errorFunctionParameters === undefined){
      this.configuration.errorFunctionParameters = [];
    }
    this.errordatasource = new MatTableDataSource(this.configuration.errorFunctionParameters);

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

      //let entity = this.configuration.entity;
      //entity = this.inputEntities.find(x => x.name === this.configuration.entity.name );

      //crud input

      //let dbType = '';
      //if(this.commandDb && this.commandDb !== ''){
      //  dbType = this.commandDb;
      //  this.readOnlyDbType = true;
      //} else {
      //  dbType = this.configuration.dbType;
      //  this.readOnlyDbType = false;
      //}
          
      let param = this.configuration.param;
      if(this.configuration.inputType === 'RULE_INPUT' && this.allRuleInputs){
        param = this.allRuleInputs.find(x => x.inputName === this.configuration.param.inputName && x.paramName === this.configuration.param.paramName );
      }

      let constant = this.configuration.constant;
      if(this.configuration.inputType === 'CONSTANT' && this.allConstants){
        constant = this.allConstants.find(x => x.constantName === this.configuration.constant.constantName );
      }

      let property = this.configuration.property;
      if(this.configuration.inputType === 'PROPERTY' && this.allModelProperties){
        property = this.allModelProperties.find(x => x.name === this.configuration.property.name );
      }

      let branchparam = this.configuration.branchparam;
      if(this.configuration.inputType === 'BRANCH_PARAM' && this.branchAvailability.branchParams){
        branchparam = this.branchAvailability.branchParams.find(x => x.name === this.configuration.branchparam.name );
      }

      let assignedProperty = this.configuration.assignedProperty;
      if(this.configuration.assignedtoinputType === 'PROPERTY' && assignedProperty && this.allModelProperties){
        assignedProperty = this.allModelProperties.find(x => x.name === this.configuration.assignedProperty.name );
      }

      let assignedReference = this.configuration.assignedReference;
      if(this.configuration.assignedtoinputType === 'REFERENCE' && assignedReference && this.allReferenceProperties){
        assignedReference = this.allReferenceProperties.find(x => x.name === this.configuration.assignedReference.name );
      }
      
      let errorBranch = this.configuration.errorBranch;
      if(errorBranch && this.allErrorBranches){
        errorBranch = this.allErrorBranches.find(x => x.name === this.configuration.errorBranch.name );
      }

      this.eventStoreNodeConfigFormGroup.patchValue({
        inputType: this.configuration.inputType,
        //dbType: dbType,
        dbAction: this.configuration.dbAction,
        event: this.configuration.event,
        errorMsg: this.configuration.errorMsg,
        errorAction: this.configuration.errorAction,
        param: param,
        constant: constant,
        property: property,
        branchparam: branchparam,
        assignedProperty: assignedProperty,
        assignedtoinputType: this.configuration.assignedtoinputType,
        assignedReference: assignedReference,
        errorBranch: errorBranch,
        errorInputType: this.configuration.errorInputType,
        errorBranchparameter: this.configuration.errorBranchparameter,
        errorParameterinputType: this.configuration.errorParameterinputType,
        errorParameterparam: this.configuration.errorParameterparam,
        errorParameterproperty: this.configuration.errorParameterproperty,
        errorParameterbranchparam: this.configuration.errorParameterbranchparam,
        errorIsAsync: this.configuration.errorIsAsync
      });

      this.changeSubscription = this.eventStoreNodeConfigFormGroup.get('errorIsAsync').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorIsAsync = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.eventStoreNodeConfigFormGroup.get('errorBranch').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorBranch = configuration;

            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.eventStoreNodeConfigFormGroup.get('errorParameterparam').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorParameterparam = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.eventStoreNodeConfigFormGroup.get('errorParameterbranchparam').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorParameterbranchparam = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.eventStoreNodeConfigFormGroup.get('errorParameterproperty').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorParameterproperty = configuration;
            this.updateModel(this.configuration);
          }
      );
      
      this.changeSubscription = this.eventStoreNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorMsg = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.eventStoreNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
        (configuration: any) => {

          this.configuration.errorAction = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.eventStoreNodeConfigFormGroup.get('dbAction').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.dbAction = configuration;
          this.updateModel(this.configuration);
        }
      );

    /*
      this.changeSubscription = this.eventStoreNodeConfigFormGroup.get('dbType').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.dbType = configuration;
          this.updateModel(this.configuration);
        }
      );
      */

      this.changeSubscription = this.eventStoreNodeConfigFormGroup.get('event').valueChanges.subscribe(
        (configuration: any) => {

          this.configuration.event = configuration;
          this.updateModel(this.configuration);
        }
      );
      
      
      this.changeSubscription = this.eventStoreNodeConfigFormGroup.get('assignedReference').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.assignedReference = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.eventStoreNodeConfigFormGroup.get('assignedtoinputType').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {

          this.configuration.assignedtoinputType = configuration;
          if(this.configuration.assignedtoinputType == 'PROPERTY'){
            this.configuration.assignedReference= {};
            this.eventStoreNodeConfigFormGroup.get('assignedReference').patchValue([], {emitEvent: false});
          }else if (this.configuration.assignedtoinputType == 'REFERENCE'){
            this.configuration.assignedProperty= {};
            this.eventStoreNodeConfigFormGroup.get('assignedProperty').patchValue([], {emitEvent: false});
          }
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.eventStoreNodeConfigFormGroup.get('assignedProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.assignedProperty = configuration;
          this.updateModel(this.configuration);
        }
      );

    /*
      this.changeSubscription = this.eventStoreNodeConfigFormGroup.get('entity').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.entity = configuration;

          //let selectedentity = this.inputEntities.find(x => x.name === configuration.name );
          //if(selectedentity){
          //  this.selectedEntityProperties = selectedentity.properties;
          //}

          this.updateModel(this.configuration);
        }
      );
      */

      this.changeSubscription = this.eventStoreNodeConfigFormGroup.get('param').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.param = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.eventStoreNodeConfigFormGroup.get('constant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.constant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.eventStoreNodeConfigFormGroup.get('property').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.property = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.eventStoreNodeConfigFormGroup.get('branchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.branchparam = configuration;
          this.updateModel(this.configuration);
        }
      );

    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.eventStoreNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}

export interface ErrorFunctionParameters {
  parameterName: string;
  inputType: string;
  input: string;
  property: string;
}