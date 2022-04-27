import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { filter, map } from 'rxjs/operators';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';

import {ActivatedRoute, Router} from '@angular/router';
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
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import {ProjectService} from '@core/projectservices/project.service';
import {ApptypesService} from '@core/projectservices/apptypes.service';
import {DeleteOperationService} from '@core/projectservices/delete-operations.service';
import { WebsocketService } from '@core/tracker/websocket.service';
import { BreakpointTrackerService } from '@core/tracker/breakpoint.service';
import { ThemeTrackerService } from '@core/tracker/theme.service';
import { IProject, Project} from '@shared/models/model/project.model';
import { IGenerator } from '@shared/models/model/generator-chain.model';
import { EventManagerService } from '@shared/events/event.type';
import { EventTypes } from '@shared/events/event.queue';
import { Subscription } from 'rxjs';
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
import {CreateApiComponent} from '@home/pages/create-api/create-api.component';
import {CreateSubruleComponent} from '@home/pages/create-subrule/create-subrule.component';
import {MatDialog} from '@angular/material/dialog';
import {CreateModelComponent} from '@home/pages/create-model/create-model.component';
import {MicroserviceModelComponent} from "@home/pages/aggregate/microservice-model.component";
import {CreateEventComponent} from '@home/pages/create-event/create-event.component';
import {CreateHybridfunctionComponent} from '@home/pages/create-hybridfunction/create-hybridfunction.component';
import {CreateLamdafunctionComponent} from '@home/pages/create-lamdafunction/create-lamdafunction.component';
import {CreateTaskComponent} from '@home/pages/create-task/create-task.component';
import {AddOperationService} from '@core/projectservices/add-operations.service';

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
    selector: 'virtuan-main-rulechain-page',
    templateUrl: './main-rulechain.component.html',
    styleUrls: ['./rulechain-page.component.scss']
})
export class MainRuleChainComponent implements OnInit {


    ruleChain: RuleChain;
    ruleChainMetaData: ResolvedRuleChainMetaData;
    connectionPropertyTemplates: ConnectionPropertyTemplate[];
    username: string;
//     uid: string;
    ruleNodeComponents: Array<RuleNodeComponentDescriptor>;
    ruleChainLoaded: boolean;
    ruleChainMetaDataLoaded: boolean;
    ruleNodeComponentsLoaded: boolean;
    loadFunctionEditor: boolean;
    connectionPropertyTemplatesLoaded: boolean;
    loadModelView: boolean;
    projectUid: string;
    lambdauid: string;
    modelUid: string;
    eventSubscriber: Subscription;
    currentTab: string;
    isGenerating: boolean;
    theme: string = 'vs-dark';
    editorOptions: any = { theme: 'vs-dark', language: 'json' };
    code: string = '';
    generatorList: { [key: number]: string } = {};
    generatorChain: IGenerator[];

    private _transformer = (node: any, level: number) => {
        return {
            expandable: !!node.children && node.children.length > 0,
            name: node.name,
            data: node,
            level: level,
        };
    };

    treeControl = new FlatTreeControl<any>(
        node => node.level,
        node => node.expandable,
    );

    treeFlattener = new MatTreeFlattener(
        this._transformer,
        node => node.level,
        node => node.expandable,
        node => node.children,
    );

    hasChild = (_: number, node: any) => node.expandable;

    dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    constructor(private route: ActivatedRoute, private router: Router, private ruleChainService: RuleChainService,
    private projectService: ProjectService,private deleteOperationService: DeleteOperationService,private addOperationService:AddOperationService, public dialog: MatDialog,
    private eventManager: EventManagerService, private socket: WebsocketService, private breakpointService: BreakpointTrackerService, private themeService: ThemeTrackerService,
    protected appTypeService: ApptypesService) {

    }


//   viewRule(item){
// //   this.router.navigate(["/ruleChains"]);
//     console.log(item);
// //     let url = item.ruleid +'/default/' + item.username + '/' + this.projectUid +'/R';
//     let url = 'ruleChains/' + item.ruleid +'/default/' + item.username + '/' + this.projectUid +'/R';
// //     this.router.navigate([url], {relativeTo:this.route});
//     this.router.navigate([url]);
//   }
  registerChangeEditorTree() {
    this.eventSubscriber = this.eventManager
      .on(EventTypes.editorTreeListModification)
      .subscribe(event => this.loadTreeData());
  }

    delete(item){
      this.projectUid = item.projectuuid;
      this.deleteOperationService.delete(item, this.projectUid);
    }

    add(node){
        this.addOperationService.createPopups(node, node.projectUid, 'Create');
    }

    edit(item){
        this.projectUid = item.projectuuid;
        this.addOperationService.editPopups(item, this.projectUid, 'Update');
    }

    viewComponent(item){
        this.projectUid = item.projectuuid;
        if(item.type === 'MODEL'){
            // load model design editor
            this.viewModel(item);
        } else if(item.type === 'LAMBDA'){
            this.viewFuncEditor(item);
        } else {
            this.viewRule(item);
        }
    }

    viewFuncEditor(item){
        this.ruleChainLoaded = false;
        this.ruleChainMetaDataLoaded = false;
        this.connectionPropertyTemplatesLoaded = false;
        this.ruleNodeComponentsLoaded = false;
        this.ruleChain = null;
        this.ruleChainMetaData = null;
        this.connectionPropertyTemplates = null;
        this.ruleNodeComponents = null;
        this.lambdauid = "";
        this.lambdauid = item.uuid;
        this.loadFunctionEditor = true;
        this.loadModelView = false;
    }

    viewRule(item) {
        this.lambdauid = "";
        this.loadFunctionEditor = false;
        this.ruleChainLoaded = false;
        this.ruleChainMetaDataLoaded = false;
        this.connectionPropertyTemplatesLoaded = false;
        this.ruleNodeComponentsLoaded = false;
        this.loadModelView = false;

        this.username = item.username;
//         this.uid = this.projectUid;
        this.ruleChainService.getRuleChainWithUsernameAndUID(item.ruleid, item.username, this.projectUid).subscribe((ruleChain) => {
            console.log('ruleChain');
            console.log(ruleChain);
            this.ruleChainLoaded = true;
            this.ruleChain = ruleChain;
        });
        this.ruleChainService.getResolvedRuleChainMetadata(item.ruleid, item.username, this.projectUid).subscribe((ruleChainMetaData) => {
            this.ruleChainMetaDataLoaded = true;
            this.ruleChainMetaData = ruleChainMetaData;
        });

        this.ruleChainService.getConnectionPropertyTemplates().subscribe((connectionPropertyTemplates) => {
            this.connectionPropertyTemplatesLoaded = true;
            this.connectionPropertyTemplates = connectionPropertyTemplates;
        });
        this.ruleChainService.getRuleNodeComponents(ruleNodeConfigResourcesModulesMap, this.projectUid, 'default').subscribe((ruleNodeComponents) => {
            this.ruleNodeComponentsLoaded = true;
            this.ruleNodeComponents = ruleNodeComponents;
        });

    }
    viewModel(item){
        this.ruleChainLoaded = false;
        this.ruleChainMetaDataLoaded = false;
        this.connectionPropertyTemplatesLoaded = false;
        this.ruleNodeComponentsLoaded = false;
        this.ruleChain = null;
        this.ruleChainMetaData = null;
        this.connectionPropertyTemplates = null;
        this.ruleNodeComponents = null;
        this.lambdauid = "";
        this.loadFunctionEditor = false;
        this.modelUid = item.uuid;
        this.loadModelView = true;
    }

    ngOnInit(): void {
        this.currentTab = 'design'
        this.route.params.subscribe(params => {
            this.projectUid = params['projectUid'];
        });
        this.loadTreeData();
        this.registerChangeEditorTree();
        this.appTypeService.getDevChainByAppType(this.projectUid)
          .pipe(
            filter((mayBeOk: HttpResponse<IGenerator[]>) => mayBeOk.ok),
            map((response: HttpResponse<IGenerator[]>) => response.body)
          )
          .subscribe(
            (res: IGenerator[]) => {
              this.generatorChain = res;
              if (this.generatorChain.length !== 0) {
                this.generatorChain.forEach(c => {
                  this.generatorList[c.position] = c.generator.name;
                });
              }
            });
        this.loadChatbox(this.projectUid);
    }

    loadTreeData(){
        this.projectService.findAllProjectComponents().subscribe((comps) => {
            this.dataSource.data = comps;
        });
    }

  generateProject() {
    this.code = '';
    this.isGenerating = true;
    setTimeout(() => {
      this.isGenerating = false;
    }, 16000);
    //console.log(this.socket.socket);
    this.socket.logSocket();
    let genType = 'Dev';
    const projectUUID: string = this.projectUid;
    let project: Project = new Project();
    if (projectUUID) {
      let breakpoint = this.breakpointService.getBreakpoint();
      let defaultTheme = this.themeService.getDefaultTheme();
      this.projectService.generateFromProjectId(projectUUID, breakpoint, defaultTheme, genType, project, projectUUID).subscribe(
        (res: any) => {
            let project: IProject = res.body;
            this.socket.send('generator');
            this.onSaveSuccess();
            },
        (res: HttpErrorResponse) => this.onSaveError());
    }
  }

  protected onSaveSuccess() {
//     this.messageService.add({
//       severity: 'success',
//       summary: 'Generation Started',
//       detail: 'Generation process started successfully.',
//     });
    if(this.code != '') {
        this.code = this.code + ",\n";
    }
    this.code = this.code + '{"status": "Success", "detail": "Generation process started successfully"}';
//     this.code = this.code + '{"status": "Success", "detail": "Generation process started successfully"},' + "/n";
    setTimeout(() => {
      this.isGenerating = false;
    }, 10000);
  }

  protected onSaveError() {
//     this.messageService.add({
//       severity: 'error',
//       summary: 'Generation failed',
//       detail: 'Generation request failed.',
//     });
    if(this.code != '') {
        this.code = this.code + ",\n";
    }
    this.code = this.code + '{"status": "Error", "detail": "Generation request failed"}';
    this.isGenerating = false;
  }


  loadChatbox(uuid) {
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

          if (uuid === projectUUID) {
            if (status) {
              if (status.trim() === 'didnot') {
//                 if (this.generatorList[position] === 'Compiler') {
//                   this.messageService.add({
//                     severity: 'error',
//                     summary: 'Compilation Failed',
//                   });
//                 } else {
//                   this.messageService.add({
//                     severity: 'error',
//                     summary: 'Generation Failed at ' + this.generatorList[position],
//                   });
//                 }
                  if(this.code != '') {
                    this.code = this.code + ",\n";
                  }
                  this.code = this.code + '{"status": "Error", "detail": "Generation failed at "'+ this.generatorList[position] + '}';

              } else if (status.trim() === 'done') {
//                 if (this.generatorList[position] === 'Compiler') {
//                   this.messageService.add({
//                     severity: 'success',
//                     summary: 'Successfully Compiled',
//                   });
//                 } else {
//                   this.messageService.add({
//                     severity: 'success',
//                     summary: 'Generation is Successful at ' + this.generatorList[position],
//                   });
//                 }
                  if(this.code != '') {
                    this.code = this.code + ",\n";
                  }
                  this.code = this.code + '{"status": "Success", "detail": "Generation successful at "'+ this.generatorList[position] + '}';

                } else if (status.trim() === 'done') {
                  if(this.code != '') {
                    this.code = this.code + ",\n";
                  }
                  this.code = this.code + '{"status": "In progress", "detail": "Generation started at "'+ this.generatorList[position] + '}';
                }
            }
          }
        }
      }
    });
  }

}
