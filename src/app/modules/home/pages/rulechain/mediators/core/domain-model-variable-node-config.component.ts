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
  key: string;
  data: any;
  children?: DomainModelNode[];
}

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
  data: any;
  key: string;
}


@Component({
  selector: 'tb-domain-model-variable-node-config',
  templateUrl: './domain-model-variable-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DomainModelVariableNodeConfigComponent),
    multi: true
  }]
})
export class DomainModelVariableNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
  allDomainModels: any[];

  nodeDefinitionValue: RuleNodeDefinition;

  propertydatasource: MatTableDataSource<Property>;

  displayedColumns: string[] = ['modelType', 'modelUIName', 'property', 'propertyName', 'actions'];

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

  domainModelVariableNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  private configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => { };
  
  private _transformer = (node: DomainModelNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.label,
      level: level,
      data: node.data,
      key: node.key,
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
    console.log(this.checklistSelection.selected);
  }

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
             // this.dataSource.data = TREE_DATA;
    this.domainModelVariableNodeConfigFormGroup = this.fb.group({
      modelpropertyinputType: [],
      modelpropertydomainModel: [],
      propertyName: []
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
    let modelpropertyinputType: string = this.domainModelVariableNodeConfigFormGroup.get('modelpropertyinputType').value;
    this.configuration.modelpropertyinputType = modelpropertyinputType;
    if (modelpropertyinputType === 'DOMAIN_MODEL'){
      this.configuration.modelpropertyviewModel= {};
      this.configuration.propertyName= "";
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      this.domainModelVariableNodeConfigFormGroup.get('modelpropertydomainModel').patchValue([], {emitEvent: false});
      this.domainModelVariableNodeConfigFormGroup.get('propertyName').patchValue([], {emitEvent: false});
    } else if (modelpropertyinputType === 'VIEW_MODEL'){
      this.configuration.modelpropertydomainModel= {};
      this.configuration.propertyName= "";
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      this.domainModelVariableNodeConfigFormGroup.get('modelpropertydomainModel').patchValue([], {emitEvent: false});
      this.domainModelVariableNodeConfigFormGroup.get('propertyName').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }
  }

  addProperty(): void{

    let checklistSelection = this.checklistSelection.selected[0];

    let selectedNode : DomainModelProperty = {
      name: checklistSelection.name,
      key:checklistSelection.key,
      data: checklistSelection.data
    }

    let modelName = this.domainModelVariableNodeConfigFormGroup.get('modelpropertydomainModel').value.name;
    let modelNameTrimmed = modelName.replace(/\s/g, "");
    let modelNameLowerCase = modelNameTrimmed.toLowerCase();
    let modelTitleName = this.titleCaseWord(modelNameLowerCase);

    let property: Property = {
      modelType: this.domainModelVariableNodeConfigFormGroup.get('modelpropertyinputType').value,
      modelUIName: modelName,
      modelName : modelTitleName,
      propertyName: this.domainModelVariableNodeConfigFormGroup.get('propertyName').value,
      property: selectedNode
    };
    this.configuration.modelproperties.push(property);
    this.propertydatasource = new MatTableDataSource(this.configuration.modelproperties);
    this.updateModel(this.configuration);
    this.domainModelVariableNodeConfigFormGroup.patchValue({
      modelpropertyinputType: [],
      modelpropertydomainModel: [],
      propertyName: []
    });
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  }

  deleteRow(index: number): void{
    this.configuration.modelproperties.splice(index, 1);
    this.updateModel(this.configuration);
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.domainModelVariableNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.domainModelVariableNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);
    this.propertydatasource = new MatTableDataSource(this.configuration.modelproperties);

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
      //this.domainModelVariableNodeConfigFormGroup.get('payload').patchValue(this.configuration.payload, {emitEvent: false});
      /*
      this.changeSubscription = this.domainModelVariableNodeConfigFormGroup.get('payload').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {

          console.log("payload node value cahnge sub");
          console.log(configuration);
          this.configuration.payload = configuration;
          this.updateModel(this.configuration);
        }
      );
      */

      this.changeSubscription = this.domainModelVariableNodeConfigFormGroup.get('modelpropertydomainModel').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.modelpropertydomainModel = configuration;
          let selectedmodelpropertydomainModel = this.allDomainModels.find(x => x.name === configuration.name );
          if(selectedmodelpropertydomainModel){
            let designtree : any[] = [];
            designtree.push(selectedmodelpropertydomainModel.design);
            //this.dataSource.data = null;
            this.dataSource.data = designtree;
          }
          this.updateModel(this.configuration);
        }
      );
    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {

  console.log("update model");
    if (this.definedConfigComponent || this.domainModelVariableNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

  titleCaseWord(word: string) {
    if (!word) return word;
    return word[0].toUpperCase() + word.substr(1);
  }

}

export interface Property {
  modelType: string;
  modelName: string;
  modelUIName: string;
  property: DomainModelProperty;
  propertyName: string;
}

export interface DomainModelProperty {
  name: string;
  key: string;
  data: any;
}