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
  selector: 'virtuan-db-dynamic-query-node-config',
  templateUrl: './db-dynamic-query-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DBDynamicQueryNodeConfigComponent),
    multi: true
  }]
})
export class DBDynamicQueryNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
  allSubRules: any[];

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

  errordatasource: MatTableDataSource<ErrorFunctionParameters>;
  displayErroredColumns: string[] = ['parameterName', 'inputType', 'input', 'property', 'actions'];
  
  displayedColumns: string[] = ['modelpropertyName', 'inputType', 'property', 'actions'];

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
      dbConnection: null,
      errorMsg: "",
      errorAction: "",
      assignedProperty: [],
      assignedtoinputType: "",
      assignedReference: [],
        model: null,
        parameterinputType: "",
        parameterparam: [],
        parameterproperty: [],
        parameterconstant: [],
        parameterbranch: [],
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
    } else if (errorInputType === 'ERROR'){
      this.configuration.errorParameterbranchparam= {};
      this.configuration.errorParameterparam= {};
      this.configuration.errorParameterproperty= {};
      this.dbNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('errorParameterparam').patchValue([], {emitEvent: false});
      this.dbNodeConfigFormGroup.get('errorParameterproperty').patchValue([], {emitEvent: false});
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

    if (inputType === 'RULE_INPUT'){
      let selectedParam = this.dbNodeConfigFormGroup.get('parameterparam').value;
      let parameterparam = {
        'inputType': inputType,
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

    this.dbNodeConfigFormGroup.get('parameterinputType').patchValue([], {emitEvent: false});
    this.dbNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
    this.dbNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
    this.dbNodeConfigFormGroup.get('parameterbranch').patchValue([], {emitEvent: false});
    this.dbNodeConfigFormGroup.get('parameterconstant').patchValue({}, {emitEvent: false});

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
        'parameterName': errorBranchparameter.paramName,
        'inputType': errorInputType,
        'input': '-',
        'property': selectedErrorParameterParam.inputName
      };
      this.configuration.errorFunctionParameters.push(errorParameter);
      this.updateModel(this.configuration);
    } else if (errorInputType === 'PROPERTY'){
      let selectedErrorParameterProperty = this.dbNodeConfigFormGroup.get('errorParameterproperty').value;
      let errorParameterproperty = {
        'parameterName': errorBranchparameter.paramName,
        'inputType': errorInputType,
        'input': '-',
        'property': selectedErrorParameterProperty.name
      };
      this.configuration.errorFunctionParameters.push(errorParameterproperty);
      this.updateModel(this.configuration);
    } else if (errorInputType === 'BRANCH_PARAM'){
      let selectedErrorParameterBranch = this.dbNodeConfigFormGroup.get('errorParameterbranchparam').value;
      let errorParameterbranchparam = {
        'parameterName': errorBranchparameter.paramName,
        'inputType': errorInputType,
        'input': '-',
        'property': selectedErrorParameterBranch.name
      };
      this.configuration.errorFunctionParameters.push(errorParameterbranchparam);
      this.updateModel(this.configuration);
    } else if (errorInputType === 'ERROR'){
      let errString = {
        'parameterName': errorBranchparameter.paramName,
        'inputType': errorInputType,
        'input': '-',
        'property': ''
      };
      this.configuration.errorFunctionParameters.push(errString);
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
      if(this.allDomainModels){

        model = this.allDomainModels.find(x => x.name === this.configuration.model.name );

        if(model){
            let designtree : any[] = [];
            designtree.push(model.design);
            this.dataSource.data = designtree;
        }
      }

      let dbConnection = this.configuration.dbConnection;
      if(this.allConnectionProperties && this.configuration.dbConnection){
        dbConnection = this.allModelProperties.find(x => x.name === this.configuration.dbConnection.name);
      }

      let errorBranch = this.configuration.errorBranch;
      if(errorBranch && this.allSubRules){
        errorBranch = this.allSubRules.find(x => x.name === this.configuration.errorBranch.name );
      }
      
      let assignedProperty = this.configuration.assignedProperty;
      if(this.configuration.assignedtoinputType === 'PROPERTY' && assignedProperty && this.allModelProperties){
        assignedProperty = this.allModelProperties.find(x => x.name === this.configuration.assignedProperty.name );
      }
      
      let assignedReference = this.configuration.assignedReference;
      if(this.configuration.assignedtoinputType === 'REFERENCE' && assignedReference && this.allReferenceProperties){
        assignedReference = this.allReferenceProperties.find(x => x.name === this.configuration.assignedReference.name );
      }
      this.dbNodeConfigFormGroup.patchValue({
      //  dbType: this.configuration.dbType,
        dbConnection: dbConnection,
        errorMsg: this.configuration.errorMsg,
        errorAction: this.configuration.errorAction,
        assignedProperty: assignedProperty,
        assignedtoinputType: this.configuration.assignedtoinputType,
        assignedReference: assignedReference,
        model: model,
        parameterinputType: this.configuration.parameterinputType,
        parameterparam: this.configuration.parameterparam,
        parameterproperty: this.configuration.parameterproperty,
        parameterconstant: this.configuration.parameterconstant,
        parameterbranch: this.configuration.parameterbranch,
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

      this.changeSubscription = this.dbNodeConfigFormGroup.get('assignedProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.assignedProperty = configuration;
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
