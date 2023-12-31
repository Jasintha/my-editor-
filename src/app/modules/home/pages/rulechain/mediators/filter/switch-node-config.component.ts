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
  selector: 'virtuan-switch-node-config',
  templateUrl: './switch-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SwitchNodeConfigComponent),
    multi: true
  }]
})
export class SwitchNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
  apptype: string;

  @Input()
  allRoots: any[];

  @Input()
  allRuleInputs: any[];

  @Input() branchAvailability: any;

    domainModelProperties: any[];
    viewModelProperties: any[];

  @Input()
  disabled: boolean;

  @Input()
  ruleNodeId: string;

  nodeDefinitionValue: RuleNodeDefinition;

  datasource: MatTableDataSource<ConditionalStatement>;

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

  switchNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;
  
  selectedVariableProperties: any[];
  selectedSecondVariableProperties: any[];
  selectedEntityProperties: any[];
  selectedCustomObjectProperties: any[];
  selectedSecondEntityProperties: any[];
  selectedSecondCustomObjectProperties: any[];

  displayedColumns: string[] = ['name','condition', 'inputType', 'input', 'property', 'actions'];
 // displayedColumns: string[] = ['name', 'condition', 'inputType', 'input', 'property', 'root', 'isAsync', 'actions'];

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.switchNodeConfigFormGroup = this.fb.group({
      firstinputType: [],
      constant: [],
      param: [],
      property: [],
      branchparam: [],
      switchsecondbranchparam: [],
      switchCondition: "",
      switchSecondinputType: [],
      switchsecondconstant: [],
      switchsecondparam: [],
      switchsecondproperty:[],
     // switchroot: "",
     // switchisAsync:false,
     // defaultEnabled: false,
      //errorMsg: "",
      //errorAction: "",
     // defaultroot: "",
     // defaultisAsync: false
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
    let inputType: string = this.switchNodeConfigFormGroup.get('firstinputType').value;
    this.configuration.firstinputType = inputType;

    if (inputType === 'CONSTANT'){
      this.configuration.param= {};
      this.configuration.property= {};
      this.configuration.branchparam= {};

      this.switchNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.switchNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
      this.switchNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});

    } else if (inputType === 'RULE_INPUT'){
      this.configuration.constant= {};
      this.configuration.property= {};
      this.configuration.branchparam= {};

      this.switchNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.switchNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
      this.switchNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.constant= {};
      this.configuration.param= {};
      this.configuration.branchparam= {};
      this.switchNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.switchNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.switchNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.constant= {};
      this.configuration.param= {};
      this.configuration.property= {};
      this.switchNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.switchNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.switchNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  refreshSecondInputTypes(){
    let inputType: string = this.switchNodeConfigFormGroup.get('switchSecondinputType').value;
    this.configuration.switchSecondinputType = inputType;

    if (inputType === 'CONSTANT'){
      this.configuration.switchsecondparam= {};
      this.configuration.switchsecondproperty= {};
      this.configuration.switchsecondbranchparam= {};

      this.switchNodeConfigFormGroup.get('switchsecondparam').patchValue([], {emitEvent: false});
      this.switchNodeConfigFormGroup.get('switchsecondproperty').patchValue([], {emitEvent: false});
      this.switchNodeConfigFormGroup.get('switchsecondbranchparam').patchValue([], {emitEvent: false});

    } else if (inputType === 'RULE_INPUT'){
      this.configuration.switchsecondconstant= {};
      this.configuration.switchsecondproperty= {};
      this.configuration.switchsecondbranchparam= {};

      this.switchNodeConfigFormGroup.get('switchsecondconstant').patchValue([], {emitEvent: false});
      this.switchNodeConfigFormGroup.get('switchsecondproperty').patchValue([], {emitEvent: false});
      this.switchNodeConfigFormGroup.get('switchsecondbranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.switchsecondconstant= {};
      this.configuration.switchsecondparam= {};
      this.configuration.switchsecondbranchparam= {};

      this.switchNodeConfigFormGroup.get('switchsecondconstant').patchValue([], {emitEvent: false});
      this.switchNodeConfigFormGroup.get('switchsecondparam').patchValue([], {emitEvent: false});
      this.switchNodeConfigFormGroup.get('switchsecondbranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.switchsecondconstant= {};
      this.configuration.switchsecondparam= {};
      this.configuration.switchsecondproperty= {};

      this.switchNodeConfigFormGroup.get('switchsecondconstant').patchValue([], {emitEvent: false});
      this.switchNodeConfigFormGroup.get('switchsecondparam').patchValue([], {emitEvent: false});
      this.switchNodeConfigFormGroup.get('switchsecondproperty').patchValue([], {emitEvent: false});
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
      this.switchNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.switchNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  addSwitchCase(): void{

    let casenumber = this.configuration.switchCases.length + 1;
    let casename = 'Case' + casenumber;

    let inputType: string = this.switchNodeConfigFormGroup.get('switchSecondinputType').value;
    let switchCondition: string = this.switchNodeConfigFormGroup.get('switchCondition').value;
    //let switchroot: string = this.switchNodeConfigFormGroup.get('switchroot').value;
    //let switchisAsync: string = this.switchNodeConfigFormGroup.get('switchisAsync').value;

    if (inputType === 'RULE_INPUT'){
      let selectedSwitchParam = this.switchNodeConfigFormGroup.get('switchsecondparam').value;
      let switchcase = {
        'name' : casename,
        'condition': switchCondition,
        'inputType': inputType,
        'input': '-',
        'property': selectedSwitchParam.inputName,
        'scope': ''
      };
      this.configuration.switchCases.push(switchcase);
      this.updateModel(this.configuration);
    } else if (inputType === 'PROPERTY'){
      let selectedSwitchProperty = this.switchNodeConfigFormGroup.get('switchsecondproperty').value;
      let switchcase = {
        'name' : casename,
        'condition': switchCondition,
        'inputType': inputType,
        'input': '-',
        'property': selectedSwitchProperty.name,
        'scope': selectedSwitchProperty.propertyScope
      };
      this.configuration.switchCases.push(switchcase);
      this.updateModel(this.configuration);
    } else if (inputType === 'CONSTANT'){
      let selectedSwitchConstant = this.switchNodeConfigFormGroup.get('switchsecondconstant').value;
      let switchcase = {
        'name' : casename,
        'condition': switchCondition,
        'inputType': inputType,
        'input': '-',
        'property': selectedSwitchConstant.constantName,
        'scope': selectedSwitchConstant.scope
      };
      this.configuration.switchCases.push(switchcase);
      this.updateModel(this.configuration);
    } else if (inputType === 'BRANCH_PARAM'){
      let selectedSwitchBranchParam = this.switchNodeConfigFormGroup.get('switchsecondbranchparam').value;
      let switchcase = {
        'name' : casename,
        'condition': switchCondition,
        'inputType': inputType,
        'input': '-',
        'property': selectedSwitchBranchParam.name,
        'scope': ''
      };
      this.configuration.switchCases.push(switchcase);
      this.updateModel(this.configuration);
    }

    this.datasource = new MatTableDataSource(this.configuration.switchCases);

    this.configuration.switchSecondinputType = '';
    this.configuration.switchCondition = '';
    this.configuration.switchsecondparam= {};
    this.configuration.switchsecondproperty= {};
    this.configuration.switchsecondbranchparam= {};
    this.configuration.switchsecondconstant= {};

    this.switchNodeConfigFormGroup.get('switchSecondinputType').patchValue('', {emitEvent: false});
    this.switchNodeConfigFormGroup.get('switchCondition').patchValue('', {emitEvent: false});
   // this.switchNodeConfigFormGroup.get('switchroot').patchValue('', {emitEvent: false});
   // this.switchNodeConfigFormGroup.get('switchisAsync').patchValue(false, {emitEvent: false});
    this.switchNodeConfigFormGroup.get('switchsecondparam').patchValue([], {emitEvent: false});
    this.switchNodeConfigFormGroup.get('switchsecondproperty').patchValue([], {emitEvent: false});
    this.switchNodeConfigFormGroup.get('switchsecondconstant').patchValue([], {emitEvent: false});
    this.switchNodeConfigFormGroup.get('switchsecondbranchparam').patchValue([], {emitEvent: false});

  }

  deleteRow(index: number): void{
    this.configuration.switchCases.splice(index, 1);
    this.datasource = new MatTableDataSource(this.configuration.switchCases);
    this.updateModel(this.configuration);
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);
    if(this.configuration.switchCases === null || this.configuration.switchCases === undefined){
        this.configuration.switchCases = [];
    }
    this.datasource = new MatTableDataSource(this.configuration.switchCases);

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

      let param = this.configuration.param;
      if(this.configuration.firstinputType === 'RULE_INPUT' && this.allRuleInputs){
        param = this.allRuleInputs.find(x => x.inputName === this.configuration.param.inputName );
      }

      let constant = this.configuration.constant;
      if(this.configuration.firstinputType === 'CONSTANT' && this.allConstants){
        constant = this.allConstants.find(x => x.constantName === this.configuration.constant.constantName );
      }

      let property = this.configuration.property;
      if(this.configuration.firstinputType === 'PROPERTY' && this.allModelProperties){
        property = this.allModelProperties.find(x => x.name === this.configuration.property.name );
      }

      let branchparam = this.configuration.branchparam;
      if(this.configuration.firstinputType === 'BRANCH_PARAM' && this.branchAvailability.branchParams){
        branchparam = this.branchAvailability.branchParams.find(x => x.name === this.configuration.branchparam.name );
      }

      //second input

      /*
      let defaultroot = this.configuration.defaultroot;
      if(defaultroot && this.allRoots){
        defaultroot = this.allRoots.find(x => x === this.configuration.defaultroot );
      }
      */

      this.switchNodeConfigFormGroup.patchValue({
        firstinputType: this.configuration.firstinputType,
        param: param,
        constant: constant,
        property: property,
        branchparam: branchparam,
        switchsecondbranchparam: this.configuration.switchsecondbranchparam,
        switchCondition: this.configuration.switchCondition,
        switchSecondinputType: this.configuration.switchSecondinputType,
        switchsecondparam: this.configuration.switchsecondparam,
        switchsecondconstant: this.configuration.switchsecondconstant,
        switchsecondproperty: this.configuration.switchsecondproperty,
        // switchroot: this.configuration.switchroot,
        // switchisAsync: this.configuration.switchisAsync,
        //errorMsg: this.configuration.errorMsg,
        //errorAction: this.configuration.errorAction,
        // defaultEnabled: this.configuration.defaultEnabled,
        // defaultisAsync: this.configuration.defaultisAsync,
        // defaultroot: defaultroot
      });

      /*
      this.changeSubscription = this.switchNodeConfigFormGroup.get('defaultroot').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.defaultroot = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.switchNodeConfigFormGroup.get('defaultisAsync').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.defaultisAsync = configuration;
          this.updateModel(this.configuration);
        }
      );


      this.changeSubscription = this.switchNodeConfigFormGroup.get('defaultEnabled').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.defaultEnabled = configuration;
          if(!this.configuration.defaultEnabled){
            this.configuration.defaultisAsync = false;
            this.configuration.defaultroot = "";
          }
          this.updateModel(this.configuration);
        }
      );


      this.changeSubscription = this.switchNodeConfigFormGroup.get('switchroot').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.switchroot = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.switchNodeConfigFormGroup.get('switchisAsync').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.switchisAsync = configuration;
          this.updateModel(this.configuration);
        }
      );


      this.changeSubscription = this.switchNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorMsg = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.switchNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
        (configuration: any) => {

          this.configuration.errorAction = configuration;
          this.updateModel(this.configuration);
        }
      );
      */

      this.changeSubscription = this.switchNodeConfigFormGroup.get('switchCondition').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.switchCondition = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.switchNodeConfigFormGroup.get('param').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.param = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.switchNodeConfigFormGroup.get('constant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.constant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.switchNodeConfigFormGroup.get('property').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.property = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.switchNodeConfigFormGroup.get('branchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.branchparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      //second input changes

      this.changeSubscription = this.switchNodeConfigFormGroup.get('switchsecondparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.switchsecondparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.switchNodeConfigFormGroup.get('switchsecondconstant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.switchsecondconstant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.switchNodeConfigFormGroup.get('switchsecondproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.switchsecondproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.switchNodeConfigFormGroup.get('switchsecondbranchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.switchsecondbranchparam = configuration;
          this.updateModel(this.configuration);
        }
      );

    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.switchNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}

export interface ConditionalStatement {
  name: string;
  condition: string;
  inputType: string;
  input: string;
  property: string;
  scope: string;
 // root: string;
 // isAsync: string;
}
