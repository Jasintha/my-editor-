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
  selector: 'virtuan-log-node-config',
  templateUrl: './log-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => LogNodeConfigComponent),
    multi: true
  }]
})
export class LogNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
  inputProperties: any[];

  @Input()
  allRuleInputs: any[];

  @Input()
  allConstants: any[];

  @Input()
  inputCustomobjects: any[];

  @Input()
  allModelProperties: any[];

  @Input()
  apptype: string;

  @Input() branchAvailability: any;

  nodeDefinitionValue: RuleNodeDefinition;

  datasource: MatTableDataSource<LogField>;

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

  logNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  displayedColumns: string[] = ['logFieldName', 'inputType', 'property', 'actions'];

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.logNodeConfigFormGroup = this.fb.group({
      category: [],
      customMessage: [],
      logFieldName: [],
      loginputType: [],
      logparam: [],
      logproperty: [],
      logbranchparam: []
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

  addLogField(): void{
  
    let inputType: string = this.logNodeConfigFormGroup.get('loginputType').value;
    let logfieldName: string = this.logNodeConfigFormGroup.get('logFieldName').value;
    
    if (inputType === 'RULE_INPUT'){
      let selectedParam = this.logNodeConfigFormGroup.get('logparam').value;
      let logparameter = {
        'logFieldName': logfieldName,
        'inputType': inputType,
        'input': '-',
        'property': selectedParam.inputName
      };
      this.configuration.logFieldProperties.push(logparameter);
      this.updateModel(this.configuration);
    } else if (inputType === 'PROPERTY'){
      let selectedProperty = this.logNodeConfigFormGroup.get('logproperty').value;
      let logproperty = {
        'logFieldName': logfieldName,
        'inputType': inputType,
        'input': '-',
        'property': selectedProperty.name
      };
      this.configuration.logFieldProperties.push(logproperty);
      this.updateModel(this.configuration);
    } else if (inputType === 'BRANCH_PARAM'){
      let selectedBranchParam = this.logNodeConfigFormGroup.get('logbranchparam').value;
      let logbranchparam = {
        'logFieldName': logfieldName,
        'inputType': inputType,
        'input': '-',
        'property': selectedBranchParam.name
      };
      this.configuration.logFieldProperties.push(logbranchparam);
      this.updateModel(this.configuration);
    }
    
    this.datasource = new MatTableDataSource(this.configuration.logFieldProperties);
    this.configuration.loginputType = '';
    this.configuration.logFieldName= {};
    this.configuration.logparam= {};
    this.configuration.logbranchparam= {};
    this.configuration.logproperty= {};
  //  this.logNodeConfigFormGroup.get('loginputType').patchValue([], {emitEvent: false});
  //  this.logNodeConfigFormGroup.get('logFieldName').patchValue("", {emitEvent: false});
  //  this.logNodeConfigFormGroup.get('logparam').patchValue([], {emitEvent: false});
  //  this.logNodeConfigFormGroup.get('logproperty').patchValue([], {emitEvent: false});
    this.logNodeConfigFormGroup.patchValue({
      loginputType: [],
      logFieldName: '',
      logparam: [],
      logproperty: [],
      logbranchparam: []
    });

  }

  deleteRow(index: number): void{
    this.configuration.logFieldProperties.splice(index, 1);
    this.datasource = new MatTableDataSource(this.configuration.logFieldProperties);
    this.updateModel(this.configuration);
  }
  
  refreshlogInputTypes(){
    let inputType: string = this.logNodeConfigFormGroup.get('loginputType').value;
    this.configuration.loginputType = inputType;
    if (inputType === 'RULE_INPUT'){
      this.configuration.logproperty= {};
      this.configuration.logbranchparam= {};
      this.logNodeConfigFormGroup.get('logproperty').patchValue([], {emitEvent: false});
      this.logNodeConfigFormGroup.get('logbranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.logparam= {};
      this.configuration.logbranchparam= {};
      this.logNodeConfigFormGroup.get('logparam').patchValue([], {emitEvent: false});
      this.logNodeConfigFormGroup.get('logbranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.logparam= {};
      this.configuration.logproperty= {};
      this.logNodeConfigFormGroup.get('logbranchparam').patchValue([], {emitEvent: false});
      this.logNodeConfigFormGroup.get('logproperty').patchValue([], {emitEvent: false});
    }
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.logNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.logNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);
    if(this.configuration.logFieldProperties === null || this.configuration.logFieldProperties === undefined){
        this.configuration.logFieldProperties = [];
    }
    this.datasource = new MatTableDataSource(this.configuration.logFieldProperties);

    if (this.changeSubscription) {
      this.changeSubscription.unsubscribe();
      this.changeSubscription = null;
    }
    if (this.definedConfigComponent) {
    console.log("came inside definedCOnfig Component");
    console.log(this.configuration);
      this.definedConfigComponent.configuration = this.configuration;
      this.changeSubscription = this.definedConfigComponent.configurationChanged.subscribe((configuration) => {
        this.updateModel(configuration);
      });
    } else {

      this.logNodeConfigFormGroup.patchValue({
        category: this.configuration.category,
        customMessage: this.configuration.customMessage,
        logFieldName: this.configuration.logFieldName,
        loginputType: this.configuration.loginputType,
        logparam: this.configuration.logparam,
        logbranchparam: this.configuration.logbranchparam,
        logproperty: this.configuration.logproperty
      });


      this.changeSubscription = this.logNodeConfigFormGroup.get('category').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {
          this.configuration.category = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.logNodeConfigFormGroup.get('customMessage').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {
          this.configuration.customMessage = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.logNodeConfigFormGroup.get('logFieldName').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {
          this.configuration.logFieldName = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.logNodeConfigFormGroup.get('logparam').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {
          this.configuration.logparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.logNodeConfigFormGroup.get('logbranchparam').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {
          this.configuration.logbranchparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.logNodeConfigFormGroup.get('logproperty').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {
          this.configuration.logproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {

    if (this.definedConfigComponent || this.logNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {

      this.propagateChange(this.required ? null : configuration);
    }
  }

}

export interface LogField {
  logFieldName: string;
  inputType: string;
  input: string;
  property: string;
}
