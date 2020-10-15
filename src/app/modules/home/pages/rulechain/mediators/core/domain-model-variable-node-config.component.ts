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

  @Input()
  allViewModels: any[];

  @Input()
  allRuleInputs: any[];

  @Input()
  allVariables: any[];

  @Input() branchAvailability: any;

  nodeDefinitionValue: RuleNodeDefinition;

  propertydatasource: MatTableDataSource<Property>;

  displayedColumns: string[] = ['modelType', 'modelUIName', 'property', 'name', 'actions'];

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

  configuration: RuleNodeConfiguration;

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
    console.log(this.checklistSelection.selected);
  }

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
             // this.dataSource.data = TREE_DATA;
    this.domainModelVariableNodeConfigFormGroup = this.fb.group({
      //modelpropertyinputType: [],
      modelpropertyruleInput:[],
      modelpropertyvariable: [],
      modelpropertyType: [],
      //modelpropertydomainModel: [],
     // modelpropertyviewModel: [],
     modelpropertybranchParam: [],
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

  /*
  refreshInputTypes(){
    let modelpropertyinputType: string = this.domainModelVariableNodeConfigFormGroup.get('modelpropertyinputType').value;
    this.configuration.modelpropertyinputType = modelpropertyinputType;
    if (modelpropertyinputType === 'DOMAIN_MODEL'){
      this.configuration.modelpropertyviewModel= {};
      //this.configuration.name= "";
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      this.domainModelVariableNodeConfigFormGroup.get('modelpropertyviewModel').patchValue([], {emitEvent: false});
      this.domainModelVariableNodeConfigFormGroup.get('propertyName').patchValue([], {emitEvent: false});
    } else if (modelpropertyinputType === 'VIEW_MODEL'){
      this.configuration.modelpropertydomainModel= {};
      //this.configuration.name= "";
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      this.domainModelVariableNodeConfigFormGroup.get('modelpropertydomainModel').patchValue([], {emitEvent: false});
      this.domainModelVariableNodeConfigFormGroup.get('propertyName').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }
  }
  */

  refreshTypes(){
    let modelpropertyType: string = this.domainModelVariableNodeConfigFormGroup.get('modelpropertyType').value;
    this.configuration.modelpropertyType = modelpropertyType;
    if (modelpropertyType === 'API_INPUT'){
      this.configuration.modelpropertyvariable= {};
      this.configuration.modelpropertybranchParam= {};
      //this.configuration.name= "";
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      this.domainModelVariableNodeConfigFormGroup.get('modelpropertyvariable').patchValue([], {emitEvent: false});
      this.domainModelVariableNodeConfigFormGroup.get('modelpropertybranchParam').patchValue([], {emitEvent: false});
      this.domainModelVariableNodeConfigFormGroup.get('propertyName').patchValue([], {emitEvent: false});
    } else if (modelpropertyType === 'VARIABLE'){
      this.configuration.modelpropertyruleInput= {};
      this.configuration.modelpropertybranchParam= {};
      //this.configuration.name= "";
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      this.domainModelVariableNodeConfigFormGroup.get('modelpropertyruleInput').patchValue([], {emitEvent: false});
      this.domainModelVariableNodeConfigFormGroup.get('modelpropertybranchParam').patchValue([], {emitEvent: false});
      this.domainModelVariableNodeConfigFormGroup.get('propertyName').patchValue([], {emitEvent: false});
    } else if (modelpropertyType === 'BRANCH_PARAM'){
      this.configuration.modelpropertyruleInput= {};
      this.configuration.modelpropertyvariable= {};
      //this.configuration.name= "";
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      this.domainModelVariableNodeConfigFormGroup.get('modelpropertyruleInput').patchValue([], {emitEvent: false});
      this.domainModelVariableNodeConfigFormGroup.get('modelpropertyvariable').patchValue([], {emitEvent: false});
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
      //key:checklistSelection.key,
      data: checklistSelection.data
    }

    const type : string = this.domainModelVariableNodeConfigFormGroup.get('modelpropertyType').value;
    let pkg : string = '';

    //let modelTitleName = '';
    let modelName = '';
    if(type === 'API_INPUT'){
        modelName = this.domainModelVariableNodeConfigFormGroup.get('modelpropertyruleInput').value.inputName;
        pkg = this.domainModelVariableNodeConfigFormGroup.get('modelpropertyruleInput').value.inputType;
        //let modelNameTrimmed = modelName.replace(/\s/g, "");
        //let modelNameLowerCase = modelNameTrimmed.toLowerCase();
        //modelTitleName = this.titleCaseWord(modelNameLowerCase);
    } else if (type === 'VARIABLE') {
        modelName = this.domainModelVariableNodeConfigFormGroup.get('modelpropertyvariable').value.name;
        pkg = this.domainModelVariableNodeConfigFormGroup.get('modelpropertyvariable').value.pkg;
        //let modelNameTrimmed = modelName.replace(/\s/g, "");
        //let modelNameLowerCase = modelNameTrimmed.toLowerCase();
        //modelTitleName = this.titleCaseWord(modelNameLowerCase);
    } else {
        modelName = this.domainModelVariableNodeConfigFormGroup.get('modelpropertybranchParam').value.name;
        let pkgLowerCase = this.domainModelVariableNodeConfigFormGroup.get('modelpropertybranchParam').value.inputType.toLowerCase();
        pkg = pkgLowerCase;
    }

    let property: Property = {
      modelType: type,
      modelUIName: modelName,
      modelName : modelName,
      pkg: pkg,
      name: this.domainModelVariableNodeConfigFormGroup.get('propertyName').value,
      type: selectedNode.data.propertytype,
      property: selectedNode
    };
    this.configuration.modelproperties.push(property);
    this.propertydatasource = new MatTableDataSource(this.configuration.modelproperties);
    this.updateModel(this.configuration);
    /*
    this.domainModelVariableNodeConfigFormGroup.patchValue({
      modelpropertyinputType: [],
      modelpropertydomainModel: [],
      modelpropertyviewModel:[],
      propertyName: []
    });
    */
    //this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  }

  deleteRow(index: number): void{
    this.configuration.modelproperties.splice(index, 1);
    this.propertydatasource = new MatTableDataSource(this.configuration.modelproperties);
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

    if(this.configuration.modelproperties === null || this.configuration.modelproperties === undefined){
        this.configuration.modelproperties = [];
    }
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

      this.changeSubscription = this.domainModelVariableNodeConfigFormGroup.get('modelpropertyruleInput').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.modelpropertyruleInput = configuration;

          if(configuration.inputType === 'model'){
            let selectedmodelpropertydomainModel = this.allDomainModels.find(x => x.nameTitleCase === configuration.inputName );
              if(selectedmodelpropertydomainModel){
              let designtree : any[] = [];
              designtree.push(selectedmodelpropertydomainModel.design);
              //this.dataSource.data = null;
              this.dataSource.data = designtree;
            }
          } else if (configuration.inputType === 'dto'){
            let selectedmodelpropertyviewModel = this.allViewModels.find(x => x.nameTitleCase === configuration.inputName );
              if(selectedmodelpropertyviewModel){
              let designtree : any[] = [];
              designtree.push(selectedmodelpropertyviewModel.design);
              //this.dataSource.data = null;
              this.dataSource.data = designtree;
            }
          }
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.domainModelVariableNodeConfigFormGroup.get('modelpropertyvariable').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.modelpropertyvariable = configuration;

          if(configuration.pkg === 'model'){
            let selectedvariabledomainModel = this.allDomainModels.find(x => x.nameTitleCase === configuration.type );
              if(selectedvariabledomainModel){
              let designtree : any[] = [];
              designtree.push(selectedvariabledomainModel.design);
              //this.dataSource.data = null;
              this.dataSource.data = designtree;
            }
          } else if (configuration.pkg === 'dto'){
            let selectedvariableviewModel = this.allViewModels.find(x => x.nameTitleCase === configuration.type );
              if(selectedvariableviewModel){
              let designtree : any[] = [];
              designtree.push(selectedvariableviewModel.design);
              //this.dataSource.data = null;
              this.dataSource.data = designtree;
            }
          }
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.domainModelVariableNodeConfigFormGroup.get('modelpropertybranchParam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.modelpropertybranchParam = configuration;

          if(configuration.inputType === 'MODEL'){
            let selectedbranchparamdomainModel = this.allDomainModels.find(x => x.nameTitleCase === configuration.input );
              if(selectedbranchparamdomainModel){
              let designtree : any[] = [];
              designtree.push(selectedbranchparamdomainModel.design);
              //this.dataSource.data = null;
              this.dataSource.data = designtree;
            }
          } else if (configuration.inputType === 'DTO'){
            let selectedbranchparamviewModel = this.allViewModels.find(x => x.nameTitleCase === configuration.input );
              if(selectedbranchparamviewModel){
              let designtree : any[] = [];
              designtree.push(selectedbranchparamviewModel.design);
              //this.dataSource.data = null;
              this.dataSource.data = designtree;
            }
          }
          this.updateModel(this.configuration);
        }
      );

    /*
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

      this.changeSubscription = this.domainModelVariableNodeConfigFormGroup.get('modelpropertyviewModel').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.modelpropertyviewModel = configuration;
          let selectedmodelpropertyviewModel = this.allViewModels.find(x => x.name === configuration.name );
          if(selectedmodelpropertyviewModel){
            let designtree : any[] = [];
            designtree.push(selectedmodelpropertyviewModel.design);
            //this.dataSource.data = null;
            this.dataSource.data = designtree;
          }
          this.updateModel(this.configuration);
        }
      );
    */
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
  name: string;
  type: string;
  pkg: string;
}

export interface DomainModelProperty {
  name: string;
 // key: string;
  data: any;
}