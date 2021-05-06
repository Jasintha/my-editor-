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
  selector: 'virtuan-assign-node-config',
  templateUrl: './assign-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AssignNodeConfigComponent),
    multi: true
  }]
})
export class AssignNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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

  assignNodeConfigFormGroup: FormGroup;

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

  datasource: MatTableDataSource<Assignment>;

  displayedColumns: string[] = ['propertyinputType', 'propertyName', 'valueinputType', 'valueName', 'actions'];

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.assignNodeConfigFormGroup = this.fb.group({
      propertyinputType: "",
      propertyproperty: [],
      propertyreference: [],
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
    let inputType: string = this.assignNodeConfigFormGroup.get('propertyinputType').value;
    this.configuration.propertyinputType = inputType;

    if (inputType === 'PROPERTY'){
      this.configuration.propertyreference= {};
      this.assignNodeConfigFormGroup.get('propertyreference').patchValue([], {emitEvent: false});
    } else if (inputType === 'REFERENCE'){
      this.configuration.propertyproperty= {};
      this.assignNodeConfigFormGroup.get('propertyproperty').patchValue([], {emitEvent: false});
    }
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  refreshSecondInputTypes(){
    let inputType: string = this.assignNodeConfigFormGroup.get('valueinputType').value;
    this.configuration.valueinputType = inputType;

    if (inputType === 'CONSTANT'){
      this.configuration.valueparam= {};
      this.configuration.valueproperty= {};
      this.configuration.valuebranchparam= {};

      this.assignNodeConfigFormGroup.get('valueparam').patchValue([], {emitEvent: false});
      this.assignNodeConfigFormGroup.get('valueproperty').patchValue([], {emitEvent: false});
      this.assignNodeConfigFormGroup.get('valuebranchparam').patchValue([], {emitEvent: false});

    } else if (inputType === 'RULE_INPUT'){
      this.configuration.valueconstant= {};
      this.configuration.valueproperty= {};
      this.configuration.valuebranchparam= {};

      this.assignNodeConfigFormGroup.get('valueconstant').patchValue([], {emitEvent: false});
      this.assignNodeConfigFormGroup.get('valueproperty').patchValue([], {emitEvent: false});
      this.assignNodeConfigFormGroup.get('valuebranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.valueconstant= {};
      this.configuration.valueparam= {};
      this.configuration.valuebranchparam= {};

      this.assignNodeConfigFormGroup.get('valueconstant').patchValue([], {emitEvent: false});
      this.assignNodeConfigFormGroup.get('valueparam').patchValue([], {emitEvent: false});
      this.assignNodeConfigFormGroup.get('valuebranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.valueconstant= {};
      this.configuration.valueparam= {};
      this.configuration.valueproperty= {};

      this.assignNodeConfigFormGroup.get('valueconstant').patchValue([], {emitEvent: false});
      this.assignNodeConfigFormGroup.get('valueparam').patchValue([], {emitEvent: false});
      this.assignNodeConfigFormGroup.get('valueproperty').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  addAssignment(): void{

    let propinputType: string = this.assignNodeConfigFormGroup.get('propertyinputType').value;
    let valueinputType: string = this.assignNodeConfigFormGroup.get('valueinputType').value;

    let propertyName: string = '';
    let valueName: string = '';
    let propertyScope: string = '';
    let valueScope: string = '';

    if (propinputType === 'REFERENCE'){
      let selectedPropertyReference = this.assignNodeConfigFormGroup.get('propertyreference').value;
      propertyName = selectedPropertyReference.name;

    } else if (propinputType === 'PROPERTY'){
      let selectedPropertyProperty = this.assignNodeConfigFormGroup.get('propertyproperty').value;
      propertyName = selectedPropertyProperty.name;
      propertyScope= selectedPropertyProperty.propertyScope;

    }
    
    if (valueinputType === 'RULE_INPUT'){
      let selectedValueParam = this.assignNodeConfigFormGroup.get('valueparam').value;
      valueName = selectedValueParam.inputName;

    } else if (valueinputType === 'PROPERTY'){
      let selectedValueProperty = this.assignNodeConfigFormGroup.get('valueproperty').value;
      valueName = selectedValueProperty.name;
      valueScope = selectedValueProperty.propertyScope;

    } else if (valueinputType === 'BRANCH_PARAM'){
      let selectedValueBranch = this.assignNodeConfigFormGroup.get('valuebranchparam').value;
      valueName = selectedValueBranch.name;

    } else if (valueinputType === 'CONSTANT'){
      let selectedValueConstant = this.assignNodeConfigFormGroup.get('valueconstant').value;
      valueName = selectedValueConstant.constantName;
      valueScope = selectedValueConstant.scope;
      
    }

    let assignment = {
      'propertyinputType': propinputType,
      'propertyName': propertyName,
      'propertyScope':propertyScope,
      'valueinputType': valueinputType,
      'valueName': valueName,
      'valueScope': valueScope
    };

    this.configuration.assignments.push(assignment);
    this.updateModel(this.configuration);
    this.datasource = new MatTableDataSource(this.configuration.assignments);

    this.configuration.propertyinputType = '';
    this.configuration.valueinputType= '';
    this.configuration.propertyproperty= {};
    this.configuration.propertyreference= {};
    this.configuration.valueparam= {};
    this.configuration.valueproperty= {};
    this.configuration.valueconstant= {};
    this.configuration.valuebranchparam= {};

    this.assignNodeConfigFormGroup.patchValue({
      propertyinputType: "",
      propertyproperty: [],
      propertyreference: [],
      valueinputType: "",
      valueparam: [],
      valueproperty: [],
      valueconstant:[],
      valuebranchparam: []
    });
  }

  deleteRow(index: number): void{
    this.configuration.assignments.splice(index, 1);
    this.datasource = new MatTableDataSource(this.configuration.assignments);
    this.updateModel(this.configuration);
  }

  ngAfterViewInit(): void {
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.assignNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.assignNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);
    
    if(this.configuration.assignments === null || this.configuration.assignments === undefined){
        this.configuration.assignments = [];
    }
    this.datasource = new MatTableDataSource(this.configuration.assignments);
    
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


      this.assignNodeConfigFormGroup.patchValue({
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

      this.changeSubscription = this.assignNodeConfigFormGroup.get('propertyreference').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.propertyreference = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.assignNodeConfigFormGroup.get('propertyproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.propertyproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.assignNodeConfigFormGroup.get('valuebranchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.valuebranchparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      //second input changes

      this.changeSubscription = this.assignNodeConfigFormGroup.get('valueparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.valueparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.assignNodeConfigFormGroup.get('valueconstant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.valueconstant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.assignNodeConfigFormGroup.get('valueproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.valueproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.assignNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}

export interface Assignment {
  propertyinputType: string;
  propertyName: string;
  valueinputType: string;
  valueName: string;
  propertyScope: string;
  valueScope: string;
}

