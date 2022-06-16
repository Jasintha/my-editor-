import { Component, OnInit, ViewEncapsulation, OnChanges, SimpleChanges, Input } from '@angular/core';
import {RequirementService} from '@core/projectservices/requirement.service';
import {StoryService} from '@core/projectservices/story-technical-view.service';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {IRequirement, Requirement, IEpic, IStory, IStatusChangeRequest} from '@shared/models/model/requirement.model';
import { IGenerator } from '@shared/models/model/generator-chain.model';
import {RequirementAddEpicDialogComponent} from '@home/pages/rulechain/design-editor/requirement-add-epic-dialog.component';
import {CreateStoryComponent} from '@home/pages/rulechain/design-editor/create-story.component';
import {MatDialog} from '@angular/material/dialog';
import {
    FcRuleEdge,
    FcRuleNode,
    FcRuleNodeType,
    getRuleNodeHelpLink,
    LinkLabel,
    RuleNode,
    RuleNodeComponentDescriptor,
    RuleNodeType,
    ruleNodeTypeDescriptors,
    ruleNodeTypesLibrary
} from '@shared/models/rule-node.models';
import {
    inputNodeComponent,
    NodeConnectionInfo,
    ResolvedRuleChainMetaData,
    RuleChain,
    ConnectionPropertyTemplate,
    RuleChainConnectionInfo,
    RuleChainImport,
    RuleChainMetaData,
    ruleChainNodeComponent
} from '@shared/models/rule-chain.models';
import {RuleChainService} from '@core/http/rule-chain.service';

import * as AngularCommon from '@angular/common';
import * as AngularForms from '@angular/forms';
import * as AngularCdkCoercion from '@angular/cdk/coercion';
import * as AngularCdkKeycodes from '@angular/cdk/keycodes';
import * as AngularMaterialChips from '@angular/material/chips';
import * as AngularMaterialAutocomplete from '@angular/material/autocomplete';
import * as AngularMaterialDialog from '@angular/material/dialog';
import * as NgrxStore from '@ngrx/store';
import * as TranslateCore from '@ngx-translate/core';
import * as VirtuanCore from '@core/public-api';
import {ItemBufferService} from '@core/public-api';
import * as VirtuanShared from '@shared/public-api';
import * as VirtuanHomeComponents from '@home/components/public-api';
import * as _moment from 'moment';
import * as AngularRouter from '@angular/router';
import * as AngularCore from '@angular/core';
import * as RxJs from 'rxjs';
import * as RxJsOperators from 'rxjs/operators';
import {EditEpicComponent} from '@home/pages/rulechain/design-editor/edit-epic/edit-epic.component';
import {ApiDeleteDialogComponent} from '@home/pages/create-api/api-delete-dialog.component';
import {DeleteDesignComponent} from '@home/pages/rulechain/design-editor/delete-design.component';
import {CreateRequirementComponent} from '@home/pages/rulechain/design-editor/create-requirement.component';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {EventManagerService} from '@shared/events/event.type';
import {ProjectService} from '@core/projectservices/project.service';
import {IStoryGen, StoryGen} from '@shared/models/model/story-gen.model';
import {ChartOptions, ChartType} from 'chart.js';
import {Label, SingleDataSet} from 'ng2-charts';
import {ConsoleLogService} from '@core/projectservices/console-logs.service';
import { WebsocketService } from '@core/tracker/websocket.service';
import {ApptypesService} from '@core/projectservices/apptypes.service';
import { CreateTextComponent } from '@home/pages/rulechain/design-editor/create-text.component';
import {trigger, style, animate, transition, state} from '@angular/animations';
import {ScreenNodeConfigComponent} from '@home/pages/rulechain/mediators/design/screen-node-config.component';
import {ActorDesignViewComponent} from '@home/pages/rulechain/design-editor/design-assets/actor.design-view.component';
import {ModelDesignViewComponent} from '@home/pages/rulechain/design-editor/design-assets/model-design-view.component';
import {ProcessDesignViewComponent} from '@home/pages/rulechain/design-editor/design-assets/process-design-view.component';
import {ScreenDesignViewComponent} from '@home/pages/rulechain/design-editor/design-assets/screen-design-view.component';
import {DesignWarningComponent} from '@home/pages/rulechain/design-editor/design-warning.component';

declare const SystemJS;

const ruleNodeConfigResourcesModulesMap = {
    '@angular/core': SystemJS.newModule(AngularCore),
    '@angular/common': SystemJS.newModule(AngularCommon),
    '@angular/forms': SystemJS.newModule(AngularForms),
    '@angular/router': SystemJS.newModule(AngularRouter),
    '@angular/cdk/keycodes': SystemJS.newModule(AngularCdkKeycodes),
    '@angular/cdk/coercion': SystemJS.newModule(AngularCdkCoercion),
    '@angular/material/chips': SystemJS.newModule(AngularMaterialChips),
    '@angular/material/autocomplete': SystemJS.newModule(AngularMaterialAutocomplete),
    '@angular/material/dialog': SystemJS.newModule(AngularMaterialDialog),
    '@ngrx/store': SystemJS.newModule(NgrxStore),
    rxjs: SystemJS.newModule(RxJs),
    'rxjs/operators': SystemJS.newModule(RxJsOperators),
    '@ngx-translate/core': SystemJS.newModule(TranslateCore),
    '@core/public-api': SystemJS.newModule(VirtuanCore),
    '@shared/public-api': SystemJS.newModule(VirtuanShared),
    '@home/components/public-api': SystemJS.newModule(VirtuanHomeComponents),
    moment: SystemJS.newModule(_moment)
};

@Component({
    selector: 'virtuan-design-editor-new',
    templateUrl: './design-editor.component.html',
    styleUrls: ['./design-editor.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger(
            'inOutAnimation',
            [
                transition(
                    ':enter',
                    [
                        style({ height: 0, opacity: 0 }),
                        animate('0.3s ease-out',
                            style({ height: 300, opacity: 1 }))
                    ]
                ),
                transition(
                    ':leave',
                    [
                        style({ height: 300, opacity: 1 }),
                        animate('0.3s ease-in',
                            style({ height: 0, opacity: 0 }))
                    ]
                )
            ]
        )
    ]
})
export class DesignEditorComponent implements OnInit, OnChanges {
    @Input()
    requirementUid: string;

    @Input()
    desprojectUid: string;

    @Input()
    username: string;

    @Input()
    reload: boolean;

    @Input()
    reqArray: IRequirement[];

    currentReq: IRequirement;
    toolTipPosition = 'left';
    progressRadio: string[] = ['New', 'In Progress', 'Complete'];

    existingEpics: any[];
    filteredStories: any[];
    showStoryBoard: boolean;
    selectedEpicId: string;
    selectedEpic: any;
    currentIndex = 0;
    ruleChain: RuleChain;
    ruleChainMetaData: ResolvedRuleChainMetaData;
    connectionPropertyTemplates: ConnectionPropertyTemplate[];
    ruleNodeComponents: Array<RuleNodeComponentDescriptor>;
    ruleChainLoaded: boolean;
    ruleChainMetaDataLoaded: boolean;
    ruleNodeComponentsLoaded: boolean;
    viewEditor: boolean;
    connectionPropertyTemplatesLoaded: boolean;
    storyserviceUuid: string;
    storyuuid: string;
    currentLevel = 'requirement'
    requirementLevel : boolean;
    epicLevel : boolean;
    storyLevel : boolean;
    progressValue: number;
    reqCount = 0;
    backendGeneratorList: { [key: number]: string } = {};
    uiGeneratorList: { [key: number]: string } = {};
    spinnerButton = false;
    hideCarouselNext = false;
    hideCarouselEpicNext = false;
    spinnerButtonEnable : boolean = true;

    ListData: any = [];
    isBtnNext = true;
    isBtnPrevious = false;
    PageNo = 0;
    PageSize = 10;
    reqCreatedAt:string;
    existingEpicOne: IEpic;

    storyImages = [
        {
            src : "/assets/images/story/actor-un.png",
            name : "actor"
        },
        {
            src : "/assets/images/story/model-un.png",
            name : "model"
        },
        {
            src : "/assets/images/story/screen-un.png",
            name : "screen"
        },
        {
            src : "/assets/images/story/gen-un.png",
            name : "generate"
        }
    ]

    public pieChartOptions: ChartOptions = {
        responsive: true,
    };
    public pieChartLabels: Label[] = [['Completed epic'], ['New epic']];
    public pieChartData: SingleDataSet = [];
    public pieChartType: ChartType = 'pie';
    public pieChartLegend = true;
    public pieChartPlugins = [];

    constructor( private requirementService: RequirementService, private storyService: StoryService, public dialog: MatDialog,
                 private ruleChainService: RuleChainService,protected eventManager: EventManagerService,
                 private projectService: ProjectService,
                 private consoleLogService: ConsoleLogService, private socket: WebsocketService,
                 protected appTypeService: ApptypesService) { }

    ngOnChanges(changes: SimpleChanges) {
        this.currentReq = this.reqArray[0];
        this.reqCount = this.reqArray.length;
        this.hideCarouselNext = this.reqCount < 2;
        if(this.existingEpics) {
            this.hideCarouselEpicNext = this.existingEpics.length < 5;
        }
        this.reloadView();
        this.loadReq();
        const date = this.currentReq.createdAt.split(' ')[0];
        const time = this.currentReq.createdAt.split(' ')[1].split('.')[0];
        this.reqCreatedAt = date + '   '+'  '+time
    }

    reloadView() {
        //  this.resetRuleEditorValues();
        this.existingEpics = [];
        this.filteredStories = [];
        this.showStoryBoard = false;
        this.selectedEpicId = "";
        this.selectedEpic = null;
        this.spinnerButtonEnable = true;
        this.loadEpics();
        this.appTypeService.getPreviewChainByAppType("ui")
            .pipe(
                filter((mayBeOk: HttpResponse<IGenerator[]>) => mayBeOk.ok),
                map((response: HttpResponse<IGenerator[]>) => response.body)
            )
            .subscribe(
                (res: IGenerator[]) => {
                    if (res && res.length !== 0) {
                        res.forEach(c => {
                            this.uiGeneratorList[c.position] = c.generator.name;
                        });
                        console.log(this.uiGeneratorList);
                    }
                });
        this.appTypeService.getPreviewChainByAppType("be")
            .pipe(
                filter((mayBeOk: HttpResponse<IGenerator[]>) => mayBeOk.ok),
                map((response: HttpResponse<IGenerator[]>) => response.body)
            )
            .subscribe(
                (res: IGenerator[]) => {
                    if (res && res.length !== 0) {
                        res.forEach(c => {
                            this.backendGeneratorList[c.position] = c.generator.name;
                        });
                        console.log(this.backendGeneratorList);
                    }
                });
    }

    loadReq(){
        this.requirementService
            .find(this.currentReq.uuid ,this.desprojectUid)
            .pipe(
                filter((mayBeOk: HttpResponse<IRequirement>) => mayBeOk.ok),
                map((response: HttpResponse<IRequirement>) => response.body)
            )
            .subscribe(
                (res: IRequirement) => {
                    this.currentReq = res;
                }
            );
    }

    loadEpics() {
        this.showStoryBoard = false;
        this.filteredStories = [];
        this.selectedEpicId = "";
        this.selectedEpic = null;
        this.resetRuleEditorValues();
        this.requirementService
            .findEpicsForReqByProjectId(this.currentReq.uuid, this.desprojectUid)
            .pipe(
                filter((res: HttpResponse<any[]>) => res.ok),
                map((res: HttpResponse<any[]>) => res.body)
            )
            .subscribe(
                (res: any[]) => {
                    if (res) {
                        this.existingEpics = res;
                        this.filterChart(res);
                        this.PageNo = 0;
                        this.getData();
//             for (let i = 0; i < this.existingEpics.length; i++) {
//               let epicitem = { label: this.existingEpics[i].name, value: this.existingEpics[i] };
//               this.epicitems.push(epicitem);
//             }
                    } else {
                        this.existingEpics = [];
                    }
                }
            );
    }
    clickReq(req) {
        this.currentLevel = 'requirement';
        this.epicLevel = false;
        this.storyLevel = false;
        this.currentReq = req;
        this.reloadView();
        this.loadReq();
    }

    filterEpic(epic, index){
        this.currentLevel = 'epic';
        this.requirementLevel = true
        this.selectedEpicId = epic.uuid;
        this.selectedEpic = epic;
        this.showStoryBoard = false;
        this.filteredStories = [];
        this.resetRuleEditorValues();
        for (let i = 0; i < this.existingEpics.length; i++) {
            if(this.existingEpics[i].uuid === epic.uuid){
                this.existingEpics[i].selected = true;
            } else {
                this.existingEpics[i].selected = false;
            }
        }
        this.loadStoriesForEpic(epic.uuid);
        this.showStoryBoard = true;

    }

    loadStoriesForEpic(epicuuid) {
        this.spinnerButtonEnable = true
        this.storyService
            .findStorieByEpic(this.desprojectUid, epicuuid)
            .pipe(
                filter((res: HttpResponse<any[]>) => res.ok),
                map((res: HttpResponse<any[]>) => res.body)
            )
            .subscribe(
                (res: any[]) => {
                    if (res) {
                        this.filteredStories = res;
//             for (let i = 0; i < this.existingEpics.length; i++) {
//               let epicitem = { label: this.existingEpics[i].name, value: this.existingEpics[i] };
//               this.epicitems.push(epicitem);
//             }
                    } else {
                        this.filteredStories = [];
                    }
                }
            );
    }

    assignRequirementToEpic(req: IRequirement) {
        const dialogRef = this.dialog.open(RequirementAddEpicDialogComponent, {
            width: '800px',
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: this.desprojectUid,
                reqdesc: req.description,
                requuid: req.uuid
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            this.loadEpics();
            this.eventManager.dispatch(
                new AppEvent(EventTypes.editorTreeListModification, {
                    name: 'editorTreeListModification',
                    content: 'Assign Epic',
                })
            );
        });
    }

    addStory(selectedEpic){
        if (selectedEpic){
            const dialogRef = this.dialog.open(CreateStoryComponent, {
                panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
                data: {
                    projectUid: this.desprojectUid,
                    epic: selectedEpic
                }
            });
            dialogRef.afterClosed(
            ).subscribe(result => {
                this.loadStoriesForEpic(selectedEpic.uuid);
            });
        }
    }

    addText(selectedEpic: any, storyuuid) {
        const dialogRef = this.dialog.open(CreateTextComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: this.desprojectUid,
                epic: selectedEpic,
                uuid: storyuuid
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            this.loadStoriesForEpic(selectedEpic.uuid);
        });

    }

    editEpics(epic){
        const dialogRef = this.dialog.open(RequirementAddEpicDialogComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: this.desprojectUid,
                createStatus: 'Update',
                epic
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
        });
    }

    editRequirement(requuid){
        const dialogRef = this.dialog.open(CreateRequirementComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: this.desprojectUid,
                createStatus: 'Update',
                uuid: requuid
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
        });
    }

    editStory(story){
        const dialogRef = this.dialog.open(CreateStoryComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: this.desprojectUid,
                story,
                createStatus: 'Update',
                epic: this.existingEpicOne
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            this.loadStoriesForEpic(this.existingEpicOne.uuid);
        });
    }

    editStoryText(story){
        const dialogRef = this.dialog.open(CreateTextComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: this.desprojectUid,
                story,
                createStatus: 'Update',
                epic: this.existingEpicOne
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            if (result){
                this.loadStoriesForEpic(this.existingEpicOne.uuid);
            }

        });
    }

    deleteRequirement(){
        const dialogRef = this.dialog.open(DeleteDesignComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: this.desprojectUid,
                type: 'requirement'
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }


    deleteDesign(reqId, type){
        const dialogRef = this.dialog.open(DeleteDesignComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: this.desprojectUid,
                uuid: reqId,
                type,
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            if (result.type === 'epic'){
                this.reloadView();
            }else if (result.type === 'story'){
                this.loadStoriesForEpic(this.existingEpicOne.uuid);
            }else if (result === 'story-text'){
                this.loadStoriesForEpic(this.existingEpicOne.uuid);
            }
        });
    }

    ngOnInit(): void {
        this.resetRuleEditorValues();
        this.existingEpics = [];
        this.filteredStories = [];
        this.selectedEpicId = '';
        this.selectedEpic = null;
        this.showStoryBoard = false;
        this.currentReq = this.reqArray[0];
        this.reqCount = this.reqArray.length

    }

    createRequirement() {
        const dialogRef = this.dialog.open(CreateRequirementComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: this.desprojectUid,
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }

    resetRuleEditorValues(){
        this.viewEditor = false;
        this.ruleChainLoaded = false;
        this.ruleChain = null;
        this.ruleChainMetaDataLoaded = false;
        this.ruleChainMetaData = null;
        this.connectionPropertyTemplatesLoaded = false;
        this.connectionPropertyTemplates = [];
        this.ruleNodeComponentsLoaded = false;
        this.ruleNodeComponents = null;
        this.storyserviceUuid = '';
        this.storyuuid = '';
    }

    loadStoryDesignEditor(story){
        this.epicLevel = true;
        this.currentLevel = 'story';
        this.existingEpics = [];
        this.filteredStories = [];
        this.selectedEpicId = '';
        this.selectedEpic = null;
        this.showStoryBoard = false;
        this.storyserviceUuid = story.serviceUUID;
        this.storyuuid = story.uuid;

        this.ruleChainService.getStoryRuleChainWithUsernameAndUID(story.ruleid, this.username, this.desprojectUid).subscribe((ruleChain) => {
            this.ruleChainLoaded = true;
            this.ruleChain = ruleChain;
        });
        this.ruleChainService.getResolvedStoryRuleChainMetadata(story.ruleid, this.username, this.desprojectUid).subscribe((ruleChainMetaData) => {
            this.ruleChainMetaDataLoaded = true;
            this.ruleChainMetaData = ruleChainMetaData;
        });

        this.ruleChainService.getConnectionPropertyTemplates().subscribe((connectionPropertyTemplates) => {
            this.connectionPropertyTemplatesLoaded = true;
            this.connectionPropertyTemplates = connectionPropertyTemplates;
        });
        this.ruleChainService.getRuleNodeComponents(ruleNodeConfigResourcesModulesMap, this.desprojectUid, 'design').subscribe((ruleNodeComponents) => {
            this.ruleNodeComponentsLoaded = true;
            this.ruleNodeComponents = ruleNodeComponents;
        });
        this.viewEditor = true;

    }

    generateStory(story: any) {
        this.spinnerButton = true

        setTimeout(()=>{
            this.spinnerButton = false
            this.spinnerButtonEnable = false
        }, 2500);

        const storyGen: IStoryGen = {
            storyUuid: story.uuid,
            projectUuid: story.projectUuid,
        };
        this.loadUIChatbox(story.portalUUID, "ui");
        this.loadBEChatbox(story.serviceUUID, "be");
        this.projectService.generateStoryUI(story.projectUuid, storyGen).subscribe((storyGenResult) => {
            this.consoleLogService.writeConsoleLog('story generated');
        });
    }

    createDesign(val , story){
        if (val === 'actor'){
            const dialogRef = this.dialog.open(ActorDesignViewComponent, {
                panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
                data: {
                    projectUid: this.desprojectUid,
                    storyUuid: story.uuid,
                    story
                }
            });
            dialogRef.afterClosed(
            ).subscribe(result => {
                this.loadStoriesForEpic(this.existingEpicOne.uuid);
            });
        }else if (val === 'model'){
            if (story.storyActors){
                const dialogRef = this.dialog.open(ModelDesignViewComponent, {
                    panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
                    data: {
                        projectUid: this.desprojectUid,
                        storyUuid: story.uuid,
                        serviceUuid: story.serviceUUID,
                        story
                    }
                });
                dialogRef.afterClosed(
                ).subscribe(result => {
                    this.loadStoriesForEpic(this.existingEpicOne.uuid);
                });
            }else {
                const dialogRef = this.dialog.open(DesignWarningComponent, {
                    panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
                    data: {
                        projectUid: this.desprojectUid,
                        storyUuid: story.uuid,
                        serviceUuid: story.serviceUUID,
                        story,
                        design: 'Actor'
                    }
                });
                dialogRef.afterClosed(
                ).subscribe(result => {
                    this.loadStoriesForEpic(this.existingEpicOne.uuid);
                });
            }
        }else if (val === 'process'){
            if (story.modelUUID){
                const dialogRef = this.dialog.open(ProcessDesignViewComponent, {
                    panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
                    data: {
                        projectUid: this.desprojectUid,
                        storyUuid: story.uuid,
                        serviceUuid: story.serviceUUID,
                        story
                    }
                });
                dialogRef.afterClosed(
                ).subscribe(result => {
                    this.loadStoriesForEpic(this.existingEpicOne.uuid);
                });
            }else {
                const dialogRef = this.dialog.open(DesignWarningComponent, {
                    panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
                    data: {
                        projectUid: this.desprojectUid,
                        storyUuid: story.uuid,
                        serviceUuid: story.serviceUUID,
                        story,
                        design: 'Model'
                    }
                });
                dialogRef.afterClosed(
                ).subscribe(result => {
                    this.loadStoriesForEpic(this.existingEpicOne.uuid);
                });
            }
        }else if (val === 'screen'){
            if (story.modelUUID){
                const dialogRef = this.dialog.open(ScreenDesignViewComponent, {
                    panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
                    data: {
                        projectUid: this.desprojectUid,
                        storyUuid: story.uuid,
                        serviceUuid: story.serviceUUID,
                        story
                    }
                });
                dialogRef.afterClosed(
                ).subscribe(result => {
                    this.loadStoriesForEpic(this.existingEpicOne.uuid);
                });
            }else {
                const dialogRef = this.dialog.open(DesignWarningComponent, {
                    panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
                    data: {
                        projectUid: this.desprojectUid,
                        storyUuid: story.uuid,
                        serviceUuid: story.serviceUUID,
                        story,
                        design: 'Model'
                    }
                });
                dialogRef.afterClosed(
                ).subscribe(result => {
                    this.loadStoriesForEpic(this.existingEpicOne.uuid);
                });
            }
        }

    }

    changeImage(src , type){
        this.storyImages.map(item =>{
            if (item.name === type){
                item.src =  "/assets/images/story/"+ src + ".png"
            }
        })
    }

    loadUIChatbox(uuid, apptype) {
        console.log("chat box load");
        console.log("uuid");
        console.log(uuid);
        console.log("apptype");
        console.log(apptype);
        this.socket.getEventListener().subscribe(event => {
            if (event.type === 'message') {
                let topic = event.data.topic;
                if (topic === 'generator') {
                    let data = event.data.content;

                    let projectUUID = '';
                    let status = '';
                    let time = '';
                    let position = -1;

                    let allKeyValuePairs = data.split(',');
                    if (allKeyValuePairs) {
                        allKeyValuePairs.forEach(keyval => {
                            let keyAndValArr = keyval.split('=', 2);
                            let key = '';
                            let val = '';

                            if (keyAndValArr) {
                                for (let i = 0; i < keyAndValArr.length; i++) {
                                    if (i === 0) {
                                        key = keyAndValArr[i];
                                    } else {
                                        val = keyAndValArr[i];
                                    }
                                }
                            }

                            if (key === 'projectuuid') {
                                projectUUID = val;
                            } else if (key === 'status') {
                                status = val;
                            } else if (key === 'time') {
                                time = val;
                            } else if (key === 'position') {
                                position = +val;
                            }
                        });
                    }
                    console.log("gen msg projectUUID");
                    console.log(projectUUID);

                    if (uuid === projectUUID) {
                        if (status) {
                            console.log("inside socket apptype");
                            console.log(apptype);
                            if (status.trim() === 'didnot') {
                                let code = '{"status": "Error", "detail": "Generation failed at ' + this.uiGeneratorList[position] + '"}';
                                this.consoleLogService.writeConsoleLog(code);

                            } else if (status.trim() === 'done') {
                                console.log("position");
                                console.log(position);
                                console.log(this.uiGeneratorList[position]);
                                let code = '{"status": "Success", "detail": "Generation successful at ' + this.uiGeneratorList[position] + '"}';
                                this.consoleLogService.writeConsoleLog(code);

                            } else if (status.trim() === 'done') {
                                let code = '{"status": "In progress", "detail": "Generation started at ' + this.uiGeneratorList[position] + '"}';
                                this.consoleLogService.writeConsoleLog(code);
                            }
                        }
                    }
                }
            }
        });
    }

    loadBEChatbox(uuid, apptype) {
        console.log("chat box load");
        console.log("uuid");
        console.log(uuid);
        console.log("apptype");
        console.log(apptype);
        this.socket.getEventListener().subscribe(event => {
            if (event.type === 'message') {
                let topic = event.data.topic;
                if (topic === 'generator') {
                    let data = event.data.content;

                    let projectUUID = '';
                    let status = '';
                    let time = '';
                    let position = -1;

                    let allKeyValuePairs = data.split(',');
                    if (allKeyValuePairs) {
                        allKeyValuePairs.forEach(keyval => {
                            let keyAndValArr = keyval.split('=', 2);
                            let key = '';
                            let val = '';

                            if (keyAndValArr) {
                                for (let i = 0; i < keyAndValArr.length; i++) {
                                    if (i === 0) {
                                        key = keyAndValArr[i];
                                    } else {
                                        val = keyAndValArr[i];
                                    }
                                }
                            }

                            if (key === 'projectuuid') {
                                projectUUID = val;
                            } else if (key === 'status') {
                                status = val;
                            } else if (key === 'time') {
                                time = val;
                            } else if (key === 'position') {
                                position = +val;
                            }
                        });
                    }
                    console.log("gen msg projectUUID");
                    console.log(projectUUID);

                    if (uuid === projectUUID) {
                        if (status) {
                            console.log("inside socket apptype");
                            console.log(apptype);
                            if (status.trim() === 'didnot') {
                                let code = '{"status": "Error", "detail": "Generation failed at ' + this.backendGeneratorList[position] + '"}';
                                this.consoleLogService.writeConsoleLog(code);
                            } else if (status.trim() === 'done') {
                                console.log("position");
                                console.log(position);
                                console.log(this.backendGeneratorList[position]);
                                let code = '{"status": "Success", "detail": "Generation successful at ' + this.backendGeneratorList[position] + '"}';
                                this.consoleLogService.writeConsoleLog(code);

                            } else if (status.trim() === 'done') {
                                let code = '{"status": "In progress", "detail": "Generation started at ' + this.backendGeneratorList[position] + '"}';
                                this.consoleLogService.writeConsoleLog(code);

                            }
                        }
                    }
                }
            }
        });
    }

    backDesignEditor(){
        // this.currentLevel = 'story';
        // this.existingEpics = [];
        // this.filteredStories = [];
        // this.selectedEpicId = '';
        // this.selectedEpic = null;
        // this.showStoryBoard = false;
        // this.storyserviceUuid = story.serviceUUID;
        // this.storyuuid = story.uuid;

        this.ruleChainLoaded = false;
        this.ruleChainMetaDataLoaded = false;
        this.connectionPropertyTemplatesLoaded = false;
        this.ruleNodeComponentsLoaded = false;
        this.viewEditor = false;

        this.loadEpics();

    }

    handleProgress(val , id){
        const status = {
            uuid: id,
            status: val
        }
        this.storyService
            .changeprogressStatus(status, this.desprojectUid)
            .pipe(
                filter((res: HttpResponse<IStatusChangeRequest>) => res.ok),
                map((res: HttpResponse<IStatusChangeRequest>) => res.body)
            )
            .subscribe(
                (res: IStatusChangeRequest) => {
                    if (res){
                        this.loadStoriesForEpic(this.selectedEpic.uuid);
                    }
                }
            );
    }

    filterChart(res){
        this.pieChartData = []
        let newCount = 0
        let completeCount = 0
        res.filter((item) => {
            if (item.status === 'NEW'){
                newCount ++;
            }else if (item.status === 'Completed'){
                completeCount ++;
            }
        })
        this.pieChartData.push(completeCount , newCount)
    }


    openNewTab() {
        const ip = window.location.origin;
        const endpoint = '/sp/api/swagger/index.html';
        const url =  ip +  endpoint;
        window.open(url);
    }
    OpenUI(){
        const ip = window.location.origin;
        const endpoint = '/uip/#/';
        const url =  ip +  endpoint;
        window.open(url);
    }

    selectedReq(val){
        const req = this.reqArray[val.page];
        this.clickReq(req);
        const date = req.createdAt.split(' ')[0];
        const time = req.createdAt.split(' ')[1].split('.')[0];
        this.reqCreatedAt = date + '   '+'  '+ time
    }

    // getData(isNext = true) {
    //     if (isNext)
    //         this.PageNo = this.PageNo + 1;
    //     else
    //         this.PageNo = this.PageNo - 1;
    //
    //     if (this.PageNo > 0) {
    //         var offset = (this.PageNo - 1) * this.PageSize;
    //         var data = this.existingEpics.slice(offset).slice(0, this.PageSize);
    //         if (data && data.length > 0) {
    //             this.ListData = data;
    //             this.isBtnNext = true;
    //             this.isBtnPrevious = true;
    //         }
    //         else {
    //             if (isNext) {
    //                 this.isBtnNext = false;
    //                 this.isBtnPrevious = true;
    //             }
    //             else {
    //                 this.isBtnNext = true;
    //                 this.isBtnPrevious = false;
    //             }
    //         }
    //     }
    //     else {
    //         this.isBtnNext = true;
    //         this.isBtnPrevious = false;
    //     }
    //
    //
    // }

    // setState(item: any) {
    //     this.ListData = this.ListData.map((p: any) => {
    //         p.isActive = item.uuid === p.uuid ? true : false;
    //         return p;
    //     })
    //     this.existingEpicOne = item;
    //     this.filterEpic(item,1)
    // }

    getData(isNext = true) {
        if (isNext)
            this.PageNo = this.PageNo + 1;
        else
            this.PageNo = this.PageNo - 1;

        if (this.PageNo > 0) {
            var offset = (this.PageNo - 1) * this.PageSize;
            var data = this.existingEpics.slice(offset).slice(0, this.PageSize);
            if (data && data.length > 0) {
                this.ListData = data;
                this.isBtnNext = true;
                this.isBtnPrevious = true;
            }
            else {
                if (isNext) {
                    this.isBtnNext = false;
                    this.isBtnPrevious = true;
                }
                else {
                    this.isBtnNext = true;
                    this.isBtnPrevious = false;
                }
            }
        }
        else {
            this.isBtnNext = true;
            this.isBtnPrevious = false;
        }

    }

    setState(item: any) {

        if (!item.isActive) {
            var $this = this;
            this.ListData = this.ListData.map((p: any) => {
                if (item.uuid === p.uuid) {
                    $this.open(p);
                }
                else {
                    $this.close(p);
                }
                return p;
            })
            this.existingEpicOne = item;
            this.filterEpic(item,1)
        }
    }

    open(p: any) {
        var width = 0;
        var div: any = document.getElementById('flexParent' + p.uuid);
        var interval = setInterval(function () {
            width = width + 5;
            div.style.width = width + '%';
            if (width === 60) {
                clearInterval(interval);
                p.isActive = true;
            }
        }, 30);
    }
    close(p: any) {
        if (p.isActive) {
            p.isActive = false;
            var div: any = document.getElementById('flexParent' + p.uuid);
            var width = Number(div.style.width.split('%')[0]);
            var interval = setInterval(function () {
                width = width - 5;
                div.style.width = width === 0 ? 'auto' : width + '%';
                if (width === 0) {
                    clearInterval(interval);
                }
            }, 30);
        }
        else {
            p.isActive = false;
        }

    }

}
