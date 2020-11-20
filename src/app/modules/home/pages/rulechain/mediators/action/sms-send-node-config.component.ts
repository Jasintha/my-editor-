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
  selector: 'tb-sms-send-node-config',
  templateUrl: './sms-send-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SmsSendNodeConfigComponent),
    multi: true
  }]
})
export class SmsSendNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
  allModelProperties: any[];

  @Input()
  allRuleInputs: any[];

  @Input()
  apptype: string;

    domainModelProperties: any[];
    viewModelProperties: any[];

  @Input()
  disabled: boolean;

  @Input()
  ruleNodeId: string;

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

  smsSendNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;
  
  selectedVariableProperties: any[];
  selectedVariablePropertiesForParameter: any[];
  
  datasource: MatTableDataSource<SmsBodyParameter>;

  displayedColumns: string[] = ['parameterName', 'inputType', 'input', 'property', 'actions'];

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.smsSendNodeConfigFormGroup = this.fb.group({
      inputType: [],
      param: [],
      constant: [],
      property: [],
      parameterinputType: [],
      parameterparam: [],
      parameterproperty: [],
      smsBody: [],
      errorMsg: "",
      errorAction: ""
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
  
  refreshInputTypes(){
  console.log("came to refresh");
    let inputType: string = this.smsSendNodeConfigFormGroup.get('inputType').value;
    this.configuration.inputType = inputType;
    if (inputType === 'CONSTANT'){
    console.log("came to constant");
      this.configuration.param= {};
      this.configuration.property= {};

      this.smsSendNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.smsSendNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
    } else if (inputType === 'RULE_INPUT'){
      this.configuration.constant= {};
      this.configuration.property= {};
      this.smsSendNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.smsSendNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.constant= {};
      this.configuration.param= {};
      this.smsSendNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.smsSendNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  refreshParameterInputTypes(){
  console.log("came to refresh");
    let inputType: string = this.smsSendNodeConfigFormGroup.get('parameterinputType').value;
    this.configuration.parameterinputType = inputType;
    if (inputType === 'RULE_INPUT'){
      this.configuration.parameterproperty= {};
      //this.configuration.parametervariableProperty = {};
      this.smsSendNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
      //this.smsSendNodeConfigFormGroup.get('parametervariableProperty').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.parameterparam= {};
      this.smsSendNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
    }
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  addParameter(): void{
  
    let number = this.configuration.smsbodyParameters.length + 1;
    let inputType: string = this.smsSendNodeConfigFormGroup.get('parameterinputType').value;
    
    if (inputType === 'RULE_INPUT'){
      let selectedParameterParam = this.smsSendNodeConfigFormGroup.get('parameterparam').value;
      let parameter = {
        'parameterName': '$'+ number,
        'inputType': inputType,
        'input': '-',
        'property': selectedParameterParam.inputName
      };
      this.configuration.smsbodyParameters.push(parameter);
      this.updateModel(this.configuration);
    } else if (inputType === 'PROPERTY'){
      let selectedParameterProperty = this.smsSendNodeConfigFormGroup.get('parameterproperty').value;
      let parameterproperty = {
        'parameterName': '$'+ number,
        'inputType': inputType,
        'input': '-',
        'property': selectedParameterProperty.name
      };
      this.configuration.smsbodyParameters.push(parameterproperty);
      this.updateModel(this.configuration);
    }
    
    this.datasource = new MatTableDataSource(this.configuration.smsbodyParameters);
  
    this.smsSendNodeConfigFormGroup.get('parameterinputType').patchValue([], {emitEvent: false});
    this.smsSendNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
    this.smsSendNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});

  }

  deleteRow(index: number): void{
    this.configuration.smsbodyParameters.splice(index, 1);
    this.datasource = new MatTableDataSource(this.configuration.smsbodyParameters);
    this.updateModel(this.configuration);
  }

  ngAfterViewInit(): void {
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.smsSendNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.smsSendNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);
    this.datasource = new MatTableDataSource(this.configuration.smsbodyParameters);
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


      let p = this.configuration.param;
      if(this.configuration.inputType === 'RULE_INPUT' && this.allRuleInputs){
        p = this.allRuleInputs.find(x => x.inputName === this.configuration.param.inputName );
      }

      let c = this.configuration.constant;
      if(this.configuration.inputType === 'CONSTANT'){
        c = this.allConstants.find(x => x.constantName === this.configuration.constant.constantName );
      }

      let property = this.configuration.property;
      if(this.configuration.inputType === 'PROPERTY'){
        property = this.allModelProperties.find(x => x.name === this.configuration.property.name );
      }

      this.smsSendNodeConfigFormGroup.patchValue({
        inputType: this.configuration.inputType,
        param: p,
        constant: c,
        property: property,
        parameterinputType: this.configuration.parameterinputType,
        parameterparam: this.configuration.parameterparam,
        parameterproperty: this.configuration.parameterproperty,
        smsBody: this.configuration.smsBody,
        errorMsg: this.configuration.errorMsg,
        errorAction: this.configuration.errorAction
      });

      this.changeSubscription = this.smsSendNodeConfigFormGroup.get('smsBody').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.smsBody = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.smsSendNodeConfigFormGroup.get('param').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.param = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.smsSendNodeConfigFormGroup.get('parameterparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.smsSendNodeConfigFormGroup.get('constant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.constant = configuration;

          console.log(this.configuration);
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.smsSendNodeConfigFormGroup.get('property').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.property = configuration;

          console.log(this.configuration);
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.smsSendNodeConfigFormGroup.get('parameterproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterproperty = configuration;

          console.log(this.configuration);
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.smsSendNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorMsg = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.smsSendNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
        (configuration: any) => {
          console.log(configuration);
          this.configuration.errorAction = configuration;
          this.updateModel(this.configuration);
        }
      );

    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.smsSendNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}

export interface SmsBodyParameter {
  parameterName: string;
  inputType: string;
  input: string;
  property: string;
}
