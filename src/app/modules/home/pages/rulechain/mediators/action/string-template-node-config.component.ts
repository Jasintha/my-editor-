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
  selector: 'virtuan-string-template-node-config',
  templateUrl: './string-template-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => StringTemplateNodeConfigComponent),
    multi: true
  }]
})
export class StringTemplateNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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

  @Input() branchAvailability: any;

  @Input()
  allReferenceProperties: any[];

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

  stringTemplateNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;
  
  selectedVariableProperties: any[];
  selectedVariablePropertiesForParameter: any[];
  
  datasource: MatTableDataSource<TemplateBodyParameter>;

  displayedColumns: string[] = ['parameterName', 'inputType', 'input', 'property', 'actions'];

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.stringTemplateNodeConfigFormGroup = this.fb.group({
      paramPrefix: ['',  [Validators.required, Validators.minLength(3)]],
      parameterinputType: [],
      parameterparam: [],
      parameterproperty: [],
      parameterconstant: [],
      parameterbranch: [],
      templateBody: "",
      errorMsg: "",
      errorAction: "",
      assignedProperty: [],
      assignedtoinputType: "",
      assignedReference: []
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
 
  refreshParameterInputTypes(){
    let inputType: string = this.stringTemplateNodeConfigFormGroup.get('parameterinputType').value;
    this.configuration.parameterinputType = inputType;
    if (inputType === 'RULE_INPUT'){
      this.configuration.parameterproperty= {};
      this.configuration.parameterbranch= {};
      this.configuration.parameterconstant= {};
      this.stringTemplateNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
      this.stringTemplateNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
      this.stringTemplateNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.parameterparam= {};
      this.configuration.parameterbranch= {};
      this.configuration.parameterconstant= {};
      this.stringTemplateNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
      this.stringTemplateNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
      this.stringTemplateNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.parameterparam= {};
      this.configuration.parameterproperty= {};
      this.configuration.parameterconstant= {};
      this.stringTemplateNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
      this.stringTemplateNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
      this.stringTemplateNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
    } else if (inputType === 'CONSTANT'){
      this.configuration.parameterparam= {};
      this.configuration.parameterproperty= {};
      this.configuration.parameterbranch= {};
      this.stringTemplateNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
      this.stringTemplateNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
      this.stringTemplateNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
    }
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  addParameter(): void{
    
    let number: number = 0;

    if(this.configuration.templateParameters){
      number = this.configuration.templateParameters.length + 1;
    } else {
        this.configuration.templateParameters = [];
        number = this.configuration.templateParameters.length + 1;
    }
    let paramPrefix: string = this.stringTemplateNodeConfigFormGroup.get('paramPrefix').value;
    let inputType: string = this.stringTemplateNodeConfigFormGroup.get('parameterinputType').value;

    if(paramPrefix == null || paramPrefix == undefined || paramPrefix == "" ){
        paramPrefix = "$";
    }
    
    if (inputType === 'RULE_INPUT'){
      let selectedParameterParam = this.stringTemplateNodeConfigFormGroup.get('parameterparam').value;
      let parameter = {
        'parameterName': paramPrefix+ number,
        'inputType': inputType,
        'input': '-',
        'property': selectedParameterParam.inputName
      };
      this.configuration.templateParameters.push(parameter);
      this.updateModel(this.configuration);
    } else if (inputType === 'PROPERTY'){
      let selectedParameterProperty = this.stringTemplateNodeConfigFormGroup.get('parameterproperty').value;
      let parameterproperty = {
        'parameterName': paramPrefix+ number,
        'inputType': inputType,
        'input': '-',
        'property': selectedParameterProperty.name
      };
      this.configuration.templateParameters.push(parameterproperty);
      this.updateModel(this.configuration);
    } else if (inputType === 'BRANCH_PARAM'){
      let selectedParameterBranch = this.stringTemplateNodeConfigFormGroup.get('parameterbranch').value;
      let parameterbranch = {
        'parameterName': paramPrefix+ number,
        'inputType': inputType,
        'input': '-',
        'property': selectedParameterBranch.name
      };
      this.configuration.templateParameters.push(parameterbranch);
      this.updateModel(this.configuration);
    } else if (inputType === 'CONSTANT'){
      let selectedParameterConstant = this.stringTemplateNodeConfigFormGroup.get('parameterconstant').value;
      let parameterconstant = {
        'parameterName': paramPrefix+ number,
        'inputType': inputType,
        'input': '-',
        'property': selectedParameterConstant.constantName
      };
      this.configuration.templateParameters.push(parameterconstant);
      this.updateModel(this.configuration);
    }

    this.datasource = new MatTableDataSource(this.configuration.templateParameters);

    this.configuration.parameterinputType = '';
    this.configuration.parameterproperty= {};
    this.configuration.parameterbranch= {};
    this.configuration.parameterparam= {};
    this.configuration.parameterconstant= {};
  
    this.stringTemplateNodeConfigFormGroup.get('parameterinputType').patchValue("", {emitEvent: false});
    this.stringTemplateNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
    this.stringTemplateNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
    this.stringTemplateNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
    this.stringTemplateNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});

  }

  deleteRow(index: number): void{
    this.configuration.templateParameters.splice(index, 1);
    this.datasource = new MatTableDataSource(this.configuration.templateParameters);
    this.updateModel(this.configuration);
  }

  ngAfterViewInit(): void {
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.stringTemplateNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.stringTemplateNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);

    if(this.configuration.templateParameters === null || this.configuration.templateParameters === undefined){
        this.configuration.templateParameters = [];
    }
    this.datasource = new MatTableDataSource(this.configuration.templateParameters);

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

      let assignedProperty = this.configuration.assignedProperty;
      if(this.configuration.assignedtoinputType === 'PROPERTY' && assignedProperty && this.allModelProperties){
        assignedProperty = this.allModelProperties.find(x => x.name === this.configuration.assignedProperty.name );
      }
      
      let assignedReference = this.configuration.assignedReference;
      if(this.configuration.assignedtoinputType === 'REFERENCE' && assignedReference && this.allReferenceProperties){
        assignedReference = this.allReferenceProperties.find(x => x.name === this.configuration.assignedReference.name );
      }

      this.stringTemplateNodeConfigFormGroup.patchValue({
        paramPrefix: this.configuration.paramPrefix,
        parameterinputType: this.configuration.parameterinputType,
        parameterparam: this.configuration.parameterparam,
        parameterproperty: this.configuration.parameterproperty,
        parameterconstant: this.configuration.parameterconstant,
        parameterbranch: this.configuration.parameterbranch,
        assignedProperty: assignedProperty,
        errorMsg: this.configuration.errorMsg,
        errorAction: this.configuration.errorAction,
        assignedtoinputType: this.configuration.assignedtoinputType,
        assignedReference: assignedReference,
        templateBody: this.configuration.templateBody
      });

      this.changeSubscription = this.stringTemplateNodeConfigFormGroup.get('paramPrefix').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.paramPrefix = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.stringTemplateNodeConfigFormGroup.get('templateBody').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.templateBody = configuration;
          this.updateModel(this.configuration);
        }
      );
      
      this.changeSubscription = this.stringTemplateNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorMsg = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.stringTemplateNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
        (configuration: any) => {

          this.configuration.errorAction = configuration;
          this.updateModel(this.configuration);
        }
      );
      
      this.changeSubscription = this.stringTemplateNodeConfigFormGroup.get('assignedProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.assignedProperty = configuration;
          this.updateModel(this.configuration);
        }
      );
      

      this.changeSubscription = this.stringTemplateNodeConfigFormGroup.get('parameterparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.stringTemplateNodeConfigFormGroup.get('parameterproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.stringTemplateNodeConfigFormGroup.get('parameterconstant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterconstant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.stringTemplateNodeConfigFormGroup.get('parameterbranch').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterbranch = configuration;
          this.updateModel(this.configuration);
        }
      );
      
      this.changeSubscription = this.stringTemplateNodeConfigFormGroup.get('assignedReference').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.assignedReference = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.stringTemplateNodeConfigFormGroup.get('assignedtoinputType').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {

          this.configuration.assignedtoinputType = configuration;
          if(this.configuration.assignedtoinputType == 'PROPERTY'){
            this.configuration.assignedReference= {};
            this.stringTemplateNodeConfigFormGroup.get('assignedReference').patchValue([], {emitEvent: false});
          }else if (this.configuration.assignedtoinputType == 'REFERENCE'){
            this.configuration.assignedProperty= {};
            this.stringTemplateNodeConfigFormGroup.get('assignedProperty').patchValue([], {emitEvent: false});
          }
          this.updateModel(this.configuration);
        }
      );

    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.stringTemplateNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}

export interface TemplateBodyParameter {
  parameterName: string;
  inputType: string;
  input: string;
  property: string;
}
