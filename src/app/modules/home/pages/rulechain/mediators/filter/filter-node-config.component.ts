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
  selector: 'virtuan-filter-node-config',
  templateUrl: './filter-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FilterNodeConfigComponent),
    multi: true
  }]
})
export class FilterNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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

  @Input() branchAvailability: any;

    domainModelProperties: any[];
    viewModelProperties: any[];

  @Input()
  disabled: boolean;

  @Input()
  ruleNodeId: string;

  @Input()
  allRuleInputs: any[];

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

  filterNodeConfigFormGroup: FormGroup;

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

  displayedColumns: string[] = ['parameterName', 'inputType', 'input', 'property', 'actions'];

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.filterNodeConfigFormGroup = this.fb.group({
      firstinputType: [],
      //entity: [],
      //entityProperty: [],
      //customObject: [],
      //customObjectProperty: [],
      constant: [],
      param: [],
      property: [],
      branchparam: [],
      //variable: [],
      //variableProperty: [],
      condition: [],
      secondinputType: [],
      //secondentity: [],
      //secondentityProperty: [],
      //secondcustomObject: [],
      //secondcustomObjectProperty: [],
      secondconstant: [],
      secondparam: [],
      secondproperty:[],
      secondbranchparam: [],
      //secondvariable: [],
      //secondvariableProperty: [],
      //root: [],
      //isAsync: false,
      //secondroot: [],
      //secondisAsync:false,
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
    let inputType: string = this.filterNodeConfigFormGroup.get('firstinputType').value;
    this.configuration.firstinputType = inputType;

    /*
    if(inputType === 'MODEL'){
      this.configuration.customObject= {};
      this.configuration.customObjectProperty = {};
      this.configuration.constant= {};
      this.configuration.param= {};
      this.configuration.variable= {};
      this.configuration.variableProperty= {};

      this.filterNodeConfigFormGroup.get('customObject').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('customObjectProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('variable').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('variableProperty').patchValue([], {emitEvent: false});

    } else if (inputType === 'DTO'){
      this.configuration.entity= {};
      this.configuration.entityProperty = {};
      this.configuration.constant= {};
      this.configuration.param= {};
      this.configuration.variable= {};
      this.configuration.variableProperty= {};

      this.filterNodeConfigFormGroup.get('entity').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('entityProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('variable').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('variableProperty').patchValue([], {emitEvent: false});

    } else if (inputType === 'VARIABLE'){
      this.configuration.entity= {};
      this.configuration.entityProperty = {};
      this.configuration.customObject= {};
      this.configuration.customObjectProperty = {};
      this.configuration.constant= {};
      this.configuration.param= {};

      this.filterNodeConfigFormGroup.get('entity').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('entityProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('customObject').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('customObjectProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
    }
    */


    if (inputType === 'CONSTANT'){
      //this.configuration.entity= {};
      //this.configuration.entityProperty = {};
      //this.configuration.customObject= {};
      //this.configuration.customObjectProperty = {};
      this.configuration.param= {};
      this.configuration.property= {};
      this.configuration.branchparam= {};
      //this.configuration.variable= {};
      //this.configuration.variableProperty= {};

      //this.filterNodeConfigFormGroup.get('entity').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('entityProperty').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('customObject').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('customObjectProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('variable').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('variableProperty').patchValue([], {emitEvent: false});

    } else if (inputType === 'RULE_INPUT'){
      //this.configuration.entity= {};
      //this.configuration.entityProperty = {};
      //this.configuration.customObject= {};
      //this.configuration.customObjectProperty = {};
      this.configuration.constant= {};
      this.configuration.property= {};
      this.configuration.branchparam= {};
      //this.configuration.variable= {};
      //this.configuration.variableProperty= {};

      //this.filterNodeConfigFormGroup.get('entity').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('entityProperty').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('customObject').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('customObjectProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('variable').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('variableProperty').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.constant= {};
      this.configuration.param= {};
      this.configuration.branchparam= {};
      this.filterNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.constant= {};
      this.configuration.param= {};
      this.configuration.property= {};
      this.filterNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  refreshSecondInputTypes(){
    let inputType: string = this.filterNodeConfigFormGroup.get('secondinputType').value;
    this.configuration.secondinputType = inputType;

    /*
    if(inputType === 'MODEL'){
      this.configuration.secondcustomObject= {};
      this.configuration.secondcustomObjectProperty = {};
      this.configuration.secondconstant= {};
      this.configuration.secondparam= {};
      this.configuration.secondvariable= {};
      this.configuration.secondvariableProperty= {};

      this.filterNodeConfigFormGroup.get('secondcustomObject').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondcustomObjectProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondconstant').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondparam').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondvariable').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondvariableProperty').patchValue([], {emitEvent: false});

    } else if (inputType === 'DTO'){
      this.configuration.secondentity= {};
      this.configuration.secondentityProperty = {};
      this.configuration.secondconstant= {};
      this.configuration.secondparam= {};
      this.configuration.secondvariable= {};
      this.configuration.secondvariableProperty= {};

      this.filterNodeConfigFormGroup.get('secondentity').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondentityProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondconstant').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondparam').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondvariable').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondvariableProperty').patchValue([], {emitEvent: false});

    } else if (inputType === 'VARIABLE'){
      this.configuration.secondentity= {};
      this.configuration.secondentityProperty = {};
      this.configuration.secondcustomObject= {};
      this.configuration.secondcustomObjectProperty = {};
      this.configuration.secondconstant= {};
      this.configuration.secondparam= {};

      this.filterNodeConfigFormGroup.get('secondentity').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondentityProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondcustomObject').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondcustomObjectProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondconstant').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondparam').patchValue([], {emitEvent: false});
    }
    */

    if (inputType === 'CONSTANT'){
      //this.configuration.secondentity= {};
      //this.configuration.secondentityProperty = {};
      //this.configuration.secondcustomObject= {};
      //this.configuration.secondcustomObjectProperty = {};
      this.configuration.secondparam= {};
      this.configuration.secondproperty= {};
      this.configuration.secondbranchparam= {};
      //this.configuration.secondvariable= {};
      //this.configuration.secondvariableProperty= {};

      //this.filterNodeConfigFormGroup.get('secondentity').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('secondentityProperty').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('secondcustomObject').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('secondcustomObjectProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondparam').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondproperty').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('secondvariable').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('secondvariableProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondbranchparam').patchValue([], {emitEvent: false});

    } else if (inputType === 'RULE_INPUT'){
      //this.configuration.secondentity= {};
      //this.configuration.secondentityProperty = {};
      //this.configuration.secondcustomObject= {};
      //this.configuration.secondcustomObjectProperty = {};
      this.configuration.secondconstant= {};
      this.configuration.secondproperty= {};
      //this.configuration.secondvariable= {};
      //this.configuration.secondvariableProperty= {};
      this.configuration.secondbranchparam= {};

      //this.filterNodeConfigFormGroup.get('secondentity').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('secondentityProperty').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('secondcustomObject').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('secondcustomObjectProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondconstant').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondproperty').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('secondvariable').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('secondvariableProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondbranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.secondconstant= {};
      this.configuration.secondparam= {};
      this.configuration.secondbranchparam= {};

      this.filterNodeConfigFormGroup.get('secondconstant').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondparam').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondbranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.secondconstant= {};
      this.configuration.secondparam= {};
      this.configuration.secondproperty= {};

      this.filterNodeConfigFormGroup.get('secondconstant').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondparam').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondproperty').patchValue([], {emitEvent: false});
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
      this.filterNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.filterNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);
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


      let secondparam = this.configuration.secondparam;
      if(this.configuration.secondinputType === 'RULE_INPUT' && this.allRuleInputs){
        secondparam = this.allRuleInputs.find(x => x.inputName === this.configuration.secondparam.inputName );
      }

      let secondconstant = this.configuration.secondconstant;
      if(this.configuration.secondinputType === 'CONSTANT' && this.allConstants){
        secondconstant = this.allConstants.find(x => x.constantName === this.configuration.secondconstant.constantName );
      }

      let secondproperty = this.configuration.secondproperty;
      if(this.configuration.secondinputType === 'PROPERTY' && this.allModelProperties){
        secondproperty = this.allModelProperties.find(x => x.name === this.configuration.secondproperty.name );
      }

      let secondbranchparam = this.configuration.secondbranchparam;
      if(this.configuration.secondinputType === 'BRANCH_PARAM' && this.branchAvailability.branchParams){
        secondbranchparam = this.branchAvailability.branchParams.find(x => x.name === this.configuration.secondbranchparam.name );
      }

      /*

      let root = this.configuration.root;
      if(root && this.allRoots){
        root = this.allRoots.find(x => x === this.configuration.root );
      }

      let secondroot = this.configuration.secondroot;
      if(secondroot && this.allRoots){
        secondroot = this.allRoots.find(x => x === this.configuration.secondroot );
      }

      */

      this.filterNodeConfigFormGroup.patchValue({
        firstinputType: this.configuration.firstinputType,
        //entity: entity,
        //entityProperty: entityProperty,
        //customObject: customObject,
        //customObjectProperty: customObjectProperty,
        //variable: variable,
        //variableProperty: variableProperty,
        param: param,
        constant: constant,
        property: property,
        branchparam: branchparam,
        secondbranchparam: secondbranchparam,
        condition: this.configuration.condition,
        secondinputType: this.configuration.secondinputType,
        //secondentity: secondentity,
        //secondentityProperty: secondentityProperty,
        //secondcustomObject: secondcustomObject,
        //secondcustomObjectProperty: secondcustomObjectProperty,
        //secondvariable: secondvariable,
        //secondvariableProperty: secondvariableProperty,
        secondparam: secondparam,
        secondconstant: secondconstant,
        secondproperty: secondproperty,
        //root: root,
        //secondroot: secondroot,
        //isAsync: this.configuration.isAsync,
        //secondisAsync: this.configuration.secondisAsync,
        errorMsg: this.configuration.errorMsg,
        errorAction: this.configuration.errorAction
      });

      /*
      this.changeSubscription = this.filterNodeConfigFormGroup.get('root').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.root = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('secondroot').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondroot = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('isAsync').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.isAsync = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('secondisAsync').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondisAsync = configuration;
          this.updateModel(this.configuration);
        }
      );

      */

      this.changeSubscription = this.filterNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorMsg = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorAction = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('condition').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.condition = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('param').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.param = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('constant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.constant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('property').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.property = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('branchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.branchparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('secondbranchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondbranchparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      //second input changes

      this.changeSubscription = this.filterNodeConfigFormGroup.get('secondparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('secondconstant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondconstant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('secondproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.filterNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}
