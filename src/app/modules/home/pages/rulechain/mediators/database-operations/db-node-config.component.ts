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
import {SelectionModel} from '@angular/cdk/collections';

import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

interface DomainModelNode {
  label: string;
  data: any;
  children?: DomainModelNode[];
}

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
  data: any;
}

@Component({
  selector: 'virtuan-db-node-config',
  templateUrl: './db-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DBNodeConfigComponent),
    multi: true
  }]
})
export class DBNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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

  @Input()
  allErrorBranches: any[];

  @Input()
  allViewModels: any[];

  @Input()
  allDomainModels: any[];

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
  disabled: boolean;

  @Input()
  allRuleInputs: any[];

  @Input()
  ruleNodeId: string;

  @Input()
  queryDb: string;

  @Input()
  commandDb: string;

  @Input()
  allModelProperties: any[];
  
  @Input() branchAvailability: any;
  
  @Input()
  allReferenceProperties: any[];

  @Input()
  allConnectionProperties: any[];

  @Input()
  apptype: string;
  
  @Input()
  allDomainModelsWithSub: any[];

  @Input()
  allViewModelsWithSub: any[];

  domainModelProperties: any[];
  viewModelProperties: any[];

  nodeDefinitionValue: RuleNodeDefinition;
  
  propertydatasource: MatTableDataSource<QueryBuilder>;
  selectedSpecificPropertiesDatasource: MatTableDataSource<SelectedProperty>;

  errordatasource: MatTableDataSource<ErrorFunctionParameters>;
  displayErroredColumns: string[] = ['parameterName', 'inputType', 'input', 'property', 'actions'];
  
  displayedColumns: string[] = ['modelpropertyName', 'condition', 'inputType', 'property', 'join', 'actions'];
  selectedSpecificPropertiesColumns: string[] = ['modelpropertyName','selectAs','fieldFunction', 'actions'];

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

  dbNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;
  
  selectedVariableProperties: any[];
  selectedEntityProperties: any[];
  selectedCustomObjectProperties: any[];

  private propagateChange = (v: any) => { };

  private _transformer = (node: DomainModelNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.label,
      level: level,
      data: node.data
    };
  }

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level, node => node.expandable);

  treeFlattener = new MatTreeFlattener(
    this._transformer, node => node.level, node => node.expandable, node => node.children);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  getLevel = (node: ExampleFlatNode) => node.level;
  
/** The selection for checklist */
  checklistSelection = new SelectionModel<ExampleFlatNode>(false /* multiple */);

  checkboxClick(node){
    this.checklistSelection.toggle(node);

  }

  //select specific tree
  private _transformerSelectSpecific = (node: DomainModelNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.label,
      level: level,
      data: node.data
    };
  }

  treeControlSelectSpecific = new FlatTreeControl<ExampleFlatNode>(
    node => node.level, node => node.expandable);

  treeFlattenerSelectSpecific = new MatTreeFlattener(
    this._transformerSelectSpecific, node => node.level, node => node.expandable, node => node.children);

  selectSpecificDataSource = new MatTreeFlatDataSource(this.treeControlSelectSpecific, this.treeFlattenerSelectSpecific);

  hasChildSelectSpecific = (_: number, node: ExampleFlatNode) => node.expandable;

  getLevelSelectSpecific = (node: ExampleFlatNode) => node.level;

/** The selection for checklist */
  checklistSelectionSelectSpecific = new SelectionModel<ExampleFlatNode>(false /* multiple */);

  checkboxClickSelectSpecific(node){
    this.checklistSelectionSelectSpecific.toggle(node);

  }
  
  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.dbNodeConfigFormGroup = this.fb.group({
    //  dbType:[],
      dbConnection: [],
      dbAction: [],
      entity: [],
      property: [],
      crudinputType: "",
      crudparam: [],
      crudconstant: [],
      crudproperty: [],
      crudbranchparam: [],
      errorMsg: "",
      errorAction: "",
      assignedProperty: [],
      assignedtoinputType: "",
      assignedReference: [],
        selectType: "",
        model: [],
        querycondition: "",
        parameterinputType: "",
        parameterparam: [],
        parameterproperty: [],
        parameterconstant: [],
        parameterbranch: [],
        join: "",
        selectAs: "",
        fieldFunction: "",
      errorBranch: [],
      errorInputType: [],
      errorIsAsync: false,
      errorBranchparameter: [],
      errorParameterinputType: [],
      errorParameterparam: [],
      errorParameterproperty: [],
      errorParameterbranchparam: [],
      isReturn: true
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
    let errorInputType: string = this.dbNodeConfigFormGroup.get('errorParameterinputType').value;
    this.configuration.errorParameterinputType = errorInputType;
    if (errorInputType === 'RULE_INPUT'){
      this.configuration.errorParameterproperty= {};
      this.configuration.errorParameterbranchparam= {};
      this.dbNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});
    } else if (errorInputType === 'PROPERTY'){
      this.configuration.errorParameterparam= {};
      this.configuration.errorParameterbranchparam= {};
      this.dbNodeConfigFormGroup.get('parameterbranchparam').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});
    } else if (errorInputType === 'BRANCH_PARAM'){
      this.configuration.errorParameterparam= {};
      this.configuration.errorParameterproperty= {};
      this.dbNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('errorParameterparam').patchValue([], {emitEvent: false});
    }
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  refreshParameterInputTypes(){
    let inputType: string = this.dbNodeConfigFormGroup.get('parameterinputType').value;
    this.configuration.parameterinputType = inputType;
    if (inputType === 'RULE_INPUT'){
      this.configuration.parameterproperty= {};
      this.configuration.parameterbranch= {};
      this.configuration.parameterconstant= {};
      this.dbNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.parameterparam= {};
      this.configuration.parameterbranch= {};
      this.configuration.parameterconstant= {};
      this.dbNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.parameterparam= {};
      this.configuration.parameterproperty= {};
      this.configuration.parameterconstant= {};
      this.dbNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
    } else if (inputType === 'CONSTANT'){
      this.configuration.parameterparam= {};
      this.configuration.parameterproperty= {};
      this.configuration.parameterbranch= {};
      this.dbNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
    }
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }
  
  refreshInputTypes(){
    let inputType: string = this.dbNodeConfigFormGroup.get('crudinputType').value;
    this.configuration.crudinputType = inputType;

    if (inputType === 'RULE_INPUT'){
      this.configuration.crudconstant= {};
      this.configuration.crudproperty= {};
      this.configuration.crudbranchparam= {};

      this.dbNodeConfigFormGroup.get('crudconstant').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('crudproperty').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('crudbranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.crudparam= {};
      this.configuration.crudconstant= {};
      this.configuration.crudbranchparam= {};

      this.dbNodeConfigFormGroup.get('crudconstant').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('crudparam').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('crudbranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'CONSTANT'){
      this.configuration.crudparam= {};
      this.configuration.crudproperty= {};
      this.configuration.crudbranchparam= {};

      this.dbNodeConfigFormGroup.get('crudproperty').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('crudparam').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('crudbranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.crudparam= {};
      this.configuration.crudproperty= {};
      this.configuration.crudconstant= {};

      this.dbNodeConfigFormGroup.get('crudproperty').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('crudparam').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('crudconstant').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  addQueryBuilder(): void{

    let checklistSelection = this.checklistSelection.selected[0];
    let selectedNode : DomainModelProperty;
    if(checklistSelection){
         selectedNode = {
          name: checklistSelection.name,
          data: checklistSelection.data
        };
    }

    let inputType: string = this.dbNodeConfigFormGroup.get('parameterinputType').value;

    let join: string = this.dbNodeConfigFormGroup.get('join').value;
    if(join){
    } else {
        join = '';
    }

    if (inputType === 'RULE_INPUT'){
      let selectedParam = this.dbNodeConfigFormGroup.get('parameterparam').value;
      let parameterparam = {
        'inputType': inputType,
        'condition': this.dbNodeConfigFormGroup.get('querycondition').value,
        'join': join,
        'modelproperty': selectedNode,
        'property': selectedParam.inputName,
        'modelpropertyName': selectedNode.name,
        'scope': ''
      };
      this.configuration.whereClauseBuilders.push(parameterparam);
      this.updateModel(this.configuration);
    } else if (inputType === 'PROPERTY'){
      let selectedProperty = this.dbNodeConfigFormGroup.get('parameterproperty').value;
      let parameterproperty = {
        'inputType': inputType,
        'condition': this.dbNodeConfigFormGroup.get('querycondition').value,
        'join': join,
        'modelproperty': selectedNode,
        'property': selectedProperty.name,
        'modelpropertyName': selectedNode.name,
        'scope': selectedProperty.propertyScope
      };

      this.configuration.whereClauseBuilders.push(parameterproperty);
      this.updateModel(this.configuration);
    } else if (inputType === 'BRANCH_PARAM'){
      let selectedBranch = this.dbNodeConfigFormGroup.get('parameterbranch').value;
      let parameterbranch = {
        'inputType': inputType,
        'condition': this.dbNodeConfigFormGroup.get('querycondition').value,
        'join': join,
        'modelproperty': selectedNode,
        'property': selectedBranch.name,
        'modelpropertyName': selectedNode.name,
        'scope': ''
      };

      this.configuration.whereClauseBuilders.push(parameterbranch);
      this.updateModel(this.configuration);
    } else if (inputType === 'CONSTANT'){
      let selectedConstant = this.dbNodeConfigFormGroup.get('parameterconstant').value;
      let parameterbranch = {
        'inputType': inputType,
        'condition': this.dbNodeConfigFormGroup.get('querycondition').value,
        'join': join,
        'modelproperty': selectedNode,
        'property': selectedConstant.constantName,
        'modelpropertyName': selectedNode.name,
        'scope': selectedConstant.scope
      };

      this.configuration.whereClauseBuilders.push(parameterbranch);
      this.updateModel(this.configuration);
    } else {
      let defaultobj = {
        'inputType': '-',
        'condition': this.dbNodeConfigFormGroup.get('querycondition').value,
        'join': join,
        'modelproperty': selectedNode,
        'property': '-',
        'modelpropertyName': selectedNode.name,
        'scope': ''
      };

      this.configuration.whereClauseBuilders.push(defaultobj);
      this.updateModel(this.configuration);

    }

    this.propertydatasource = new MatTableDataSource(this.configuration.whereClauseBuilders);

    this.configuration.parameterinputType = '';
    this.configuration.parameterproperty= {};
    this.configuration.parameterbranch= {};
    this.configuration.parameterparam= {};
    this.configuration.parameterconstant= {};
    this.configuration.querycondition= '';
    this.configuration.join= '';

    this.dbNodeConfigFormGroup.get('parameterinputType').patchValue([], {emitEvent: false});
    this.dbNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
    this.dbNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
    this.dbNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
    this.dbNodeConfigFormGroup.get('join').patchValue("", {emitEvent: false});
    this.dbNodeConfigFormGroup.get('parameterconstant').patchValue({}, {emitEvent: false});
    this.dbNodeConfigFormGroup.get('querycondition').patchValue("", {emitEvent: false});

  }

  deleteErrorRow(index: number): void{
    this.configuration.errorFunctionParameters.splice(index, 1);
    this.errordatasource = new MatTableDataSource(this.configuration.errorFunctionParameters);
    this.updateModel(this.configuration);
  }

  addErrorParameter(): void{

    let errorInputType: string = this.dbNodeConfigFormGroup.get('errorParameterinputType').value;
    let errorBranchparameter = this.dbNodeConfigFormGroup.get('errorBranchparameter').value;

    if (errorInputType === 'RULE_INPUT'){
      let selectedErrorParameterParam = this.dbNodeConfigFormGroup.get('errorParameterparam').value;
      let errorParameter = {
        'parameterName': errorBranchparameter.name,
        'inputType': errorInputType,
        'input': '-',
        'property': selectedErrorParameterParam.inputName
      };
      this.configuration.errorFunctionParameters.push(errorParameter);
      this.updateModel(this.configuration);
    } else if (errorInputType === 'PROPERTY'){
      let selectedErrorParameterProperty = this.dbNodeConfigFormGroup.get('errorParameterproperty').value;
      let errorParameterproperty = {
        'parameterName': errorBranchparameter.name,
        'inputType': errorInputType,
        'input': '-',
        'property': selectedErrorParameterProperty.name
      };
      this.configuration.errorFunctionParameters.push(errorParameterproperty);
      this.updateModel(this.configuration);
    } else if (errorInputType === 'BRANCH_PARAM'){
      let selectedErrorParameterBranch = this.dbNodeConfigFormGroup.get('errorParameterbranchparam').value;
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

    this.dbNodeConfigFormGroup.get('errorParameterinputType').patchValue([], {emitEvent: false});
    this.dbNodeConfigFormGroup.get('errorParameterparam').patchValue([], {emitEvent: false});
    this.dbNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
    this.dbNodeConfigFormGroup.get('errorBranchparameter').patchValue([], {emitEvent: false});
    this.dbNodeConfigFormGroup.get('errorParameterbranchparam').patchValue([], {emitEvent: false});

  }

  deleteRow(index: number): void{
    this.configuration.whereClauseBuilders.splice(index, 1);
    this.propertydatasource = new MatTableDataSource(this.configuration.whereClauseBuilders);
    this.updateModel(this.configuration);
  }

  addSelectedProperty(): void{

    let checklistSelectionSelectSpecific = this.checklistSelectionSelectSpecific.selected[0];
    let selectedNode : DomainModelProperty;
    if(checklistSelectionSelectSpecific){
         selectedNode = {
          name: checklistSelectionSelectSpecific.name,
          data: checklistSelectionSelectSpecific.data
        };
    }

    let selectSpecificProperty = {
      'modelproperty': selectedNode,
      'modelpropertyName': selectedNode.name,
      'selectAs': this.dbNodeConfigFormGroup.get('selectAs').value,
      'fieldFunction': this.dbNodeConfigFormGroup.get('fieldFunction').value
    };
    this.configuration.selectedProperties.push(selectSpecificProperty);
    this.updateModel(this.configuration);
    this.selectedSpecificPropertiesDatasource = new MatTableDataSource(this.configuration.selectedProperties);

  }

  deleteRowSelectedProperty(index: number): void{
    this.configuration.selectedProperties.splice(index, 1);
    this.selectedSpecificPropertiesDatasource = new MatTableDataSource(this.configuration.selectedProperties);
    this.updateModel(this.configuration);
  }

  refreshDbActions(){

    let action: string = this.dbNodeConfigFormGroup.get('dbAction').value;
    this.configuration.dbAction = action;

    if(action === 'QUERY'){
      this.configuration.crudinputType= "";
      this.configuration.crudparam= {};
      this.configuration.crudconstant= {};
      this.configuration.crudproperty= {};
      this.configuration.crudbranchparam= {};

      this.configuration.entity= {};

      this.configuration.assignedtoinputType= "";
      this.configuration.assignedProperty= {};
      this.configuration.assignedReference= {};

      this.configuration.property= {};

      this.dbNodeConfigFormGroup.get('entity').patchValue([], {emitEvent: false});

      this.dbNodeConfigFormGroup.get('assignedtoinputType').patchValue("", {emitEvent: false});
      this.dbNodeConfigFormGroup.get('assignedProperty').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('assignedReference').patchValue([], {emitEvent: false});

      this.dbNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('crudinputType').patchValue("", {emitEvent: false});
      this.dbNodeConfigFormGroup.get('crudparam').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('crudbranchparam').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('crudconstant').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('crudproperty').patchValue([], {emitEvent: false});


    } else if(action === 'UPDATE' || action === 'CREATE'){
      this.configuration.crudinputType= "";
      this.configuration.crudparam= {};
      this.configuration.crudconstant= {};
      this.configuration.crudproperty= {};
      this.configuration.crudbranchparam= {};

      this.configuration.entity= {};

      this.configuration.assignedtoinputType= "";
      this.configuration.assignedProperty= {};
      this.configuration.assignedReference= {};

      this.configuration.selectType= "";
      this.configuration.model= {};
      this.configuration.querycondition= "";
      this.configuration.parameterinputType= "";
      this.configuration.parameterparam= {};
      this.configuration.parameterproperty= {};
      this.configuration.parameterbranch= {};
      this.configuration.parameterconstant= {};
      this.configuration.join= "";

      this.configuration.whereClauseBuilders = [];
      this.configuration.selectedProperties = [];
      this.propertydatasource = new MatTableDataSource(this.configuration.whereClauseBuilders);
      this.selectedSpecificPropertiesDatasource = new MatTableDataSource(this.configuration.selectedProperties);
      this.dataSource.data = [];
      this.selectSpecificDataSource.data = [];

      this.dbNodeConfigFormGroup.get('entity').patchValue([], {emitEvent: false});

      this.dbNodeConfigFormGroup.get('assignedtoinputType').patchValue("", {emitEvent: false});
      this.dbNodeConfigFormGroup.get('assignedProperty').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('assignedReference').patchValue([], {emitEvent: false});

      this.dbNodeConfigFormGroup.get('crudinputType').patchValue("", {emitEvent: false});
      this.dbNodeConfigFormGroup.get('crudparam').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('crudbranchparam').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('crudconstant').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('crudproperty').patchValue([], {emitEvent: false});

      this.dbNodeConfigFormGroup.get('selectType').patchValue("", {emitEvent: false});
      this.dbNodeConfigFormGroup.get('model').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('parameterinputType').patchValue("", {emitEvent: false});
      this.dbNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('querycondition').patchValue("", {emitEvent: false});
      this.dbNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('join').patchValue("", {emitEvent: false});
    } else {
      this.configuration.property= {};
      this.dbNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});

      if(action === 'DELETE' || action === 'DELETEALL'){
        this.configuration.assignedtoinputType= "";
        this.configuration.assignedProperty= {};
        this.configuration.assignedReference= {};

        this.dbNodeConfigFormGroup.get('assignedtoinputType').patchValue("", {emitEvent: false});
        this.dbNodeConfigFormGroup.get('assignedProperty').patchValue([], {emitEvent: false});
        this.dbNodeConfigFormGroup.get('assignedReference').patchValue([], {emitEvent: false});
      }

      if(action === 'FINDALL' || action === 'DELETEALL'){
        this.configuration.crudinputType= "";
        this.configuration.crudparam= {};
        this.configuration.crudconstant= {};
        this.configuration.crudproperty= {};
        this.configuration.crudbranchparam= {};

        this.dbNodeConfigFormGroup.get('crudinputType').patchValue("", {emitEvent: false});
        this.dbNodeConfigFormGroup.get('crudparam').patchValue([], {emitEvent: false});
        this.dbNodeConfigFormGroup.get('crudbranchparam').patchValue([], {emitEvent: false});
        this.dbNodeConfigFormGroup.get('crudconstant').patchValue([], {emitEvent: false});
        this.dbNodeConfigFormGroup.get('crudproperty').patchValue([], {emitEvent: false});
      }

      this.configuration.selectType= "";
      this.configuration.model= {};
      this.configuration.querycondition= "";
      this.configuration.parameterinputType= "";
      this.configuration.parameterparam= {};
      this.configuration.parameterproperty= {};
      this.configuration.parameterbranch= {};
      this.configuration.parameterconstant= {};
      this.configuration.join= "";

      this.dbNodeConfigFormGroup.get('selectType').patchValue("", {emitEvent: false});
      this.dbNodeConfigFormGroup.get('model').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('parameterinputType').patchValue("", {emitEvent: false});
      this.dbNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('querycondition').patchValue("", {emitEvent: false});
      this.dbNodeConfigFormGroup.get('parameterconstant').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('join').patchValue("", {emitEvent: false});

      this.configuration.whereClauseBuilders = [];
      this.configuration.selectedProperties = [];
      this.propertydatasource = new MatTableDataSource(this.configuration.whereClauseBuilders);
      this.selectedSpecificPropertiesDatasource = new MatTableDataSource(this.configuration.selectedProperties);
      this.dataSource.data = [];
      this.selectSpecificDataSource.data = [];

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
      this.dbNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.dbNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);

    if(this.configuration.whereClauseBuilders === null || this.configuration.whereClauseBuilders === undefined){
        this.configuration.whereClauseBuilders = [];
    }
    this.propertydatasource = new MatTableDataSource(this.configuration.whereClauseBuilders);

    if(this.configuration.selectedProperties === null || this.configuration.selectedProperties === undefined){
        this.configuration.selectedProperties = [];
    }
    this.selectedSpecificPropertiesDatasource = new MatTableDataSource(this.configuration.selectedProperties);

    if(this.configuration.errorFunctionParameters === null || this.configuration.errorFunctionParameters === undefined){
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

      let model = this.configuration.model;
      if(this.configuration.dbAction === 'QUERY' && this.allDomainModels){

        model = this.allDomainModels.find(x => x.name === this.configuration.model.name );

        if(model){
            let designtree : any[] = [];
            designtree.push(model.design);
            this.dataSource.data = designtree;
            if(this.configuration.selectType === 'SELECTSPECIFIC'){
                this.selectSpecificDataSource.data = designtree;
            }
        }
      }

      let dbConnection = this.configuration.dbConnection;
      if(this.allConnectionProperties && this.configuration.dbConnection){
        dbConnection = this.allConnectionProperties.find(x => x.name === this.configuration.dbConnection.name);
      }

      let entity = this.configuration.entity;
      if((this.configuration.dbAction === 'FIND' || this.configuration.dbAction === 'FINDALL' || this.configuration.dbAction === 'DELETEALL' || this.configuration.dbAction === 'DELETE') && entity && this.inputEntities){
      entity = this.inputEntities.find(x => x.name === this.configuration.entity.name );
      }

      console.log(this.allErrorBranches);

      let errorBranch = this.configuration.errorBranch;
      if(errorBranch && this.allErrorBranches){
        errorBranch = this.allErrorBranches.find(x => x.name === this.configuration.errorBranch.name );
      }

      let property = this.configuration.property;
      if((this.configuration.dbAction === 'CREATE' || this.configuration.dbAction === 'UPDATE') && property && this.allModelProperties){
        property = this.allModelProperties.find(x => x.name === this.configuration.property.name );
      }

      //crud input


      let crudparam = this.configuration.crudparam;
      if(this.configuration.crudinputType === 'RULE_INPUT' && this.allRuleInputs){
        crudparam = this.allRuleInputs.find(x => x.inputName === this.configuration.crudparam.inputName );
      }

      let crudconstant = this.configuration.crudconstant;
      if(this.configuration.crudinputType === 'CONSTANT' && this.allConstants){
        crudconstant = this.allConstants.find(x => x.constantName === this.configuration.crudconstant.constantName );
      }

      let crudproperty = this.configuration.crudproperty;
      if(this.configuration.crudinputType === 'PROPERTY' && this.allModelProperties){
        crudproperty = this.allModelProperties.find(x => x.name === this.configuration.crudproperty.name );
      }
      
      let assignedProperty = this.configuration.assignedProperty;
      if(this.configuration.assignedtoinputType === 'PROPERTY' && assignedProperty && this.allModelProperties){
        assignedProperty = this.allModelProperties.find(x => x.name === this.configuration.assignedProperty.name );
      }
      
      let assignedReference = this.configuration.assignedReference;
      if(this.configuration.assignedtoinputType === 'REFERENCE' && assignedReference && this.allReferenceProperties){
        assignedReference = this.allReferenceProperties.find(x => x.name === this.configuration.assignedReference.name );
      }
      
      let crudbranchparam = this.configuration.crudbranchparam;
      if(this.configuration.crudinputType === 'BRANCH_PARAM' && this.branchAvailability.branchParams){
        crudbranchparam = this.branchAvailability.branchParams.find(x => x.name === this.configuration.crudbranchparam.name );
      }

      this.dbNodeConfigFormGroup.patchValue({
      //  dbType: this.configuration.dbType,
        dbConnection: dbConnection,
        dbAction: this.configuration.dbAction,
        entity: entity,
        crudinputType: this.configuration.crudinputType,
        crudconstant: crudconstant,
        crudproperty: crudproperty,
        crudparam: crudparam,
        crudbranchparam: crudbranchparam,
        errorMsg: this.configuration.errorMsg,
        errorAction: this.configuration.errorAction,
        assignedProperty: assignedProperty,
        property: property,
        assignedtoinputType: this.configuration.assignedtoinputType,
        assignedReference: assignedReference,
        selectType: this.configuration.selectType,
        model: model,
        querycondition: this.configuration.querycondition,
        parameterinputType: this.configuration.parameterinputType,
        parameterparam: this.configuration.parameterparam,
        parameterproperty: this.configuration.parameterproperty,
        parameterconstant: this.configuration.parameterconstant,
        parameterbranch: this.configuration.parameterbranch,
        join: this.configuration.join,
        selectAs: this.configuration.selectAs,
        fieldFunction: this.configuration.fieldFunction,
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

      /*
      this.changeSubscription = this.dbNodeConfigFormGroup.get('dbAction').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.dbAction = configuration;
          this.updateModel(this.configuration);
        }
      );
      */

      this.changeSubscription = this.dbNodeConfigFormGroup.get('isReturn').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.isReturn = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.dbNodeConfigFormGroup.get('errorIsAsync').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorIsAsync = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.dbNodeConfigFormGroup.get('errorBranch').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorBranch = configuration;

            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.dbNodeConfigFormGroup.get('errorParameterparam').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorParameterparam = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.dbNodeConfigFormGroup.get('errorParameterbranchparam').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorParameterbranchparam = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.dbNodeConfigFormGroup.get('errorParameterproperty').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.errorParameterproperty = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.dbNodeConfigFormGroup.get('dbConnection').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.dbConnection = configuration;
          this.updateModel(this.configuration);
        }
      );

      /*
      this.changeSubscription = this.dbNodeConfigFormGroup.get('dbType').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.dbType = configuration;
          this.updateModel(this.configuration);
        }
      );
      */

      this.changeSubscription = this.dbNodeConfigFormGroup.get('property').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.property = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.dbNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorMsg = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.dbNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
        (configuration: any) => {

          this.configuration.errorAction = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.dbNodeConfigFormGroup.get('entity').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.entity = configuration;

          //let selectedentity = this.inputEntities.find(x => x.name === configuration.name );
          //if(selectedentity){
          //  this.selectedEntityProperties = selectedentity.properties;
          //}

          this.updateModel(this.configuration);
        }
      );
      
      this.changeSubscription = this.dbNodeConfigFormGroup.get('assignedReference').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.assignedReference = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.dbNodeConfigFormGroup.get('assignedtoinputType').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {

          this.configuration.assignedtoinputType = configuration;
          if(this.configuration.assignedtoinputType == 'PROPERTY'){
            this.configuration.assignedReference= {};
            this.dbNodeConfigFormGroup.get('assignedReference').patchValue([], {emitEvent: false});
          }else if (this.configuration.assignedtoinputType == 'REFERENCE'){
            this.configuration.assignedProperty= {};
            this.dbNodeConfigFormGroup.get('assignedProperty').patchValue([], {emitEvent: false});
          }
          this.updateModel(this.configuration);
        }
      );

      //crud input changes


      this.changeSubscription = this.dbNodeConfigFormGroup.get('crudparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.crudparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.dbNodeConfigFormGroup.get('crudproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.crudproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.dbNodeConfigFormGroup.get('crudconstant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.crudconstant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.dbNodeConfigFormGroup.get('assignedProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.assignedProperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.dbNodeConfigFormGroup.get('crudbranchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.crudbranchparam = configuration;
          this.updateModel(this.configuration);
        }
      );


      this.changeSubscription = this.dbNodeConfigFormGroup.get('selectType').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.selectType = configuration;
          let designtree : any[] = [];
          if(configuration === 'SELECTSPECIFIC'){
              if(this.allDomainModels){
                let selectedModel = this.allDomainModels.find(x => x.name === this.configuration.model.name );
                if(selectedModel){
                    designtree.push(selectedModel.design);
                }
              }
          } else {
            this.configuration.selectedProperties = [];
            this.selectedSpecificPropertiesDatasource = new MatTableDataSource(this.configuration.selectedProperties);
          }
          this.selectSpecificDataSource.data = designtree;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.dbNodeConfigFormGroup.get('querycondition').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.querycondition = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.dbNodeConfigFormGroup.get('join').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.join = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.dbNodeConfigFormGroup.get('parameterparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.dbNodeConfigFormGroup.get('parameterproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.dbNodeConfigFormGroup.get('parameterconstant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterconstant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.dbNodeConfigFormGroup.get('parameterbranch').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterbranch = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.dbNodeConfigFormGroup.get('selectAs').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.selectAs = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.dbNodeConfigFormGroup.get('fieldFunction').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.fieldFunction = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.dbNodeConfigFormGroup.get('model').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.model = configuration;
          let designtree : any[] = [];

          if(this.allDomainModels){
            let selectedModel = this.allDomainModels.find(x => x.name === configuration.name );
            designtree.push(selectedModel.design);
          }
          this.dataSource.data = designtree;

          this.updateModel(this.configuration);
        }
      );

    }
  }

  titleCaseWord(word: string) {
    if (!word) return word;
    return word[0].toUpperCase() + word.substr(1);
  }

  lowerCaseWord(word: string) {
    if (!word) return word;
    return word[0].toLowerCase() + word.substr(1);
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.dbNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}

export interface QueryBuilder {
  inputType: string;
  property: string;
  condition: string;
  join: string;
  modelproperty: DomainModelProperty;
  modelpropertyName: string;
  scope: string;
}

export interface SelectedProperty {
  modelproperty: DomainModelProperty;
  modelpropertyName: string;
  selectAs: string;
  fieldFunction: string;
}

export interface DomainModelProperty {
  name: string;
 // key: string;
  data: any;
}

export interface ErrorFunctionParameters {
  parameterName: string;
  inputType: string;
  input: string;
  property: string;
}
