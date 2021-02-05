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
  selector: 'virtuan-reference-property-node-config',
  templateUrl: './reference-property-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ReferencePropertyNodeConfigComponent),
    multi: true
  }]
})
export class ReferencePropertyNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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

  @Input()
  allModelProperties: any[];

  @Input()
  inputEntities: any[];

  @Input()
  inputCustomobjects: any[];

  @Input()
  allDomainModelsWithSub: any[];

  @Input()
  allViewModelsWithSub: any[];

  @Input() branchAvailability: any;

  nodeDefinitionValue: RuleNodeDefinition;

  propertydatasource: MatTableDataSource<Property>;

  displayedColumns: string[] = ['name', 'propertyType', 'propertyDataType', 'actions'];

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

  referencePropertyNodeConfigFormGroup: FormGroup;

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
    this.referencePropertyNodeConfigFormGroup = this.fb.group({
      propertyName: '',
      modelpropertyproperty: [],
      modelpropertyType: '',
      modelpropertyruleInput: [],
      modelpropertybranchParam: []
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

  refreshTypes(){
    let modelpropertyType: string = this.referencePropertyNodeConfigFormGroup.get('modelpropertyType').value;
    if (modelpropertyType === 'RULE_INPUT'){
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    this.referencePropertyNodeConfigFormGroup.patchValue({
      modelpropertybranchParam: [],
      modelpropertyproperty: []
    });

    } else if (modelpropertyType === 'PROPERTY'){
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    this.referencePropertyNodeConfigFormGroup.patchValue({
      modelpropertyruleInput: [],
      modelpropertybranchParam: []
    });

    } else if (modelpropertyType === 'BRANCH_PARAM'){
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    this.referencePropertyNodeConfigFormGroup.patchValue({
      modelpropertyruleInput: [],
      modelpropertyproperty: []
    });

    }
  }

  addProperty(): void{
    const propertyType : string = this.referencePropertyNodeConfigFormGroup.get('modelpropertyType').value;
    let checklistSelection = this.checklistSelection.selected[0];
    let selectedNode : DomainModelProperty;
    if(checklistSelection){
         selectedNode = {
          name: checklistSelection.name,
          //key:checklistSelection.key,
          data: checklistSelection.data
        };
    }

    let name : string = this.referencePropertyNodeConfigFormGroup.get('propertyName').value;
    name = name.replace(/\s/g, "");
    name = this.lowerCaseWord(name);
    let propertyDataType : string = '';
    let type: string = '';
    let record: string = '';
    let modelproperty: DomainModelProperty;
    let selectedInput: string = '';

    let mapKey: string = '';
    let mapKeyType: string = '';
    let mapValue: string = '';
    let mapValueType: string = '';
    let mapValueRecord: string = '';

    let modelName = '';
    if(propertyType === 'RULE_INPUT'){
        selectedInput = this.referencePropertyNodeConfigFormGroup.get('modelpropertyruleInput').value.inputName;
        let pkg = this.referencePropertyNodeConfigFormGroup.get('modelpropertyruleInput').value.inputType;

        if(selectedNode.data.type === 'collection' || selectedNode.data.type === 'list'){
            let modelNameTrimmed = selectedNode.data.name.replace(/\s/g, "");
            let modelNameLowerCase = modelNameTrimmed.toLowerCase();
            let modelTitleName = this.titleCaseWord(modelNameLowerCase);
            type = modelTitleName;

            if(pkg === 'model' || pkg === 'MODEL'){
                propertyDataType = 'MODEL';
            } else if(pkg === 'dto' || pkg === 'DTO'){
                propertyDataType = 'DTO';
            }

            if (selectedNode.data.type === 'collection') {
                record = 's';
            } else if (selectedNode.data.type === 'list') {
                record = 'm';
            }

        } else {
            type = selectedNode.data.propertytype;
            propertyDataType = 'PRIMITIVE';
            record = 's';
        }

        modelproperty = selectedNode;
    } else if (propertyType === 'BRANCH_PARAM') {
        selectedInput = this.referencePropertyNodeConfigFormGroup.get('modelpropertybranchParam').value.name;
        let pkg = this.referencePropertyNodeConfigFormGroup.get('modelpropertybranchParam').value.inputType;
        let selectedInputrecord = this.referencePropertyNodeConfigFormGroup.get('modelpropertybranchParam').value.record;

        if(selectedInputrecord === 's'){
            if(selectedNode.data.type === 'collection' || selectedNode.data.type === 'list'){
                let modelNameTrimmed = selectedNode.data.name.replace(/\s/g, "");
                let modelNameLowerCase = modelNameTrimmed.toLowerCase();
                let modelTitleName = this.titleCaseWord(modelNameLowerCase);
                type = modelTitleName;

                if(pkg === 'model' || pkg === 'MODEL'){
                    propertyDataType = 'MODEL';
                } else if(pkg === 'dto' || pkg === 'DTO'){
                    propertyDataType = 'DTO';
                }

                if (selectedNode.data.type === 'collection') {
                    record = 's';
                } else if (selectedNode.data.type === 'list') {
                    record = 'm';
                }

            } else {
                type = selectedNode.data.propertytype;
                propertyDataType = 'PRIMITIVE';
                record = 's';
            }
            modelproperty = selectedNode;
        } else {
            type = this.referencePropertyNodeConfigFormGroup.get('modelpropertybranchParam').value.input;
            if(pkg === 'model' || pkg === 'MODEL'){
                propertyDataType = 'MODEL';
            } else if(pkg === 'dto' || pkg === 'DTO'){
                propertyDataType = 'DTO';
            } else {
                propertyDataType = 'PRIMITIVE';
            }
            record = 'm';
        }

    } else if (propertyType === 'PROPERTY') {
        selectedInput = this.referencePropertyNodeConfigFormGroup.get('modelpropertyproperty').value.name;
        let pkg = this.referencePropertyNodeConfigFormGroup.get('modelpropertyproperty').value.propertyDataType;
        let selectedInputrecord = this.referencePropertyNodeConfigFormGroup.get('modelpropertyproperty').value.record;

        if(selectedInputrecord === 's'){
            if(selectedNode.data.type === 'collection' || selectedNode.data.type === 'list'){
                let modelNameTrimmed = selectedNode.data.name.replace(/\s/g, "");
                let modelNameLowerCase = modelNameTrimmed.toLowerCase();
                let modelTitleName = this.titleCaseWord(modelNameLowerCase);
                type = modelTitleName;

                if(pkg === 'model' || pkg === 'MODEL'){
                    propertyDataType = 'MODEL';
                } else if(pkg === 'dto' || pkg === 'DTO'){
                    propertyDataType = 'DTO';
                }

                if (selectedNode.data.type === 'collection') {
                    record = 's';
                } else if (selectedNode.data.type === 'list') {
                    record = 'm';
                }

            } else {
                type = selectedNode.data.propertytype;
                propertyDataType = 'PRIMITIVE';
                record = 's';
            }
            modelproperty = selectedNode;
        } else {
            type = this.referencePropertyNodeConfigFormGroup.get('modelpropertybranchParam').value.type;
            propertyDataType = pkg;
            record = 'm';
        }
    }

    let property: Property = {
      propertyType: propertyType,
      name : name,
      propertyDataType: propertyDataType,
      type: type,
      record: record,
      modelproperty: modelproperty,
      selectedInput: selectedInput,
      mapKey: mapKey,
      mapKeyType: mapKeyType,
      mapValue: mapValue,
      mapValueType: mapValueType,
      mapValueRecord: mapValueRecord
    };
    this.configuration.referenceproperties.push(property);
    this.propertydatasource = new MatTableDataSource(this.configuration.referenceproperties);
    this.updateModel(this.configuration);

    this.referencePropertyNodeConfigFormGroup.patchValue({
      propertyName: ''
    });

  }

  deleteRow(index: number): void{
    this.configuration.referenceproperties.splice(index, 1);
    this.propertydatasource = new MatTableDataSource(this.configuration.referenceproperties);
    this.updateModel(this.configuration);
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.referencePropertyNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.referencePropertyNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);

    if(this.configuration.referenceproperties === null || this.configuration.referenceproperties === undefined){
        this.configuration.referenceproperties = [];
    }
    this.propertydatasource = new MatTableDataSource(this.configuration.referenceproperties);

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

      this.changeSubscription = this.referencePropertyNodeConfigFormGroup.get('modelpropertyproperty').valueChanges.subscribe(
        (configuration: any) => {
         // this.configuration.modelpropertyproperty = configuration;

          if(configuration.propertyDataType === 'MODEL' && configuration.record === 's'){
            let selectedbranchparamdomainModel = this.allDomainModelsWithSub.find(x => x.nameTitleCase === configuration.type );
              if(selectedbranchparamdomainModel){
              let designtree : any[] = [];
              designtree.push(selectedbranchparamdomainModel.design);
              //this.dataSource.data = null;
              this.dataSource.data = designtree;
            }
          } else if (configuration.propertyDataType === 'DTO' && configuration.record === 's'){
            let selectedbranchparamviewModel = this.allViewModelsWithSub.find(x => x.nameTitleCase === configuration.type );
              if(selectedbranchparamviewModel){
              let designtree : any[] = [];
              designtree.push(selectedbranchparamviewModel.design);
              //this.dataSource.data = null;
              this.dataSource.data = designtree;
            }
          } else {
            this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
          }
         // this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.referencePropertyNodeConfigFormGroup.get('modelpropertyruleInput').valueChanges.subscribe(
        (configuration: any) => {
          //this.configuration.modelpropertyruleInput = configuration;

          if(configuration.inputType === 'model'){
            let selectedmodelpropertydomainModel = this.allDomainModelsWithSub.find(x => x.nameTitleCase === configuration.inputName );
              if(selectedmodelpropertydomainModel){
              let designtree : any[] = [];
              designtree.push(selectedmodelpropertydomainModel.design);
              //this.dataSource.data = null;
              this.dataSource.data = designtree;
            }
          } else if (configuration.inputType === 'dto'){
            let selectedmodelpropertyviewModel = this.allViewModelsWithSub.find(x => x.nameTitleCase === configuration.inputName );
              if(selectedmodelpropertyviewModel){
              let designtree : any[] = [];
              designtree.push(selectedmodelpropertyviewModel.design);
              //this.dataSource.data = null;
              this.dataSource.data = designtree;
            }
          }
          //this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.referencePropertyNodeConfigFormGroup.get('modelpropertybranchParam').valueChanges.subscribe(
        (configuration: any) => {
          //this.configuration.modelpropertybranchParam = configuration;

          if(configuration.inputType === 'MODEL' && configuration.record === 's'){
            let selectedbranchparamdomainModel = this.allDomainModelsWithSub.find(x => x.nameTitleCase === configuration.input );
              if(selectedbranchparamdomainModel){
              let designtree : any[] = [];
              designtree.push(selectedbranchparamdomainModel.design);
              //this.dataSource.data = null;
              this.dataSource.data = designtree;
            }
          } else if (configuration.inputType === 'DTO' && configuration.record === 's'){
            let selectedbranchparamviewModel = this.allViewModelsWithSub.find(x => x.nameTitleCase === configuration.input );
              if(selectedbranchparamviewModel){
              let designtree : any[] = [];
              designtree.push(selectedbranchparamviewModel.design);
              //this.dataSource.data = null;
              this.dataSource.data = designtree;
            }
          } else {
            this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
          }
         // this.updateModel(this.configuration);
        }
      );

    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {

  console.log("update model");
    if (this.definedConfigComponent || this.referencePropertyNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
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
}

export interface Property {
  propertyType: string;
  name: string;
  propertyDataType: string;
  type: string;
  record: string;
  selectedInput: string;
  modelproperty: DomainModelProperty;
  mapKey: string;
  mapKeyType: string;
  mapValue: string;
  mapValueType: string;
  mapValueRecord: string;
}

/*
export interface Property {
  modelType: string;
  modelName: string;
  property: DomainModelProperty;
  name: string;
  type: string;
  pkg: string;
}
*/

export interface DomainModelProperty {
  name: string;
 // key: string;
  data: any;
}