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
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {EventManagerService} from '@shared/events/event.type';
import {NgxSpinnerService} from 'ngx-spinner';
import {DesignAssets} from '@core/projectservices/design-assets.service';
import {
    IStoryModelRequest,
    IStoryProcessRequest,
    IStoryScreenRequest,
    StoryModelRequest,
    StoryProcessRequest
} from '@shared/models/model/design-assets.model';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {MatStepper} from '@angular/material/stepper';
import {Aggregate, IAggregate} from '@shared/models/model/aggregate.model';


@Component({
    selector: 'virtuan-story-model-design-view',
    templateUrl: './model-design-view.component.html',
})
export class ModelDesignViewComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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

    projectUid: string;
    storyuuid: string;
    serviceUuid: string;
    isSaving: boolean;


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
                private fb: FormBuilder,
                public dialogRef: MatDialogRef<ModelDesignViewComponent>,
                @Inject(MAT_DIALOG_DATA)  public data: any,
                protected eventManager: EventManagerService,
                private spinnerService: NgxSpinnerService,
                private designAssetsService: DesignAssets) {
        this.modelNodeConfigFormGroup = this.fb.group({
            createType: "",
            modelName: "",
            modelselection: null,
            isDto: false
        });
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
    }

    ngOnInit(): void {
        this.serviceUuid = this.data.serviceUuid;
        this.projectUid = this.data.projectUid;
        this.storyuuid =  this.data.storyUuid;
        this.isSaving =  false;
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
                    this.configuration.isDto = false;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.modelNodeConfigFormGroup.get('createType').valueChanges.subscribe(
                (configuration: any) => {
                    if(configuration === 'New') {
                        this.configuration.modeluuid = "";
                    } else if (configuration === 'Existing') {
                        this.configuration.modelName = "";
                        this.configuration.isDto = false;
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

            this.changeSubscription = this.modelNodeConfigFormGroup.get('isDto').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.isDto = configuration;
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
        let selectedAg = this.modelNodeConfigFormGroup.get(['modelselection']).value;
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

    changeValue(val){
        if (val === 'Existing'){
            this.loadAggregatesForService('');
        }
    }

    private createFromForm(): IStoryModelRequest {
        const selectedModel = this.modelNodeConfigFormGroup.get(['modelselection']).value;
        if (this.modelNodeConfigFormGroup.get(['createType']).value === 'Existing'){
            return {
                ...new StoryModelRequest(),
                storyUuid: this.storyuuid,
                createType: 'Existing',
                modeluuid: selectedModel.uuid,
                modelName: selectedModel.name
            };
        }else if (this.modelNodeConfigFormGroup.get(['createType']).value === 'New'){
            return {
                ...new StoryModelRequest(),
                storyUuid: this.storyuuid,
                createType: 'New',
                modeluuid: selectedModel.uuid,
                modelName: selectedModel.name,
                isDto: this.modelNodeConfigFormGroup.get(['isDto']).value,
                data: this.modeldata,
            };
        }
    }

    save() {
        this.isSaving = true;
        const storyModelRequest = this.createFromForm();
        if (storyModelRequest) {
            this.subscribeToSaveResponse(this.designAssetsService.modelUpdate(storyModelRequest, this.projectUid));
        } else {
            this.subscribeToSaveResponse(this.designAssetsService.modelUpdate(storyModelRequest, this.projectUid));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IStoryModelRequest>>) {
        result.subscribe(
            () => this.onSaveSuccess(),
            () => this.onSaveError()
        );
    }

    protected onSaveSuccess() {
        this.isSaving = false;
        this.eventManager.dispatch(
            new AppEvent(EventTypes.editorUITreeListModification, {
                name: 'editorUITreeListModification',
                content: 'Add an page navigation',
            })
        );
        this.dialogRef.close();
    }

    protected onSaveError() {// this.spinnerService.hide();
        this.isSaving = false;
    }

    goBack(stepper: MatStepper) {
        stepper.previous();
    }
    goForward(stepper: MatStepper) {
        if (stepper.selectedIndex === 0){
            // this.loadAIDes();
        }


        if (this.modelNodeConfigFormGroup.get(['createType']).value === 'Existing'){
            const selectedModel = this.modelNodeConfigFormGroup.get(['modelselection']).value;
            this.aggregateService
                .findDesignById(selectedModel.uuid,this.serviceUuid)
                .pipe(
                    filter((res: HttpResponse<TreeNode>) => res.ok),
                    map((res: HttpResponse<TreeNode>) => res.body)
                )
                .subscribe(
                    (res: TreeNode) => {
                        this.modeldata = [];
                        console.log(res)
                        this.modeldata.push(res);

                        this.expandAll();
                        stepper.next();
                    },
                    (res: HttpErrorResponse) => this.onError()
                );
        }else{
            this.checkNameAvailability();
            stepper.next();
        }
    }

    expandAll(){
        this.modeldata.forEach( node => {
            this.expandRecursive(node, true);
        } );
    }

    private expandRecursive(node:TreeNode, isExpand:boolean){
        node.expanded = isExpand;
    }

    saveModel(aggregate: IAggregate) {
        this.isSaving = true;

        if (aggregate.uuid) {
            // aggregate.status = this.currentAggregate.status;
            this.subscribeToModelSaveResponse(this.aggregateService.update(aggregate, this.projectUid));
        } else {
            this.subscribeToModelSaveResponse(this.aggregateService.create(aggregate, this.projectUid));
        }
    }

    private createModelFromForm(): IAggregate {
        let type = '';
        if (this.modelNodeConfigFormGroup.get(['createType']).value !== 'isDto') {
            type = 'MODEL';
        } else {
            type = 'DTO';
        }

        return {
            ...new Aggregate(),
            uuid: '',
            name: this.modelNodeConfigFormGroup.get(['modelName']).value,
            type,
            projectUuid: this.serviceUuid,
        };
    }

    protected subscribeToModelSaveResponse(result: Observable<HttpResponse<IAggregate>>) {
        result.subscribe(
            res => this.onModelSaveSuccess(res),
            () => this.onSaveError()
        );
    }

    protected onModelSaveSuccess(res) {
        this.modeldata = [];
        const createdAggregate: IAggregate = res.body;
        this.aggregateService
            .findDesignById(createdAggregate.uuid,this.serviceUuid)
            .pipe(
                filter((resp: HttpResponse<TreeNode>) => resp.ok),
                map((resp: HttpResponse<TreeNode>) => resp.body)
            )
            .subscribe(
                (resp: TreeNode) => {
                    this.isSaving = false;
                    this.eventManager.dispatch(
                        new AppEvent(EventTypes.editorTreeListModification, {
                            name: 'editorTreeListModification',
                            content: 'Add an Model',
                        })
                    );
                    this.eventManager.dispatch(
                        new AppEvent(EventTypes.editorUITreeListModification, {
                            name: 'editorUITreeListModification',
                            content: 'Add an Model',
                        })
                    );
                    this.modeldata = [];
                    console.log(res)
                    this.modeldata.push(res);

                    this.expandAll();
                },
                (resp: HttpErrorResponse) => this.onError()
            );
    }

    checkNameAvailability() {
        const aggregate = this.createModelFromForm();
        this.aggregateService
            .findNameAvailability(aggregate.name, this.projectUid)
            .pipe(
                filter((res: HttpResponse<any>) => res.ok),
                map((res: HttpResponse<any>) => res.body)
            )
            .subscribe(
                (res: any) => {
                    if (res.IsNameExist) {
                    } else {
                        this.saveModel(aggregate);
                    }
                },
                (res: HttpErrorResponse) => this.onError()
            );
    }
}
