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
  ViewContainerRef,
  NgModule,
  Compiler,
} from "@angular/core";
import {
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR,
  Validators,
  AbstractControl,
} from "@angular/forms";
import {
  IRuleNodeConfigurationComponent,
  RuleNodeConfiguration,
  RuleNodeDefinition,
} from "@shared/models/rule-node.models";
import { Subscription } from "rxjs";
import { RuleChainService } from "@core/http/rule-chain.service";
import { coerceBooleanProperty } from "@angular/cdk/coercion";
import { TranslateService } from "@ngx-translate/core";
import { JsonObjectEditComponent } from "@shared/components/json-object-edit.component";
import { deepClone } from "@core/utils";
import { Observable } from "rxjs";
import { PageComponent } from "@shared/components/page.component";
import { Store } from "@ngrx/store";
import { AppState } from "@core/core.state";
import { MatTableDataSource } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";

import { FlatTreeControl } from "@angular/cdk/tree";
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from "@angular/material/tree";
import { CommonModule } from "@angular/common";
import { SharedModule } from "@app/shared/shared.module";
import { RuleChainModule } from "../../rulechain.module";
import { MediatorNodeConfigModule } from "../mediator-node-config.module";
import * as PropertyNode from "../core/property-node.json";

export enum VirtuanControlType {
  TEXT_INPUT_FIELD = "text-input-field-form-ctrl",
  FORM_TABLE = "form-table-ctrl",
  INPUT_SELECTOR = "input-selector-form-ctrl",
  SELECT_SCOPE = "select-scope-form-ctrl",
  RETURN = "select-return-form-ctrl",
  CHECHBOX_SETRETURN = "checkbox-setRetun-form-ctrl",
  ERRORHANDLER = "form-errorhandler-ctrl",
  PARAMTER_SELCTOR = "select-premitve-data-type-form-ctrl",
  PROPERTY_TYPE = 'select-property-type-form-ctr',
  VALUE_TYPE = 'select-value-type-form-ctr',
  PRC_TEMPLATE = 'select-type-PRC-ctr'
}

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
  propertyScope: string;
}

export interface Assignment {
  propertyinputType: string;
  propertyName: string;
  valueinputType: string;
  valueName: string;
  propertyScope: string;
  valueScope: string;
}

export interface Param {
  name: string;
  inputType: string;
  input: string;
  record: string;
}

export interface ErrorFunctionParameters {
  parameterName: string;
  inputType: string;
  input: string;
  property: string;
  propertyScope: string;
}

export interface DomainModelProperty {
  name: string;
  data: any;
}

export interface Constant {
  constantName: string;
  constantType: string;
  customValue: string;
  scope: string;
}

@Component({
  selector: "virtuan-common-node-config",
  templateUrl: "./common-node-config.component.html",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CommonNodeConfigComponent),
      multi: true,
    },
  ],
})
export class CommonNodeConfigComponent implements OnInit, AfterViewInit {
  @ViewChild("container", { static: true, read: ViewContainerRef })
  container: ViewContainerRef;

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
  allSubRules: any[];

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

  @Input()
  nodeGuide: string;

  @Input() branchAvailability: any;

  nodeDefinitionValue: RuleNodeDefinition;

  propertydatasource: MatTableDataSource<Property>;
  datasource: MatTableDataSource<Param | Assignment>;
  errordatasource: MatTableDataSource<ErrorFunctionParameters>;

  displayedColumns: string[] = [
    "name",
    "propertyType",
    "propertyDataType",
    "type",
    "actions",
  ];

  @Input()
  set nodeDefinition(nodeDefinition: RuleNodeDefinition) {
    if (this.nodeDefinitionValue !== nodeDefinition) {
      this.nodeDefinitionValue = nodeDefinition;
    }
  }

  get nodeDefinition(): RuleNodeDefinition {
    return this.nodeDefinitionValue;
  }

  definedDirectiveError: string;

  commonNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;
  changeSubscriptionProp: Subscription;
  changeSubscriptionVal: Subscription;

  private definedConfigComponentRef: ComponentRef<
    IRuleNodeConfigurationComponent
  >;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;
  private propagateChange = (v: any) => { };

  private _transformer = (node: DomainModelNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.label,
      level: level,
      data: node.data,
    };
  };

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    (node) => node.level,
    (node) => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children
  );

  element = "";
  output = "";

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  treeControlVal = new FlatTreeControl<ExampleFlatNode>(
    node => node.level, node => node.expandable);
treeFlattenerVal = new MatTreeFlattener(
    this._transformer, node => node.level, node => node.expandable, node => node.children);
  dataSourceVal = new MatTreeFlatDataSource(this.treeControlVal, this.treeFlattenerVal);

  treeControlProp = new FlatTreeControl<ExampleFlatNode>(
    node => node.level, node => node.expandable);
treeFlattenerProp = new MatTreeFlattener(
    this._transformer, node => node.level, node => node.expandable, node => node.children);
  dataSourceProp = new MatTreeFlatDataSource(this.treeControlProp, this.treeFlattenerProp);

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  getLevel = (node: ExampleFlatNode) => node.level;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<ExampleFlatNode>(
    false /* multiple */
  );

  checklistSelectionProp = new SelectionModel<ExampleFlatNode>(false /* multiple */); // &&&&

  checklistSelectionVal = new SelectionModel<ExampleFlatNode>(false /* multiple */); // &&&&

  checkboxClick(node) {
    this.checklistSelection.toggle(node);
  }

  checkboxClickProp(node){
    this.checklistSelectionProp.toggle(node);
}
checkboxClickVal(node){
    this.checklistSelectionVal.toggle(node);
}

  constructor(
    private translate: TranslateService,
    private ruleChainService: RuleChainService,
    private compiler: Compiler,
    private fb: FormBuilder
  ) {
    this.commonNodeConfigFormGroup = this.fb.group({
      constantName: [],
      constantType: [],
      customValue: [],
      scope: "",
      propertyName: "",
      modelpropertyType: "",
      modelpropertyruleInput: [],
      modelpropertybranchParam: [],
      modelpropertyproperty: [],
      propinputType: "",
      propentity: [],
      propcustomObject: [],
      propprimitive: "",
      proprecord: "",
      keyinputType: "",
      keypentity: [],
      keycustomObject: [],
      keyprimitive: "",
      valueinputType: "",
      valueentity: [],
      valuecustomObject: [],
      valueprimitive: "",
      valuerecord: "",
      propertyScope: "",
      errorMsg: "",
      errorAction: "",
      enableLogger: true,
      enableRecover: true,
      enableCors: true,
      enableMultiTenant: false,
      paraminputType: "",
      paramName: "",
      paramRecord: "",
      paramentity: [],
      paramcustomObject: [],
      primitive: "",
      errorBranch: [],
      errorInputType: [],
      errorIsAsync: false,
      errorBranchparameter: [],
      errorParameterinputType: [],
      errorParameterparam: [],
      errorParameterproperty: [],
      errorParameterbranchparam: [],
      propertyinputType: "",
      propertyproperty: [],
      propertyreference: [],
      valueparam: [],
      valueproperty: [],
      valueconstant:[],
      valuebranchparam: []
    });
  }
  ngAfterViewInit(): void { }

  ngOnInit(): void { }

  private addComponent(template: string, properties: any = {}) {
    @Component({ template: template })
    class TemplateComponent { }

    @NgModule({
      declarations: [TemplateComponent],
      imports: [MediatorNodeConfigModule, CommonModule, SharedModule],
    })
    class TemplateModule { }

    const mod = this.compiler.compileModuleAndAllComponentsSync(TemplateModule);
    const factory = mod.componentFactories.find(
      (comp) => comp.componentType === TemplateComponent
    );
    const component = this.container.createComponent(factory);
    Object.assign(component.instance, properties);
    // If properties are changed at a later stage, the change detection
    // may need to be triggered manually:
    // component.changeDetectorRef.detectChanges();
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void { }

  addProperty(): void {
    const propertyType: string = this.commonNodeConfigFormGroup.get(
      "modelpropertyType"
    ).value;
    let checklistSelection = this.checklistSelection.selected[0];
    let selectedNode: DomainModelProperty;
    if (propertyType !== "NEW" && checklistSelection) {
      selectedNode = {
        name: checklistSelection.name,
        //key:checklistSelection.key,
        data: checklistSelection.data,
      };
    }

    let name: string = this.commonNodeConfigFormGroup.get("propertyName").value;
    name = name.replace(/\s/g, "");
    name = this.lowerCaseWord(name);
    let propertyDataType: string = "";
    let type: string = "";
    let record: string = "";
    let modelproperty: DomainModelProperty;
    let selectedInput: string = "";

    let mapKey: string = "";
    let mapKeyType: string = "";
    let mapValue: string = "";
    let mapValueType: string = "";
    let mapValueRecord: string = "";
    let propertyScope: string = "";
    //let modelTitleName = '';
    let modelName = "";
    if (propertyType === "RULE_INPUT") {
      selectedInput = this.commonNodeConfigFormGroup.get(
        "modelpropertyruleInput"
      ).value.inputName;
      let pkg = this.commonNodeConfigFormGroup.get("modelpropertyruleInput")
        .value.inputType;

      if (
        selectedNode.data.type === "collection" ||
        selectedNode.data.type === "list"
      ) {
        if (name[0] === " ") {
          name = name.substr(1);
        }
        name = name.replace(/\s/g, "_");
        let modelNameTrimmed = selectedNode.data.name.replace(/\s/g, "");
        let modelNameLowerCase = modelNameTrimmed.toLowerCase();
        let modelTitleName = this.titleCaseWord(modelNameLowerCase);
        type = modelTitleName;

        if (pkg === "model" || pkg === "MODEL") {
          propertyDataType = "MODEL";
        } else if (pkg === "dto" || pkg === "DTO") {
          propertyDataType = "DTO";
        }

        if (selectedNode.data.type === "collection") {
          record = "s";
        } else if (selectedNode.data.type === "list") {
          record = "m";
        }
      } else {
        type = selectedNode.data.propertytype;
        propertyDataType = "PRIMITIVE";
        record = "s";
      }

      modelproperty = selectedNode;
    } else if (propertyType === "BRANCH_PARAM") {
      selectedInput = this.commonNodeConfigFormGroup.get(
        "modelpropertybranchParam"
      ).value.name;
      let pkg = this.commonNodeConfigFormGroup.get("modelpropertybranchParam")
        .value.inputType;
      if (
        selectedNode.data.type === "collection" ||
        selectedNode.data.type === "list"
      ) {
        let modelNameTrimmed = selectedNode.data.name.replace(/\s/g, "");
        let modelNameLowerCase = modelNameTrimmed.toLowerCase();
        let modelTitleName = this.titleCaseWord(modelNameLowerCase);
        type = modelTitleName;

        if (pkg === "model" || pkg === "MODEL") {
          propertyDataType = "MODEL";
        } else if (pkg === "dto" || pkg === "DTO") {
          propertyDataType = "DTO";
        }

        if (selectedNode.data.type === "collection") {
          record = "s";
        } else if (selectedNode.data.type === "list") {
          record = "m";
        }
      } else {
        type = selectedNode.data.propertytype;
        propertyDataType = "PRIMITIVE";
        record = "s";
      }

      modelproperty = selectedNode;
    } else if (propertyType === "PROPERTY") {
      selectedInput = this.commonNodeConfigFormGroup.get(
        "modelpropertyproperty"
      ).value.name;
      let pkg = this.commonNodeConfigFormGroup.get("modelpropertyproperty")
        .value.propertyDataType;
      if (
        selectedNode.data.type === "collection" ||
        selectedNode.data.type === "list"
      ) {
        let modelNameTrimmed = selectedNode.data.name.replace(/\s/g, "");
        let modelNameLowerCase = modelNameTrimmed.toLowerCase();
        let modelTitleName = this.titleCaseWord(modelNameLowerCase);
        type = modelTitleName;

        if (pkg === "model" || pkg === "MODEL") {
          propertyDataType = "MODEL";
        } else if (pkg === "dto" || pkg === "DTO") {
          propertyDataType = "DTO";
        }

        if (selectedNode.data.type === "collection") {
          record = "s";
        } else if (selectedNode.data.type === "list") {
          record = "m";
        }
      } else {
        type = selectedNode.data.propertytype;
        propertyDataType = "PRIMITIVE";
        record = "s";
      }
      modelproperty = selectedNode;
    } else if (propertyType === "NEW") {
      propertyDataType = this.commonNodeConfigFormGroup.get("propinputType")
        .value;
      if (propertyDataType !== "DB" && propertyDataType !== "MESSAGING") {
        record = this.commonNodeConfigFormGroup.get("proprecord").value;
        propertyScope = this.commonNodeConfigFormGroup.get("propertyScope")
          .value;
      } else {
        record = "";
        propertyScope = "GLOBAL";
      }

      if (propertyScope == "GLOBAL") {
        name = this.titleCaseWord(name);
      }

      if (propertyDataType === "MODEL") {
        type = this.commonNodeConfigFormGroup.get("propentity").value.name;
      } else if (propertyDataType === "DTO") {
        type = this.commonNodeConfigFormGroup.get("propcustomObject").value
          .name;
      } else if (propertyDataType === "PRIMITIVE") {
        type = this.commonNodeConfigFormGroup.get("propprimitive").value;
      } else if (propertyDataType === "MAP") {
        mapKeyType = this.commonNodeConfigFormGroup.get("keyinputType").value;
        if (mapKeyType === "MODEL") {
          mapKey = this.commonNodeConfigFormGroup.get("keypentity").value.name;
        } else if (mapKeyType === "DTO") {
          mapKey = this.commonNodeConfigFormGroup.get("keycustomObject").value
            .name;
        } else if (mapKeyType === "PRIMITIVE") {
          mapKey = this.commonNodeConfigFormGroup.get("keyprimitive").value;
        }

        mapValueType = this.commonNodeConfigFormGroup.get("valueinputType")
          .value;

        if (mapValueType === "MODEL") {
          mapValue = this.commonNodeConfigFormGroup.get("valueentity").value
            .name;
        } else if (mapValueType === "DTO") {
          mapValue = this.commonNodeConfigFormGroup.get("valuecustomObject")
            .value.name;
        } else if (mapValueType === "PRIMITIVE") {
          mapValue = this.commonNodeConfigFormGroup.get("valueprimitive").value;
        }
        mapValueRecord = this.commonNodeConfigFormGroup.get("valuerecord")
          .value;
      }
    }

    let property: Property = {
      propertyType: propertyType,
      name: name,
      propertyDataType: propertyDataType,
      type: type,
      record: record,
      modelproperty: modelproperty,
      selectedInput: selectedInput,
      mapKey: mapKey,
      mapKeyType: mapKeyType,
      mapValue: mapValue,
      mapValueType: mapValueType,
      mapValueRecord: mapValueRecord,
      propertyScope: propertyScope,
    };
    this.configuration.modelproperties.push(property);
    this.propertydatasource = new MatTableDataSource(
      this.configuration.modelproperties
    );
    this.updateModel(this.configuration);

    this.commonNodeConfigFormGroup.patchValue({
      propertyName: "",
    });

    //this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  deleteRow(index: number): void {
    this.configuration.modelproperties.splice(index, 1);
    this.propertydatasource = new MatTableDataSource(
      this.configuration.modelproperties
    );
    this.updateModel(this.configuration);
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.commonNodeConfigFormGroup.disable({ emitEvent: false });
    } else {
      this.commonNodeConfigFormGroup.enable({ emitEvent: false });
    }
  }

  writeValue(value: RuleNodeConfiguration): void {
    this.configuration = deepClone(value);

    if (
      this.configuration.modelproperties === null ||
      this.configuration.modelproperties === undefined
    ) {
      this.configuration.modelproperties = [];
    }

    if(this.configuration.assignments === null || 
      this.configuration.assignments === undefined){
      this.configuration.assignments = [];
    }

    if (
      this.configuration.branchParams === null ||
      this.configuration.branchParams === undefined
    ) {
      this.configuration.branchParams = [];
    }

    if (
      this.configuration.constants === null ||
      this.configuration.constants === undefined
    ) {
      this.configuration.constants = [];
    }

    if (
      this.configuration.errorFunctionParameters === null ||
      this.configuration.errorFunctionParameters === undefined
    ) {
      this.configuration.errorFunctionParameters = [];
    }

    if (this.configuration.branchParams.length == 0) {
      let primitiveParam = {
        name: "_error",
        inputType: "PRIMITIVE",
        input: "String",
        record: "s",
      };
      this.configuration.branchParams.push(primitiveParam);
      this.updateModel(this.configuration);
    }

    if (this.changeSubscription) {
      this.changeSubscription.unsubscribe();
      this.changeSubscription = null;
    }
    if (this.definedConfigComponent) {
      this.definedConfigComponent.configuration = this.configuration;
      this.changeSubscription = this.definedConfigComponent
      .configurationChanged.subscribe(
        (configuration) => {
          this.updateModel(configuration);
        }
      );
    } else {
      this.changeSubscription = this.commonNodeConfigFormGroup
        .get("modelpropertyruleInput")
        .valueChanges.subscribe((configuration: any) => {
          //this.configuration.modelpropertyruleInput = configuration;

          if (configuration.inputType === "model") {
            let selectedmodelpropertydomainModel = this.allDomainModelsWithSub.find(
              (x) => x.nameTitleCase === configuration.inputName
            );
            if (selectedmodelpropertydomainModel) {
              let designtree: any[] = [];
              designtree.push(selectedmodelpropertydomainModel.design);
              //this.dataSource.data = null;
              this.dataSource.data = designtree;
            }
          } else if (configuration.inputType === "dto") {
            let selectedmodelpropertyviewModel = this.allViewModelsWithSub.find(
              (x) => x.nameTitleCase === configuration.inputName
            );
            if (selectedmodelpropertyviewModel) {
              let designtree: any[] = [];
              designtree.push(selectedmodelpropertyviewModel.design);
              //this.dataSource.data = null;
              this.dataSource.data = designtree;
            }
          }
          //this.updateModel(this.configuration);
        });

      this.changeSubscription = this.commonNodeConfigFormGroup
        .get("modelpropertybranchParam")
        .valueChanges.subscribe((configuration: any) => {
          //this.configuration.modelpropertybranchParam = configuration;

          if (configuration.inputType === "MODEL") {
            let selectedbranchparamdomainModel = this.allDomainModelsWithSub.find(
              (x) => x.nameTitleCase === configuration.input
            );
            if (selectedbranchparamdomainModel) {
              let designtree: any[] = [];
              designtree.push(selectedbranchparamdomainModel.design);
              //this.dataSource.data = null;
              this.dataSource.data = designtree;
            }
          } else if (configuration.inputType === "DTO") {
            let selectedbranchparamviewModel = this.allViewModelsWithSub.find(
              (x) => x.nameTitleCase === configuration.input
            );
            if (selectedbranchparamviewModel) {
              let designtree: any[] = [];
              designtree.push(selectedbranchparamviewModel.design);
              //this.dataSource.data = null;
              this.dataSource.data = designtree;
            }
          }
          // this.updateModel(this.configuration);
        });

      this.changeSubscription = this.commonNodeConfigFormGroup
        .get("modelpropertyproperty")
        .valueChanges.subscribe((configuration: any) => {
          // this.configuration.modelpropertyproperty = configuration;

          if (configuration.propertyDataType === "MODEL") {
            let selectedbranchparamdomainModel = this.allDomainModelsWithSub.find(
              (x) => x.nameTitleCase === configuration.type
            );
            if (selectedbranchparamdomainModel) {
              let designtree: any[] = [];
              designtree.push(selectedbranchparamdomainModel.design);
              //this.dataSource.data = null;
              this.dataSource.data = designtree;
            }
          } else if (configuration.propertyDataType === "DTO") {
            let selectedbranchparamviewModel = this.allViewModelsWithSub.find(
              (x) => x.nameTitleCase === configuration.type
            );
            if (selectedbranchparamviewModel) {
              let designtree: any[] = [];
              designtree.push(selectedbranchparamviewModel.design);
              //this.dataSource.data = null;
              this.dataSource.data = designtree;
            }
          }
          // this.updateModel(this.configuration);
        });

      this.changeSubscription = this.commonNodeConfigFormGroup
        .get("propinputType")
        .valueChanges.subscribe((propinputType: any) => {
          if (propinputType === "MODEL") {
            this.commonNodeConfigFormGroup.patchValue({
              propcustomObject: [],
              propprimitive: "",
              keyinputType: "",
              keypentity: [],
              keycustomObject: [],
              keyprimitive: "",
              valueinputType: "",
              valueentity: [],
              valuecustomObject: [],
              valueprimitive: "",
              valuerecord: "",
            });
          } else if (propinputType === "DTO") {
            this.commonNodeConfigFormGroup.patchValue({
              propentity: [],
              propprimitive: "",
              keyinputType: "",
              keypentity: [],
              keycustomObject: [],
              keyprimitive: "",
              valueinputType: "",
              valueentity: [],
              valuecustomObject: [],
              valueprimitive: "",
              valuerecord: "",
            });
          } else if (propinputType === "PRIMITIVE") {
            this.commonNodeConfigFormGroup.patchValue({
              propentity: [],
              propcustomObject: [],
              keyinputType: "",
              keypentity: [],
              keycustomObject: [],
              keyprimitive: "",
              valueinputType: "",
              valueentity: [],
              valuecustomObject: [],
              valueprimitive: "",
              valuerecord: "",
            });
          } else if (propinputType === "MAP") {
            this.commonNodeConfigFormGroup.patchValue({
              propentity: [],
              propcustomObject: [],
              propprimitive: "",
            });
          }
        });

      this.changeSubscription = this.commonNodeConfigFormGroup
        .get("keyinputType")
        .valueChanges.subscribe((propinputType: any) => {
          if (propinputType === "MODEL") {
            this.commonNodeConfigFormGroup.patchValue({
              keycustomObject: [],
              keyprimitive: "",
            });
          } else if (propinputType === "DTO") {
            this.commonNodeConfigFormGroup.patchValue({
              keypentity: [],
              keyprimitive: "",
            });
          } else if (propinputType === "PRIMITIVE") {
            this.commonNodeConfigFormGroup.patchValue({
              keypentity: [],
              keycustomObject: [],
            });
          }
        });

      this.changeSubscription = this.commonNodeConfigFormGroup
        .get("valueinputType")
        .valueChanges.subscribe((propinputType: any) => {
          if (propinputType === "MODEL") {
            this.commonNodeConfigFormGroup.patchValue({
              valuecustomObject: [],
              valueprimitive: "",
            });
          } else if (propinputType === "DTO") {
            this.commonNodeConfigFormGroup.patchValue({
              valueentity: [],
              valueprimitive: "",
            });
          } else if (propinputType === "PRIMITIVE") {
            this.commonNodeConfigFormGroup.patchValue({
              valueentity: [],
              valuecustomObject: [],
            });
          }
        });

      this.changeSubscription = this.commonNodeConfigFormGroup
        .get("enableLogger")
        .valueChanges.subscribe((configuration: any) => {
          this.configuration.enableLogger = configuration;
          this.updateModel(this.configuration);
        });

      this.changeSubscription = this.commonNodeConfigFormGroup
        .get("enableRecover")
        .valueChanges.subscribe((configuration: any) => {
          this.configuration.enableRecover = configuration;
          this.updateModel(this.configuration);
        });

      this.changeSubscription = this.commonNodeConfigFormGroup
        .get("enableCors")
        .valueChanges.subscribe((configuration: any) => {
          this.configuration.enableCors = configuration;
          this.updateModel(this.configuration);
        });
      this.changeSubscription = this.commonNodeConfigFormGroup
        .get("enableMultiTenant")
        .valueChanges.subscribe((configuration: any) => {
          this.configuration.enableMultiTenant = configuration;
          this.updateModel(this.configuration);
        });

      this.changeSubscription = this.commonNodeConfigFormGroup
        .get("errorIsAsync")
        .valueChanges.subscribe((configuration: any) => {
          this.configuration.errorIsAsync = configuration;
          this.updateModel(this.configuration);
        });

      this.changeSubscription = this.commonNodeConfigFormGroup
        .get("errorBranch")
        .valueChanges.subscribe((configuration: any) => {
          this.configuration.errorBranch = configuration;

          this.updateModel(this.configuration);
        });

      this.changeSubscription = this.commonNodeConfigFormGroup
        .get("errorParameterparam")
        .valueChanges.subscribe((configuration: any) => {
          this.configuration.errorParameterparam = configuration;
          this.updateModel(this.configuration);
        });

      this.changeSubscription = this.commonNodeConfigFormGroup
        .get("errorParameterbranchparam")
        .valueChanges.subscribe((configuration: any) => {
          this.configuration.errorParameterbranchparam = configuration;
          this.updateModel(this.configuration);
        });

      this.changeSubscription = this.commonNodeConfigFormGroup
        .get("errorParameterproperty")
        .valueChanges.subscribe((configuration: any) => {
          this.configuration.errorParameterproperty = configuration;
          this.updateModel(this.configuration);
        });

      this.changeSubscription = this.commonNodeConfigFormGroup
        .get("errorMsg")
        .valueChanges.subscribe((configuration: any) => {
          this.configuration.errorMsg = configuration;
          this.updateModel(this.configuration);
        });

      this.changeSubscription = this.commonNodeConfigFormGroup
        .get("errorAction")
        .valueChanges.subscribe((configuration: any) => {
          this.configuration.errorAction = configuration;
          this.updateModel(this.configuration);
        });

        this.changeSubscription = this.commonNodeConfigFormGroup
        .get('propertyreference').valueChanges.subscribe(
          (configuration: any) => {
              this.configuration.propertyreference = configuration;
              this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.commonNodeConfigFormGroup
      .get('propertyproperty').valueChanges.subscribe(
          (configuration: any) => {
              this.configuration.propertyproperty = configuration;
              this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.commonNodeConfigFormGroup
      .get('valuebranchparam').valueChanges.subscribe(
          (configuration: any) => {
              this.configuration.valuebranchparam = configuration;
              this.updateModel(this.configuration);
          }
      );


      this.changeSubscription = this.commonNodeConfigFormGroup
      .get('valueparam').valueChanges.subscribe(
          (configuration: any) => {
              this.configuration.valueparam = configuration;
              this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.commonNodeConfigFormGroup
      .get('valueconstant').valueChanges.subscribe(
          (configuration: any) => {
              this.configuration.valueconstant = configuration;
              this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.commonNodeConfigFormGroup
      .get('valueproperty').valueChanges.subscribe(
          (configuration: any) => {
              this.configuration.valueproperty = configuration;
              this.updateModel(this.configuration);
          }
      );

      let errorBranch = this.configuration.errorBranch;
      if (errorBranch && this.allSubRules) {
        errorBranch = this.allSubRules.find(
          (x) => x.name === this.configuration.errorBranch.name
        );
      }

      let errorAction = this.configuration.errorAction;

      this.commonNodeConfigFormGroup.patchValue({
        paraminputType: this.configuration.paraminputType,
        paramName: this.configuration.paramName,
        paramRecord: this.configuration.paramRecord,
        paramentity: this.configuration.paramentity,
        paramcustomObject: this.configuration.paramcustomObject,
        primitive: this.configuration.primitive,
        enableLogger: this.configuration.enableLogger,
        enableRecover: this.configuration.enableRecover,
        enableCors: this.configuration.enableCors,
        enableMultiTenant: this.configuration.enableMultiTenant,
        errorMsg: this.configuration.errorMsg,
        errorAction: errorAction,
        errorBranch: errorBranch,
        errorInputType: this.configuration.errorInputType,
        errorBranchparameter: this.configuration.errorBranchparameter,
        errorParameterinputType: this.configuration.errorParameterinputType,
        errorParameterparam: this.configuration.errorParameterparam,
        errorParameterproperty: this.configuration.errorParameterproperty,
        errorParameterbranchparam: this.configuration.errorParameterbranchparam,
        errorIsAsync: this.configuration.errorIsAsync,
      });
    }

    this.changeSubscriptionVal = this.commonNodeConfigFormGroup.get('valueproperty').valueChanges.subscribe(
      (configuration: any) => {
          // this.configuration.modelpropertyproperty = configuration;

          if(configuration.propertyDataType === 'MODEL' && configuration.record === 's'){
              const selectedbranchparamdomainModel = this.allDomainModelsWithSub.find(x => x.nameTitleCase === configuration.type );
              if(selectedbranchparamdomainModel){
                  const designtree : any[] = [];
                  designtree.push(selectedbranchparamdomainModel.design);
                  this.dataSourceVal.data = designtree;
              }
          } else if (configuration.propertyDataType === 'DTO' && configuration.record === 's'){
              const selectedbranchparamviewModel = this.allViewModelsWithSub.find(x => x.nameTitleCase === configuration.type );
              if(selectedbranchparamviewModel){
                  const designtree : any[] = [];
                  designtree.push(selectedbranchparamviewModel.design);
                  this.dataSourceVal.data = designtree;
              }
          } else {
              this.dataSourceVal = new MatTreeFlatDataSource(this.treeControlVal, this.treeFlattenerVal);
          }
          // this.updateModel(this.configuration);
      }
  );

  this.changeSubscriptionProp = this.commonNodeConfigFormGroup.get('propertyproperty').valueChanges.subscribe(
      (configuration: any) => {
          // this.configuration.modelpropertyproperty = configuration;

          if(configuration.propertyDataType === 'MODEL' && configuration.record === 's'){
              const selectedbranchparamdomainModel = this.allDomainModelsWithSub.find(x => x.nameTitleCase === configuration.type );
              if(selectedbranchparamdomainModel){
                  const designtree : any[] = [];
                  designtree.push(selectedbranchparamdomainModel.design);
                  this.dataSourceProp.data = designtree;
              }
          } else if (configuration.propertyDataType === 'DTO' && configuration.record === 's'){
              const selectedbranchparamviewModel = this.allViewModelsWithSub.find(x => x.nameTitleCase === configuration.type );
              if(selectedbranchparamviewModel){
                  const designtree : any[] = [];
                  designtree.push(selectedbranchparamviewModel.design);
                  this.dataSourceProp.data = designtree;
              }
          } else {
              this.dataSourceProp = new MatTreeFlatDataSource(this.treeControlProp, this.treeFlattenerProp);
          }
          // this.updateModel(this.configuration);
      }
  );

    
    this.createComponent();
  }

  createComponent() {
    PropertyNode.allConnectorControls.forEach((item) => {
      if (item.fields) {
        item.fields.forEach((field) => {
          this.element = this.element + this.getTemplate(field);
        });
      }
    });

    this.output = `<div [formGroup]="commonNodeConfigFormGroup"> ${this.element} </div> `;

    this.addComponent(this.output, {
      commonNodeConfigFormGroup: this.commonNodeConfigFormGroup,
      displayedColumns: this.displayedColumns,
      deleteRow: function (source: string, index: number) {
        if (source === "data") {
          if (this.configuration.constants.length > 0) {
            this.configuration.constants.splice(index, 1);
            this.datasource = new MatTableDataSource(
              this.configuration.constants
            ) as MatTableDataSource<Constant>;
          } else if(this.configuration.assignments > 0) {
            this.configuration.assignments.splice(index, 1);
            this.datasource = new MatTableDataSource(this.configuration.assignments);    
          } else {
            this.configuration.callFunctionParameters.splice(index, 1);
            this.datasource = new MatTableDataSource(
              this.configuration.callFunctionParameters
            );
          }
        } else {
          this.configuration.modelproperties.splice(index, 1);
          this.propertydatasource = new MatTableDataSource(
            this.configuration.modelproperties
          );
        }
        this.updateModel(this.configuration);
      },
      propertydatasource: this.propertydatasource,
      configuration: this.configuration,
      checkboxClick: function (node) {
        this.checkboxClick(node);
      },
      checkboxClickProp: function(node){
        this.checklistSelectionProp.toggle(node);
      },
      checkboxClickVal: function(node){
          this.checklistSelectionVal.toggle(node);
      },
      updateModel: function (configuration: RuleNodeConfiguration) {
        if (
          this.definedConfigComponent ||
          this.commonNodeConfigFormGroup.valid
        ) {
          this.propagateChange(configuration);
        } else {
          this.propagateChange(this.required ? null : configuration);
        }
      },
      definedConfigComponent: this.definedConfigComponent,
      propagateChange: function (v: any) { },
      required: this.required,
      registerOnChange: function (fn: any) {
        this.propagateChange = fn;
      },
      registerOnTouched: function (fn: any) { },
      addProperty: function () {
        const propertyType: string = this.commonNodeConfigFormGroup.get(
          "modelpropertyType"
        ).value;
        let checklistSelection = this.checklistSelection.selected[0];
        let selectedNode: DomainModelProperty;
        if (propertyType !== "NEW" && checklistSelection) {
          selectedNode = {
            name: checklistSelection.name,
            data: checklistSelection.data,
          };
        }

        let name: string = this.commonNodeConfigFormGroup.get("propertyName")
          .value;
        name = name.replace(/\s/g, "");
        name = this.lowerCaseWord(name);
        let propertyDataType: string = "";
        let type: string = "";
        let record: string = "";
        let modelproperty: DomainModelProperty;
        let selectedInput: string = "";

        let mapKey: string = "";
        let mapKeyType: string = "";
        let mapValue: string = "";
        let mapValueType: string = "";
        let mapValueRecord: string = "";
        let propertyScope: string = "";
        let modelName = "";
        if (propertyType === "RULE_INPUT") {
          selectedInput = this.commonNodeConfigFormGroup.get(
            "modelpropertyruleInput"
          ).value.inputName;
          let pkg = this.commonNodeConfigFormGroup.get("modelpropertyruleInput")
            .value.inputType;

          if (
            selectedNode.data.type === "collection" ||
            selectedNode.data.type === "list"
          ) {
            if (name[0] === " ") {
              name = name.substr(1);
            }
            name = name.replace(/\s/g, "_");
            let modelNameTrimmed = selectedNode.data.name.replace(/\s/g, "");
            let modelNameLowerCase = modelNameTrimmed.toLowerCase();
            let modelTitleName = this.titleCaseWord(modelNameLowerCase);
            type = modelTitleName;

            if (pkg === "model" || pkg === "MODEL") {
              propertyDataType = "MODEL";
            } else if (pkg === "dto" || pkg === "DTO") {
              propertyDataType = "DTO";
            }

            if (selectedNode.data.type === "collection") {
              record = "s";
            } else if (selectedNode.data.type === "list") {
              record = "m";
            }
          } else {
            type = selectedNode.data.propertytype;
            propertyDataType = "PRIMITIVE";
            record = "s";
          }

          modelproperty = selectedNode;
        } else if (propertyType === "BRANCH_PARAM") {
          selectedInput = this.commonNodeConfigFormGroup.get(
            "modelpropertybranchParam"
          ).value.name;
          let pkg = this.commonNodeConfigFormGroup.get(
            "modelpropertybranchParam"
          ).value.inputType;
          if (
            selectedNode.data.type === "collection" ||
            selectedNode.data.type === "list"
          ) {
            let modelNameTrimmed = selectedNode.data.name.replace(/\s/g, "");
            let modelNameLowerCase = modelNameTrimmed.toLowerCase();
            let modelTitleName = this.titleCaseWord(modelNameLowerCase);
            type = modelTitleName;

            if (pkg === "model" || pkg === "MODEL") {
              propertyDataType = "MODEL";
            } else if (pkg === "dto" || pkg === "DTO") {
              propertyDataType = "DTO";
            }

            if (selectedNode.data.type === "collection") {
              record = "s";
            } else if (selectedNode.data.type === "list") {
              record = "m";
            }
          } else {
            type = selectedNode.data.propertytype;
            propertyDataType = "PRIMITIVE";
            record = "s";
          }

          modelproperty = selectedNode;
        } else if (propertyType === "PROPERTY") {
          selectedInput = this.commonNodeConfigFormGroup.get(
            "modelpropertyproperty"
          ).value.name;
          let pkg = this.commonNodeConfigFormGroup.get("modelpropertyproperty")
            .value.propertyDataType;
          if (
            selectedNode.data.type === "collection" ||
            selectedNode.data.type === "list"
          ) {
            let modelNameTrimmed = selectedNode.data.name.replace(/\s/g, "");
            let modelNameLowerCase = modelNameTrimmed.toLowerCase();
            let modelTitleName = this.titleCaseWord(modelNameLowerCase);
            type = modelTitleName;

            if (pkg === "model" || pkg === "MODEL") {
              propertyDataType = "MODEL";
            } else if (pkg === "dto" || pkg === "DTO") {
              propertyDataType = "DTO";
            }

            if (selectedNode.data.type === "collection") {
              record = "s";
            } else if (selectedNode.data.type === "list") {
              record = "m";
            }
          } else {
            type = selectedNode.data.propertytype;
            propertyDataType = "PRIMITIVE";
            record = "s";
          }
          modelproperty = selectedNode;
        } else if (propertyType === "NEW") {
          propertyDataType = this.commonNodeConfigFormGroup.get("propinputType")
            .value;
          if (propertyDataType !== "DB" && propertyDataType !== "MESSAGING") {
            record = this.commonNodeConfigFormGroup.get("proprecord").value;
            propertyScope = this.commonNodeConfigFormGroup.get("propertyScope")
              .value;
          } else {
            record = "";
            propertyScope = "GLOBAL";
          }

          if (propertyScope == "GLOBAL") {
            name = this.titleCaseWord(name);
          }

          if (propertyDataType === "MODEL") {
            type = this.commonNodeConfigFormGroup.get("propentity").value.name;
          } else if (propertyDataType === "DTO") {
            type = this.commonNodeConfigFormGroup.get("propcustomObject").value
              .name;
          } else if (propertyDataType === "PRIMITIVE") {
            type = this.commonNodeConfigFormGroup.get("propprimitive").value;
          } else if (propertyDataType === "MAP") {
            mapKeyType = this.commonNodeConfigFormGroup.get("keyinputType")
              .value;
            if (mapKeyType === "MODEL") {
              mapKey = this.commonNodeConfigFormGroup.get("keypentity").value
                .name;
            } else if (mapKeyType === "DTO") {
              mapKey = this.commonNodeConfigFormGroup.get("keycustomObject")
                .value.name;
            } else if (mapKeyType === "PRIMITIVE") {
              mapKey = this.commonNodeConfigFormGroup.get("keyprimitive").value;
            }

            mapValueType = this.commonNodeConfigFormGroup.get("valueinputType")
              .value;

            if (mapValueType === "MODEL") {
              mapValue = this.commonNodeConfigFormGroup.get("valueentity").value
                .name;
            } else if (mapValueType === "DTO") {
              mapValue = this.commonNodeConfigFormGroup.get("valuecustomObject")
                .value.name;
            } else if (mapValueType === "PRIMITIVE") {
              mapValue = this.commonNodeConfigFormGroup.get("valueprimitive")
                .value;
            }
            mapValueRecord = this.commonNodeConfigFormGroup.get("valuerecord")
              .value;
          }
        }

        let property: Property = {
          propertyType: propertyType,
          name: name,
          propertyDataType: propertyDataType,
          type: type,
          record: record,
          modelproperty: modelproperty,
          selectedInput: selectedInput,
          mapKey: mapKey,
          mapKeyType: mapKeyType,
          mapValue: mapValue,
          mapValueType: mapValueType,
          mapValueRecord: mapValueRecord,
          propertyScope: propertyScope,
        };
        this.configuration.modelproperties.push(property);
        this.propertydatasource = new MatTableDataSource(
          this.configuration.modelproperties
        );
        this.updateModel(this.configuration);

        this.commonNodeConfigFormGroup.patchValue({
          propertyName: "",
        });
      },
      checklistSelection: this.checklistSelection,
      checklistSelectionProp: this.checklistSelectionProp,
      checklistSelectionVal: this.checklistSelectionVal,
      titleCaseWord: function (word: string) {
        if (!word) return word;
        return word[0].toUpperCase() + word.substr(1);
      },
      lowerCaseWord: function (word: string) {
        if (!word) return word;
        return word[0].toLowerCase() + word.substr(1);
      },
      dataSource: this.dataSource,
      datasource: this.datasource,
      treeControl: this.treeControl,
      treeFlattener: this.treeFlattener,
      treeControlProp: this.treeControlProp,
      treeFlattenerProp: this.treeFlattenerProp,
      treeControlVal: this.treeControlVal,
      treeFlattenerVal: this.treeFlattenerVal,
      refreshTypes: function () {
        let modelpropertyType: string = this.commonNodeConfigFormGroup.get(
          "modelpropertyType"
        ).value;
        if (modelpropertyType === "RULE_INPUT") {
          this.dataSource = new MatTreeFlatDataSource(
            this.treeControl,
            this.treeFlattener
          );
          this.commonNodeConfigFormGroup.patchValue({
            modelpropertybranchParam: [],
            modelpropertyproperty: [],
            propinputType: "",
            propentity: [],
            propcustomObject: [],
            propprimitive: "",
            proprecord: "",
            keyinputType: "",
            keypentity: [],
            keycustomObject: [],
            keyprimitive: "",
            valueinputType: "",
            valueentity: [],
            valuecustomObject: [],
            valueprimitive: "",
            valuerecord: "",
            propertyScope: "",
            constantName: [],
            constantType: [],
            customValue: [],
            scope: "",
          });
        } else if (modelpropertyType === "PROPERTY") {
          this.dataSource = new MatTreeFlatDataSource(
            this.treeControl,
            this.treeFlattener
          );
          this.commonNodeConfigFormGroup.patchValue({
            modelpropertyruleInput: [],
            modelpropertybranchParam: [],
            propinputType: "",
            propentity: [],
            propcustomObject: [],
            propprimitive: "",
            proprecord: "",
            keyinputType: "",
            keypentity: [],
            keycustomObject: [],
            keyprimitive: "",
            valueinputType: "",
            valueentity: [],
            valuecustomObject: [],
            valueprimitive: "",
            valuerecord: "",
            propertyScope: "",
            constantName: [],
            constantType: [],
            customValue: [],
            scope: "",
          });
        } else if (modelpropertyType === "BRANCH_PARAM") {
          this.dataSource = new MatTreeFlatDataSource(
            this.treeControl,
            this.treeFlattener
          );
          this.commonNodeConfigFormGroup.patchValue({
            modelpropertyruleInput: [],
            modelpropertyproperty: [],
            propinputType: "",
            propentity: [],
            propcustomObject: [],
            propprimitive: "",
            proprecord: "",
            keyinputType: "",
            keypentity: [],
            keycustomObject: [],
            keyprimitive: "",
            valueinputType: "",
            valueentity: [],
            valuecustomObject: [],
            valueprimitive: "",
            valuerecord: "",
            propertyScope: "",
            constantName: [],
            constantType: [],
            customValue: [],
            scope: "",
          });
        } else if (modelpropertyType === "NEW") {
          this.dataSource = new MatTreeFlatDataSource(
            this.treeControl,
            this.treeFlattener
          );
          this.commonNodeConfigFormGroup.patchValue({
            modelpropertyruleInput: [],
            modelpropertybranchParam: [],
            modelpropertyproperty: [],
          });
        }
      },
      refreshInputTypes: function(){
        let inputType: string = this.commonNodeConfigFormGroup
        .get('propertyinputType').value;
        this.configuration.propertyinputType = inputType;

        if (inputType === 'PROPERTY'){
            this.configuration.propertyreference= {};
            this.commonNodeConfigFormGroup.get('propertyreference')
            .patchValue([], {emitEvent: false});
        } else if (inputType === 'REFERENCE'){
            this.configuration.propertyproperty= {};
            this.commonNodeConfigFormGroup.get('propertyproperty')
            .patchValue([], {emitEvent: false});
        } else if (inputType === 'RETURN'){
            this.configuration.propertyreference= {};
            this.configuration.propertyproperty= {};
        }
        if (this.definedConfigComponent) {
            this.propagateChange(this.configuration);
        }
    },
    refreshSecondInputTypes: function(){
        let inputType: string = this.commonNodeConfigFormGroup.get('valueinputType').value;
        this.configuration.valueinputType = inputType;

        if (inputType === 'CONSTANT'){
            this.configuration.valueparam= {};
            this.configuration.valueproperty= {};
            this.configuration.valuebranchparam= {};

            this.commonNodeConfigFormGroup.get('valueparam').patchValue([], {emitEvent: false});
            this.commonNodeConfigFormGroup.get('valueproperty').patchValue([], {emitEvent: false});
            this.commonNodeConfigFormGroup.get('valuebranchparam').patchValue([], {emitEvent: false});

        } else if (inputType === 'RULE_INPUT'){
            this.configuration.valueconstant= {};
            this.configuration.valueproperty= {};
            this.configuration.valuebranchparam= {};

            this.commonNodeConfigFormGroup.get('valueconstant').patchValue([], {emitEvent: false});
            this.commonNodeConfigFormGroup.get('valueproperty').patchValue([], {emitEvent: false});
            this.commonNodeConfigFormGroup.get('valuebranchparam').patchValue([], {emitEvent: false});
        } else if (inputType === 'PROPERTY'){
            this.configuration.valueconstant= {};
            this.configuration.valueparam= {};
            this.configuration.valuebranchparam= {};

            this.commonNodeConfigFormGroup.get('valueconstant').patchValue([], {emitEvent: false});
            this.commonNodeConfigFormGroup.get('valueparam').patchValue([], {emitEvent: false});
            this.commonNodeConfigFormGroup.get('valuebranchparam').patchValue([], {emitEvent: false});
        } else if (inputType === 'BRANCH_PARAM'){
            this.configuration.valueconstant= {};
            this.configuration.valueparam= {};
            this.configuration.valueproperty= {};

            this.commonNodeConfigFormGroup.get('valueconstant').patchValue([], {emitEvent: false});
            this.commonNodeConfigFormGroup.get('valueparam').patchValue([], {emitEvent: false});
            this.commonNodeConfigFormGroup.get('valueproperty').patchValue([], {emitEvent: false});
        }

        if (this.definedConfigComponent) {
            this.propagateChange(this.configuration);
        }

    },
      addConstant: function () {
        let scope: string = this.commonNodeConfigFormGroup.get("scope").value;
        let name: string = this.commonNodeConfigFormGroup.get("constantName")
          .value;

        name = name.replace(/\s/g, "");

        if (scope == "GLOBAL") {
          name = this.titleCaseWord(name);
        } else {
          name = this.lowerCaseWord(name);
        }

        let constant = {
          constantName: name,
          constantType: this.commonNodeConfigFormGroup.get("constantType")
            .value,
          customValue: this.commonNodeConfigFormGroup.get("customValue").value,
          scope: scope,
        };
        this.configuration.constants.push(constant);
        this.updateModel(this.configuration);
        this.datasource = new MatTableDataSource(this.configuration.constants);
        this.commonNodeConfigFormGroup.patchValue({
          constantName: "",
          constantType: "",
          customValue: "",
          scope: "",
        });
      },
      addParam: function () {
        let inputType: string = this.commonNodeConfigFormGroup.get(
          "paraminputType"
        ).value;
        let paramName: string = this.commonNodeConfigFormGroup.get("paramName")
          .value;
        let paramRecord: string = this.commonNodeConfigFormGroup.get(
          "paramRecord"
        ).value;

        if (inputType === "MODEL") {
          let selectedEntity = this.commonNodeConfigFormGroup.get("paramentity")
            .value;
          let entityparam = {
            name: paramName,
            inputType: inputType,
            input: selectedEntity.name,
            record: paramRecord,
          };
          this.configuration.branchParams.push(entityparam);
          this.updateModel(this.configuration);
        } else if (inputType === "DTO") {
          let selectedDTO = this.commonNodeConfigFormGroup.get(
            "paramcustomObject"
          ).value;
          let dtoParam = {
            name: paramName,
            inputType: inputType,
            input: selectedDTO.name,
            record: paramRecord,
          };
          this.configuration.branchParams.push(dtoParam);
          this.updateModel(this.configuration);
        } else if (inputType === "PRIMITIVE") {
          let selectedprimitive = this.commonNodeConfigFormGroup.get(
            "primitive"
          ).value;
          let primitiveParam = {
            name: paramName,
            inputType: inputType,
            input: selectedprimitive,
            record: paramRecord,
          };
          this.configuration.branchParams.push(primitiveParam);
          this.updateModel(this.configuration);
        } else if (inputType === "ANY") {
          let anyParam = {
            name: paramName,
            inputType: inputType,
            input: "-",
            record: paramRecord,
          };
          this.configuration.branchParams.push(anyParam);
          this.updateModel(this.configuration);
        }

        this.datasource = new MatTableDataSource(
          this.configuration.branchParams
        );

        this.commonNodeConfigFormGroup.patchValue({
          paraminputType: "",
          paramName: "",
          paramRecord: "",
          paramentity: [],
          paramcustomObject: [],
          primitive: "",
        });
      },
      deleteErrorRow: function (index: number) {
        this.configuration.errorFunctionParameters.splice(index, 1);
        this.errordatasource = new MatTableDataSource(
          this.configuration.errorFunctionParameters
        );
        this.updateModel(this.configuration);
      },
      addErrorParameter: function () {
        let errorInputType: string = this.commonNodeConfigFormGroup.get(
          "errorParameterinputType"
        ).value;
        let errorBranchparameter = this.commonNodeConfigFormGroup.get(
          "errorBranchparameter"
        ).value;

        if (errorInputType === "RULE_INPUT") {
          let selectedErrorParameterParam = this.commonNodeConfigFormGroup.get(
            "errorParameterparam"
          ).value;
          let errorParameter = {
            parameterName: errorBranchparameter.paramName,
            inputType: errorInputType,
            input: "-",
            property: selectedErrorParameterParam.inputName,
          };
          this.configuration.errorFunctionParameters.push(errorParameter);
          this.updateModel(this.configuration);
        } else if (errorInputType === "PROPERTY") {
          let selectedErrorParameterProperty = this.commonNodeConfigFormGroup.get(
            "errorParameterproperty"
          ).value;
          let errorParameterproperty = {
            parameterName: errorBranchparameter.paramName,
            inputType: errorInputType,
            input: "-",
            property: selectedErrorParameterProperty.name,
          };
          this.configuration.errorFunctionParameters.push(
            errorParameterproperty
          );
          this.updateModel(this.configuration);
        } else if (errorInputType === "BRANCH_PARAM") {
          let selectedErrorParameterBranch = this.commonNodeConfigFormGroup.get(
            "errorParameterbranchparam"
          ).value;
          let errorParameterbranchparam = {
            parameterName: errorBranchparameter.paramName,
            inputType: errorInputType,
            input: "-",
            property: selectedErrorParameterBranch.name,
          };
          this.configuration.errorFunctionParameters.push(
            errorParameterbranchparam
          );
          this.updateModel(this.configuration);
        } else if (errorInputType === "ERROR") {
          let errString = {
            parameterName: errorBranchparameter.paramName,
            inputType: errorInputType,
            input: "-",
            property: "",
          };
          this.configuration.errorFunctionParameters.push(errString);
          this.updateModel(this.configuration);
        }

        this.errordatasource = new MatTableDataSource(
          this.configuration.errorFunctionParameters
        );

        this.configuration.errorParameterinputType = "";
        this.configuration.errorParameterproperty = {};
        this.configuration.errorParameterparam = {};
        this.configuration.errorBranchparameter = {};
        this.configuration.errorParameterbranchparam = {};

        this.commonNodeConfigFormGroup
          .get("errorParameterinputType")
          .patchValue([], { emitEvent: false });
        this.commonNodeConfigFormGroup
          .get("errorParameterparam")
          .patchValue([], { emitEvent: false });
        this.commonNodeConfigFormGroup
          .get("errorParameterproperty")
          .patchValue([], { emitEvent: false });
        this.commonNodeConfigFormGroup
          .get("errorBranchparameter")
          .patchValue([], { emitEvent: false });
        this.commonNodeConfigFormGroup
          .get("errorParameterbranchparam")
          .patchValue([], { emitEvent: false });
      },
      refreshErrorParameterInputTypes: function () {
        let errorInputType: string = this.commonNodeConfigFormGroup.get(
          "errorParameterinputType"
        ).value;
        this.configuration.errorParameterinputType = errorInputType;
        if (errorInputType === "RULE_INPUT") {
          this.configuration.errorParameterproperty = {};
          this.configuration.errorParameterbranchparam = {};
          this.commonNodeConfigFormGroup
            .get("errorParameterproperty")
            .patchValue([], { emitEvent: false });
          this.commonNodeConfigFormGroup
            .get("errorParameterbranchparam")
            .patchValue([], { emitEvent: false });
        } else if (errorInputType === "PROPERTY") {
          this.configuration.errorParameterparam = {};
          this.configuration.errorParameterbranchparam = {};
          this.commonNodeConfigFormGroup
            .get("parameterbranchparam")
            .patchValue([], { emitEvent: false });
          this.commonNodeConfigFormGroup
            .get("errorParameterbranchparam")
            .patchValue([], { emitEvent: false });
        } else if (errorInputType === "BRANCH_PARAM") {
          this.configuration.errorParameterparam = {};
          this.configuration.errorParameterproperty = {};
          this.commonNodeConfigFormGroup
            .get("errorParameterproperty")
            .patchValue([], { emitEvent: false });
          this.commonNodeConfigFormGroup
            .get("errorParameterparam")
            .patchValue([], { emitEvent: false });
        } else if (errorInputType === "ERROR") {
          this.configuration.errorParameterbranchparam = {};
          this.configuration.errorParameterparam = {};
          this.configuration.errorParameterproperty = {};
          this.commonNodeConfigFormGroup
            .get("errorParameterproperty")
            .patchValue([], { emitEvent: false });
          this.commonNodeConfigFormGroup
            .get("errorParameterparam")
            .patchValue([], { emitEvent: false });
          this.commonNodeConfigFormGroup
            .get("errorParameterproperty")
            .patchValue([], { emitEvent: false });
        }
        if (this.definedConfigComponent) {
          this.propagateChange(this.configuration);
        }
      },
      addAssignment: function(){
        const checklistSelectionProp = this.checklistSelectionProp.selected[0];
        let selectedProperty : DomainModelProperty;
        if(checklistSelectionProp){
            selectedProperty = {
                name: checklistSelectionProp.name,
                data: checklistSelectionProp.data
            };
        }

        const checklistSelectionVal = this.checklistSelectionVal.selected[0];
        let selectedValue : DomainModelProperty;
        if(checklistSelectionVal){
            selectedValue = {
                name: checklistSelectionVal.name,
                data: checklistSelectionVal.data
            };
        }
        let propinputType: string = this.commonNodeConfigFormGroup.get('propertyinputType').value;
        let valueinputType: string = this.commonNodeConfigFormGroup.get('valueinputType').value;

        let propertyName: string = '';
        let valueName: string = '';
        let propertyScope: string = '';
        let valueScope: string = '';

        if (propinputType === 'REFERENCE'){
            let selectedPropertyReference = this.commonNodeConfigFormGroup.get('propertyreference').value;
            propertyName = selectedPropertyReference.name;
        } else if (propinputType === 'PROPERTY'){
            let selectedPropertyProperty = this.commonNodeConfigFormGroup.get('propertyproperty').value;
            propertyName = selectedPropertyProperty.name;
            propertyScope= selectedPropertyProperty.propertyScope;
        }
        if (valueinputType === 'RULE_INPUT'){
            let selectedValueParam = this.commonNodeConfigFormGroup.get('valueparam').value;
            valueName = selectedValueParam.inputName;
        } else if (valueinputType === 'PROPERTY'){
            let selectedValueProperty = this.commonNodeConfigFormGroup.get('valueproperty').value;
            valueName = selectedValueProperty.name;
            valueScope = selectedValueProperty.propertyScope;
        } else if (valueinputType === 'BRANCH_PARAM'){
            let selectedValueBranch = this.commonNodeConfigFormGroup.get('valuebranchparam').value;
            valueName = selectedValueBranch.name;
        } else if (valueinputType === 'CONSTANT'){
            let selectedValueConstant = this.commonNodeConfigFormGroup.get('valueconstant').value;
            valueName = selectedValueConstant.constantName;
            valueScope = selectedValueConstant.scope;
        }

        let assignment = {
            'propertyinputType': propinputType,
            'propertyName': propertyName,
            'propertyAttributeType': selectedProperty.data.propertytype,
            'propertyAttribute': selectedProperty.name,
            'propertyPath': selectedProperty.data.path,
            'propertyScope':propertyScope,
            'valueinputType': valueinputType,
            'valueAttributeType': selectedValue.data.propertytype,
            'valueAttribute': selectedValue.name,
            'valuePath': selectedValue.data.path,
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

        this.commonNodeConfigFormGroup.patchValue({
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
    });
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.commonNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

  getTemplate(field) {
    if (field.controlType === VirtuanControlType.TEXT_INPUT_FIELD) {
      return `<mat-form-field fxFlex class="mat-block">
      <mat-label>${field.label}</mat-label>
      <input matInput formControlName="${field.key}"/>
      </mat-form-field>`;
    } else if (field.controlType === VirtuanControlType.FORM_TABLE) {
      this.displayedColumns = field.table.col;
      let tableTemplate;
      if (field.table.source === "propertydatasource") {
        tableTemplate = `<div fxFlex class="table-container" style="padding: 10px;">
        <table mat-table [dataSource]="propertydatasource" class="mat-elevation-z8">
            <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef> Property Name </th>
                <td mat-cell *matCellDef="let element"> {{element.name}} </td>
            </ng-container>
    
            <ng-container matColumnDef="propertyType">
                <th mat-header-cell *matHeaderCellDef> Created From </th>
                <td mat-cell *matCellDef="let element"> {{element.propertyType}} </td>
            </ng-container>
    
            <ng-container matColumnDef="propertyDataType">
                <th mat-header-cell *matHeaderCellDef> Data Type </th>
                <td mat-cell *matCellDef="let element"> {{element.propertyDataType}} </td>
            </ng-container>
            <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef> Type </th>
                <td mat-cell *matCellDef="let element"> {{element.type}} </td>
            </ng-container>
            <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef> Action </th>
                <td mat-cell *matCellDef="let element;let i = index">
                    <button mat-icon-button class="virtuan-mat-32" (click)="deleteRow('prop',i)" matTooltip="Delete Property" matTooltipPosition="above">
                        <mat-icon style="color:red;">delete</mat-icon>
                    </button></td>
            </ng-container>
    
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
    </div>`;
      } else {
        tableTemplate = `
        <div fxFlex class="table-container" style="padding: 10px;margin-bottom:10px;">
        <table mat-table [dataSource]="datasource" class="mat-elevation-z8">

      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef> Name </th>
        <td mat-cell *matCellDef="let element"> {{element.name}} </td>
      </ng-container>

      <ng-container matColumnDef="record">
        <th mat-header-cell *matHeaderCellDef> Record </th>
        <td mat-cell *matCellDef="let element"> {{element.record}} </td>
      </ng-container>

          <ng-container matColumnDef="parameterName">
            <th mat-header-cell *matHeaderCellDef> Name </th>
            <td mat-cell *matCellDef="let element"> {{element.parameterName}} </td>
          </ng-container>
    
          <ng-container matColumnDef="inputType">
            <th mat-header-cell *matHeaderCellDef> Input Type </th>
            <td mat-cell *matCellDef="let element"> {{element.inputType}} </td>
          </ng-container>
    
          <ng-container matColumnDef="input">
            <th mat-header-cell *matHeaderCellDef> Input </th>
            <td mat-cell *matCellDef="let element"> {{element.input}} </td>
          </ng-container>
    
          <ng-container matColumnDef="property">
            <th mat-header-cell *matHeaderCellDef> Property </th>
            <td mat-cell *matCellDef="let element"> {{element.property}} </td>
          </ng-container>
    
          <ng-container matColumnDef="constantName">
          <th mat-header-cell *matHeaderCellDef> Name </th>
          <td mat-cell *matCellDef="let element"> {{element.constantName}} </td>
        </ng-container>
  
        <ng-container matColumnDef="scope">
          <th mat-header-cell *matHeaderCellDef> Scope </th>
          <td mat-cell *matCellDef="let element"> {{element.scope}} </td>
        </ng-container>
  
        <ng-container matColumnDef="constantType">
          <th mat-header-cell *matHeaderCellDef> Type </th>
          <td mat-cell *matCellDef="let element"> {{element.constantType}} </td>
        </ng-container>
  
        <ng-container matColumnDef="customValue">
          <th mat-header-cell *matHeaderCellDef> Custom Value </th>
          <td mat-cell *matCellDef="let element"> {{element.customValue}} </td>
        </ng-container>

        <ng-container matColumnDef="propertyinputType">

        <th mat-header-cell *matHeaderCellDef> Property Type </th>
        <td mat-cell *matCellDef="let element"> {{element.propertyinputType}} </td>
    </ng-container>

    <ng-container matColumnDef="propertyName">
        <th mat-header-cell *matHeaderCellDef> Property Name </th>
        <td mat-cell *matCellDef="let element"> {{element.propertyName}} </td>
    </ng-container>

    <ng-container matColumnDef="propertyAttribute">
        <th mat-header-cell *matHeaderCellDef> Property Attribute </th>
        <td mat-cell *matCellDef="let element"> {{element.propertyAttribute}} </td>
    </ng-container>

    <ng-container matColumnDef="propertyAttributeType">
        <th mat-header-cell *matHeaderCellDef> Prop. Attr. Type </th>
        <td mat-cell *matCellDef="let element"> {{element.propertyAttributeType}} </td>
    </ng-container>

    <ng-container matColumnDef="valueinputType">
        <th mat-header-cell *matHeaderCellDef> Value type </th>
        <td mat-cell *matCellDef="let element"> {{element.valueinputType}} </td>
    </ng-container>

    <ng-container matColumnDef="valueName">
        <th mat-header-cell *matHeaderCellDef> Value Name </th>
        <td mat-cell *matCellDef="let element"> {{element.valueName}} </td>
    </ng-container>

    <ng-container matColumnDef="valueAttribute">
        <th mat-header-cell *matHeaderCellDef> Value Attribute </th>
        <td mat-cell *matCellDef="let element"> {{element.valueAttribute}} </td>
    </ng-container>

    <ng-container matColumnDef="valueAttributeType">
        <th mat-header-cell *matHeaderCellDef> Value Attr. Type </th>
        <td mat-cell *matCellDef="let element"> {{element.valueAttributeType}} </td>
    </ng-container>
        
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Action </th>
            <td mat-cell *matCellDef="let element;let i = index">
              <button mat-icon-button class="virtuan-mat-32" (click)="deleteRow('data',i)" matTooltip="Delete Parameter" matTooltipPosition="above">
                <mat-icon style="color:red;">delete</mat-icon>
              </button></td>
          </ng-container>
          
    
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
      `;
      }
      let subElement = "";
      field.form.fields.forEach((field) => {
        subElement = subElement + this.getTemplate(field);
      });
      return subElement + tableTemplate;
    } else if (field.controlType === VirtuanControlType.INPUT_SELECTOR) {
      this.propertydatasource = new MatTableDataSource(
        this.configuration.modelproperties
      );
      return `
      <mat-form-field fxFlex class="mat-block">
      <mat-label>Type</mat-label>
      <mat-select formControlName="modelpropertyType" (selectionChange)="refreshTypes()">
          <mat-option value="NEW">New</mat-option>
          <mat-option *ngIf="!branchAvailability?.branchFound && allRuleInputs?.length" value="RULE_INPUT">Rule Input</mat-option>
          <mat-option *ngIf="allModelProperties?.length" value="PROPERTY">Property</mat-option>
          <mat-option *ngIf="branchAvailability?.branchFound && branchAvailability?.branchParams?.length" value="BRANCH_PARAM">Branch Param</mat-option>
      </mat-select>
  </mat-form-field>
  <mat-form-field *ngIf="commonNodeConfigFormGroup.value.modelpropertyType === 'RULE_INPUT'" fxFlex class="mat-block">
      <mat-label>Rule Input</mat-label>
      <mat-select formControlName="modelpropertyruleInput">
          <ng-container *ngFor="let domainModel of allRuleInputs">
              <mat-option *ngIf="(domainModel?.inputType === 'model' || domainModel?.inputType === 'dto') && domainModel?.record === 's'" [value]="domainModel">
                  {{domainModel.inputName}} <span *ngIf="domainModel.inputType === 'model'"> - Domain Model</span>
                  <span *ngIf="domainModel.inputType === 'dto'"> - DTO Model</span>
              </mat-option>
          </ng-container>
      </mat-select>
  </mat-form-field>
  <mat-form-field *ngIf="commonNodeConfigFormGroup.value.modelpropertyType === 'BRANCH_PARAM'" fxFlex class="mat-block">
      <mat-label>Branch Param</mat-label>
      <mat-select formControlName="modelpropertybranchParam">
          <ng-container *ngFor="let domainModel of branchAvailability?.branchParams">
              <mat-option *ngIf="(domainModel?.inputType === 'MODEL' || domainModel?.inputType === 'DTO') && domainModel?.record === 's'" [value]="domainModel">
                  {{domainModel.name}} : {{domainModel.input}} <span *ngIf="domainModel.inputType === 'MODEL'"> - Domain Model</span>
                  <span *ngIf="domainModel.inputType === 'DTO'"> - DTO Model</span>
              </mat-option>
          </ng-container>
      </mat-select>
  </mat-form-field>
  <mat-form-field *ngIf="commonNodeConfigFormGroup.value.modelpropertyType === 'PROPERTY'" fxFlex class="mat-block">
      <mat-label>Property</mat-label>
      <mat-select formControlName="modelpropertyproperty">
          <ng-container *ngFor="let prop of allModelProperties">
              <mat-option *ngIf="(prop?.propertyDataType === 'MODEL' || prop?.propertyDataType === 'DTO') && prop?.record === 's'" [value]="prop">
                  {{prop.name}} : {{prop.type}} <span *ngIf="prop.propertyDataType === 'MODEL'"> - Domain Model</span>
                  <span *ngIf="prop.propertyDataType === 'DTO'"> - DTO Model</span>
              </mat-option>
          </ng-container>
      </mat-select>
  </mat-form-field>

  <ng-container *ngIf="commonNodeConfigFormGroup.value.modelpropertyType === 'NEW'">

      <mat-form-field fxFlex class="mat-block">
          <mat-label>Data Type</mat-label>
          <mat-select formControlName="propinputType">
              <mat-option *ngIf="inputEntities?.length" value="MODEL">Model</mat-option>
              <mat-option *ngIf="inputCustomobjects?.length" value="DTO">DTO</mat-option>
              <mat-option value="PRIMITIVE">Primitive</mat-option>
              <mat-option value="MAP">Map</mat-option>
              <mat-option value="ANY">Any</mat-option>
              <mat-option value="DB">Database</mat-option>
              <mat-option value="MESSAGING">Messaging</mat-option>
          </mat-select>
      </mat-form-field>

      <mat-form-field *ngIf="commonNodeConfigFormGroup.value.propinputType === 'MODEL'" fxFlex class="mat-block">
          <mat-label>Model</mat-label>
          <mat-select formControlName="propentity">
              <mat-option *ngFor="let nodeEntity of inputEntities" [value]="nodeEntity">
                  {{nodeEntity.name}}
              </mat-option>
          </mat-select>
      </mat-form-field>
      <mat-form-field *ngIf="commonNodeConfigFormGroup.value.propinputType === 'DTO'" fxFlex class="mat-block">
          <mat-label>DTO</mat-label>
          <mat-select formControlName="propcustomObject">
              <mat-option *ngFor="let nodeEntity of inputCustomobjects" [value]="nodeEntity">
                  {{nodeEntity.name}}
              </mat-option>
          </mat-select>
      </mat-form-field>
      <mat-form-field *ngIf="commonNodeConfigFormGroup.value.propinputType === 'PRIMITIVE'" fxFlex class="mat-block">
          <mat-label>Primitive</mat-label>
          <mat-select formControlName="propprimitive">
              <mat-option value="TEXT">Text</mat-option>
              <mat-option value="NUMBER">Number</mat-option>
              <mat-option value="FLOAT">FLOAT</mat-option>
              <mat-option value="DATE">Date</mat-option>
              <mat-option value="TRUE_OR_FALSE">True/False</mat-option>
          </mat-select>
      </mat-form-field>

      <mat-form-field fxFlex class="mat-block" *ngIf="commonNodeConfigFormGroup.value.propinputType !== 'DB' && commonNodeConfigFormGroup.value.propinputType !== 'MESSAGING'">
          <mat-label>Record</mat-label>
          <mat-select formControlName="proprecord">
              <mat-option value="s">Single</mat-option>
              <mat-option value="m">Multiple</mat-option>
          </mat-select>
      </mat-form-field>

      <section *ngIf="commonNodeConfigFormGroup.value.propinputType === 'MAP'" fxLayout="column" fxLayout.gt-sm="row" fxLayoutGap="10px" style="padding: 10px;">
          <section class="mat-block" fxFlex>
              <mat-form-field fxFlex class="mat-block">
                  <mat-label>Key Data Type</mat-label>
                  <mat-select formControlName="keyinputType">
                      <mat-option *ngIf="inputEntities?.length" value="MODEL">Model</mat-option>
                      <mat-option *ngIf="inputCustomobjects?.length" value="DTO">DTO</mat-option>
                      <mat-option value="PRIMITIVE">Primitive</mat-option>
                  </mat-select>
              </mat-form-field>
          </section>

          <section class="mat-block" fxFlex>

              <mat-form-field *ngIf="commonNodeConfigFormGroup.value.keyinputType === 'MODEL'" fxFlex class="mat-block">
                  <mat-label>Model</mat-label>
                  <mat-select formControlName="keypentity">
                      <mat-option *ngFor="let nodeEntity of inputEntities" [value]="nodeEntity">
                          {{nodeEntity.name}}
                      </mat-option>
                  </mat-select>
              </mat-form-field>
              <mat-form-field *ngIf="commonNodeConfigFormGroup.value.keyinputType === 'DTO'" fxFlex class="mat-block">
                  <mat-label>DTO</mat-label>
                  <mat-select formControlName="keycustomObject">
                      <mat-option *ngFor="let nodeEntity of inputCustomobjects" [value]="nodeEntity">
                          {{nodeEntity.name}}
                      </mat-option>
                  </mat-select>
              </mat-form-field>
              <mat-form-field *ngIf="commonNodeConfigFormGroup.value.keyinputType === 'PRIMITIVE'" fxFlex class="mat-block">
                  <mat-label>Primitive</mat-label>
                  <mat-select formControlName="keyprimitive">
                      <mat-option value="TEXT">Text</mat-option>
                      <mat-option value="NUMBER">Number</mat-option>
                      <mat-option value="FLOAT">FLOAT</mat-option>
                      <mat-option value="DATE">Date</mat-option>
                      <mat-option value="TRUE_OR_FALSE">True/False</mat-option>
                  </mat-select>
              </mat-form-field>
          </section>
      </section>
      <section *ngIf="commonNodeConfigFormGroup.value.propinputType === 'MAP'" fxLayout="column" fxLayout.gt-sm="row" fxLayoutGap="10px" style="padding: 10px;">
          <section class="mat-block" fxFlex>
              <mat-form-field fxFlex class="mat-block">
                  <mat-label>Value Data Type</mat-label>
                  <mat-select formControlName="valueinputType">
                      <mat-option *ngIf="inputEntities?.length" value="MODEL">Model</mat-option>
                      <mat-option *ngIf="inputCustomobjects?.length" value="DTO">DTO</mat-option>
                      <mat-option value="PRIMITIVE">Primitive</mat-option>
                  </mat-select>
              </mat-form-field>
          </section>

          <section class="mat-block" fxFlex>

              <mat-form-field *ngIf="commonNodeConfigFormGroup.value.valueinputType === 'MODEL'" fxFlex class="mat-block">
                  <mat-label>Model</mat-label>
                  <mat-select formControlName="valueentity">
                      <mat-option *ngFor="let nodeEntity of inputEntities" [value]="nodeEntity">
                          {{nodeEntity.name}}
                      </mat-option>
                  </mat-select>
              </mat-form-field>
              <mat-form-field *ngIf="commonNodeConfigFormGroup.value.valueinputType === 'DTO'" fxFlex class="mat-block">
                  <mat-label>DTO</mat-label>
                  <mat-select formControlName="valuecustomObject">
                      <mat-option *ngFor="let nodeEntity of inputCustomobjects" [value]="nodeEntity">
                          {{nodeEntity.name}}
                      </mat-option>
                  </mat-select>
              </mat-form-field>
              <mat-form-field *ngIf="commonNodeConfigFormGroup.value.valueinputType === 'PRIMITIVE'" fxFlex class="mat-block">
                  <mat-label>Primitive</mat-label>
                  <mat-select formControlName="valueprimitive">
                      <mat-option value="TEXT">Text</mat-option>
                      <mat-option value="NUMBER">Number</mat-option>
                      <mat-option value="FLOAT">FLOAT</mat-option>
                      <mat-option value="DATE">Date</mat-option>
                      <mat-option value="TRUE_OR_FALSE">True/False</mat-option>
                  </mat-select>
              </mat-form-field>
          </section>
          <section class="mat-block" fxFlex>
              <mat-form-field fxFlex class="mat-block">
                  <mat-label>Record</mat-label>
                  <mat-select formControlName="valuerecord">
                      <mat-option value="s">Single</mat-option>
                      <mat-option value="m">Multiple</mat-option>
                  </mat-select>
              </mat-form-field>
          </section>
      </section>

  </ng-container>

  <ng-container *ngIf="commonNodeConfigFormGroup.value.modelpropertyType !== 'NEW'">

  <mat-tree [dataSource]="dataSource" [treeControl]="treeControl">
      <mat-tree-node *matTreeNodeDef="let node" matTreeNodeToggle matTreeNodePadding>
          <button mat-icon-button disabled></button>
          <mat-checkbox class="checklist-leaf-node"
                        [checked]="checklistSelection.isSelected(node)"
                        (change)="checkboxClick(node)">{{node.name}}</mat-checkbox>
      </mat-tree-node>
      <mat-tree-node *matTreeNodeDef="let node; when: hasChild" matTreeNodePadding>
          <button mat-icon-button matTreeNodeToggle
                  [attr.aria-label]="'toggle ' + node.name">
              <mat-icon class="mat-icon-rtl-mirror">
                  {{treeControl.isExpanded(node) ? 'expand_more' : 'chevron_right'}}
              </mat-icon>
          </button>
          <mat-checkbox [checked]="checklistSelection.isSelected(node)"
                        (change)="checkboxClick(node)">{{node.name}}</mat-checkbox>
      </mat-tree-node>
  </mat-tree>
  </ng-container>

  <mat-form-field *ngIf="commonNodeConfigFormGroup.value.modelpropertyType === 'NEW' && (commonNodeConfigFormGroup.value.propinputType !== 'DB' && commonNodeConfigFormGroup.value.propinputType !== 'MESSAGING')" fxFlex class="mat-block">
      <mat-label>Scope</mat-label>
      <mat-select formControlName="propertyScope">
          <mat-option value="RULE">Rule</mat-option>
          <mat-option value="GLOBAL">Global</mat-option>
      </mat-select>
  </mat-form-field>

  <div fxFlex fxLayout="row" fxLayoutAlign="end center">
  <button mat-icon-button class="virtuan-fullscreen-button-style"
          (click)="addProperty()"
          matTooltip="Add Property"
          matTooltipPosition="above">
      <mat-icon color="primary">add</mat-icon>
  </button>
  </div>
`;
    } else if (field.controlType === VirtuanControlType.SELECT_SCOPE) {
      this.datasource = new MatTableDataSource(this.configuration.constants);
      return ` <section style="padding-top: 10px;padding-bottom: 20px;">
      <label>Add Constants</label>
    </section>
    <section fxLayout="column" fxLayout.gt-sm="row" fxLayoutGap="10px" style="padding: 10px;">
      <mat-form-field fxFlex class="mat-block">
        <mat-label>Name</mat-label>
        <input matInput formControlName="constantName"/>
      </mat-form-field>
      <mat-form-field fxFlex class="mat-block">
        <mat-label>Scope</mat-label>
        <mat-select formControlName="scope">
          <mat-option value="RULE">Rule</mat-option>
          <mat-option value="GLOBAL">Global</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field fxFlex class="mat-block">
        <mat-label>Type</mat-label>
        <mat-select formControlName="constantType">
          <mat-option value="String">Text</mat-option>
          <mat-option value="Integer">Number</mat-option>
          <mat-option value="Float">Float</mat-option>
          <mat-option value="Date">Date</mat-option>
          <mat-option value="Boolean">True/False</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field fxFlex class="mat-block">
        <mat-label>Custom Value</mat-label>
        <input matInput formControlName="customValue"/>
      </mat-form-field>
      <button mat-icon-button class="virtuan-fullscreen-button-style"
              (click)="addConstant()"
              matTooltip="Add Constant"
              matTooltipPosition="above">
        <mat-icon color="primary">add</mat-icon>
      </button>
    </section>
  `;
    } else if (field.controlType === VirtuanControlType.ERRORHANDLER) {
      this.errordatasource = new MatTableDataSource(
        this.configuration.errorFunctionParameters
      );
      return `<mat-form-field fxFlex class="mat-block">
      <mat-label>Error Message</mat-label>
      <input matInput formControlName="errorMsg"/>
  </mat-form-field>
  <mat-form-field fxFlex class="mat-block">
      <mat-label>Error Action</mat-label>
      <mat-select formControlName="errorAction">
          <mat-option value="1">Log & Continue</mat-option>
          <mat-option value="2">Log & Exit</mat-option>
          <mat-option value="3">Return</mat-option>
          <mat-option value="4">Call an Error Process</mat-option>
      </mat-select>
  </mat-form-field>
  
  <div *ngIf="configuration.errorAction == '4'">

  <mat-expansion-panel>
    <mat-expansion-panel-header>
      <mat-panel-title>
        Error Process Details
      </mat-panel-title>
      <mat-panel-description>
        Call an error process if error occured
      </mat-panel-description>
    </mat-expansion-panel-header>

    <section fxLayout="column" fxLayout.gt-sm="row">
      <mat-form-field fxFlex class="mat-block">
        <mat-label>Error Process</mat-label>
        <mat-select formControlName="errorBranch">
          <mat-option *ngFor="let root of allSubRules" [value]="root">
            {{root.name}}
          </mat-option>
        </mat-select>
      </mat-form-field>
      <mat-checkbox formControlName="errorIsAsync">
        Non Blocking
      </mat-checkbox>
    </section>

    <section fxLayout="column" fxLayout.gt-sm="row" fxLayoutGap="10px" style="padding: 10px;">
      <mat-form-field fxFlex class="mat-block">
        <mat-label>Process Input</mat-label>
        <mat-select formControlName="errorBranchparameter">
          <ng-container *ngFor="let param of configuration?.errorBranch?.params">
            <mat-option [value]="param">
              <span *ngIf="param.inputType === 'model' || param.inputType === 'dto';else primitive_param">{{param.paramName}} - {{param.inputName}}</span><ng-template #primitive_param><span>{{param.paramName}} - {{param.inputType}}</span></ng-template>
            </mat-option>
          </ng-container>
        </mat-select>
      </mat-form-field>

      <mat-form-field fxFlex class="mat-block">
        <mat-label>Process Input Type</mat-label>
        <mat-select formControlName="errorParameterinputType" (selectionChange)="refreshErrorParameterInputTypes()">
          <mat-option *ngIf="!branchAvailability?.branchFound && allRuleInputs?.length" value="RULE_INPUT">Rule Input</mat-option>
          <mat-option *ngIf="allModelProperties?.length" value="PROPERTY">Property</mat-option>
          <mat-option *ngIf="branchAvailability?.branchFound && branchAvailability?.branchParams?.length" value="BRANCH_PARAM">Branch Param</mat-option>
        </mat-select>
      </mat-form-field>
      <section class="mat-block" fxFlex>
        <mat-form-field *ngIf="configuration.errorParameterinputType === 'RULE_INPUT'" fxFlex class="mat-block">
          <mat-label>Rule Input</mat-label>
          <mat-select formControlName="errorParameterparam">
            <mat-option *ngFor="let property of allRuleInputs" [value]="property">
              {{property.inputName}}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field *ngIf="configuration.errorParameterinputType === 'PROPERTY'" fxFlex class="mat-block">
          <mat-label>Property</mat-label>
          <mat-select formControlName="errorParameterproperty">
            <mat-option *ngFor="let property of allModelProperties" [value]="property">
              {{property.name}}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field *ngIf="configuration.errorParameterinputType === 'BRANCH_PARAM'" fxFlex class="mat-block">
          <mat-label>Branch Param</mat-label>
          <mat-select formControlName="errorParameterbranchparam">
            <mat-option *ngFor="let param of branchAvailability?.branchParams" [value]="param">
              {{param.name}}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </section>
      <button mat-icon-button class="virtuan-fullscreen-button-style"
              (click)="addErrorParameter()"
              matTooltip="Add Parameter"
              matTooltipPosition="above">
        <mat-icon color="primary">add</mat-icon>
      </button>
    </section>

    <div fxFlex class="table-container" style="padding: 10px;margin-bottom:10px;">
      <table mat-table [dataSource]="errordatasource" class="mat-elevation-z8">

        <ng-container matColumnDef="parameterName">
          <th mat-header-cell *matHeaderCellDef> Name </th>
          <td mat-cell *matCellDef="let element"> {{element.parameterName}} </td>
        </ng-container>

        <ng-container matColumnDef="inputType">
          <th mat-header-cell *matHeaderCellDef> Input Type </th>
          <td mat-cell *matCellDef="let element"> {{element.inputType}} </td>
        </ng-container>

        <ng-container matColumnDef="input">
          <th mat-header-cell *matHeaderCellDef> Input </th>
          <td mat-cell *matCellDef="let element"> {{element.input}} </td>
        </ng-container>

        <ng-container matColumnDef="property">
          <th mat-header-cell *matHeaderCellDef> Property </th>
          <td mat-cell *matCellDef="let element"> {{element.property}} </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef> Action </th>
          <td mat-cell *matCellDef="let element;let i = index">
            <button mat-icon-button class="virtuan-mat-32" (click)="deleteErrorRow(i)" matTooltip="Delete Parameter" matTooltipPosition="above">
              <mat-icon style="color:red;">delete</mat-icon>
            </button></td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayErroredColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayErroredColumns;"></tr>
      </table>
    </div>

  </mat-expansion-panel>

</div>

  `;
    } else if (field.controlType === VirtuanControlType.CHECHBOX_SETRETURN) {
      return `
      <section fxLayout="row" fxLayout.gt-sm="column" fxLayoutGap="10px">
      <mat-checkbox fxFlex class="mat-block" formControlName="enableLogger">
          Enable Logger
      </mat-checkbox>
      <mat-checkbox fxFlex class="mat-block" formControlName="enableRecover">
          Enable Recover
      </mat-checkbox>
      <mat-checkbox fxFlex class="mat-block" formControlName="enableCors">
          Enable CORS
      </mat-checkbox>
      <mat-checkbox fxFlex class="mat-block" formControlName="enableMultiTenant">
          Enable Multi-Tenancy
      </mat-checkbox>
  </section>
  `;
    } else if (field.controlType === VirtuanControlType.PARAMTER_SELCTOR) {
      this.datasource = new MatTableDataSource(this.configuration.branchParams);
      return `
    <section fxLayout="column" fxLayout.gt-sm="row" fxLayoutGap="10px" style="padding: 10px;">
      <mat-form-field fxFlex class="mat-block">
        <mat-label>Name</mat-label>
        <input matInput formControlName="paramName"/>
      </mat-form-field>
      <mat-form-field fxFlex class="mat-block">
        <mat-label>Record</mat-label>
        <mat-select formControlName="paramRecord">
          <mat-option value="s">Single</mat-option>
          <mat-option value="m">Multiple</mat-option>
        </mat-select>
      </mat-form-field>
        <section class="mat-block" fxFlex>
          <mat-form-field fxFlex class="mat-block">
            <mat-label>Input Type</mat-label>
            <mat-select formControlName="paraminputType">
              <mat-option *ngIf="inputEntities?.length" value="MODEL">Model</mat-option>
              <mat-option *ngIf="inputCustomobjects?.length" value="DTO">DTO</mat-option>
              <mat-option value="PRIMITIVE">Primitive</mat-option>
              <mat-option value="ANY">Any</mat-option>
            </mat-select>
          </mat-form-field>
        </section>
  
        <section class="mat-block" fxFlex>
          <mat-form-field *ngIf="configuration.paraminputType === 'MODEL'" fxFlex class="mat-block">
            <mat-label>Model</mat-label>
            <mat-select formControlName="paramentity">
              <mat-option *ngFor="let nodeEntity of inputEntities" [value]="nodeEntity">
                {{nodeEntity.name}}
              </mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field *ngIf="configuration.paraminputType === 'DTO'" fxFlex class="mat-block">
            <mat-label>DTO</mat-label>
            <mat-select formControlName="paramcustomObject">
              <mat-option *ngFor="let nodeEntity of inputCustomobjects" [value]="nodeEntity">
                {{nodeEntity.name}}
              </mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field *ngIf="configuration.paraminputType === 'PRIMITIVE'" fxFlex class="mat-block">
            <mat-label>Primitive</mat-label>
            <mat-select formControlName="primitive">
              <mat-option value="String">Text</mat-option>
              <mat-option value="Integer">Number</mat-option>
              <mat-option value="Float">Float</mat-option>
              <mat-option value="Date">Date</mat-option>
              <mat-option value="Boolean">True/False</mat-option>
            </mat-select>
          </mat-form-field>
  
        </section>
      <button mat-icon-button class="virtuan-fullscreen-button-style"
              (click)="addParam()"
              matTooltip="Add Param"
              matTooltipPosition="above">
        <mat-icon color="primary">add</mat-icon>
      </button>
    </section>
  `;
    } else if (field.controlType === VirtuanControlType.PROPERTY_TYPE) {
      this.datasource = new MatTableDataSource(this.configuration.assignments);
      return `<section fxLayout="column" fxLayout.gt-sm="row" fxLayoutGap="10px" style="padding: 10px;">
      <section class="mat-block" fxFlex>
          <mat-form-field fxFlex class="mat-block">
              <mat-label>Property Type</mat-label>
              <mat-select formControlName="propertyinputType" (selectionChange)="refreshInputTypes()">
                  <mat-option *ngIf="allModelProperties?.length" value="PROPERTY">Value Property</mat-option>
                  <mat-option *ngIf="allReferenceProperties?.length" value="REFERENCE">Reference Property</mat-option>
                  <mat-option value="RETURN">Rule Respond</mat-option>
              </mat-select>
          </mat-form-field>
          <mat-form-field *ngIf="configuration.propertyinputType === 'PROPERTY'" fxFlex class="mat-block">
              <mat-label>Property</mat-label>
              <mat-select formControlName="propertyproperty">
                  <mat-option *ngFor="let property of allModelProperties" [value]="property">
                      {{property.name}}
                  </mat-option>
              </mat-select>
          </mat-form-field>
          <mat-form-field *ngIf="configuration.propertyinputType === 'REFERENCE'" fxFlex class="mat-block">
              <mat-label>Reference Property</mat-label>
              <mat-select formControlName="propertyreference">
                  <mat-option *ngFor="let property of allReferenceProperties" [value]="property">
                      {{property.name}}
                  </mat-option>
              </mat-select>
          </mat-form-field>
          <mat-tree [dataSource]="dataSourceProp" [treeControl]="treeControlProp">
              <mat-tree-node *matTreeNodeDef="let node" matTreeNodeToggle matTreeNodePadding>
                  <button mat-icon-button disabled></button>
                  <mat-checkbox class="checklist-leaf-node"
                                [checked]="checklistSelectionProp.isSelected(node)"
                                (change)="checkboxClickProp(node)">{{node.name}}</mat-checkbox>
              </mat-tree-node>
              <mat-tree-node *matTreeNodeDef="let node; when: hasChildProp" matTreeNodePadding>
                  <button mat-icon-button matTreeNodeToggle
                          [attr.aria-label]="'toggle ' + node.name">
                      <mat-icon class="mat-icon-rtl-mirror">
                          {{treeControlProp.isExpanded(node) ? 'expand_more' : 'chevron_right'}}
                      </mat-icon>
                  </button>
                  <mat-checkbox [checked]="checklistSelectionProp.isSelected(node)"
                                (change)="checkboxClickProp(node)">{{node.name}}</mat-checkbox>
              </mat-tree-node>
          </mat-tree>
      </section>
  </section>`
    } else if (field.controlType === VirtuanControlType.VALUE_TYPE) {
      this.datasource = new MatTableDataSource(this.configuration.assignments);
      return `
      <section fxLayout="column" fxLayout.gt-sm="row" fxLayoutGap="10px" style="padding: 10px;">
      <section class="mat-block" fxFlex>
          <mat-form-field fxFlex class="mat-block">
              <mat-label>Value Type</mat-label>
              <mat-select formControlName="valueinputType" (selectionChange)="refreshSecondInputTypes()">
                  <mat-option *ngIf="allModelProperties?.length" value="PROPERTY">Property</mat-option>
                  <mat-option *ngIf="!branchAvailability?.branchFound && allRuleInputs?.length" value="RULE_INPUT">Rule Input</mat-option>
                  <mat-option *ngIf="allConstants?.length" value="CONSTANT">Constant</mat-option>
                  <mat-option *ngIf="branchAvailability?.branchFound && branchAvailability?.branchParams?.length" value="BRANCH_PARAM">Branch Param</mat-option>
              </mat-select>
          </mat-form-field>
      </section>
      
      <section class="mat-block" fxFlex>

      <mat-form-field *ngIf="configuration.valueinputType === 'RULE_INPUT'" fxFlex class="mat-block">
          <mat-label>Rule Input</mat-label>
          <mat-select formControlName="valueparam">
              <mat-option *ngFor="let property of allRuleInputs" [value]="property">
                  {{property.inputName}}
              </mat-option>
          </mat-select>
      </mat-form-field>

      <mat-form-field *ngIf="configuration.valueinputType === 'CONSTANT'" fxFlex class="mat-block">
          <mat-label>Constant</mat-label>
          <mat-select formControlName="valueconstant">
              <mat-option *ngFor="let constant of allConstants" [value]="constant">
                  {{constant.constantName}}
              </mat-option>
          </mat-select>
      </mat-form-field>

      <mat-form-field *ngIf="configuration.valueinputType === 'PROPERTY'" fxFlex class="mat-block">
          <mat-label>Property</mat-label>
          <mat-select formControlName="valueproperty">
              <mat-option *ngFor="let property of allModelProperties" [value]="property">
                  {{property.name}}
              </mat-option>
          </mat-select>
      </mat-form-field>
      <mat-form-field *ngIf="configuration.valueinputType === 'BRANCH_PARAM'" fxFlex class="mat-block">
          <mat-label>Branch Param</mat-label>
          <mat-select formControlName="valuebranchparam">
              <mat-option *ngFor="let param of branchAvailability?.branchParams" [value]="param">
                  {{param.name}}
              </mat-option>
          </mat-select>
      </mat-form-field>

      <mat-tree [dataSource]="dataSourceVal" [treeControl]="treeControlVal">
          <mat-tree-node *matTreeNodeDef="let node" matTreeNodeToggle matTreeNodePadding>
              <button mat-icon-button disabled></button>
              <mat-checkbox class="checklist-leaf-node"
                            [checked]="checklistSelectionVal.isSelected(node)"
                            (change)="checkboxClickVal(node)">{{node.name}}</mat-checkbox>
          </mat-tree-node>
          <mat-tree-node *matTreeNodeDef="let node; when: hasChild" matTreeNodePadding>
              <button mat-icon-button matTreeNodeToggle
                      [attr.aria-label]="'toggle ' + node.name">
                  <mat-icon class="mat-icon-rtl-mirror">
                      {{treeControlVal.isExpanded(node) ? 'expand_more' : 'chevron_right'}}
                  </mat-icon>
              </button>
              <mat-checkbox [checked]="checklistSelectionVal.isSelected(node)"
                            (change)="checkboxClickVal(node)">{{node.name}}</mat-checkbox>
          </mat-tree-node>
      </mat-tree>
  </section>
  </section>
      `
    } else if (field.controlType === VirtuanControlType.PRC_TEMPLATE){
      return `<div fxFlex fxLayout="row" fxLayoutAlign="end center">
      <button mat-icon-button class="virtuan-fullscreen-button-style"
              (click)="addAssignment()"
              matTooltip="Add Assignment"
              matTooltipPosition="above">
          <mat-icon color="primary">add</mat-icon>
      </button>
  </div>`
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

  ngOnDestroy(): void {
    if (this.definedConfigComponentRef) {
      this.definedConfigComponentRef.destroy();
    }
  }
}
