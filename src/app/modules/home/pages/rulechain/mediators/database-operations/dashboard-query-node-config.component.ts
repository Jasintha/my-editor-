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
  selector: 'virtuan-dashboard-query-node-config',
  templateUrl: './dashboard-query-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DashboardQueryNodeConfigComponent),
    multi: true
  }]
})
export class DashboardQueryNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
  
  displayedColumns: string[] = ['modelpropertyName', 'condition', 'value', 'join', 'actions'];
  selectedSpecificPropertiesColumns: string[] = ['modelpropertyName', 'selectAs', 'fieldFunction', 'actions'];

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
        selectType: "",
        model: [],
        querycondition: "",
        value: "",
        join: "",
        selectAs: "",
        fieldFunction: ""
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

  addQueryBuilder(): void{

    let checklistSelection = this.checklistSelection.selected[0];
    let selectedNode : DomainModelProperty;
    if(checklistSelection){
         selectedNode = {
          name: checklistSelection.name,
          data: checklistSelection.data
        };
    }

    let join: string = this.dbNodeConfigFormGroup.get('join').value;
    if(join){
    } else {
        join = '';
    }

      let defaultobj = {
        'inputType': '-',
        'condition': this.dbNodeConfigFormGroup.get('querycondition').value,
        'join': join,
        'modelproperty': selectedNode,
        'property': '-',
        'value': this.dbNodeConfigFormGroup.get('value').value,
        'modelpropertyName': selectedNode.name
      };

      this.configuration.whereClauseBuilders.push(defaultobj);
      this.updateModel(this.configuration);

    this.propertydatasource = new MatTableDataSource(this.configuration.whereClauseBuilders);

    this.configuration.querycondition= '';
    this.configuration.join= '';
    this.configuration.queryvalue= '';

    this.dbNodeConfigFormGroup.get('join').patchValue("", {emitEvent: false});
    this.dbNodeConfigFormGroup.get('value').patchValue("", {emitEvent: false});
    this.dbNodeConfigFormGroup.get('querycondition').patchValue("", {emitEvent: false});

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
            if(this.configuration.selectType === 'SELECTSPECIFIC'){
                this.selectSpecificDataSource.data = designtree;
            }
        }
      }


      this.dbNodeConfigFormGroup.patchValue({
        selectType: this.configuration.selectType,
        model: model,
        selectAs: this.configuration.selectAs,
        fieldFunction: this.configuration.fieldFunction,
        querycondition: this.configuration.querycondition,
        value: this.configuration.queryvalue,
        join: this.configuration.join,
      });


      this.changeSubscription = this.dbNodeConfigFormGroup.get('value').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.queryvalue = configuration;
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
  value: string;
  join: string;
  modelproperty: DomainModelProperty;
  modelpropertyName: string;
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