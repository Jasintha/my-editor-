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
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { filter, map } from 'rxjs/operators';

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
import { TreeNode, MenuItem } from 'primeng/api';
import { StoryService } from '@core/projectservices/story-technical-view.service';
import { AggregateService } from '@core/projectservices/microservice-aggregate.service';
import {MicroserviceAddModelDialogComponent} from "@home/pages/aggregate/microservice-add-model-dialog.component";
import {MatDialog} from "@angular/material/dialog";


@Component({
  selector: 'virtuan-story-model-node-config',
  templateUrl: './model-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ModelNodeConfigComponent),
    multi: true
  }]
})
export class ModelNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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

  existingModels: any[];

  @Input()
  ruleNodeId: string;

  @Input()
  projectUid: string;

  @Input()
  storyuuid: string;

  @Input()
  serviceUuid: string;


  inputitems: any[];

  modeldata: TreeNode[];
  modelitems: MenuItem[];
  selectedModelNode: TreeNode;

  @Input() isNodeEdit: boolean;

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

  modelNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;


  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              protected storyService: StoryService,
              protected aggregateService: AggregateService,
              public dialog: MatDialog,
              private fb: FormBuilder) {
    this.modelNodeConfigFormGroup = this.fb.group({
      createType: "",
      modelName: "",
      modelselection: null
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


  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.modelNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.modelNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);

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

    let modeluuid = this.configuration.modeluuid;
//     if(modeluuid){
        this.loadAggregatesForService(modeluuid);
//     }

      //this.modelNodeConfigFormGroup.get('payload').patchValue(this.configuration.payload, {emitEvent: false});

      this.changeSubscription = this.modelNodeConfigFormGroup.get('modelselection').valueChanges.subscribe(
        (configuration: any) => {

            let model = configuration;
            if(this.isNodeEdit) {
                this.modeldata = [];
                this.modeldata.push(model.config);
            }
            this.configuration.modeluuid = model.uuid;
            this.configuration.modelName = "";
            this.configuration.createType = "";
            this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.modelNodeConfigFormGroup.get('createType').valueChanges.subscribe(
        (configuration: any) => {
          if(configuration === 'New') {
            this.configuration.modeluuid = "";
          } else if (configuration === 'Existing') {
            this.configuration.modelName = "";
          }
          this.configuration.createType = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.modelNodeConfigFormGroup.get('modelName').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.modelName = configuration;
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

    if (this.definedConfigComponent || this.modelNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {

      this.propagateChange(this.required ? null : configuration);
    }
  }


  loadAggregatesForService(storyModelUuid) {
    this.aggregateService
      .findByProjectUUId(this.serviceUuid, this.serviceUuid)
      .pipe(
        filter((res: HttpResponse<any[]>) => res.ok),
        map((res: HttpResponse<any[]>) => res.body)
      )
      .subscribe(
        (res: any[]) => {
          this.existingModels = [];
          this.inputitems = [];
          if (res) {
            this.existingModels = res;
            let findModel;
            for (let i = 0; i < this.existingModels.length; i++) {
              if (storyModelUuid && storyModelUuid === this.existingModels[i].uuid) {
                findModel = this.existingModels[i];
              }
              if (this.existingModels[i].type === 'MODEL') {
                const dropdownLabel = this.existingModels[i].name + ' : Model';
                this.inputitems.push({ label: dropdownLabel, value: this.existingModels[i] });
              } else if (this.existingModels[i].type === 'DTO') {
                const dropdownLabel = this.existingModels[i].name + ' : DTO';
                this.inputitems.push({ label: dropdownLabel, value: this.existingModels[i] });
              }
            }
            if (findModel && storyModelUuid) {
              this.modelNodeConfigFormGroup.patchValue({
                modelselection: findModel,
              });
              this.onModelChange();
            }
          }
        },
        (res: HttpErrorResponse) => this.onError()
      );
  }

  onModelChange() {
    let model = this.modelNodeConfigFormGroup.get(['modelselection']).value;
    if(this.isNodeEdit) {
        this.modeldata = [];
        this.modeldata.push(model.config);
    }
    this.configuration.modeluuid = model.uuid;
    this.updateModel(this.configuration);
  }

  deleteModelNode(event) {
    this.removeNode(this.modeldata);
  }

  editModelNode(node) {
    this.editModel(node);
  }

  modelcontextMenu(menuevent, contextMenu) {
    this.modelitems = [
      { label: 'Delete', icon: 'pi pi-trash', command: event => this.deleteModelNode(event) },
      { label: 'Edit', icon: 'pi pi-pencil', command: event => this.editModelNode(menuevent) },
    ];
    //     if (menuevent.node.data.type === 'property' && !menuevent.node.data.isNotPersist) {
    //       this.items.push({
    //         label: 'Configurations',
    //         icon: 'pi pi-info',
    //         command: event => this.addNodeConstraints(menuevent),
    //       });
    //     }
  }

  onModelNodeSelect(event) {
    let selectedNode: TreeNode = event.node;
    //     if (selectedNode.data.type === 'collection' || selectedNode.data.type === 'list') {
    //       this.addModel(event);
    //     }
    if (selectedNode.data.type === 'collection' || selectedNode.data.type === 'list') {
      this.addModel(event);
    } else if (selectedNode.data.type === 'ENTITY_DESIGN_INIT') {
      this.addModel(event);
    } else if (selectedNode.data.type === 'PROPERTY_DESIGN_INIT') {
      this.addModel(event);
    }
  }

  addToModelTreeNode(data) {
    let styleClass = 'fa fa-list';

    if (data.type === 'property') {
      styleClass = 'fa fa-check';
    } else if (data.type === 'collection') {
      styleClass = 'fa fa-cubes';
    } else if (data.type === 'entity') {
      styleClass = 'fa fa-object-group';
    } else if (data.type === 'property-group') {
      styleClass = 'fa fa-object-ungroup';
    }

    let node: TreeNode = {
      label: data.name,
      icon: styleClass,
      data: data,
      children: [],
    };

    return node;
  }


  editModel(event) {
    let selectedAg = this.modelNodeConfigFormGroup.get(['modelselection']).value;
    let currentName = event.node.data.name.replace(/\s/g, '');
    let currentNameLowercase = currentName.toLowerCase();
    let namelength: number = currentNameLowercase.length;
    let currentNodeType = event.node.data.type;
    const dialogRef = this.dialog.open(MicroserviceAddModelDialogComponent, {
      panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
      data: {
        edit: true,
        type: event.node.data.type,
        name: currentName,
        propertytype: event.node.data.propertytype,
        modelId: selectedAg.uuid,
        projectUid: this.serviceUuid
      }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      console.log(`Dialog result: `, result);
      if(result){
        let eventkey = event.node.key.slice(0, -namelength);
        let nameTrimmed = result.name.replace(/\s/g, '');
        let nameLowerCase = nameTrimmed.toLowerCase();
        let datakey = eventkey + '_' + nameLowerCase;
        let data = this.addToModelTreeNode(result);

        let styleClass = 'fa fa-list';

        if (result.type === 'property') {
          styleClass = 'fa fa-check';
        } else if (result.type === 'collection') {
          styleClass = 'fa fa-cubes';
        }
        event.node.icon = 'fa fa-cross';
        event.node.label = result.name;
        event.node.key = datakey;
        // event.node.styleClass = 'test';
        event.node.data = Object.assign(event.node.data, result);

        if ((currentNodeType === 'collection' || currentNodeType === 'list') && result.type === 'property') {
          event.node.children = [];
        }

        const aggregateData = { aggregateId: selectedAg.uuid, data: this.modeldata };
        this.aggregateService
          .saveModelDesign(aggregateData, this.serviceUuid)
          .pipe(
            filter((res: HttpResponse<any>) => res.ok),
            map((res: HttpResponse<any>) => res.body)
          )
          .subscribe(
            (res: any) => {},
            (res: HttpErrorResponse) => this.onError()
          );
        }
    });

  }

  addModel(event) {
    let selectedAg = this.modelNodeConfigFormGroup.get(['modelselection']).value;
    const dialogRef = this.dialog.open(MicroserviceAddModelDialogComponent, {
      panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
      data: {
        edit : false,
        modelId : selectedAg.uuid,
        projectUid : this.serviceUuid,
      }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      console.log(`Dialog result: `, result);
      if(result){
        const eventkey = event.node.key;
        const nameTrimmed = result.name.replace(/\s/g, '');
        const nameLowerCase = nameTrimmed.toLowerCase();
        // let titleName = this.titleCaseWord(nameLowerCase);
        const datakey = eventkey + '_' + nameLowerCase;
        const data = this.addToModelTreeNode(result);
        data.key = datakey;
        if (!event.node.children) {
          event.node.children = [];
        }
        event.node.children.push(data);
        const aggregateData = { aggregateId: selectedAg.uuid, data: this.modeldata };
        this.aggregateService
          .saveModelDesign(aggregateData, this.serviceUuid)
          .pipe(
            filter((res: HttpResponse<any>) => res.ok),
            map((res: HttpResponse<any>) => res.body)
          )
          .subscribe(
            (res: any) => {},
            (res: HttpErrorResponse) => this.onError()
          );
      }
    });
  }

  removeNode(nodes) {
    for (let i = 0; i < nodes.length; i++) {
      if (this.selectedModelNode === nodes[i]) {
        nodes.splice(i, 1);
        break;
      } else {
        if (nodes[i].children !== undefined) {
          this.removeNode(nodes[i].children);
        }
      }
    }
  }

  getGeneralKey(key, addition) {
    const nameTrimmed = addition.replace(/\s/g, '');
    const nameLowerCase = nameTrimmed.toLowerCase();
    return key + '_' + nameLowerCase;
  }

  addToTreeNode(data) {
    let styleClass = 'fa fa-list';
    let label = '';

    if (data.type === 'MODEL_DESIGN' && data.aggregateData.type === 'property') {
      styleClass = 'fa fa-check';
      label = data.aggregateData.name;
    } else if ((data.type === 'MODEL_DESIGN' && data.aggregateData.type === 'collection') || data.type === 'MODEL') {
      styleClass = 'fa fa-cubes';
      label = data.aggregateData.name;
    } else if (data.type === 'MODEL_DESIGN' && data.aggregateData.type === 'list') {
      styleClass = 'fa fa-list';
      label = data.aggregateData.name;
    }

    let node: TreeNode = {
      label: label,
      icon: styleClass,
      data: data,
      children: [],
    };

    return node;
  }

  protected onError() {
  }

}
