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
  selector: 'tb-lambda-function-node-config',
  templateUrl: './lambda-function-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => LambdaFunctionNodeConfigComponent),
    multi: true
  }]
})
export class LambdaFunctionNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
  disabled: boolean;

  @Input()
  ruleNodeId: string;

  @Input()
  inputEntities: any[];

  @Input()
  allVariables: any[];

  @Input()
  allLambdaFunctions: any[];

  @Input()
  inputProperties: any[];

  @Input()
  allConstants: any[];

  @Input()
  inputCustomobjects: any[];

  @Input()
  allModelProperties: any[];

  @Input()
  apptype: string;

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

  lambdaFunctionNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;
  
  datasource: MatTableDataSource<LambdaParameters>;

  displayedColumns: string[] = ['parameterName', 'inputType', 'input', 'property', 'actions'];

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.lambdaFunctionNodeConfigFormGroup = this.fb.group({
      functionparameter: [],
      inputType: [],
      //record: [],
      //customObject: [],
      function: [],
      parameterinputType: [],
      parameterparam: [],
      parameterproperty: []
    });
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  ngOnInit(): void {
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
      this.lambdaFunctionNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.lambdaFunctionNodeConfigFormGroup.enable({emitEvent: false});
    }
  }
  
  refreshParameterInputTypes(){
    let inputType: string = this.lambdaFunctionNodeConfigFormGroup.get('parameterinputType').value;
    this.configuration.parameterinputType = inputType;
    if (inputType === 'PARAM'){
      this.configuration.parameterproperty= {};
      this.lambdaFunctionNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.parameterparam= {};
      this.lambdaFunctionNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
    }
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  deleteRow(index: number): void{
    this.configuration.lambdaParameters.splice(index, 1);
    this.datasource = new MatTableDataSource(this.configuration.lambdaParameters);
    this.updateModel(this.configuration);
  }
  
  addParameter(): void{
    /*
    let number: number = 0;

    if(this.configuration.lambdaParameters){
      number = this.configuration.lambdaParameters.length + 1;
    } else {
        this.configuration.lambdaParameters = [];
        number = this.configuration.lambdaParameters.length + 1;
    }
    */

    let inputType: string = this.lambdaFunctionNodeConfigFormGroup.get('parameterinputType').value;
    let functionparameter = this.lambdaFunctionNodeConfigFormGroup.get('functionparameter').value;
    
    if (inputType === 'PARAM'){
      let selectedParameterParam = this.lambdaFunctionNodeConfigFormGroup.get('parameterparam').value;
      let parameter = {
        'parameterName': functionparameter.inputName,
        'inputType': inputType,
        'input': '-',
        'property': selectedParameterParam.inputName
      };
      this.configuration.lambdaParameters.push(parameter);
      this.updateModel(this.configuration);
    } else if (inputType === 'PROPERTY'){
      let selectedParameterProperty = this.lambdaFunctionNodeConfigFormGroup.get('parameterproperty').value;
      let parameterproperty = {
        'parameterName': functionparameter.inputName,
        'inputType': inputType,
        'input': '-',
        'property': selectedParameterProperty.name
      };
      this.configuration.lambdaParameters.push(parameterproperty);
      this.updateModel(this.configuration);
    }

    this.datasource = new MatTableDataSource(this.configuration.lambdaParameters);
  
    this.lambdaFunctionNodeConfigFormGroup.get('parameterinputType').patchValue([], {emitEvent: false});
    this.lambdaFunctionNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
    this.lambdaFunctionNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
    this.lambdaFunctionNodeConfigFormGroup.get('functionparameter').patchValue([], {emitEvent: false});

  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);
    this.datasource = new MatTableDataSource(this.configuration.lambdaParameters);
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

      let functionObj = this.configuration.function;
      if(functionObj){
        functionObj = this.allLambdaFunctions.find(x => x.name === this.configuration.function.name );
      }
      /*
      let customObject = this.configuration.customObject;
      if(customObject){
        customObject = this.inputCustomobjects.find(x => x.name === this.configuration.customObject.name );
      }

      let entity = this.configuration.entity;
      if(entity){
        entity = this.inputEntities.find(x => x.name === this.configuration.entity.name );
      }
      */

      this.lambdaFunctionNodeConfigFormGroup.patchValue({
        inputType: this.configuration.inputType,
        functionparameter: this.configuration.functionparameter,
        //record: this.configuration.record,
        //customObject: customObject,
        parameterinputType: this.configuration.parameterinputType,
        parameterparam: this.configuration.parameterparam,
        parameterproperty: this.configuration.parameterproperty,
        function: functionObj
      });

      this.changeSubscription = this.lambdaFunctionNodeConfigFormGroup.get('function').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.function = configuration;
          this.updateModel(this.configuration);
        }
      );
      /*
      this.changeSubscription = this.lambdaFunctionNodeConfigFormGroup.get('record').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.record = configuration;
          this.updateModel(this.configuration);
        }
      );
      */

      this.changeSubscription = this.lambdaFunctionNodeConfigFormGroup.get('parameterparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.lambdaFunctionNodeConfigFormGroup.get('parameterproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      /*
      this.changeSubscription = this.lambdaFunctionNodeConfigFormGroup.get('inputType').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {

          this.configuration.inputType = configuration;
          if(this.configuration.inputType == 'MODEL'){
            this.configuration.customObject= {};
            this.lambdaFunctionNodeConfigFormGroup.get('customObject').patchValue([], {emitEvent: false});
          }else if (this.configuration.inputType == 'DTO'){
            this.configuration.entity= {};
            this.lambdaFunctionNodeConfigFormGroup.get('entity').patchValue([], {emitEvent: false});
          }
          this.updateModel(this.configuration);
        }
      );
      this.changeSubscription = this.lambdaFunctionNodeConfigFormGroup.get('customObject').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.customObject = configuration;
          this.configuration.entity = {};
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.lambdaFunctionNodeConfigFormGroup.get('entity').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.entity = configuration;
          this.configuration.customObject = {};
          this.updateModel(this.configuration);
        }
      );
      */

    }
  }

/*
  useDefinedDirective(): boolean {
    return this.nodeDefinition &&
      (this.nodeDefinition.configDirective &&
       this.nodeDefinition.configDirective.length) && !this.definedDirectiveError;
  }
  */

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.lambdaFunctionNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

  /*

  private validateDefinedDirective() {
    if (this.definedConfigComponentRef) {
      this.definedConfigComponentRef.destroy();
      this.definedConfigComponentRef = null;
    }
    if (this.nodeDefinition.uiResourceLoadError && this.nodeDefinition.uiResourceLoadError.length) {
      this.definedDirectiveError = this.nodeDefinition.uiResourceLoadError;
    } else if (this.nodeDefinition.configDirective && this.nodeDefinition.configDirective.length) {
      if (this.changeSubscription) {
        this.changeSubscription.unsubscribe();
        this.changeSubscription = null;
      }
      this.definedConfigContainer.clear();
      const factory = this.ruleChainService.getRuleNodeConfigFactory(this.nodeDefinition.configDirective);
      this.definedConfigComponentRef = this.definedConfigContainer.createComponent(factory);
      this.definedConfigComponent = this.definedConfigComponentRef.instance;
      this.definedConfigComponent.ruleNodeId = this.ruleNodeId;
      this.definedConfigComponent.configuration = this.configuration;
      this.changeSubscription = this.definedConfigComponent.configurationChanged.subscribe((configuration) => {
        this.updateModel(configuration);
      });
    }
  }

  validate() {
    if (this.useDefinedDirective()) {
      this.definedConfigComponent.validate();
    }
  }
  */
}

export interface LambdaParameters {
  parameterName: string;
  inputType: string;
  input: string;
  property: string;
}

