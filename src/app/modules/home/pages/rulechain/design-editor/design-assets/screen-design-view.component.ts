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
import { SelectItem } from 'primeng/api';
import { Observable } from 'rxjs';
import { PageComponent } from '@shared/components/page.component';
import { Store } from '@ngrx/store';
import { AppState } from '@core/core.state';
import {MatTableDataSource} from '@angular/material/table';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {StoryService} from '@core/projectservices/story-technical-view.service';
import {filter, map} from 'rxjs/operators';
import {IStoryActorRequest, IStoryScreenRequest, StoryActorRequest, StoryScreenRequest} from '@shared/models/model/design-assets.model';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EventManagerService} from '@shared/events/event.type';
import {NgxSpinnerService} from 'ngx-spinner';
import {DesignAssets} from '@core/projectservices/design-assets.service';
import {AggregateService} from '@core/projectservices/microservice-aggregate.service';

@Component({
    selector: 'virtuan-screen-design-view',
    templateUrl: './screen-design-view.component.html',
    styleUrls: ['./design-view.components.scss']

})
export class ScreenDesignViewComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

    @ViewChild('definedConfigContent', {read: ViewContainerRef, static: true}) definedConfigContainer: ViewContainerRef;

    private requiredValue: boolean;
    get required(): boolean {
        return this.requiredValue;
    }
    @Input()
    set required(value: boolean) {
        this.requiredValue = coerceBooleanProperty(value);
    }
    storyUuid: string

    @Input()
    disabled: boolean;

    @Input()
    allActors: any[];

    @Input()
    ruleNodeId: string;

    serviceUuid: string;

    nodeDefinitionValue: RuleNodeDefinition;

    isSaving: boolean;
    // data: any;
    projectUid: string;
    createType: string;
    pageTemplateItems: any[];
    existingPortals: any[];
    selectedPortal: any;
    selectedScreen: any;
    inputitems: any[];

    actionItems: any[] = [];

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

    screenNodeConfigFormGroup: FormGroup;

    changeSubscription: Subscription;

//   displayedColumns: string[] = ['actorName', 'permissionLevel', 'actions'];

    private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
    private definedConfigComponent: IRuleNodeConfigurationComponent;

    configuration: RuleNodeConfiguration;

    private propagateChange = (v: any) => { };

    constructor(private translate: TranslateService,
                private ruleChainService: RuleChainService,
                protected storyService: StoryService,
                private fb: FormBuilder,
                public dialogRef: MatDialogRef<ScreenDesignViewComponent>,
                protected aggregateService: AggregateService,
                @Inject(MAT_DIALOG_DATA)  public data: any,
                protected eventManager: EventManagerService,
                private spinnerService: NgxSpinnerService,
                private designAssetsService: DesignAssets) {
        this.screenNodeConfigFormGroup = this.fb.group({
            modelselection: null,
            screenName: '',
            screenTemplate: '',
            screeActions: []
        });
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
    }

    loadPortals() {
        this.storyService
            .findPortalsByProjectId(this.serviceUuid)
            .pipe(
                filter((res: HttpResponse<any[]>) => res.ok),
                map((res: HttpResponse<any[]>) => res.body)
            )
            .subscribe(
                (res: any[]) => {
                    if (res) {
                        this.existingPortals = res;
                    } else {
                        this.existingPortals = [];
                    }
                },
                (res: HttpErrorResponse) => this.onError()
            );
    }

    ngOnInit(): void {
        this.projectUid = this.data.projectUid;
        this.storyUuid = this.data.storyUuid
        this.serviceUuid = this.data.serviceUuid
        this.existingPortals = [];
        this.loadPortals();
        this.isSaving = false;
        this.getPageTemplates();
        this.loadAggregatesForService('');
        if (this.data.story.screenData){
            this.update();
        }
    }

    update(){
        const screenDate = this.data.story.screenData;
        this.loadAggregatesForService(screenDate.modeluuid);
        this.screenNodeConfigFormGroup.patchValue({
            screenName: screenDate.screenName,
            screenTemplate: screenDate.screenTemplate
        })
        this.onScreenTypeChanged();
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
                    let existingModels = [];
                    this.inputitems = [];
                    if (res) {
                        existingModels = res;
                        let findModel;
                        for (let i = 0; i < existingModels.length; i++) {
                            if (storyModelUuid && storyModelUuid === existingModels[i].uuid) {
                                findModel = existingModels[i];
                            }
                            if (existingModels[i].type === 'MODEL') {
                                const dropdownLabel = existingModels[i].name;
                                this.inputitems.push({ label: dropdownLabel, value: existingModels[i] });
                            } else if (existingModels[i].type === 'DTO') {
                                const dropdownLabel = existingModels[i].name;
                                this.inputitems.push({ label: dropdownLabel, value: existingModels[i] });
                            }
                        }
                        if (findModel && storyModelUuid) {
                            this.screenNodeConfigFormGroup.patchValue({
                                modelselection: findModel,
                            });
                            this.onModelChange();
                        }
                    }
                },
                (res: HttpErrorResponse) => this.onError()
            );
    }

    onScreenTypeChanged() {
        this.actionItems = [];
        const screenTemplate = this.screenNodeConfigFormGroup.get(['screenTemplate']).value;
        if(screenTemplate === 'table-page') {
            this.actionItems.push('on-load');
        } else if(screenTemplate === 'form-page') {
            this.actionItems.push('on-create');
        } else if(screenTemplate === 'aio-table' || screenTemplate === 'aio-grid') {
            this.actionItems.push('on-load');
            this.actionItems.push('on-create');
            this.actionItems.push('on-update');
            this.actionItems.push('on-delete');
        } else if(screenTemplate === 'login-page') {
            this.actionItems.push('on-create');
        }else if(screenTemplate === 'form-wizard-page') {
            this.actionItems.push('on-create');
        }else if(screenTemplate === 'register-page') {
            this.actionItems.push('on-create');
        }  else {
            this.actionItems.push('on-load');
        }
        this.screenNodeConfigFormGroup.patchValue({
            screeActions: this.actionItems,
        });
    }

    ngOnDestroy(): void {
        if (this.definedConfigComponentRef) {
            this.definedConfigComponentRef.destroy();
        }
    }

    ngAfterViewInit(): void {
    }

    protected onError() {
        //  this.logger.error(errorMessage);
    }

    getPageTemplates() {
        this.pageTemplateItems = [
            {label:'Login Page', value:'login-page'},
            {label:'Register Page', value:'register-page'},
            {label:'Table Page', value:'table-page'},
            {label:'Form Page', value:'form-page'},
            {label:'AIO Table', value:'aio-table'},
            {label:'Form Wizard Page', value:'form-wizard-page'},
            {label:'AIO Tile Page', value:'aio-grid'},
            {label:'Tile Page', value:'tile-page'},
            {label:'Tab Page', value:'tab-page'},
            {label:'Custom Page', value:'custom-page'},
            {label:'Static Page', value:'static-page'},
            {label:'Filter Page', value:'filter-page'}
        ];
        // this.pageTemplateItems.push('login-page' );
        // this.pageTemplateItems.push('register-page');
        // this.pageTemplateItems.push('table-page');
        // this.pageTemplateItems.push('form-page');
        // this.pageTemplateItems.push('aio-table');
        // this.pageTemplateItems.push('form-wizard-page');
        // this.pageTemplateItems.push('aio-grid');
        // this.pageTemplateItems.push('tab-page');
        // this.pageTemplateItems.push('filter-page');
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        if (this.disabled) {
            this.screenNodeConfigFormGroup.disable({emitEvent: false});
        } else {
            this.screenNodeConfigFormGroup.enable({emitEvent: false});
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
            this.screenNodeConfigFormGroup.patchValue({
                screenName: this.configuration.screenName,
                screenTemplate: this.configuration.screenTemplate,
                screeActions: this.configuration.screeActions,
            });
            this.onScreenTypeChanged();
        }
        this.changeSubscription = this.screenNodeConfigFormGroup.get('screenName').valueChanges.subscribe(
            (configuration: any) => {
                this.configuration.screenName = configuration;
                this.updateModel(this.configuration);
            }
        );
        this.changeSubscription = this.screenNodeConfigFormGroup.get('screenTemplate').valueChanges.subscribe(
            (configuration: any) => {
                this.configuration.screenTemplate = configuration;
                this.updateModel(this.configuration);
                this.onScreenTypeChanged();
            }
        );
        this.changeSubscription = this.screenNodeConfigFormGroup.get('screeActions').valueChanges.subscribe(
            (configuration: any) => {
                this.configuration.screeActions = configuration;
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

    private updateModel(configuration: RuleNodeConfiguration) {

        if (this.definedConfigComponent || this.screenNodeConfigFormGroup.valid) {
            this.propagateChange(configuration);
        } else {

            this.propagateChange(this.required ? null : configuration);
        }
    }

    onModelChange() {
        let model = this.screenNodeConfigFormGroup.get(['modelselection']).value;
        // this.configuration.modeluuid = model.uuid;
        // this.updateModel(this.configuration);
    }

    private createFromForm(): IStoryScreenRequest {
        let model = this.screenNodeConfigFormGroup.get(['modelselection']).value;
        return {
            ...new StoryScreenRequest(),
            storyUuid: this.storyUuid,
            screenTemplate: this.screenNodeConfigFormGroup.get(['screenTemplate']).value,
            screenName: this.screenNodeConfigFormGroup.get(['screenName']).value,
            screenActions: this.actionItems,
            modeluuid: model.uuid
        };
    }

    save() {
        this.isSaving = true;
        const storyScreenRequest = this.createFromForm();
        if (storyScreenRequest) {
            this.subscribeToSaveResponse(this.designAssetsService.screenUpdate(storyScreenRequest, this.projectUid));
        } else {
            this.subscribeToSaveResponse(this.designAssetsService.screenUpdate(storyScreenRequest, this.projectUid));
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
