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
  selector: 'virtuan-call-node-config',
  templateUrl: './call-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CallNodeConfigComponent),
    multi: true
  }]
})
export class CallNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
  allRoots: any[];

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
  allModelProperties: any[];

  @Input() branchAvailability: any;

  @Input()
  apptype: string;

  @Input()
  allRuleInputs: any[];

  @Input()
  allErrorBranches: any[];

    domainModelProperties: any[];
    viewModelProperties: any[];

  @Input()
  disabled: boolean;

  @Input()
  ruleNodeId: string;

   @Input()
   allReferenceProperties: any[];

   @Input()
   allMicroservices: any[];

   apiItems: any[];

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

  callNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;
  
  selectedVariableProperties: any[];
  selectedVariablePropertiesForParameter: any[];
  
  targetdatasource: MatTableDataSource<Target>;
  calldatasource: MatTableDataSource<CallProperty>;

  displayedColumns: string[] = ['targetType', 'keyPropertyType', 'keyProperty', 'keyRaw', 'valuePropertyType', 'valueProperty', 'valueRaw', 'actions'];
  calldisplayedColumns: string[] = ['name', 'value', 'actions'];

  errordatasource: MatTableDataSource<ErrorFunctionParameters>;
  displayErroredColumns: string[] = ['parameterName', 'inputType', 'input', 'property', 'actions'];

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.callNodeConfigFormGroup = this.fb.group({
      url: "",
      callAction: "",
      targetParameterType: "",
      targetQueryType: "",
      targetBodyType: "",
      targetName: "",
      callName: "",
      callValue: "",
      callreturnrecord: "",
      callreturninputType: [],
      callreturnentity: [],
      callreturncustomObject: [],
      calltargetbranchparam: [],
      errorMsg: "",
      errorAction: "",
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
      errorParameterbranchparam: [],
      keyType: [],
      valueType: [],
      key: [],
      keyinputType: [],
      keyconstant: [],
      keyproperty: [],
      value: [],
      valueinputType: [],
      valueconstant: [],
      valueproperty: [],
      valueparam: [],
      valuebranchparam: [],
      isInternal: false,
      microservice:[],
      microserviceApi:[]
    });
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  ngOnInit(): void {

  }

  refreshMicroservices() {
    this.apiItems = [];
    const microservice = this.callNodeConfigFormGroup.get(['microservice']).value;

    this.configuration.microservice= microservice.name;
    this.configuration.apiresourcepath= '';
    this.updateModel(this.configuration);

    if (microservice.microserviceApis) {
      for (let i = 0; i < microservice.microserviceApis.length; i++) {
        const apiObj = {
          'apiType': 'API',
          'api': microservice.microserviceApis[i],
        };
        this.apiItems.push(apiObj);
      }
    }

    if (microservice.commands) {
      for (let i = 0; i < microservice.commands.length; i++) {
        const commandObj = {
          'apiType': 'COMMAND',
          'api': microservice.commands[i],
        };
        this.apiItems.push(commandObj);
      }
    }

    if (microservice.queries) {
      for (let i = 0; i < microservice.queries.length; i++) {
        const queryObj = {
          'apiType': 'QUERY',
          'api': microservice.queries[i],
        };
        this.apiItems.push(queryObj);
      }
    }
  }

  onChangeMicroserviceAPI() {
    const api = this.callNodeConfigFormGroup.get(['microserviceApi']).value;
    if (api) {
      const apiStart: boolean = api.resourcePath.startsWith('/');
      let suggestedPath = '';
      if (apiStart) {
        suggestedPath = api.resourcePath;
      } else {
        suggestedPath = '/' + api.resourcePath;
      }
      this.configuration.apiresourcepath= suggestedPath;
      this.updateModel(this.configuration);
    }
  }
  ngOnDestroy(): void {
    if (this.definedConfigComponentRef) {
      this.definedConfigComponentRef.destroy();
    }
  }

  refreshErrorParameterInputTypes(){
    let errorInputType: string = this.callNodeConfigFormGroup.get('errorParameterinputType').value;
    this.configuration.errorParameterinputType = errorInputType;
    if (errorInputType === 'RULE_INPUT'){
      this.configuration.errorParameterproperty= {};
      this.configuration.errorParameterbranchparam= {};
      this.callNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
      this.callNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});
    } else if (errorInputType === 'PROPERTY'){
      this.configuration.errorParameterparam= {};
      this.configuration.errorParameterbranchparam= {};
      this.callNodeConfigFormGroup.get('parameterbranchparam').patchValue([], {emitEvent: false});
      this.callNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});
    } else if (errorInputType === 'BRANCH_PARAM'){
      this.configuration.errorParameterparam= {};
      this.configuration.errorParameterproperty= {};
      this.callNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
      this.callNodeConfigFormGroup.get('errorParameterparam').patchValue([], {emitEvent: false});
    }
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  refreshValueInputTypes(){
    let inputType: string = this.callNodeConfigFormGroup.get('valueinputType').value;
    this.configuration.valueinputType = inputType;
    if (inputType === 'CONSTANT'){
      this.configuration.valueparam= {};
      this.configuration.valueproperty= {};
      this.configuration.valuebranchparam= {};
      this.callNodeConfigFormGroup.get('valueparam').patchValue([], {emitEvent: false});
      this.callNodeConfigFormGroup.get('valueproperty').patchValue([], {emitEvent: false});
      this.callNodeConfigFormGroup.get('valuebranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'RULE_INPUT'){
      this.configuration.valueconstant= {};
      this.configuration.valueproperty= {};
      this.configuration.valuebranchparam= {};
      this.callNodeConfigFormGroup.get('valueconstant').patchValue([], {emitEvent: false});
      this.callNodeConfigFormGroup.get('valueproperty').patchValue([], {emitEvent: false});
      this.callNodeConfigFormGroup.get('valuebranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.valueconstant= {};
      this.configuration.valueparam= {};
      this.configuration.valuebranchparam= {};
      this.callNodeConfigFormGroup.get('valueconstant').patchValue([], {emitEvent: false});
      this.callNodeConfigFormGroup.get('valueparam').patchValue([], {emitEvent: false});
      this.callNodeConfigFormGroup.get('valuebranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.valueconstant= {};
      this.configuration.valueparam= {};
      this.configuration.valueproperty= {};
      this.callNodeConfigFormGroup.get('valueconstant').patchValue([], {emitEvent: false});
      this.callNodeConfigFormGroup.get('valueparam').patchValue([], {emitEvent: false});
      this.callNodeConfigFormGroup.get('valueproperty').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  refreshKeyInputTypes(){
    let inputType: string = this.callNodeConfigFormGroup.get('keyinputType').value;
    this.configuration.keyinputType = inputType;
    if (inputType === 'CONSTANT'){
      this.configuration.keyproperty= {};
      this.callNodeConfigFormGroup.get('keyproperty').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.keyconstant= {};
      this.callNodeConfigFormGroup.get('keyconstant').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  addTarget(): void{


    let targetType: string = this.callNodeConfigFormGroup.get('targetParameterType').value;
    let targetQueryType: string = this.callNodeConfigFormGroup.get('targetQueryType').value;
    let targetBodyType: string = this.callNodeConfigFormGroup.get('targetBodyType').value;
    let finalTargetType : string = '';
    if (targetType === "HEADER"){
      finalTargetType = 'HEADER';
    } else if (targetType === "QUERY"){
      finalTargetType = targetQueryType;
    } else if (targetType === "BODY"){
      finalTargetType = targetBodyType;
    }


    let keyInputType: string = this.callNodeConfigFormGroup.get('keyType').value;
    let valueInputType: string = this.callNodeConfigFormGroup.get('valueType').value;

    let keyPropertyType: string = this.callNodeConfigFormGroup.get('keyinputType').value;
    // let keyProperty: string = this.callNodeConfigFormGroup.get('valueType').value;
    let valuePropertyType: string = this.callNodeConfigFormGroup.get('valueinputType').value;
    // let valueProperty: string = this.callNodeConfigFormGroup.get('valueType').value;

    let keyRaw: string = this.callNodeConfigFormGroup.get('key').value;
    let valueRaw: string = this.callNodeConfigFormGroup.get('value').value;


    let targetParameter: Target = new CTarget();

    targetParameter.targetType = finalTargetType;
    targetParameter.valueInputType = valueInputType;
    targetParameter.keyInputType = keyInputType;
    if (finalTargetType === 'BODY_RAW'){
      targetParameter.keyInputType = '-';
    }

    if (keyInputType === 'IN-LINE'){
      targetParameter.keyRaw = keyRaw;
      targetParameter.keyProperty = '-';
      targetParameter.keyPropertyType = '-';
    }
    if (valueInputType === 'IN-LINE'){
      targetParameter.valueRaw = valueRaw;
      targetParameter.valueProperty = '-';
      targetParameter.valuePropertyType = '-';
    }

    if (keyInputType === 'PROPERTY'){
      targetParameter.keyRaw = '-';
      targetParameter.keyPropertyType = keyPropertyType;
      if (keyPropertyType === 'CONSTANT'){
        let selectedKeyConstant = this.callNodeConfigFormGroup.get('keyconstant').value;
        targetParameter.keyPropertyScope = selectedKeyConstant.scope;
        targetParameter.keyProperty = selectedKeyConstant.constantName;
      } else if (keyPropertyType === 'PROPERTY'){
        let selectedKeyProperty = this.callNodeConfigFormGroup.get('keyproperty').value;
        targetParameter.keyPropertyScope = selectedKeyProperty.propertyScope;
        targetParameter.keyProperty = selectedKeyProperty.name;
      }
    }

    if (valueInputType === 'PROPERTY'){
      targetParameter.valueRaw = '-';
      targetParameter.valuePropertyType = valuePropertyType;
      if (valuePropertyType === 'CONSTANT'){
        let selectedValueConstant = this.callNodeConfigFormGroup.get('valueconstant').value;
        targetParameter.valuePropertyScope = selectedValueConstant.scope;
        targetParameter.valueProperty = selectedValueConstant.constantName;
      } else if (valuePropertyType === 'PROPERTY'){
        let selectedValueProperty = this.callNodeConfigFormGroup.get('valueproperty').value;
        targetParameter.valuePropertyScope = selectedValueProperty.propertyScope;
        targetParameter.valueProperty = selectedValueProperty.name;
      } else if (valuePropertyType === 'RULE_INPUT'){
        let selectedValueRuleProperty = this.callNodeConfigFormGroup.get('valueparam').value;
        targetParameter.valuePropertyScope = '-';
        targetParameter.valueProperty = selectedValueRuleProperty.inputName;
      } else if (valuePropertyType === 'BRANCH_PARAM'){
        let selectedValueBranchParam = this.callNodeConfigFormGroup.get('valuebranchparam').value;
        targetParameter.valuePropertyScope = selectedValueBranchParam.propertyScope;
        targetParameter.valueProperty = selectedValueBranchParam.name;
      }
    }

    if (finalTargetType === 'BODY_RAW'){
      targetParameter.keyRaw = '-';
      targetParameter.keyPropertyType = '-';
      targetParameter.keyProperty = '-';
    }

    this.configuration.callTargets.push(targetParameter);
    this.updateModel(this.configuration);

    this.targetdatasource = new MatTableDataSource(this.configuration.callTargets);

    this.configuration.key = '';
    this.configuration.keyinputType= '';
    this.configuration.keyconstant= '';
    this.configuration.keyproperty= {};
    this.configuration.value= '';
    this.configuration.valueinputType= '';
    this.configuration.valueconstant= {};
    this.configuration.valueproperty= {};
    this.configuration.valueparam= {};
    this.configuration.valuebranchparam= {};

    this.callNodeConfigFormGroup.get('key').patchValue('', {emitEvent: false});
    this.callNodeConfigFormGroup.get('keyinputType').patchValue('', {emitEvent: false});
    this.callNodeConfigFormGroup.get('keyconstant').patchValue('', {emitEvent: false});
    this.callNodeConfigFormGroup.get('keyproperty').patchValue([], {emitEvent: false});
    this.callNodeConfigFormGroup.get('value').patchValue([], {emitEvent: false});
    this.callNodeConfigFormGroup.get('valueinputType').patchValue([], {emitEvent: false});
    this.callNodeConfigFormGroup.get('valueconstant').patchValue([], {emitEvent: false});
    this.callNodeConfigFormGroup.get('valueproperty').patchValue([], {emitEvent: false});
    this.callNodeConfigFormGroup.get('valueparam').patchValue([], {emitEvent: false});
    this.callNodeConfigFormGroup.get('valuebranchparam').patchValue([], {emitEvent: false});


  }

  deleteErrorRow(index: number): void{
    this.configuration.errorFunctionParameters.splice(index, 1);
    this.errordatasource = new MatTableDataSource(this.configuration.errorFunctionParameters);
    this.updateModel(this.configuration);
  }

  addErrorParameter(): void{

    let errorInputType: string = this.callNodeConfigFormGroup.get('errorParameterinputType').value;
    let errorBranchparameter = this.callNodeConfigFormGroup.get('errorBranchparameter').value;

    if (errorInputType === 'RULE_INPUT'){
      let selectedErrorParameterParam = this.callNodeConfigFormGroup.get('errorParameterparam').value;
      let errorParameter = {
        'parameterName': errorBranchparameter.name,
        'inputType': errorInputType,
        'input': '-',
        'property': selectedErrorParameterParam.inputName
      };
      this.configuration.errorFunctionParameters.push(errorParameter);
      this.updateModel(this.configuration);
    } else if (errorInputType === 'PROPERTY'){
      let selectedErrorParameterProperty = this.callNodeConfigFormGroup.get('errorParameterproperty').value;
      let errorParameterproperty = {
        'parameterName': errorBranchparameter.name,
        'inputType': errorInputType,
        'input': '-',
        'property': selectedErrorParameterProperty.name
      };
      this.configuration.errorFunctionParameters.push(errorParameterproperty);
      this.updateModel(this.configuration);
    } else if (errorInputType === 'BRANCH_PARAM'){
      let selectedErrorParameterBranch = this.callNodeConfigFormGroup.get('errorParameterbranchparam').value;
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

    this.callNodeConfigFormGroup.get('errorParameterinputType').patchValue([], {emitEvent: false});
    this.callNodeConfigFormGroup.get('errorParameterparam').patchValue([], {emitEvent: false});
    this.callNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
    this.callNodeConfigFormGroup.get('errorBranchparameter').patchValue([], {emitEvent: false});
    this.callNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});

  }

  deleteRow(index: number): void{
    this.configuration.callTargets.splice(index, 1);
    this.targetdatasource = new MatTableDataSource(this.configuration.callTargets);
    this.updateModel(this.configuration);
  }

  addCallProperties(): void{
    let callName: string = this.callNodeConfigFormGroup.get('callName').value;
    let callValue: string = this.callNodeConfigFormGroup.get('callValue').value;

    let callproperty = {
        'name': callName,
        'value': callValue
    };

    this.configuration.callProperties.push(callproperty);
    this.updateModel(this.configuration);
    this.calldatasource = new MatTableDataSource(this.configuration.callProperties);
    this.callNodeConfigFormGroup.get('callName').patchValue('', {emitEvent: false});
    this.callNodeConfigFormGroup.get('callValue').patchValue('', {emitEvent: false});

  }

  deleteCallPropertyRow(index: number): void{
    this.configuration.callProperties.splice(index, 1);
    this.calldatasource = new MatTableDataSource(this.configuration.callProperties);
    this.updateModel(this.configuration);
  }

  ngAfterViewInit(): void {
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.callNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.callNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {
    this.apiItems = [];
    this.configuration = deepClone(value);
    
    if(this.configuration.callTargets){
    } else {
        this.configuration.callTargets = [];
    }
    
    if(this.configuration.callProperties){
    } else {
        this.configuration.callProperties = [];
    }

    if(this.configuration.errorFunctionParameters === null || this.configuration.errorFunctionParameters === undefined){
      this.configuration.errorFunctionParameters = [];
    }
    this.errordatasource = new MatTableDataSource(this.configuration.errorFunctionParameters);

    this.targetdatasource = new MatTableDataSource(this.configuration.callTargets);
    this.calldatasource = new MatTableDataSource(this.configuration.callProperties);
    
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

      let customObject = this.configuration.callreturncustomObject;
      if(customObject){
        customObject = this.inputCustomobjects.find(x => x.name === this.configuration.callreturncustomObject.name );
      }

      let errorBranch = this.configuration.errorBranch;
      if(errorBranch && this.allErrorBranches){
        errorBranch = this.allErrorBranches.find(x => x.name === this.configuration.errorBranch.name );
      }

      let microservice;
      let microserviceApi;
      let microserviceName = this.configuration.microservice;
      let microserviceResourcePath = this.configuration.apiresourcepath;
      if (this.configuration.isInternal && microserviceName && this.allMicroservices){
        microservice = this.allMicroservices.find(x => x.name === microserviceName );

        if (microservice && microservice.microserviceApis) {
          for (let i = 0; i < microservice.microserviceApis.length; i++) {
            const apiObj = {
              'apiType': 'API',
              'api': microservice.microserviceApis[i],
            };
            this.apiItems.push(apiObj);
          }
        }

        if (microservice && microservice.commands) {
          for (let i = 0; i < microservice.commands.length; i++) {
            const commandObj = {
              'apiType': 'COMMAND',
              'api': microservice.commands[i],
            };
            this.apiItems.push(commandObj);
          }
        }

        if (microservice && microservice.queries) {
          for (let i = 0; i < microservice.queries.length; i++) {
            const queryObj = {
              'apiType': 'QUERY',
              'api': microservice.queries[i],
            };
            this.apiItems.push(queryObj);
          }
        }

        let searchedmicroserviceApi = this.apiItems.find(x => x.api.resourcePath === microserviceResourcePath);
        if(searchedmicroserviceApi){
            microserviceApi = searchedmicroserviceApi.api;
        }

      }

      let entity = this.configuration.callreturnentity;
      if(entity){
        entity = this.inputEntities.find(x => x.name === this.configuration.callreturnentity.name );
      }

      let assignedProperty = this.configuration.assignedProperty;
      if(this.configuration.assignedtoinputType === 'PROPERTY' && assignedProperty && this.allModelProperties){
        assignedProperty = this.allModelProperties.find(x => x.name === this.configuration.assignedProperty.name );
      }

      let assignedReference = this.configuration.assignedReference;
      if(this.configuration.assignedtoinputType === 'REFERENCE' && assignedReference && this.allReferenceProperties){
        assignedReference = this.allReferenceProperties.find(x => x.name === this.configuration.assignedReference.name );
      }

      this.callNodeConfigFormGroup.patchValue({
        url: this.configuration.url,
        callAction: this.configuration.callAction,
        targetParameterType: this.configuration.targetParameterType,
        targetQueryType: this.configuration.targetQueryType,
        targetBodyType: this.configuration.targetBodyType,
        targetName: this.configuration.targetName,
        callName: this.configuration.callName,
        callValue: this.configuration.callValue,
        callreturnrecord: this.configuration.callreturnrecord,
        callreturninputType: this.configuration.callreturninputType,
        callreturnentity: entity,
        callreturncustomObject: customObject,
        calltargetbranchparam: this.configuration.calltargetbranchparam,
        errorMsg: this.configuration.errorMsg,
        errorAction: this.configuration.errorAction,
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
        errorIsAsync: this.configuration.errorIsAsync,
        key: this.configuration.key,
        keyType: this.configuration.keyType,
        valueType: this.configuration.valueType,
        keyinputType: this.configuration.keyinputType,
        keyconstant: this.configuration.keyconstant,
        keyproperty: this.configuration.keyproperty,
        value: this.configuration.value,
        valueinputType: this.configuration.valueinputType,
        valueconstant: this.configuration.valueconstant,
        valueproperty: this.configuration.valueproperty,
        valueparam: this.configuration.valueparam,
        valuebranchparam: this.configuration.valuebranchparam,
        isInternal: this.configuration.isInternal,
        microservice: microservice,
        microserviceApi: microserviceApi
      });

      this.changeSubscription = this.callNodeConfigFormGroup.get('isInternal').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.isInternal = configuration;
          if(configuration){
            this.configuration.url = '';
          } else {
            this.configuration.microservice= '';
            this.configuration.apiresourcepath= '';
          }
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('assignedProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.assignedProperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('assignedReference').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.assignedReference = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('assignedtoinputType').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {

          this.configuration.assignedtoinputType = configuration;
          if(this.configuration.assignedtoinputType == 'PROPERTY'){
            this.configuration.assignedReference= {};
            this.callNodeConfigFormGroup.get('assignedReference').patchValue([], {emitEvent: false});
          }else if (this.configuration.assignedtoinputType == 'REFERENCE'){
            this.configuration.assignedProperty= {};
            this.callNodeConfigFormGroup.get('assignedProperty').patchValue([], {emitEvent: false});
          }
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('errorIsAsync').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorIsAsync = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('errorBranch').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorBranch = configuration;

            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('errorParameterparam').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorParameterparam = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('errorParameterbranchparam').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorParameterbranchparam = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('errorParameterproperty').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorParameterproperty = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('url').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.url = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('callAction').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.callAction = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('targetParameterType').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.targetParameterType = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('targetQueryType').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.targetQueryType = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('targetBodyType').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.targetBodyType = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('targetName').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.targetName = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('callName').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.callName = configuration;
          this.updateModel(this.configuration);
        }
      );
      
      this.changeSubscription = this.callNodeConfigFormGroup.get('callValue').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.callValue = configuration;
          this.updateModel(this.configuration);
        }
      );
      
      this.changeSubscription = this.callNodeConfigFormGroup.get('callreturnrecord').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.callreturnrecord = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('calltargetbranchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.calltargetbranchparam = configuration;
          this.updateModel(this.configuration);
        }
      );
      
      this.changeSubscription = this.callNodeConfigFormGroup.get('callreturninputType').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.callreturninputType = configuration;
          if(this.configuration.callreturninputType == 'MODEL'){
            this.configuration.callreturncustomObject= {};
            this.callNodeConfigFormGroup.get('callreturncustomObject').patchValue([], {emitEvent: false});
          }else if (this.configuration.callreturninputType == 'DTO'){
            this.configuration.callreturnentity= {};
            this.callNodeConfigFormGroup.get('callreturnentity').patchValue([], {emitEvent: false});
          } 
          
          this.updateModel(this.configuration);
        }
      );
      
      this.changeSubscription = this.callNodeConfigFormGroup.get('callreturncustomObject').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.callreturncustomObject = configuration;
          this.configuration.callreturnentity = {};
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('callreturnentity').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.callreturnentity = configuration;
          this.configuration.callreturncustomObject = {};
          this.updateModel(this.configuration);
        }
      );
      
      this.changeSubscription = this.callNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorMsg = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
        (configuration: any) => {

          this.configuration.errorAction = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('keyType').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.keyType = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('valueType').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.valueType = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('key').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.key = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('keyinputType').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.keyinputType = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('keyconstant').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.keyconstant = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('keyproperty').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.keyproperty = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('value').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.value = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('valueinputType').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.valueinputType = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('valueconstant').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.valueconstant = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('valueproperty').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.valueproperty = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('valueparam').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.valueparam = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.callNodeConfigFormGroup.get('valuebranchparam').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.valuebranchparam = configuration;
            this.updateModel(this.configuration);
          }
      );

    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.callNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}

export interface Target {
  targetType: string,
  keyInputType: string,
  keyRaw: string,
  keyPropertyType: string,
  keyPropertyScope: string,
  keyProperty: string,
  valueInputType: string,
  valueRaw: string,
  valuePropertyType: string,
  valuePropertyScope: string,
  valueProperty: string
}

class CTarget implements Target{
  keyInputType: string;
  keyProperty: string;
  keyPropertyType: string;
  keyPropertyScope: string;
  keyRaw: string;
  targetType: string;
  valueInputType: string;
  valueProperty: string;
  valuePropertyType: string;
  valuePropertyScope: string;
  valueRaw: string;
}

export interface CallProperty {
  name: string;
  value: string;
}

export interface ErrorFunctionParameters {
  parameterName: string;
  inputType: string;
  input: string;
  property: string;
}