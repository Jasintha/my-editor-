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
  selector: 'virtuan-connection-property-node-config',
  templateUrl: './connection-property-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ConnectionPropertyNodeConfigComponent),
    multi: true
  }]
})
export class ConnectionPropertyNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
    allRuleInputs: any[];

    @Input()
    allVariables: any[];


    @Input()
    allDomainModelsWithSub: any[];

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
    apptype: string;

  @Input()
  connectionPropertyTemplates: any[];

  nodeDefinitionValue: RuleNodeDefinition;

  datasource: MatTableDataSource<ConnectionTemplateProperty>;
  propertydatasource: MatTableDataSource<ConnectionProperty>;

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

  connectionPropertyNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  displayedColumns: string[] = ['connectionpropertyname', 'inputType', 'property', 'actions'];
  propertydisplayedColumns: string[] = ['name', 'type', 'scope', 'actions'];

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.connectionPropertyNodeConfigFormGroup = this.fb.group({
      name: '',
      scope: '',
      type: '',
      templateproperty: [],
      propertyinputType: '',
      param: [],
      constant: [],
      property: [],
      branchparam: []

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
  
  refreshInputTypes(){
    let inputType: string = this.connectionPropertyNodeConfigFormGroup.get('propertyinputType').value;
    this.configuration.propertyinputType = inputType;

      if (inputType === 'CONSTANT'){
      this.configuration.conpropertyparam= {};
      this.configuration.conpropertyproperty= {};
      this.configuration.conpropertybranchparam= {};
      this.connectionPropertyNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.connectionPropertyNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
      this.connectionPropertyNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});

    } else if (inputType === 'RULE_INPUT'){
      this.configuration.conpropertyconstant= {};
      this.configuration.conpropertyproperty= {};
      this.configuration.conpropertybranchparam= {};
      this.connectionPropertyNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.connectionPropertyNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
      this.connectionPropertyNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.conpropertyconstant= {};
      this.configuration.conpropertyparam= {};
      this.configuration.conpropertybranchparam= {};
      this.connectionPropertyNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.connectionPropertyNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.connectionPropertyNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.conpropertyconstant= {};
      this.configuration.conpropertyparam= {};
      this.configuration.conpropertyproperty= {};
      this.connectionPropertyNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.connectionPropertyNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.connectionPropertyNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  refreshTemplates(){
    this.configuration.propertyinputType = '';
    this.configuration.conpropertybranchparam= {};
    this.configuration.conpropertyparam= {};
    this.configuration.conpropertyconstant= {};
    this.configuration.conpropertyproperty= {};
    this.connectionPropertyNodeConfigFormGroup.patchValue({
      propertyinputType: '',
      param: [],
      property: [],
      constant: [],
      branchparam: []
    });
    this.configuration.connectionTemplateProperties = [];
    //this.updateModel(this.configuration);
    this.datasource = new MatTableDataSource(this.configuration.connectionTemplateProperties);
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  addProperty(): void{
  
    let templateproperty = this.connectionPropertyNodeConfigFormGroup.get('templateproperty').value;

    let connectionpropertyname = '';
    let connectionpropertykey = '';
    let connectionpropertydatatype = '';
    
    if (templateproperty){
        connectionpropertyname = templateproperty.name;
        connectionpropertykey = templateproperty.key;
        connectionpropertydatatype = templateproperty.dataType;
    }

    let inputType: string = this.connectionPropertyNodeConfigFormGroup.get('propertyinputType').value;
    let input = '';
    let property = ''
    let propertyscope = ''

    if (inputType === 'RULE_INPUT'){
      let selectedParam = this.connectionPropertyNodeConfigFormGroup.get('param').value;
      input = '-';
      propertyscope = '-'
      property = selectedParam.inputName;
    } else if (inputType === 'PROPERTY'){
      let selectedProperty = this.connectionPropertyNodeConfigFormGroup.get('property').value;
      input = '-';
      property = selectedProperty.name;
      propertyscope = selectedProperty.propertyScope;

    } else if (inputType === 'CONSTANT'){
      let selectedConstant = this.connectionPropertyNodeConfigFormGroup.get('constant').value;
      input = '-';
      property = selectedConstant.constantName;
      propertyscope = selectedConstant.scope;

    } else if (inputType === 'BRANCH_PARAM'){
      let selectedBranchParam = this.connectionPropertyNodeConfigFormGroup.get('branchparam').value;
      input = '-';
      propertyscope = '-'
      property = selectedBranchParam.name;
    }
    
      let conProp = {
        'connectionpropertyname' : connectionpropertyname,
        'connectionpropertykey': connectionpropertykey,
        'connectionpropertydatatype': connectionpropertydatatype,
        'inputType': inputType,
        'property': property,
        'propertyscope': propertyscope
      };
    
    this.configuration.connectionTemplateProperties.push(conProp);
    this.updateModel(this.configuration);
    this.datasource = new MatTableDataSource(this.configuration.connectionTemplateProperties);

    this.configuration.propertyinputType = '';
    this.configuration.templateproperty = {};
    this.configuration.conpropertybranchparam= {};
    this.configuration.conpropertyparam= {};
    this.configuration.conpropertyconstant= {};
    this.configuration.conpropertyproperty= {};

    this.connectionPropertyNodeConfigFormGroup.patchValue({
      templateproperty: [],
      propertyinputType: '',
      param: [],
      property: [],
      constant: [],
      branchparam: []
    });
  }

  addConProperty(){
    let name = this.connectionPropertyNodeConfigFormGroup.get('name').value;
    let selectedtype = this.connectionPropertyNodeConfigFormGroup.get('type').value;
    let scope = this.connectionPropertyNodeConfigFormGroup.get('scope').value;

    let type = '';
    let group = '';
    if(selectedtype){
        type = selectedtype.key;
        group = selectedtype.type;
    }

      let conProp = {
        'name' : name,
        'scope': scope,
        'type': type,
        'group': group,
        'properties': this.configuration.connectionTemplateProperties
      };

    this.configuration.connectionProperties.push(conProp);

    this.updateModel(this.configuration);

    this.configuration.connectionTemplateProperties = [];
    this.configuration.connectionpropname = '';
    this.configuration.connectionpropscope = '';
    this.configuration.connectionproptype= {};

    this.propertydatasource = new MatTableDataSource(this.configuration.connectionProperties);
    this.datasource = new MatTableDataSource(this.configuration.connectionTemplateProperties);

    this.connectionPropertyNodeConfigFormGroup.patchValue({
      name: '',
      scope: '',
      type: []
    });
  }

  deleteConRow(index: number): void{
    this.configuration.connectionProperties.splice(index, 1);
    this.propertydatasource = new MatTableDataSource(this.configuration.connectionProperties);
    this.updateModel(this.configuration);
  }

  deleteRow(index: number): void{
    this.configuration.connectionTemplateProperties.splice(index, 1);
    this.datasource = new MatTableDataSource(this.configuration.connectionTemplateProperties);
    this.updateModel(this.configuration);
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.connectionPropertyNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.connectionPropertyNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

   this.configuration = deepClone(value);
   
   this.configuration.connectionTemplateProperties = [];
   
    if(this.configuration.connectionProperties === null || this.configuration.connectionProperties === undefined){
        this.configuration.connectionProperties = [];
    }
     this.datasource = new MatTableDataSource(this.configuration.connectionTemplateProperties);
     this.propertydatasource = new MatTableDataSource(this.configuration.connectionProperties);

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
      this.connectionPropertyNodeConfigFormGroup.patchValue({
        name: this.configuration.connectionpropname,
        scope: this.configuration.connectionpropscope,
        type: this.configuration.connectionproptype,
        templateproperty: this.configuration.templateproperty,
        propertyinputType: this.configuration.propertyinputType,
        branchparam: this.configuration.conpropertybranchparam,
        param: this.configuration.conpropertyparam,
        constant: this.configuration.conpropertyconstant,
        property: this.configuration.conpropertyproperty
      });

      this.changeSubscription = this.connectionPropertyNodeConfigFormGroup.get('name').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.connectionpropname = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.connectionPropertyNodeConfigFormGroup.get('param').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.conpropertyparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.connectionPropertyNodeConfigFormGroup.get('constant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.conpropertyconstant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.connectionPropertyNodeConfigFormGroup.get('property').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.conpropertyproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.connectionPropertyNodeConfigFormGroup.get('branchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.conpropertybranchparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.connectionPropertyNodeConfigFormGroup.get('scope').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.connectionpropscope = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.connectionPropertyNodeConfigFormGroup.get('type').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.connectionproptype = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.connectionPropertyNodeConfigFormGroup.get('templateproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.templateproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {

    if (this.definedConfigComponent || this.connectionPropertyNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {

      this.propagateChange(this.required ? null : configuration);
    }
  }

}

export interface ConnectionTemplateProperty {
  connectionpropertyname: string;
  connectionpropertykey: string;
  connectionpropertydatatype: string;
  inputType: string;
  property: string;
}


export interface ConnectionProperty {
  name: string;
  type: string;
  scope: string;
  group: string;
  properties: ConnectionTemplateProperty[];
}