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
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'virtuan-grpc-call-node-config',
  templateUrl: './grpc-call-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => GRPCCallNodeConfigComponent),
    multi: true
  }]
})
export class GRPCCallNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

  @ViewChild('definedConfigContent', { read: ViewContainerRef, static: true }) definedConfigContainer: ViewContainerRef;

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
  allErrorBranches: any[];

  @Input()
  allReferenceProperties: any[];

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

  @Input() branchAvailability: any;

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

  grpcCallNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;

  selectedVariableProperties: any[];
  selectedVariablePropertiesForParameter: any[];

  errordatasource: MatTableDataSource<ErrorFunctionParameters>;
  displayErroredColumns: string[] = ['parameterName', 'inputType', 'input', 'property', 'actions'];


  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
    private ruleChainService: RuleChainService,
    private fb: FormBuilder) {
    this.grpcCallNodeConfigFormGroup = this.fb.group({
      inputType: [],
      param: [],
      constant: [],
      property: [],
      secondinputType: [],
      secondconstant: [],
      secondparam: [],
      secondproperty: [],
      secondbranchparam: [],
      thirdinputType: [],
      thirdconstant: [],
      thirdparam: [],
      thirdproperty: [],
      thirdbranchparam: [],
      errorMsg: "",
      errorAction: "",
      grpcMethod: "",
      apiMethodName: "",
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
      errorParameterbranchparam: [],
      isReturn: false
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

  refreshErrorParameterInputTypes() {
    let errorInputType: string = this.grpcCallNodeConfigFormGroup.get('errorParameterinputType').value;
    this.configuration.errorParameterinputType = errorInputType;
    if (errorInputType === 'RULE_INPUT') {
      this.configuration.errorParameterproperty = {};
      this.configuration.errorParameterbranchparam = {};
      this.grpcCallNodeConfigFormGroup.get('errorParameterproperty').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], { emitEvent: false });
    } else if (errorInputType === 'PROPERTY') {
      this.configuration.errorParameterparam = {};
      this.configuration.errorParameterbranchparam = {};
      this.grpcCallNodeConfigFormGroup.get('parameterbranchparam').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], { emitEvent: false });
    } else if (errorInputType === 'BRANCH_PARAM') {
      this.configuration.errorParameterparam = {};
      this.configuration.errorParameterproperty = {};
      this.grpcCallNodeConfigFormGroup.get('errorParameterproperty').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('errorParameterparam').patchValue([], { emitEvent: false });
    }
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  deleteErrorRow(index: number): void {
    this.configuration.errorFunctionParameters.splice(index, 1);
    this.errordatasource = new MatTableDataSource(this.configuration.errorFunctionParameters);
    this.updateModel(this.configuration);
  }

  addErrorParameter(): void {

    let errorInputType: string = this.grpcCallNodeConfigFormGroup.get('errorParameterinputType').value;
    let errorBranchparameter = this.grpcCallNodeConfigFormGroup.get('errorBranchparameter').value;

    if (errorInputType === 'RULE_INPUT') {
      let selectedErrorParameterParam = this.grpcCallNodeConfigFormGroup.get('errorParameterparam').value;
      let errorParameter = {
        'parameterName': errorBranchparameter.name,
        'inputType': errorInputType,
        'input': '-',
        'property': selectedErrorParameterParam.inputName
      };
      this.configuration.errorFunctionParameters.push(errorParameter);
      this.updateModel(this.configuration);
    } else if (errorInputType === 'PROPERTY') {
      let selectedErrorParameterProperty = this.grpcCallNodeConfigFormGroup.get('errorParameterproperty').value;
      let errorParameterproperty = {
        'parameterName': errorBranchparameter.name,
        'inputType': errorInputType,
        'input': '-',
        'property': selectedErrorParameterProperty.name
      };
      this.configuration.errorFunctionParameters.push(errorParameterproperty);
      this.updateModel(this.configuration);
    } else if (errorInputType === 'BRANCH_PARAM') {
      let selectedErrorParameterBranch = this.grpcCallNodeConfigFormGroup.get('errorParameterbranchparam').value;
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
    this.configuration.errorParameterproperty = {};
    this.configuration.errorParameterparam = {};
    this.configuration.errorBranchparameter = {};
    this.configuration.errorParameterbranchparam = {};

    this.grpcCallNodeConfigFormGroup.get('errorParameterinputType').patchValue([], { emitEvent: false });
    this.grpcCallNodeConfigFormGroup.get('errorParameterparam').patchValue([], { emitEvent: false });
    this.grpcCallNodeConfigFormGroup.get('errorParameterproperty').patchValue([], { emitEvent: false });
    this.grpcCallNodeConfigFormGroup.get('errorBranchparameter').patchValue([], { emitEvent: false });
    this.grpcCallNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], { emitEvent: false });

  }

  refreshInputTypes() {

    let inputType: string = this.grpcCallNodeConfigFormGroup.get('inputType').value;
    this.configuration.inputType = inputType;
    if (inputType === 'CONSTANT') {

      this.configuration.param = {};
      this.configuration.property = {};
      this.configuration.branchparam = {};
      this.grpcCallNodeConfigFormGroup.get('param').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('branchparam').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('property').patchValue([], { emitEvent: false });
    } else if (inputType === 'RULE_INPUT') {
      this.configuration.constant = {};
      this.configuration.property = {};
      this.configuration.branchparam = {};
      this.grpcCallNodeConfigFormGroup.get('branchparam').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('constant').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('property').patchValue([], { emitEvent: false });
    } else if (inputType === 'PROPERTY') {
      this.configuration.constant = {};
      this.configuration.param = {};
      this.configuration.branchparam = {};
      this.grpcCallNodeConfigFormGroup.get('branchparam').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('constant').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('param').patchValue([], { emitEvent: false });
    } else if (inputType === 'BRANCH_PARAM') {
      this.configuration.constant = {};
      this.configuration.param = {};
      this.configuration.property = {};
      this.grpcCallNodeConfigFormGroup.get('constant').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('param').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('property').patchValue([], { emitEvent: false });
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  refreshSecondInputTypes() {
    let inputType: string = this.grpcCallNodeConfigFormGroup.get('secondinputType').value;
    this.configuration.secondinputType = inputType;
    if (inputType === 'CONSTANT') {
      this.configuration.secondparam = {};
      this.configuration.secondproperty = {};
      this.configuration.secondbranchparam = {};
      this.grpcCallNodeConfigFormGroup.get('secondparam').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('secondproperty').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('secondbranchparam').patchValue([], { emitEvent: false });

    } else if (inputType === 'RULE_INPUT') {

      this.configuration.secondconstant = {};
      this.configuration.secondproperty = {};
      this.configuration.secondbranchparam = {};
      this.grpcCallNodeConfigFormGroup.get('secondconstant').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('secondproperty').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('secondbranchparam').patchValue([], { emitEvent: false });
    } else if (inputType === 'PROPERTY') {
      this.configuration.secondconstant = {};
      this.configuration.secondparam = {};
      this.configuration.secondbranchparam = {};

      this.grpcCallNodeConfigFormGroup.get('secondconstant').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('secondparam').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('secondbranchparam').patchValue([], { emitEvent: false });
    } else if (inputType === 'BRANCH_PARAM') {
      this.configuration.secondconstant = {};
      this.configuration.secondparam = {};
      this.configuration.secondproperty = {};
      this.grpcCallNodeConfigFormGroup.get('secondconstant').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('secondparam').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('secondproperty').patchValue([], { emitEvent: false });
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  refreshThirdInputTypes() {
    let inputType: string = this.grpcCallNodeConfigFormGroup.get('thirdinputType').value;
    this.configuration.thirdinputType = inputType;
    if (inputType === 'CONSTANT') {
      this.configuration.thirdparam = {};
      this.configuration.thirdproperty = {};
      this.configuration.thirdbranchparam = {};
      this.grpcCallNodeConfigFormGroup.get('thirdparam').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('thirdproperty').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('thirdbranchparam').patchValue([], { emitEvent: false });

    } else if (inputType === 'RULE_INPUT') {

      this.configuration.thirdconstant = {};
      this.configuration.thirdproperty = {};
      this.configuration.thirdbranchparam = {};
      this.grpcCallNodeConfigFormGroup.get('thirdconstant').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('thirdproperty').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('thirdbranchparam').patchValue([], { emitEvent: false });
    } else if (inputType === 'PROPERTY') {
      this.configuration.thirdconstant = {};
      this.configuration.thirdparam = {};
      this.configuration.thirdbranchparam = {};

      this.grpcCallNodeConfigFormGroup.get('thirdconstant').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('thirdparam').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('thirdbranchparam').patchValue([], { emitEvent: false });
    } else if (inputType === 'BRANCH_PARAM') {
      this.configuration.thirdconstant = {};
      this.configuration.thirdparam = {};
      this.configuration.thirdproperty = {};
      this.grpcCallNodeConfigFormGroup.get('thirdconstant').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('thirdparam').patchValue([], { emitEvent: false });
      this.grpcCallNodeConfigFormGroup.get('thirdproperty').patchValue([], { emitEvent: false });
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
      this.grpcCallNodeConfigFormGroup.disable({ emitEvent: false });
    } else {
      this.grpcCallNodeConfigFormGroup.enable({ emitEvent: false });
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);

    if (this.configuration.errorFunctionParameters === null || this.configuration.errorFunctionParameters === undefined) {
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

      let p = this.configuration.param;
      if (this.configuration.inputType === 'RULE_INPUT' && this.allRuleInputs) {
        p = this.allRuleInputs.find(x => x.inputName === this.configuration.param.inputName);
      }

      let c = this.configuration.constant;
      if (this.configuration.inputType === 'CONSTANT' && this.allConstants) {
        c = this.allConstants.find(x => x.constantName === this.configuration.constant.constantName);
      }

      let property = this.configuration.property;
      if (this.configuration.inputType === 'PROPERTY' && this.allModelProperties) {
        property = this.allModelProperties.find(x => x.name === this.configuration.property.name);
      }

      let branchparam = this.configuration.branchparam;
      if (this.configuration.inputType === 'BRANCH_PARAM' && this.branchAvailability.branchParams) {
        branchparam = this.branchAvailability.branchParams.find(x => x.name === this.configuration.branchparam.name);
      }

      let assignedProperty = this.configuration.assignedProperty;
      if (this.configuration.assignedtoinputType === 'PROPERTY' && assignedProperty && this.allModelProperties) {
        assignedProperty = this.allModelProperties.find(x => x.name === this.configuration.assignedProperty.name);
      }

      let assignedReference = this.configuration.assignedReference;
      if (this.configuration.assignedtoinputType === 'REFERENCE' && assignedReference && this.allReferenceProperties) {
        assignedReference = this.allReferenceProperties.find(x => x.name === this.configuration.assignedReference.name);
      }

      let errorBranch = this.configuration.errorBranch;
      if (errorBranch && this.allErrorBranches) {
        errorBranch = this.allErrorBranches.find(x => x.name === this.configuration.errorBranch.name);
      }

      //second input

      let secondparam = this.configuration.secondparam;
      if (this.configuration.secondinputType === 'RULE_INPUT' && this.allRuleInputs) {
        secondparam = this.allRuleInputs.find(x => x.inputName === this.configuration.secondparam.inputName);
      }

      let secondconstant = this.configuration.secondconstant;
      if (this.configuration.secondinputType === 'CONSTANT' && this.allConstants) {
        secondconstant = this.allConstants.find(x => x.constantName === this.configuration.secondconstant.constantName);
      }

      let secondproperty = this.configuration.secondproperty;
      if (this.configuration.secondinputType === 'PROPERTY' && this.allModelProperties) {
        secondproperty = this.allModelProperties.find(x => x.name === this.configuration.secondproperty.name);
      }

      let secondbranchparam = this.configuration.secondbranchparam;
      if (this.configuration.secondinputType === 'BRANCH_PARAM' && this.branchAvailability.branchParams) {
        secondbranchparam = this.branchAvailability.branchParams.find(x => x.name === this.configuration.secondbranchparam.name);
      }


      //third input

      let thirdparam = this.configuration.thirdparam;
      if (this.configuration.thirdinputType === 'RULE_INPUT' && this.allRuleInputs) {
        thirdparam = this.allRuleInputs.find(x => x.inputName === this.configuration.thirdparam.inputName);
      }

      let thirdconstant = this.configuration.thirdconstant;
      if (this.configuration.thirdinputType === 'CONSTANT' && this.allConstants) {
        thirdconstant = this.allConstants.find(x => x.constantName === this.configuration.thirdconstant.constantName);
      }

      let thirdproperty = this.configuration.thirdproperty;
      if (this.configuration.thirdinputType === 'PROPERTY' && this.allModelProperties) {
        thirdproperty = this.allModelProperties.find(x => x.name === this.configuration.thirdproperty.name);
      }

      let thirdbranchparam = this.configuration.thirdbranchparam;
      if (this.configuration.thirdinputType === 'BRANCH_PARAM' && this.branchAvailability.branchParams) {
        thirdbranchparam = this.branchAvailability.branchParams.find(x => x.name === this.configuration.thirdbranchparam.name);
      }

      this.grpcCallNodeConfigFormGroup.patchValue({
        grpcMethod: this.configuration.grpcMethod,
        apiMethodName: this.configuration.apiMethodName,
        inputType: this.configuration.inputType,
        param: p,
        constant: c,
        property: property,
        branchparam: branchparam,
        secondbranchparam: secondbranchparam,
        secondinputType: this.configuration.secondinputType,
        secondparam: secondparam,
        secondconstant: secondconstant,
        secondproperty: secondproperty,
        thirdbranchparam: thirdbranchparam,
        thirdinputType: this.configuration.thirdinputType,
        thirdparam: thirdparam,
        thirdconstant: thirdconstant,
        thirdproperty: thirdproperty,
        assignedProperty: assignedProperty,
        assignedtoinputType: this.configuration.assignedtoinputType,
        assignedReference: assignedReference,
        errorMsg: this.configuration.errorMsg,
        errorAction: this.configuration.errorAction,
        errorBranch: errorBranch,
        errorInputType: this.configuration.errorInputType,
        errorBranchparameter: this.configuration.errorBranchparameter,
        errorParameterinputType: this.configuration.errorParameterinputType,
        errorParameterparam: this.configuration.errorParameterparam,
        errorParameterproperty: this.configuration.errorParameterproperty,
        errorParameterbranchparam: this.configuration.errorParameterbranchparam,
        errorIsAsync: this.configuration.errorIsAsync,
        isReturn: this.configuration.isReturn
      });

      this.changeSubscription = this.grpcCallNodeConfigFormGroup.get('isReturn').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.isReturn = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.grpcCallNodeConfigFormGroup.get('secondbranchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondbranchparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.grpcCallNodeConfigFormGroup.get('secondparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.grpcCallNodeConfigFormGroup.get('secondconstant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondconstant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.grpcCallNodeConfigFormGroup.get('secondproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.grpcCallNodeConfigFormGroup.get('thirdbranchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.thirdbranchparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.grpcCallNodeConfigFormGroup.get('thirdparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.thirdparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.grpcCallNodeConfigFormGroup.get('thirdconstant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.thirdconstant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.grpcCallNodeConfigFormGroup.get('thirdproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.thirdproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.grpcCallNodeConfigFormGroup.get('grpcMethod').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.grpcMethod = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.grpcCallNodeConfigFormGroup.get('apiMethodName').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.apiMethodName = configuration;
          this.updateModel(this.configuration);
        }
      );


      this.changeSubscription = this.grpcCallNodeConfigFormGroup.get('assignedtoinputType').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {

          this.configuration.assignedtoinputType = configuration;
          if (this.configuration.assignedtoinputType == 'PROPERTY') {
            this.configuration.assignedReference = {};
            this.grpcCallNodeConfigFormGroup.get('assignedReference').patchValue([], { emitEvent: false });
          } else if (this.configuration.assignedtoinputType == 'REFERENCE') {
            this.configuration.assignedProperty = {};
            this.grpcCallNodeConfigFormGroup.get('assignedProperty').patchValue([], { emitEvent: false });
          }
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.grpcCallNodeConfigFormGroup.get('errorIsAsync').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorIsAsync = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.grpcCallNodeConfigFormGroup.get('errorBranch').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorBranch = configuration;

          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.grpcCallNodeConfigFormGroup.get('errorParameterparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorParameterparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.grpcCallNodeConfigFormGroup.get('errorParameterbranchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorParameterbranchparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.grpcCallNodeConfigFormGroup.get('errorParameterproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorParameterproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.grpcCallNodeConfigFormGroup.get('assignedProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.assignedProperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.grpcCallNodeConfigFormGroup.get('assignedReference').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.assignedReference = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.grpcCallNodeConfigFormGroup.get('param').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.param = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.grpcCallNodeConfigFormGroup.get('branchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.branchparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.grpcCallNodeConfigFormGroup.get('constant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.constant = configuration;


          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.grpcCallNodeConfigFormGroup.get('property').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.property = configuration;


          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.grpcCallNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorMsg = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.grpcCallNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
        (configuration: any) => {

          this.configuration.errorAction = configuration;
          this.updateModel(this.configuration);
        }
      );

    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.grpcCallNodeConfigFormGroup.valid) {
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

