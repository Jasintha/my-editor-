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
import {Observable, Subscription} from 'rxjs';
import { RuleChainService } from '@core/http/rule-chain.service';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { TranslateService } from '@ngx-translate/core';
import { JsonObjectEditComponent } from '@shared/components/json-object-edit.component';
import { deepClone } from '@core/utils';
import {APIInput, APIInputType, APIParamType, IAPIInput, IWorkflowMapping} from '@shared/models/model/api-input.model';
import {IProject} from '@shared/models/model/project.model';
import {IApi} from '@shared/models/model/microservice-api.model';
import {IDatamodel} from '@shared/models/model/datamodel.model';
import {ICustomObject} from '@shared/models/model/custom-object.model';
import {IAggregate} from '@shared/models/model/aggregate.model';
import {IEvent} from '@shared/models/model/microservice-event.model';
import {IViewmodel} from '@shared/models/model/viewmodel.model';
import {ISubrule} from '@shared/models/model/subrule.model';
import {filter, map} from 'rxjs/operators';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {ICommand} from '@shared/models/model/command.model';
import {IQuery} from '@shared/models/model/query.model';
import { AggregateService } from '@core/projectservices/microservice-aggregate.service';
import {ProjectService} from '@core/projectservices/project.service';
import {IStoryProcessRequest, IStoryScreenRequest, StoryProcessRequest, StoryScreenRequest} from '@shared/models/model/design-assets.model';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EventManagerService} from '@shared/events/event.type';
import {NgxSpinnerService} from 'ngx-spinner';
import {DesignAssets} from '@core/projectservices/design-assets.service';
interface Item {
    value: any;
    label: string;
}
@Component({
    selector: 'virtuan-process-design-view',
    templateUrl: './process-design-view.component.html',
})
export class ProcessDesignViewComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
    allActors: any[];

    serviceUuid: string;

    @Input()
    ruleNodeId: string;

    nodeDefinitionValue: RuleNodeDefinition;

    crudItems: any[] = ['CREATE','UPDATE','DELETE','FIND','FINDALL', 'EMPTY'];

    apiMethod: any[] = ['POST','GET','PUT','DELETE'];

//   returnRecord: any[] = ['MULTIPLE', 'SINGLE'];

    returnRecord: Item[] = [
        { label: 'Single', value: 's' },
        { label: 'Multiple', value: 'm' }
    ];
    returnObject: any[];

    isSaving: boolean;
    project: IProject;
    currentApi: IApi;
    items: Item[];
    // returnItems: Item[];
    aggregates: IAggregate[];
    apiParams: APIInput[];
    aggregateItems: Item[];
    editType: string;
    apiStyle: string;
    projectUid: string;
    storyUuid: string

  fileinput: any = {
    id: '',
    paramType: APIParamType.BODY,
    inputType: APIInputType.FILE,
    inputName: 'file',
  };

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

    processNodeConfigFormGroup: FormGroup;

    changeSubscription: Subscription;

//   displayedColumns: string[] = ['actorName', 'permissionLevel', 'actions'];

    private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
    private definedConfigComponent: IRuleNodeConfigurationComponent;

    configuration: RuleNodeConfiguration;

    private propagateChange = (v: any) => { };

    constructor(private translate: TranslateService,
                private ruleChainService: RuleChainService,
                protected aggregateService: AggregateService,
                private fb: FormBuilder,
                public dialogRef: MatDialogRef<ProcessDesignViewComponent>,
                protected projectService: ProjectService,
                @Inject(MAT_DIALOG_DATA)  public data: any,
                protected eventManager: EventManagerService,
                private spinnerService: NgxSpinnerService,
                private designAssetsService: DesignAssets) {
        this.processNodeConfigFormGroup = this.fb.group({
            processName: ['', Validators.required],
            apiTemplate: '',
            apiMethod: '',
            returnObject: null,
            returnRecord: '',
            selectedAPIInputs:null

        });
    }

    protected onError(errorMessage: string) {
        // this.logger.error(errorMessage);
    }

    loadAggregates() {
        for (let i = 0; i < this.aggregates.length; i++) {
            if (this.aggregates[i].status === 'ENABLED' && this.aggregates[i].type === 'MODEL') {
                const dropdownLabel = this.aggregates[i].name + ' : Model';
                this.aggregateItems.push({ label: dropdownLabel, value: this.aggregates[i] });
                const input = {
                    id: this.aggregates[i].uuid,
                    paramType: APIParamType.BODY,
                    inputType: APIInputType.MODEL,
                    inputName: this.aggregates[i].name,
                };
                const returnObj = {
                    id: this.aggregates[i].uuid,
                    paramType: APIParamType.RETURN,
                    inputType: APIInputType.MODEL,
                    inputName: this.aggregates[i].name,
                };
                this.items.push({ label: dropdownLabel, value: input });
                this.returnObject.push({ label: dropdownLabel, value: returnObj });
            } else if (this.aggregates[i].status === 'ENABLED' && this.aggregates[i].type === 'DTO') {
                const dropdownLabel = this.aggregates[i].name + ' : DTO';
                this.aggregateItems.push({ label: dropdownLabel, value: this.aggregates[i] });
                const input = {
                    id: this.aggregates[i].uuid,
                    paramType: APIParamType.BODY,
                    inputType: APIInputType.DTO,
                    inputName: this.aggregates[i].name,
                };
                const returnObj = {
                    id: this.aggregates[i].uuid,
                    paramType: APIParamType.RETURN,
                    inputType: APIInputType.DTO,
                    inputName: this.aggregates[i].name,
                };
                this.items.push({ label: dropdownLabel, value: input });
                this.returnObject.push({ label: dropdownLabel, value: returnObj });
            }
        }
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
    }

    loadServiceAndUpdateForm(){
        if (this.serviceUuid) {
            this.projectService
                .findWithModelEventsAndSubrules(this.serviceUuid)
                .pipe(
                    filter((mayBeOk: HttpResponse<IProject>) => mayBeOk.ok),
                    map((response: HttpResponse<IProject>) => response.body)
                )
                .subscribe(
                    (res: IProject) => {
                        this.project = res;
                        this.aggregates = this.project.aggregates;
                        if (this.aggregates) {
                            this.loadAggregates();
                        }
                        let selectedAPIInputs = this.data.story.processApiData.apiInput;
                        if(this.items && this.data.story.processApiData.apiInput){
                            selectedAPIInputs = this.items.find(x => (x.value.id === this.data.story.processApiData.apiInput.id) && (x.value.inputName === this.data.story.processApiData.apiInput.inputName));
                            this.processNodeConfigFormGroup.patchValue({
                                selectedAPIInputs: selectedAPIInputs.value,
                            });
                        }
                        let returnObject = this.data.story.processApiData.returnObject;
                        if(returnObject && this.returnObject){
                            returnObject = this.returnObject.find(x => (x.value.id === this.data.story.processApiData.returnObject.id) && (x.value.inputType === this.data.story.processApiData.returnObject.inputType) && (x.value.inputName === this.data.story.processApiData.returnObject.inputName));
                            this.processNodeConfigFormGroup.patchValue({
                                returnObject: returnObject.value
                            });
                        }
                    },
                    (res: HttpErrorResponse) => this.onError(res.message)
                );
        }

    }

    ngOnInit(): void {
        this.projectUid =  this.data.projectUid;
        this.storyUuid =  this.data.storyUuid;
        this.serviceUuid = this.data.serviceUuid;
        this.isSaving = false;
        this.items = [];
        this.apiParams = [];
        this.aggregateItems = [];
        this.returnObject = [];
        this.addPrimitivesForReturnSelect();
        this.loadServiceAndUpdateForm();

        // if (this.serviceUuid) {
        //     this.aggregateService
        //         .findByProjectUUId(this.serviceUuid, this.serviceUuid)
        //         .pipe(
        //             filter((mayBeOk: HttpResponse<any[]>) => mayBeOk.ok),
        //             map((response: HttpResponse<any[]>) => response.body)
        //         )
        //         .subscribe(
        //             (res: any[]) => {
        //                 this.aggregates = res;
        //                 if (this.aggregates) {
        //                     this.loadAggregates();
        //                 }
        //             },
        //             (res: HttpErrorResponse) => this.onError(res.message)
        //         );
        // }

        if (this.data.story.processApiUUID[0]){
            this.update();
        }
    }

    update(){
        const processData = this.data.story.processApiData;
        this.processNodeConfigFormGroup.patchValue({
            processName: processData.processName,
            apiTemplate: processData.apiTemplate,
            apiMethod: processData.apiMethod,
            returnRecord: processData.returnRecord,
        })
    }

    addPrimitivesForReturnSelect() {
        const dropdownLabelText = 'TEXT';
        const stringReturnObj: APIInput = {
            id: '',
            paramType: APIParamType.RETURN,
            inputType: APIInputType.TEXT,
            inputName: '_s',
        };
        const dropdownLabelNumber = 'NUMBER';
        const intReturnObj: APIInput = {
            id: '',
            paramType: APIParamType.RETURN,
            inputType: APIInputType.NUMBER,
            inputName: '_i',
        };
        const dropdownLabelFloat = 'FLOAT';
        const floatReturnObj: APIInput = {
            id: '',
            paramType: APIParamType.RETURN,
            inputType: APIInputType.FLOAT,
            inputName: '_f',
        };
        const dropdownLabelBoolean = 'TRUE_OR_FALSE';
        const boolReturnObj: APIInput = {
            id: '',
            paramType: APIParamType.RETURN,
            inputType: APIInputType.TRUE_OR_FALSE,
            inputName: '_b',
        };
        const dropdownLabelDate = 'DATE';
        const dateReturnObj: APIInput = {
            id: '',
            paramType: APIParamType.RETURN,
            inputType: APIInputType.DATE,
            inputName: '_t',
        };

        const dropdownLabelFile = 'FILE';
        const fileReturnObj: APIInput = {
          id: '',
          paramType: APIParamType.RETURN,
          inputType: APIInputType.FILE,
          inputName: 'file',
        };

        if(!this.returnObject){
            this.returnObject = [];
        }
        this.returnObject.push({ label: dropdownLabelText, value: stringReturnObj });
        this.returnObject.push({ label: dropdownLabelNumber, value: intReturnObj });
        this.returnObject.push({ label: dropdownLabelFloat, value: floatReturnObj });
        this.returnObject.push({ label: dropdownLabelBoolean, value: boolReturnObj });
        this.returnObject.push({ label: dropdownLabelDate, value: dateReturnObj });
        this.returnObject.push({ label: dropdownLabelFile, value: fileReturnObj });
//
//     this.returnItems.push(stringReturnObj );
//     this.returnItems.push( intReturnObj );
//     this.returnItems.push(floatReturnObj);
//     this.returnItems.push( boolReturnObj );
//     this.returnItems.push(dateReturnObj );
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
            this.processNodeConfigFormGroup.disable({emitEvent: false});
        } else {
            this.processNodeConfigFormGroup.enable({emitEvent: false});
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
            this.processNodeConfigFormGroup.patchValue({
                processName: this.configuration.processName,
                apiTemplate: this.configuration.apiTemplate,
                apiMethod: this.configuration.apiMethod,
                returnObject: this.configuration.returnObject,
                returnRecord: this.configuration.returnRecord
            });
        }
        this.changeSubscription = this.processNodeConfigFormGroup.get('apiTemplate').valueChanges.subscribe(
            (configuration: any) => {
                this.configuration.apiTemplate = configuration;
                this.updateModel(this.configuration);
            }
        );
        this.changeSubscription = this.processNodeConfigFormGroup.get('processName').valueChanges.subscribe(
            (configuration: any) => {
                this.configuration.processName = configuration;
                this.updateModel(this.configuration);
            }
        );
        this.changeSubscription = this.processNodeConfigFormGroup.get('apiMethod').valueChanges.subscribe(
            (configuration: any) => {
                this.configuration.apiMethod = configuration;
                this.updateModel(this.configuration);
            }
        );
        this.changeSubscription = this.processNodeConfigFormGroup.get('returnObject').valueChanges.subscribe(
            (configuration: any) => {
                this.configuration.returnObject = configuration;
                this.updateModel(this.configuration);
            }
        );
        this.changeSubscription = this.processNodeConfigFormGroup.get('returnRecord').valueChanges.subscribe(
            (configuration: any) => {
                this.configuration.returnRecord = configuration;
                this.updateModel(this.configuration);
            }
        );
    }

    titleCaseWord(word: string) {
        if (!word) return word;
        return word[0].toUpperCase() + word.substr(1);
    }

    lowerCaseWord(word: string) {
        if (!word) return word;
        return word[0].toLowerCase() + word.substr(1);
    }
    onInputObjChange(){
        // this.configuration.apiInput = this.processNodeConfigFormGroup.get(['selectedAPIInputs']).value;
        // this.updateModel(this.configuration);
    }

    private updateModel(configuration: RuleNodeConfiguration) {

        if (this.definedConfigComponent || this.processNodeConfigFormGroup.valid) {
            this.propagateChange(configuration);
        } else {

            this.propagateChange(this.required ? null : configuration);
        }
    }

    private createFromForm(): IStoryProcessRequest {
        const val = this.processNodeConfigFormGroup.get(['selectedAPIInputs']).value;
        return {
            ...new StoryProcessRequest(),
            storyUuid: this.storyUuid,
            processName: this.processNodeConfigFormGroup.get('processName').value,
            apiTemplate: this.processNodeConfigFormGroup.get('apiTemplate').value,
            apiMethod: this.processNodeConfigFormGroup.get('apiMethod').value,
            returnRecord:this.processNodeConfigFormGroup.get('returnRecord').value,
            returnObject: this.processNodeConfigFormGroup.get('returnObject').value,
            apiInput: this.processNodeConfigFormGroup.get(['selectedAPIInputs']).value
        };
    }

    save() {
        this.isSaving = true;
        const storyProcessRequest = this.createFromForm();
        if (storyProcessRequest) {
            this.subscribeToSaveResponse(this.designAssetsService.processUpdate(storyProcessRequest, this.projectUid));
        } else {
            this.subscribeToSaveResponse(this.designAssetsService.processUpdate(storyProcessRequest, this.projectUid));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IStoryScreenRequest>>) {
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

}
