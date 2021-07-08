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
  selector: 'virtuan-context-property-node-config',
  templateUrl: './context-property-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ContextPropertyNodeConfigComponent),
    multi: true
  }]
})
export class ContextPropertyNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
  
  @Input()
  allReferenceProperties: any[];

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

  contextPropertyNodeConfigFormGroup: FormGroup;

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

  datasource: MatTableDataSource<ContextProperty>;

  displayedColumns: string[] = ['name', 'valueinputType', 'valueName', 'actions'];

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.contextPropertyNodeConfigFormGroup = this.fb.group({
      contextpropname: "",
      valueinputType: "",
      valueparam: [],
      valueproperty: [],
      valueconstant:[],
      valuebranchparam: []
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
    let inputType: string = this.contextPropertyNodeConfigFormGroup.get('propertyinputType').value;
    this.configuration.propertyinputType = inputType;

    if (inputType === 'PROPERTY'){
      this.configuration.propertyreference= {};
      this.contextPropertyNodeConfigFormGroup.get('propertyreference').patchValue([], {emitEvent: false});
    } else if (inputType === 'REFERENCE'){
      this.configuration.propertyproperty= {};
      this.contextPropertyNodeConfigFormGroup.get('propertyproperty').patchValue([], {emitEvent: false});
    }
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  refreshSecondInputTypes(){
    let inputType: string = this.contextPropertyNodeConfigFormGroup.get('valueinputType').value;
    this.configuration.valueinputType = inputType;

    if (inputType === 'CONSTANT'){
      this.configuration.valueparam= {};
      this.configuration.valueproperty= {};
      this.configuration.valuebranchparam= {};

      this.contextPropertyNodeConfigFormGroup.get('valueparam').patchValue([], {emitEvent: false});
      this.contextPropertyNodeConfigFormGroup.get('valueproperty').patchValue([], {emitEvent: false});
      this.contextPropertyNodeConfigFormGroup.get('valuebranchparam').patchValue([], {emitEvent: false});

    } else if (inputType === 'RULE_INPUT'){
      this.configuration.valueconstant= {};
      this.configuration.valueproperty= {};
      this.configuration.valuebranchparam= {};

      this.contextPropertyNodeConfigFormGroup.get('valueconstant').patchValue([], {emitEvent: false});
      this.contextPropertyNodeConfigFormGroup.get('valueproperty').patchValue([], {emitEvent: false});
      this.contextPropertyNodeConfigFormGroup.get('valuebranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.valueconstant= {};
      this.configuration.valueparam= {};
      this.configuration.valuebranchparam= {};

      this.contextPropertyNodeConfigFormGroup.get('valueconstant').patchValue([], {emitEvent: false});
      this.contextPropertyNodeConfigFormGroup.get('valueparam').patchValue([], {emitEvent: false});
      this.contextPropertyNodeConfigFormGroup.get('valuebranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.valueconstant= {};
      this.configuration.valueparam= {};
      this.configuration.valueproperty= {};

      this.contextPropertyNodeConfigFormGroup.get('valueconstant').patchValue([], {emitEvent: false});
      this.contextPropertyNodeConfigFormGroup.get('valueparam').patchValue([], {emitEvent: false});
      this.contextPropertyNodeConfigFormGroup.get('valueproperty').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  addAssignment(): void{

    let contextpropname: string = this.contextPropertyNodeConfigFormGroup.get('contextpropname').value;
    let valueinputType: string = this.contextPropertyNodeConfigFormGroup.get('valueinputType').value;
    let valueName: string = '';
    let valueScope: string = '';

    if (valueinputType === 'RULE_INPUT'){
      let selectedValueParam = this.contextPropertyNodeConfigFormGroup.get('valueparam').value;
      valueName = selectedValueParam.inputName;

    } else if (valueinputType === 'PROPERTY'){
      let selectedValueProperty = this.contextPropertyNodeConfigFormGroup.get('valueproperty').value;
      valueName = selectedValueProperty.name;
      valueScope = selectedValueProperty.propertyScope;

    } else if (valueinputType === 'BRANCH_PARAM'){
      let selectedValueBranch = this.contextPropertyNodeConfigFormGroup.get('valuebranchparam').value;
      valueName = selectedValueBranch.name;

    } else if (valueinputType === 'CONSTANT'){
      let selectedValueConstant = this.contextPropertyNodeConfigFormGroup.get('valueconstant').value;
      valueName = selectedValueConstant.constantName;
      valueScope = selectedValueConstant.scope;

    }

    let assignment = {
      'name': contextpropname,
      'valueinputType': valueinputType,
      'valueName': valueName,
      'valueScope': valueScope
    };

    this.configuration.contextProperties.push(assignment);
    this.updateModel(this.configuration);
    this.datasource = new MatTableDataSource(this.configuration.contextProperties);

    this.configuration.contextpropname = '';
    this.configuration.valueinputType= '';
    //this.configuration.propertyproperty= {};
    //this.configuration.propertyreference= {};
    this.configuration.valueparam= {};
    this.configuration.valueproperty= {};
    this.configuration.valueconstant= {};
    this.configuration.valuebranchparam= {};

    this.contextPropertyNodeConfigFormGroup.patchValue({
      contextpropname: "",
      valueinputType: "",
      valueparam: [],
      valueproperty: [],
      valueconstant:[],
      valuebranchparam: []
    });
  }

  deleteRow(index: number): void{
    this.configuration.contextProperties.splice(index, 1);
    this.datasource = new MatTableDataSource(this.configuration.contextProperties);
    this.updateModel(this.configuration);
  }

  ngAfterViewInit(): void {
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.contextPropertyNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.contextPropertyNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);

    if(this.configuration.contextProperties === null || this.configuration.contextProperties === undefined){
        this.configuration.contextProperties = [];
    }
    this.datasource = new MatTableDataSource(this.configuration.contextProperties);

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

      /*
      let property = this.configuration.property;
      if(this.configuration.inputType === 'PROPERTY' && this.allModelProperties){
        property = this.allModelProperties.find(x => x.name === this.configuration.property.name );
      }

      let referenceProperty = this.configuration.referenceProperty;
      if(this.configuration.inputType === 'REFERENCE' && this.allReferenceProperties){
        referenceProperty = this.allReferenceProperties.find(x => x.name === this.configuration.referenceProperty.name );
      }

      //second input


      let valueparam = this.configuration.valueparam;
      if(this.configuration.secondinputType === 'RULE_INPUT' && this.allRuleInputs){
        valueparam = this.allRuleInputs.find(x => x.inputName === this.configuration.valueparam.inputName );
      }

      let valueconstant = this.configuration.valueconstant;
      if(this.configuration.secondinputType === 'CONSTANT' && this.allConstants){
        valueconstant = this.allConstants.find(x => x.constantName === this.configuration.valueconstant.constantName );
      }

      let valueproperty = this.configuration.valueproperty;
      if(this.configuration.secondinputType === 'PROPERTY' && this.allModelProperties){
        valueproperty = this.allModelProperties.find(x => x.name === this.configuration.valueproperty.name );
      }

      let valuebranchparam = this.configuration.valuebranchparam;
      if(this.configuration.secondinputType === 'BRANCH_PARAM' && this.branchAvailability.branchParams){
        valuebranchparam = this.branchAvailability.branchParams.find(x => x.name === this.configuration.valuebranchparam.name );
      }


      this.contextPropertyNodeConfigFormGroup.patchValue({
        inputType: this.configuration.inputType,
        referenceProperty: referenceProperty,
        property: property,
        valuebranchparam: valuebranchparam,
        secondinputType: this.configuration.secondinputType,
        valueparam: valueparam,
        valueconstant: valueconstant,
        valueproperty: valueproperty
      });
      */


      this.changeSubscription = this.contextPropertyNodeConfigFormGroup.get('contextpropname').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.contextpropname = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.contextPropertyNodeConfigFormGroup.get('valuebranchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.valuebranchparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      //second input changes

      this.changeSubscription = this.contextPropertyNodeConfigFormGroup.get('valueparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.valueparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.contextPropertyNodeConfigFormGroup.get('valueconstant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.valueconstant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.contextPropertyNodeConfigFormGroup.get('valueproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.valueproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.contextPropertyNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}

export interface ContextProperty {
  name: string;
  valueinputType: string;
  valueName: string;
  valueScope: string;
}

