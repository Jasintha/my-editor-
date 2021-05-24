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
  selector: 'virtuan-email-send-node-config',
  templateUrl: './email-send-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => EmailSendNodeConfigComponent),
    multi: true
  }]
})
export class EmailSendNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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

  @Input() branchAvailability: any;

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
  apptype: string;

  @Input()
  allRuleInputs: any[];

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

  emailSendNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;
  
  selectedVariableProperties: any[];
  selectedVariablePropertiesForParameter: any[];
  
  datasource: MatTableDataSource<EmailBodyParameter>;
  errordatasource: MatTableDataSource<ErrorFunctionParameters>;

  displayedColumns: string[] = ['parameterName', 'inputType', 'input', 'property', 'actions'];
  displayErroredColumns: string[] = ['parameterName', 'inputType', 'input', 'property', 'actions'];

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.emailSendNodeConfigFormGroup = this.fb.group({
      emailSubject: [],
      toemailinputType: [],
      toemailparam: [],
      toemailconstant: [],
      toemailproperty: [],
      //toemailvariable: [],
      //toemailvariableProperty: [],
      parameterinputType: [],
      //parametervariable: [],
      //parametervariableProperty: [],
      parameterparam: [],
      parameterproperty: [],
      emailBody: [],
      errorMsg: "",
      errorAction: "",
      emailcontentType: "",
      emailBodyType: "",
      emailBodyProperty: [],
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

  }

  ngOnDestroy(): void {
    if (this.definedConfigComponentRef) {
      this.definedConfigComponentRef.destroy();
    }
  }

  refreshErrorParameterInputTypes(){
    let errorInputType: string = this.emailSendNodeConfigFormGroup.get('errorParameterinputType').value;
    this.configuration.errorParameterinputType = errorInputType;
    if (errorInputType === 'RULE_INPUT'){
      this.configuration.errorParameterproperty= {};
      this.configuration.errorParameterbranchparam= {};
      this.emailSendNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
      this.emailSendNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});
    } else if (errorInputType === 'PROPERTY'){
      this.configuration.errorParameterparam= {};
      this.configuration.errorParameterbranchparam= {};
      this.emailSendNodeConfigFormGroup.get('parameterbranchparam').patchValue([], {emitEvent: false});
      this.emailSendNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});
    } else if (errorInputType === 'BRANCH_PARAM'){
      this.configuration.errorParameterparam= {};
      this.configuration.errorParameterproperty= {};
      this.emailSendNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
      this.emailSendNodeConfigFormGroup.get('errorParameterparam').patchValue([], {emitEvent: false});
    }
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  refreshEmailBody(){
    let emailBodyType: string = this.emailSendNodeConfigFormGroup.get('emailBodyType').value;
    this.configuration.emailBodyType = emailBodyType;

    if (emailBodyType === 'INLINE'){
        this.configuration.emailBodyProperty= {};
        this.emailSendNodeConfigFormGroup.get('emailBodyProperty').patchValue([], {emitEvent: false});
    } else if (emailBodyType === 'PROPERTY'){
        this.configuration.parameterinputType = ""
        this.configuration.parameterproperty= {};
        this.configuration.parameterparam= {};

        this.configuration.emailbodyParameters = [];
        this.datasource = new MatTableDataSource(this.configuration.emailbodyParameters);
        this.emailSendNodeConfigFormGroup.get('parameterinputType').patchValue("", {emitEvent: false});
        this.emailSendNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
        this.emailSendNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }
  }
  
  refreshInputTypes(){

    let inputType: string = this.emailSendNodeConfigFormGroup.get('toemailinputType').value;
    this.configuration.toemailinputType = inputType;
    if (inputType === 'CONSTANT'){

      this.configuration.toemailparam= {};
      this.configuration.toemailproperty= {};
      //this.configuration.toemailvariable= {};
      //this.configuration.toemailvariableProperty = {};

      this.emailSendNodeConfigFormGroup.get('toemailparam').patchValue([], {emitEvent: false});
      this.emailSendNodeConfigFormGroup.get('toemailproperty').patchValue([], {emitEvent: false});
      //this.emailSendNodeConfigFormGroup.get('toemailvariable').patchValue([], {emitEvent: false});
      //this.emailSendNodeConfigFormGroup.get('toemailvariableProperty').patchValue([], {emitEvent: false});
    } else if (inputType === 'RULE_INPUT'){
      this.configuration.toemailconstant= {};
      this.configuration.toemailproperty= {};
      //this.configuration.toemailvariable= {};
      //this.configuration.toemailvariableProperty = {};
      this.emailSendNodeConfigFormGroup.get('toemailconstant').patchValue([], {emitEvent: false});
      this.emailSendNodeConfigFormGroup.get('toemailproperty').patchValue([], {emitEvent: false});
      //this.emailSendNodeConfigFormGroup.get('toemailvariable').patchValue([], {emitEvent: false});
      //this.emailSendNodeConfigFormGroup.get('toemailvariableProperty').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.toemailconstant= {};
      this.configuration.toemailparam= {};
      this.emailSendNodeConfigFormGroup.get('toemailconstant').patchValue([], {emitEvent: false});
      this.emailSendNodeConfigFormGroup.get('toemailparam').patchValue([], {emitEvent: false});
    }
    /*
    else if (inputType === 'VARIABLE'){
      this.configuration.toemailconstant= {};
      this.configuration.toemailparam= {};
      this.emailSendNodeConfigFormGroup.get('toemailconstant').patchValue([], {emitEvent: false});
      this.emailSendNodeConfigFormGroup.get('toemailparam').patchValue([], {emitEvent: false});
    }
    */

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  refreshParameterInputTypes(){

    let inputType: string = this.emailSendNodeConfigFormGroup.get('parameterinputType').value;
    this.configuration.parameterinputType = inputType;
    if (inputType === 'RULE_INPUT'){
      this.configuration.parameterproperty= {};
      //this.configuration.parametervariableProperty = {};
      this.emailSendNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
      //this.emailSendNodeConfigFormGroup.get('parametervariableProperty').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.parameterparam= {};
      this.emailSendNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
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

    let errorInputType: string = this.emailSendNodeConfigFormGroup.get('errorParameterinputType').value;
    let errorBranchparameter = this.emailSendNodeConfigFormGroup.get('errorBranchparameter').value;

    if (errorInputType === 'RULE_INPUT'){
      let selectedErrorParameterParam = this.emailSendNodeConfigFormGroup.get('errorParameterparam').value;
      let errorParameter = {
        'parameterName': errorBranchparameter.name,
        'inputType': errorInputType,
        'input': '-',
        'property': selectedErrorParameterParam.inputName
      };
      this.configuration.errorFunctionParameters.push(errorParameter);
      this.updateModel(this.configuration);
    } else if (errorInputType === 'PROPERTY'){
      let selectedErrorParameterProperty = this.emailSendNodeConfigFormGroup.get('errorParameterproperty').value;
      let errorParameterproperty = {
        'parameterName': errorBranchparameter.name,
        'inputType': errorInputType,
        'input': '-',
        'property': selectedErrorParameterProperty.name
      };
      this.configuration.errorFunctionParameters.push(errorParameterproperty);
      this.updateModel(this.configuration);
    } else if (errorInputType === 'BRANCH_PARAM'){
      let selectedErrorParameterBranch = this.emailSendNodeConfigFormGroup.get('errorParameterbranchparam').value;
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

    this.emailSendNodeConfigFormGroup.get('errorParameterinputType').patchValue([], {emitEvent: false});
    this.emailSendNodeConfigFormGroup.get('errorParameterparam').patchValue([], {emitEvent: false});
    this.emailSendNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
    this.emailSendNodeConfigFormGroup.get('errorBranchparameter').patchValue([], {emitEvent: false});
    this.emailSendNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});

  }

  addParameter(): void{
  
    let number = this.configuration.emailbodyParameters.length + 1;
    let inputType: string = this.emailSendNodeConfigFormGroup.get('parameterinputType').value;
    
    if (inputType === 'RULE_INPUT'){
      let selectedParameterParam = this.emailSendNodeConfigFormGroup.get('parameterparam').value;
      let parameter = {
        'parameterName': '$'+ number,
        'inputType': inputType,
        'input': '-',
        'property': selectedParameterParam.inputName
      };
      this.configuration.emailbodyParameters.push(parameter);
      this.updateModel(this.configuration);
    } else if (inputType === 'PROPERTY'){
      let selectedParameterProperty = this.emailSendNodeConfigFormGroup.get('parameterproperty').value;
      let parameterproperty = {
        'parameterName': '$'+ number,
        'inputType': inputType,
        'input': '-',
        'property': selectedParameterProperty.name
      };
      this.configuration.emailbodyParameters.push(parameterproperty);
      this.updateModel(this.configuration);
    }
     /*
     else if (inputType === 'VARIABLE'){
      let selectedParameterVariable = this.emailSendNodeConfigFormGroup.get('parametervariable').value;
      if(selectedParameterVariable.type == 'String' || 
         selectedParameterVariable.type == 'Integer' ||
         selectedParameterVariable.type == 'Boolean' ||
         selectedParameterVariable.type == 'Date' ||
         selectedParameterVariable.type == 'Image' ||
         selectedParameterVariable.type == 'File'){         
          let parameter = {
            'parameterName': '$'+ number,
            'inputType': inputType,
            'input': '-',
            'property': selectedParameterVariable.name
          };       
          this.configuration.emailbodyParameters.push(parameter);  
          this.updateModel(this.configuration);          
      } else {
          let selectedParameterVariableProperty = this.emailSendNodeConfigFormGroup.get('parametervariableProperty').value;
          let parameter = {
            'parameterName': '$'+ number,
            'inputType': inputType,
            'input': selectedParameterVariable.name,
            'property': selectedParameterVariableProperty.name
          };   
          this.configuration.emailbodyParameters.push(parameter);
          this.updateModel(this.configuration);
      }      
    }
    */
    
    this.datasource = new MatTableDataSource(this.configuration.emailbodyParameters);
  
    this.emailSendNodeConfigFormGroup.get('parameterinputType').patchValue("", {emitEvent: false});
    //this.emailSendNodeConfigFormGroup.get('parametervariable').patchValue([], {emitEvent: false});
    //this.emailSendNodeConfigFormGroup.get('parametervariableProperty').patchValue([], {emitEvent: false});
    this.emailSendNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
    this.emailSendNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});

  }

  deleteRow(index: number): void{
    this.configuration.emailbodyParameters.splice(index, 1);
    this.datasource = new MatTableDataSource(this.configuration.emailbodyParameters);
    this.updateModel(this.configuration);
  }

  ngAfterViewInit(): void {
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.emailSendNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.emailSendNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);
    this.datasource = new MatTableDataSource(this.configuration.emailbodyParameters);
    if (this.changeSubscription) {
      this.changeSubscription.unsubscribe();
      this.changeSubscription = null;
    }

    if(this.configuration.errorFunctionParameters === null || this.configuration.errorFunctionParameters === undefined){
      this.configuration.errorFunctionParameters = [];
    }
    this.errordatasource = new MatTableDataSource(this.configuration.errorFunctionParameters);

    if (this.definedConfigComponent) {
      this.definedConfigComponent.configuration = this.configuration;
      this.changeSubscription = this.definedConfigComponent.configurationChanged.subscribe((configuration) => {
        this.updateModel(configuration);
      });
    } else {

      let p = this.configuration.toemailparam;
      if(this.configuration.toemailinputType === 'RULE_INPUT'){
        p = this.allRuleInputs.find(x => x.inputName === this.configuration.toemailparam.inputName );
      }

      let errorBranch = this.configuration.errorBranch;
      if(errorBranch && this.allRoots){
        errorBranch = this.allRoots.find(x => x.name === this.configuration.errorBranch.name );
      }

      let c = this.configuration.toemailconstant;
      if(this.configuration.toemailinputType === 'CONSTANT'){
        c = this.allConstants.find(x => x.constantName === this.configuration.toemailconstant.constantName );
      }

      let property = this.configuration.toemailproperty;
      if(this.configuration.toemailinputType === 'PROPERTY'){
        property = this.allModelProperties.find(x => x.name === this.configuration.toemailproperty.name );
      }

      let emailBodyProperty = this.configuration.emailBodyProperty;
      if(this.configuration.emailBodyType === 'PROPERTY'){
        emailBodyProperty = this.allModelProperties.find(x => x.name === this.configuration.emailBodyProperty.name );
      }

      this.emailSendNodeConfigFormGroup.patchValue({
        emailcontentType: this.configuration.emailcontentType,
        emailBodyType: this.configuration.emailBodyType,
        emailBodyProperty: emailBodyProperty,
        emailSubject: this.configuration.emailSubject,
        toemailinputType: this.configuration.toemailinputType,
        toemailparam: p,
        toemailconstant: c,
        toemailproperty: property,
       // toemailvariable: v,
       // toemailvariableProperty: vp,
        parameterinputType: this.configuration.parameterinputType,
       // parametervariable: this.configuration.parametervariable,
       // parametervariableProperty: this.configuration.parametervariableProperty,
        parameterparam: this.configuration.parameterparam,
        parameterproperty: this.configuration.parameterproperty,
        emailBody: this.configuration.emailBody,
        errorMsg: this.configuration.errorMsg,
        errorAction: this.configuration.errorAction,
        errorBranch: errorBranch,
        errorInputType: this.configuration.errorInputType,
        errorBranchparameter: this.configuration.errorBranchparameter,
        errorParameterinputType: this.configuration.errorParameterinputType,
        errorParameterparam: this.configuration.errorParameterparam,
        errorParameterproperty: this.configuration.errorParameterproperty,
        errorParameterbranchparam: this.configuration.errorParameterbranchparam,
        errorIsAsync: this.configuration.errorIsAsync
      });

      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('errorIsAsync').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorIsAsync = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('errorBranch').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorBranch = configuration;

            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('errorParameterparam').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorParameterparam = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('errorParameterbranchparam').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorParameterbranchparam = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('errorParameterproperty').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorParameterproperty = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('emailBody').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.emailBody = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('emailSubject').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.emailSubject = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('toemailparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.toemailparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('parameterparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('toemailconstant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.toemailconstant = configuration;


          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('toemailproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.toemailproperty = configuration;


          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('parameterproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterproperty = configuration;


          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('emailcontentType').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.emailcontentType = configuration;
          this.updateModel(this.configuration);
        }
      );

      /*
      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('emailBodyType').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.emailBodyType = configuration;
          this.updateModel(this.configuration);
        }
      );
      */

      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('emailBodyProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.emailBodyProperty = configuration;
          this.updateModel(this.configuration);
        }
      );


      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorMsg = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
        (configuration: any) => {

          this.configuration.errorAction = configuration;
          this.updateModel(this.configuration);
        }
      );

    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.emailSendNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}

export interface EmailBodyParameter {
  parameterName: string;
  inputType: string;
  input: string;
  property: string;
}

export interface ErrorFunctionParameters {
  parameterName: string;
  inputType: string;
  input: string;
  property: string;
}