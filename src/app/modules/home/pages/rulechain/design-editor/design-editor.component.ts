import { Component, OnInit, ViewEncapsulation, OnChanges, SimpleChanges, Input } from '@angular/core';
import {RequirementService} from '@core/projectservices/requirement.service';
import {StoryService} from '@core/projectservices/story-technical-view.service';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import { IRequirement, Requirement, IEpic, IStory } from '@shared/models/model/requirement.model';
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
    encapsulation: ViewEncapsulation.None
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
    toolTipPosition = 'left'

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

    public pieChartOptions: ChartOptions = {
        responsive: true,
    };
    public pieChartLabels: Label[] = [['CompletedEpic'], ['NewEpic']];
    public pieChartData: SingleDataSet = [];
    public pieChartType: ChartType = 'pie';
    public pieChartLegend = true;
    public pieChartPlugins = [];

    constructor( private requirementService: RequirementService, private storyService: StoryService, public dialog: MatDialog,
                 private ruleChainService: RuleChainService,protected eventManager: EventManagerService, private projectService: ProjectService,
                 private consoleLogService: ConsoleLogService) { }

    ngOnChanges(changes: SimpleChanges) {
        this.currentReq = this.reqArray[0];
        this.reqCount = this.reqArray.length;
        this.reloadView();
    }

    reloadView() {
        //  this.resetRuleEditorValues();
        this.existingEpics = [];
        this.filteredStories = [];
        this.showStoryBoard = false;
        this.selectedEpicId = "";
        this.selectedEpic = null;
        this.loadEpics();
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
            if(i === index){
                this.existingEpics[i].selected = true;
            } else {
                this.existingEpics[i].selected = false;
            }
        }
        this.loadStoriesForEpic(epic.uuid);
        this.showStoryBoard = true;

    }

    loadStoriesForEpic(epicuuid) {
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

    editDialog(reqId){
        const dialogRef = this.dialog.open(CreateRequirementComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: this.desprojectUid,
                uuid: reqId,
                createStatus: 'Update',
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
        });
    }

    editStory(reqId){
        const dialogRef = this.dialog.open(CreateStoryComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: this.desprojectUid,
                uuid: reqId,
                createStatus: 'Update',
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
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
            console.log(`Dialog result: ${result}`);
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
        this.consoleLogService.writeConsoleLog('story generated');
        const storyGen: IStoryGen = {
            storyUuid: story.uuid,
            projectUuid: story.projectUuid,
        };
        this.projectService.generateStoryUI(story.projectUuid, storyGen).subscribe((storyGenResult) => {
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

    handleProgress(val){
        if (val === '1'){
            this.progressValue = 30;
        }else if (val === '2'){
            this.progressValue = 60;
        } else if (val === '3'){
            this.progressValue = 100;
        }
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

}
