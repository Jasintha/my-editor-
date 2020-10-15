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
  selector: 'tb-branch-node-config',
  templateUrl: './branch-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => BranchNodeConfigComponent),
    multi: true
  }]
})
export class BranchNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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

  nodeDefinitionValue: RuleNodeDefinition;

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

  datasource: MatTableDataSource<CallFunctionParameters>;

  displayedColumns: string[] = ['parameterName', 'inputType', 'input', 'property', 'actions'];

  errorOptions: any[] = [{'name': 'Log & Continue', 'id': 1}, {'name': 'Log & Exit', 'id': 2}, {'name': 'Return', 'id': 3}];

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

  branchNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;


  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.branchNodeConfigFormGroup = this.fb.group({
      branch: [],
      isAsync: false,
      errorMsg: "",
      errorAction: "",
      branchparameter: [],
      inputType: [],
      parameterinputType: [],
      parameterparam: [],
      parameterproperty: [],
      parameterbranchparam: []
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
      this.branchNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.branchNodeConfigFormGroup.enable({emitEvent: false});
    }
  }
  
  refreshParameterInputTypes(){
    let inputType: string = this.branchNodeConfigFormGroup.get('parameterinputType').value;
    this.configuration.parameterinputType = inputType;
    if (inputType === 'PARAM'){
      this.configuration.parameterproperty= {};
      this.configuration.parameterbranchparam= {};
      this.branchNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
      this.branchNodeConfigFormGroup.get('parameterbranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.parameterparam= {};
      this.configuration.parameterbranchparam= {};
      this.branchNodeConfigFormGroup.get('parameterbranchparam').patchValue([], {emitEvent: false});
      this.branchNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.parameterparam= {};
      this.configuration.parameterproperty= {};
      this.branchNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
      this.branchNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
    }
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  deleteRow(index: number): void{
    this.configuration.callFunctionParameters.splice(index, 1);
    this.datasource = new MatTableDataSource(this.configuration.callFunctionParameters);
    this.updateModel(this.configuration);
  }

  addParameter(): void{

    let inputType: string = this.branchNodeConfigFormGroup.get('parameterinputType').value;
    let branchparameter = this.branchNodeConfigFormGroup.get('branchparameter').value;

    if (inputType === 'PARAM'){
      let selectedParameterParam = this.branchNodeConfigFormGroup.get('parameterparam').value;
      let parameter = {
        'parameterName': branchparameter.name,
        'inputType': inputType,
        'input': '-',
        'property': selectedParameterParam.inputName
      };
      this.configuration.callFunctionParameters.push(parameter);
      this.updateModel(this.configuration);
    } else if (inputType === 'PROPERTY'){
      let selectedParameterProperty = this.branchNodeConfigFormGroup.get('parameterproperty').value;
      let parameterproperty = {
        'parameterName': branchparameter.name,
        'inputType': inputType,
        'input': '-',
        'property': selectedParameterProperty.name
      };
      this.configuration.callFunctionParameters.push(parameterproperty);
      this.updateModel(this.configuration);
    } else if (inputType === 'BRANCH_PARAM'){
      let selectedParameterBranch = this.branchNodeConfigFormGroup.get('parameterbranchparam').value;
      let parameterbranchparam = {
        'parameterName': branchparameter.name,
        'inputType': inputType,
        'input': '-',
        'property': selectedParameterBranch.name
      };
      this.configuration.callFunctionParameters.push(parameterbranchparam);
      this.updateModel(this.configuration);
    }

    this.datasource = new MatTableDataSource(this.configuration.callFunctionParameters);

    this.configuration.parameterinputType = '';
    this.configuration.parameterproperty= {};
    this.configuration.parameterparam= {};
    this.configuration.branchparameter= {};
    this.configuration.parameterbranchparam= {};

    this.branchNodeConfigFormGroup.get('parameterinputType').patchValue([], {emitEvent: false});
    this.branchNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
    this.branchNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
    this.branchNodeConfigFormGroup.get('branchparameter').patchValue([], {emitEvent: false});
    this.branchNodeConfigFormGroup.get('parameterbranchparam').patchValue([], {emitEvent: false});

  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);

    if(this.configuration.callFunctionParameters === null || this.configuration.callFunctionParameters === undefined){
        this.configuration.callFunctionParameters = [];
    }
    this.datasource = new MatTableDataSource(this.configuration.callFunctionParameters);

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

      let branch = this.configuration.branch;
      if(branch && this.allRoots){
        branch = this.allRoots.find(x => x.name === this.configuration.branch.name );
      }
      let errorAction = this.configuration.errorAction;
      //if(errorAction > 0){
       // errorAction = this.errorOptions.find(x => x.id === this.configuration.errorAction );
     // }

      this.branchNodeConfigFormGroup.patchValue({
        branch: branch,
        inputType: this.configuration.inputType,
        branchparameter: this.configuration.branchparameter,
        parameterinputType: this.configuration.parameterinputType,
        parameterparam: this.configuration.parameterparam,
        parameterproperty: this.configuration.parameterproperty,
        parameterbranchparam: this.configuration.parameterbranchparam,
        isAsync: this.configuration.isAsync,
        errorMsg: this.configuration.errorMsg,
        errorAction: errorAction
      });

      this.changeSubscription = this.branchNodeConfigFormGroup.get('isAsync').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.isAsync = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.branchNodeConfigFormGroup.get('branch').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.branch = configuration;
          console.log(this.configuration.branch);
          this.updateModel(this.configuration);
        }
      );
      
      this.changeSubscription = this.branchNodeConfigFormGroup.get('parameterparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.branchNodeConfigFormGroup.get('parameterbranchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterbranchparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.branchNodeConfigFormGroup.get('parameterproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.branchNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorMsg = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.branchNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorAction = configuration;
          this.updateModel(this.configuration);
        }
      );
    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {

    if (this.definedConfigComponent || this.branchNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}

export interface CallFunctionParameters {
  parameterName: string;
  inputType: string;
  input: string;
  property: string;
}