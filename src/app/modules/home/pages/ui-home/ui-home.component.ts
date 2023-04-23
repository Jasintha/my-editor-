import {
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewEncapsulation,
} from "@angular/core";
import { filter, map } from "rxjs/operators";
import { FlatTreeControl } from "@angular/cdk/tree";
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from "@angular/material/tree";
import { ActivatedRoute, Router } from "@angular/router";
import {
  inputNodeComponent,
  NodeConnectionInfo,
  ResolvedRuleChainMetaData,
  RuleChain,
  ConnectionPropertyTemplate,
  RuleChainConnectionInfo,
  RuleChainImport,
  RuleChainMetaData,
  ruleChainNodeComponent,
} from "@shared/models/rule-chain.models";
import { RuleChainService } from "@core/http/rule-chain.service";
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
  ruleNodeTypesLibrary,
} from "@shared/models/rule-node.models";
import { HttpResponse, HttpErrorResponse } from "@angular/common/http";
import { ProjectService } from "@core/projectservices/project.service";
import { RequirementService } from "@core/projectservices/requirement.service";
import { ApptypesService } from "@core/projectservices/apptypes.service";
import { DeleteOperationService } from "@core/projectservices/delete-operations.service";
import { WebsocketService } from "@core/tracker/websocket.service";
import { BreakpointTrackerService } from "@core/tracker/breakpoint.service";
import { ThemeTrackerService } from "@core/tracker/theme.service";
import { IProject, Project } from "@shared/models/model/project.model";
import { IGenerator } from "@shared/models/model/generator-chain.model";
import { EventManagerService } from "@shared/events/event.type";
import { EventTypes } from "@shared/events/event.queue";
import { Location } from "@angular/common";
import { Subscription } from "rxjs";
import * as AngularCommon from "@angular/common";
import * as AngularForms from "@angular/forms";
import * as AngularCdkCoercion from "@angular/cdk/coercion";
import * as AngularCdkKeycodes from "@angular/cdk/keycodes";
import * as AngularMaterialChips from "@angular/material/chips";
import * as AngularMaterialAutocomplete from "@angular/material/autocomplete";
import * as AngularMaterialDialog from "@angular/material/dialog";
import * as NgrxStore from "@ngrx/store";
import * as TranslateCore from "@ngx-translate/core";
import * as VirtuanCore from "@core/public-api";
import { ItemBufferService } from "@core/public-api";
import * as VirtuanShared from "@shared/public-api";
import * as VirtuanHomeComponents from "@home/components/public-api";
import * as _moment from "moment";
import * as AngularRouter from "@angular/router";
import * as AngularCore from "@angular/core";
import * as RxJs from "rxjs";
import * as RxJsOperators from "rxjs/operators";
import { CreateApiComponent } from "@home/pages/create-api/create-api.component";
import { CreateSubruleComponent } from "@home/pages/create-subrule/create-subrule.component";
import { MatDialog } from "@angular/material/dialog";
import { CreateModelComponent } from "@home/pages/create-model/create-model.component";
import { MicroserviceModelComponent } from "@home/pages/aggregate/microservice-model.component";
import { CreateEventComponent } from "@home/pages/create-event/create-event.component";
import { CreateHybridfunctionComponent } from "@home/pages/create-hybridfunction/create-hybridfunction.component";
import { CreateLamdafunctionComponent } from "@home/pages/create-lamdafunction/create-lamdafunction.component";
import { CreateTaskComponent } from "@home/pages/create-task/create-task.component";
import { ImportModelComponent } from "@home/pages/create-model/import-model.component";
import { AddOperationService } from "@core/projectservices/add-operations.service";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { EnvSelectComponent } from "@home/pages/rulechain/env-select.component";
import { ConsoleLogService } from "@core/projectservices/console-logs.service";
import { AggregateService } from "@core/projectservices/microservice-aggregate.service";
import { LoginService } from "@core/services/login.services";
import { node } from "prop-types";

declare const SystemJS;

const ruleNodeConfigResourcesModulesMap = {
  "@angular/core": SystemJS.newModule(AngularCore),
  "@angular/common": SystemJS.newModule(AngularCommon),
  "@angular/forms": SystemJS.newModule(AngularForms),
  "@angular/router": SystemJS.newModule(AngularRouter),
  "@angular/cdk/keycodes": SystemJS.newModule(AngularCdkKeycodes),
  "@angular/cdk/coercion": SystemJS.newModule(AngularCdkCoercion),
  "@angular/material/chips": SystemJS.newModule(AngularMaterialChips),
  "@angular/material/autocomplete": SystemJS.newModule(
    AngularMaterialAutocomplete
  ),
  "@angular/material/dialog": SystemJS.newModule(AngularMaterialDialog),
  "@ngrx/store": SystemJS.newModule(NgrxStore),
  rxjs: SystemJS.newModule(RxJs),
  "rxjs/operators": SystemJS.newModule(RxJsOperators),
  "@ngx-translate/core": SystemJS.newModule(TranslateCore),
  "@core/public-api": SystemJS.newModule(VirtuanCore),
  "@shared/public-api": SystemJS.newModule(VirtuanShared),
  "@home/components/public-api": SystemJS.newModule(VirtuanHomeComponents),
  moment: SystemJS.newModule(_moment),
};

@Component({
  selector: "virtuan-ui-home",
  templateUrl: "./ui-home.component.html",
  styleUrls: [
    "./ui-home.component.scss",
    "../rulechain/rulechain-page.component.scss",
  ],
})
export class UiHomeComponent implements OnInit, OnChanges {
  ruleChain: RuleChain;
  ruleChainMetaData: ResolvedRuleChainMetaData;
  connectionPropertyTemplates: ConnectionPropertyTemplate[];
  username: string;
  pageId: string;
  widgetId: string;
  //     uid: string;
  ruleNodeComponents: Array<RuleNodeComponentDescriptor>;
  ruleChainLoaded: boolean;
  ruleChainMetaDataLoaded: boolean;
  ruleNodeComponentsLoaded: boolean;
  loadFunctionEditor: boolean;
  loadUIHome: boolean;
  loadServiceHome: boolean;
  loadDesignRequirement: boolean;
  connectionPropertyTemplatesLoaded: boolean;
  loadModelView: boolean;
  projectUid: string;
  ruleprojectUid: string;
  editorType: string;
  requirementUid: string;
  requirementCount: number;
  requirementArray: any[];
  currentReqIndex: number;
  desprojectUid: string;
  lambdauid: string;
  modelUid: string;
  consoleEventSubscriber: Subscription;
  eventSubscriber: Subscription;
  eventSubscriberUi: Subscription;
  currentTab: string;
  activeNode: any;
  loadPageEditor: boolean;
  loadWidgetEditor: boolean;
  loadGridPageEditor: boolean;
  loadCustomPageEditor: boolean;
  loadFilterPageEditor: boolean;
  routeEnable: boolean;
  isGenerating: boolean;
  reload: boolean;
  theme: string = "vs-dark";
  editorOptions: any = {
    language: "json",
    readOnly: true,
    renderLineHighlight: "none",
  };
  code: string = "";
  fEBuildStatus: string = "";
  bEBuildStatus: string = "";
  fEGenStatus: string = "";
  bEGenStatus: string = "";
  generatorList: { [key: number]: string } = {};
  generatorChain: IGenerator[];
  selectedTab = 0;
  splitPartOneSize = 90;
  splitPartTwoSize = 10;
  splitConsoleSizeOne = 90;
  splitConsoleSizeTwo = 5;
  loadTabPageEditor: boolean;
  loadThemeEditor: boolean;
  loadBuildWindow: boolean;
  private _transformer = (node: any, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      data: node,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<any>(
    (node) => node.level,
    (node) => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children
  );

  hasChild = (_: number, node: any) => node.expandable;

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  designdataSource = new MatTreeFlatDataSource(
    this.treeControl,
    this.treeFlattener
  );
  uiTreeDaSource = new MatTreeFlatDataSource(
    this.treeControl,
    this.treeFlattener
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ruleChainService: RuleChainService,
    private requirementService: RequirementService,
    private projectService: ProjectService,
    private deleteOperationService: DeleteOperationService,
    private addOperationService: AddOperationService,
    public dialog: MatDialog,
    private eventManager: EventManagerService,
    private socket: WebsocketService,
    private breakpointService: BreakpointTrackerService,
    private themeService: ThemeTrackerService,
    protected appTypeService: ApptypesService,
    protected aggregateService: AggregateService,
    private consoleLogService: ConsoleLogService,
    private loginService: LoginService,
    private location: Location
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    // this.requirementUid =
    //     this.requirementCount =
  }

  movetoNextReq(nextUUID) {
    this.requirementUid = nextUUID;
  }

  selectActiveNode(node) {
    this.activeNode = node;
    this.projectUid = this.activeNode.data.projectuuid;
    this.viewComponent(node.data);
  }

  refreshTree() {
    this.loadTreeData();
    this.loadUITreeData();
    //  this.loadDesignTreeData();
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
      .subscribe((event) => this.loadTreeData());
  }

  registerChangeUIEditor() {
    this.eventSubscriberUi = this.eventManager
      .on(EventTypes.editorUITreeListModification)
      .subscribe((event) => this.loadUITreeData());
  }

  registerChangeDesignEditor() {
    this.eventSubscriberUi = this.eventManager
      .on(EventTypes.editorDesignTreeListModification)
      .subscribe((event) => this.loadDesignTreeData());
  }

  onEditMultiWidgetPage() {
    this.eventSubscriber = this.eventManager
      .on(EventTypes.editMultiWidgetPage)
      .subscribe((event) => this.viewPageEditor(event.payload));
  }

  // showWidgetEditor(event) {
  //     this.viewSingleWidget(event.payload);
  // }

  // onEditCustomPage() {
  //     this.eventSubscriber = this.eventManager
  //         .on(EventTypes.editCustomPage)
  //         .subscribe(event => this.showWidgetEditor(event));
  // }

  delete(item) {
    this.projectUid = item.projectuuid;
    this.deleteOperationService.delete(item, this.projectUid);
  }

  add(node) {
    this.addOperationService.createPopups(node, node.projectuuid, "Create");
  }

  importModel(node) {
    const dialogRef = this.dialog.open(ImportModelComponent, {
      panelClass: ["virtuan-dialog", "virtuan-fullscreen-dialog"],
      data: {
        projectUid: node.projectuuid,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  edit(item) {
    this.projectUid = item.projectuuid;
    this.addOperationService.editPopups(item, this.projectUid, "Update");
  }

  public tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.selectedTab = tabChangeEvent.index;
  }

  viewComponent(item) {
    this.projectUid = item.projectuuid;
    if (item.type === "MODEL") {
      // load model design editor
      this.viewModel(item);
    } else if (item.type === "LAMBDA") {
      this.viewFuncEditor(item);
    } else if (item.type === "REQUIREMENT") {
      this.viewReqEditor(item);
    } else if (item.type === "PARENT_ACTOR") {
    } else if (item.type === "UI_PAGE") {
      this.viewPageEditor(item);
    } else if (item.type === "PARENT_PAGE_THEMES") {
      this.viewPageTheme(item);
    } else if (
      item.type === "API" ||
      item.type === "COMMAND" ||
      item.type === "QUERY" ||
      item.type === "TASK" ||
      item.type === "MAIN_TASK" ||
      item.type === "SERVICEFILE" ||
      item.type === "WORKFLOW"
    ) {
      this.viewRule(item);
    } else {
    }
  }
  viewPageTheme(item) {
    this.routeEnable = true;
    this.loadPageEditor = false;
    this.loadWidgetEditor = false;
    this.loadCustomPageEditor = false;
    this.loadGridPageEditor = false;
    this.loadTabPageEditor = false;
    this.loadFilterPageEditor = false;
    this.router.navigate(["ui/page-theme"], {
      queryParams: { projectUid: item.projectuuid, pageUid: item.uuid },
    });
  }

  viewUIHome() {
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
    this.loadModelView = false;
    this.loadDesignRequirement = false;
    this.requirementUid = "";
    this.loadPageEditor = false;
    this.loadGridPageEditor = false;
    this.loadCustomPageEditor = false;
    this.loadFilterPageEditor = false;
    this.loadTabPageEditor = false;
    this.loadThemeEditor = false;
    this.loadBuildWindow = false;
    this.loadUIHome = true;
    this.loadServiceHome = false;
  }

  viewServiceHome() {
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
    this.loadModelView = false;
    this.loadDesignRequirement = false;
    this.requirementUid = "";
    this.loadPageEditor = false;
    this.loadGridPageEditor = false;
    this.loadCustomPageEditor = false;
    this.loadFilterPageEditor = false;
    this.loadTabPageEditor = false;
    this.loadThemeEditor = false;
    this.loadBuildWindow = false;
    this.loadUIHome = false;
    this.loadServiceHome = true;
  }

  viewPageEditor(item) {
    this.routeEnable = false;
    this.location.replaceState(`ui`);
    if (item.subtype === "multiWidget") {
      this.loadGridPageEditor = true;
      this.loadPageEditor = false;
      this.loadCustomPageEditor = false;
      this.loadTabPageEditor = false;
      this.loadFilterPageEditor = false;
    } else if (item.subtype === "tabbed") {
      this.loadTabPageEditor = true;
      this.loadGridPageEditor = false;
      this.loadPageEditor = false;
      this.loadCustomPageEditor = false;
      this.loadFilterPageEditor = false;
    } else if (item.subtype === "customPage") {
      this.loadPageEditor = false;
      this.loadGridPageEditor = false;
      this.loadCustomPageEditor = true;
      this.loadTabPageEditor = false;
      this.loadFilterPageEditor = false;
    } else if (item.subtype === "filterPage") {
      this.loadPageEditor = false;
      this.loadGridPageEditor = false;
      this.loadCustomPageEditor = false;
      this.loadTabPageEditor = false;
      this.loadFilterPageEditor = true;
    } else {
      this.loadPageEditor = true;
      this.loadGridPageEditor = false;
      this.loadCustomPageEditor = false;
      this.loadTabPageEditor = false;
      this.loadFilterPageEditor = false;
    }
    this.ruleChainLoaded = false;
    this.ruleChainMetaDataLoaded = false;
    this.connectionPropertyTemplatesLoaded = false;
    this.ruleNodeComponentsLoaded = false;
    this.ruleChain = null;
    this.ruleChainMetaData = null;
    this.connectionPropertyTemplates = null;
    this.ruleNodeComponents = null;
    this.loadDesignRequirement = false;
    this.requirementUid = "";
    this.lambdauid = "";
    this.loadFunctionEditor = false;
    this.loadModelView = false;
    this.projectUid = item.projectuuid;
    this.pageId = item.uuid;
    this.loadWidgetEditor = false;
    this.loadThemeEditor = false;
    this.loadBuildWindow = false;
    this.loadUIHome = false;
    this.loadServiceHome = false;
  }

  // viewPageEditor(item) {
  //   if (item.subtype === "multiWidget") {
  //     this.router.navigate(['ui/page/multiWidget'], {queryParams: {projectUid: item.projectuuid, pageId: item.uuid}});
  //   } else if (item.subtype === "tabbed") {
  //     this.router.navigate(['ui/page/tabbed'], {queryParams: {projectUid: item.projectuuid, pageId: item.uuid}});
  //   } else if (item.subtype === "customPage") {
  //     this.router.navigate(['ui/page/customPage'], {queryParams: {projectUid: item.projectuuid, pageId: item.uuid}});
  //   } else if (item.subtype === "filterPage") {
  //     this.router.navigate(['ui/page/filterPage'], {queryParams: {projectUid: item.projectuuid, pageId: item.uuid}});
  //   } else {
  //     this.router.navigate(['ui/page/singleWidget'], {queryParams: {projectUid: item.projectuuid, pageId: item.uuid}});
  //   }
  // }

  // viewSingleWidget(item){
  //     this.loadWidgetEditor = true;
  //     this.ruleChainLoaded = false;
  //     this.ruleChainMetaDataLoaded = false;
  //     this.connectionPropertyTemplatesLoaded = false;
  //     this.ruleNodeComponentsLoaded = false;
  //     this.ruleChain = null;
  //     this.ruleChainMetaData = null;
  //     this.connectionPropertyTemplates = null;
  //     this.ruleNodeComponents = null;
  //     this.loadDesignRequirement = false;
  //     this.requirementUid = "";
  //     this.lambdauid = "";
  //     this.lambdauid = "";
  //     this.loadFunctionEditor = false;
  //     this.loadModelView = false;
  //     this.loadPageEditor = false;
  //     this.loadGridPageEditor = false;
  //     this.loadCustomPageEditor = false;
  //     this.loadFilterPageEditor = false;
  //     this.loadTabPageEditor = false;
  //     this.pageId =item.pageUUID;
  //     this.widgetId = item.widgetUUID;
  // }

  viewFuncEditor(item) {
    this.ruleChainLoaded = false;
    this.ruleChainMetaDataLoaded = false;
    this.connectionPropertyTemplatesLoaded = false;
    this.ruleNodeComponentsLoaded = false;
    this.ruleChain = null;
    this.ruleChainMetaData = null;
    this.connectionPropertyTemplates = null;
    this.ruleNodeComponents = null;
    this.loadDesignRequirement = false;
    this.requirementUid = "";
    this.lambdauid = "";
    this.lambdauid = item.uuid;
    this.loadFunctionEditor = true;
    this.loadModelView = false;
    this.loadPageEditor = false;
    this.loadGridPageEditor = false;
    this.loadCustomPageEditor = false;
    this.loadFilterPageEditor = false;
    this.loadTabPageEditor = false;
    this.loadWidgetEditor = false;
    this.loadThemeEditor = false;
    this.loadBuildWindow = false;
    this.loadUIHome = false;
    this.loadServiceHome = false;
  }

  viewReqEditor(item?) {
    console.log(item);
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
    this.loadModelView = false;
    this.requirementUid = "";
    this.desprojectUid = "";
    this.loadDesignRequirement = false;
    this.requirementUid = item.uuid;
    this.desprojectUid = item.projectuuid;
    this.loadPageEditor = false;
    this.loadGridPageEditor = false;
    this.loadCustomPageEditor = false;
    this.loadFilterPageEditor = false;
    this.loadTabPageEditor = false;
    this.loadWidgetEditor = false;
    if (this.reload) {
      this.reload = false;
    } else {
      this.reload = true;
    }
    this.loadDesignRequirement = true;
    this.loadThemeEditor = false;
    this.loadBuildWindow = false;
    this.loadUIHome = false;
    this.loadServiceHome = false;
  }

  viewBuildWindow() {
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
    this.loadModelView = false;
    this.requirementUid = "";
    this.loadDesignRequirement = false;
    this.loadPageEditor = false;
    this.loadGridPageEditor = false;
    this.loadCustomPageEditor = false;
    this.loadFilterPageEditor = false;
    this.loadTabPageEditor = false;
    this.loadWidgetEditor = false;
    if (this.reload) {
      this.reload = false;
    } else {
      this.reload = true;
    }
    this.loadDesignRequirement = false;
    this.loadThemeEditor = false;
    this.loadBuildWindow = true;
    this.loadUIHome = false;
    this.loadServiceHome = false;
  }

  viewRule(item) {
    this.lambdauid = "";
    this.loadFunctionEditor = false;
    this.ruleChainLoaded = false;
    this.ruleChainMetaDataLoaded = false;
    this.connectionPropertyTemplatesLoaded = false;
    this.ruleNodeComponentsLoaded = false;
    this.loadModelView = false;
    this.loadDesignRequirement = false;
    this.requirementUid = "";
    this.loadPageEditor = false;
    this.loadGridPageEditor = false;
    this.loadCustomPageEditor = false;
    this.loadFilterPageEditor = false;
    this.loadTabPageEditor = false;
    this.ruleprojectUid = "";
    this.editorType = "";
    this.ruleprojectUid = item.projectuuid;
    this.loadWidgetEditor = false;
    this.loadThemeEditor = false;
    if (item.type === "SERVICEFILE") {
      this.editorType = "servicefile";
    } else if (item.type === "MAIN_TASK") {
      this.editorType = "maintask";
    } else {
      this.editorType = "default";
    }

    this.username = item.username;
    //         this.uid = this.projectUid;
    this.ruleChainService
      .getRuleChainWithUsernameAndUID(
        item.ruleid,
        item.username,
        this.ruleprojectUid
      )
      .subscribe((ruleChain) => {
        this.ruleChainLoaded = true;
        this.ruleChain = ruleChain;
      });
    this.ruleChainService
      .getResolvedRuleChainMetadata(
        item.ruleid,
        item.username,
        this.ruleprojectUid
      )
      .subscribe((ruleChainMetaData) => {
        this.ruleChainMetaDataLoaded = true;
        this.ruleChainMetaData = ruleChainMetaData;
      });

    this.ruleChainService
      .getConnectionPropertyTemplates()
      .subscribe((connectionPropertyTemplates) => {
        this.connectionPropertyTemplatesLoaded = true;
        this.connectionPropertyTemplates = connectionPropertyTemplates;
      });

    this.ruleChainService
      .getRuleNodeComponents(
        ruleNodeConfigResourcesModulesMap,
        this.ruleprojectUid,
        this.editorType
      )
      .subscribe((ruleNodeComponents) => {
        this.ruleNodeComponentsLoaded = true;
        this.ruleNodeComponents = ruleNodeComponents;
      });
    this.loadBuildWindow = false;
    this.loadUIHome = false;
    this.loadServiceHome = false;
  }
  viewModel(item) {
    this.routeEnable = true;
    this.loadPageEditor = false;
    this.loadWidgetEditor = false;
    this.loadCustomPageEditor = false;
    this.loadGridPageEditor = false;
    this.loadTabPageEditor = false;
    this.loadFilterPageEditor = false;
    this.router.navigate(["ui/model"], {
      queryParams: { projectUid: item.projectuuid, modelUid: item.uuid },
    });
  }

  ngOnInit(): void {
    this.requirementArray = [];
    this.currentReqIndex = 0;
    this.currentTab = "portal";
    this.ruleprojectUid = "";
    this.editorType = "";
    this.listenConsoleLogChange();
    this.loadTreeData();
    this.loadDesignTreeData();
    this.loadUITreeData();
    this.registerChangeEditorTree();
    this.registerChangeUIEditor();
    this.onEditMultiWidgetPage();
    this.registerChangeDesignEditor();
    this.loadPreviewStatus();
    //         this.appTypeService.getDevChainByAppType(this.projectUid)
    //           .pipe(
    //             filter((mayBeOk: HttpResponse<IGenerator[]>) => mayBeOk.ok),
    //             map((response: HttpResponse<IGenerator[]>) => response.body)
    //           )
    //           .subscribe(
    //             (res: IGenerator[]) => {
    //               this.generatorChain = res;
    //               if (this.generatorChain.length !== 0) {
    //                 this.generatorChain.forEach(c => {
    //                   this.generatorList[c.position] = c.generator.name;
    //                 });
    //               }
    //             });
    //         this.loadChatbox(this.projectUid);
  }

  loadPreviewStatus() {
    this.getFEPrevStatus();
    this.getBEPrevStatus();
  }

  loadTreeData() {
    this.projectService.findAllProjectComponents().subscribe((comps) => {
      this.dataSource.data = comps;
    });
  }

  changeSplit(val) {
    this.currentTab = val;
    if (val === "portal") {
      this.router.navigate([`ui`]);
    } else if (val === "service") {
      this.router.navigate([`service`]);
    } else if (val === "design") {
      this.router.navigate([`design`]);
    } else if (val === "build") {
      this.router.navigate([`build`]);
    }
  }

  loadBuildView() {
    this.viewBuildWindow();
  }

  loadDesignTreeData() {
    this.requirementService
      .findAllDesignTreeData()
      .pipe(
        filter((mayBeOk: HttpResponse<any[]>) => mayBeOk.ok),
        map((response: HttpResponse<any[]>) => response.body)
      )
      .subscribe((res: any[]) => {
        this.requirementCount = res[0].children.length;
        if (this.requirementCount > 0) {
          this.populateReqIDArray(res[0].children);
        }
        this.designdataSource.data = res;
        if (res && res[0] && res[0].children.length > 0) {
          this.viewReqEditor(res[0].children[0]);
          this.treeControl.expand(this.treeControl.dataNodes[0]);
        } else {
          this.viewReqEditor();
        }
      });
  }

  populateReqIDArray(requirements) {
    this.requirementArray = requirements;
  }

  loadUITreeData() {
    this.projectService.findAllUIComponents().subscribe((comps) => {
      // if (comps[0].isParent) {
      //   comps[0].color = "red";
      //   comps[0].icon = "backup";
      //   comps[0].children.map((i) => {
      //     if (i.isParent) {
      //       i.color = "green";
      //       i.icon = "backup";
      //       if (i.children) {
      //         i.children?.map((j) => {
      //           j.color = "blue";
      //           j.icon = "description";
      //           if(j.isParent){
      //             j.children?.map((k) => {
      //               k.color = "green";
      //               k.icon = "backup";
      //             })
      //           }
      //         });
      //       } else {
      //         i.color = "red";
      //         i.icon = "backup";
      //       }
      //     } else {
      //       i.color = "green";
      //       i.icon = "backup";
      //     }
      //   });
      // } else {
      //   comps[0].color = "red";
      //   comps[0].icon = "backup";
      // }
      this.uiTreeDaSource.data = comps;
      this.treeControl.expand(this.treeControl.dataNodes[0]);
      this.treeControl.expand(this.treeControl.dataNodes[1]);
    });
  }

  generateProject() {
    if (this.projectUid) {
      // this.loadChatbox(this.projectUid);
      this.appTypeService
        .getDevChainByAppType(this.projectUid)
        .pipe(
          filter((mayBeOk: HttpResponse<IGenerator[]>) => mayBeOk.ok),
          map((response: HttpResponse<IGenerator[]>) => response.body)
        )
        .subscribe((res: IGenerator[]) => {
          this.generatorChain = res;
          if (this.generatorChain.length !== 0) {
            this.generatorChain.forEach((c) => {
              this.generatorList[c.position] = c.generator.name;
            });
          }
        });
      this.code = "";
      this.isGenerating = true;
      setTimeout(() => {
        this.isGenerating = false;
      }, 16000);
      let genType = "Dev";
      const projectUUID: string = this.projectUid;
      let project: Project = new Project();
      if (projectUUID) {
        //                 let breakpoint = this.breakpointService.getBreakpoint();
        //                 let defaultTheme = this.themeService.getDefaultTheme();
        this.projectService
          .generateFromProjectId(
            projectUUID,
            -1,
            1,
            genType,
            project,
            projectUUID
          )
          .subscribe(
            (res: any) => {
              let project: IProject = res.body;
              this.socket.sendFE("generator");
              this.socket.sendBE("generator");
              this.onSaveSuccess();
            },
            (res: HttpErrorResponse) => this.onSaveError()
          );
      }
    }
    // const dialogRef = this.dialog.open(EnvSelectComponent, {
    //     panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
    //     data: {
    //         projectUid: this.projectUid,
    //         createStatus: status,
    //     }
    // });
    // dialogRef.afterClosed(
    // ).subscribe(result => {
    //     if (result){
    //
    //     }
    // });
  }

  logout() {
    this.loginService.logout();
    this.router.navigate([""]);
  }

  protected onSaveSuccess() {
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'Generation Started',
    //       detail: 'Generation process started successfully.',
    //     });
    if (this.code != "") {
      this.code = this.code + ",\n";
    }
    this.code =
      this.code +
      '{"status": "Success", "detail": "Generation process started successfully"}';
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
    if (this.code != "") {
      this.code = this.code + ",\n";
    }
    this.code =
      this.code + '{"status": "Error", "detail": "Generation request failed"}';
    this.isGenerating = false;
  }

  listenConsoleLogChange() {
    this.consoleEventSubscriber = this.eventManager
      .on(EventTypes.consoleLogsUpdated)
      .subscribe((event) => this.updateLog());
  }

  updateLog() {
    this.code = this.consoleLogService.readConsoleLog();
  }

  clearLog() {
    this.consoleLogService.clearConsoleLog();
  }

  ngOnDestroy() {
    this.consoleEventSubscriber.unsubscribe();
  }

  getFEPrevStatus() {
    this.projectService
      .getFEPreviewStatusData()
      .pipe(
        filter((res: HttpResponse<any>) => res.ok),
        map((res: HttpResponse<any>) => res.body)
      )
      .subscribe((event) => {
        this.fEBuildStatus = event;
      });
  }

  getBEPrevStatus() {
    this.projectService
      .getBEPreviewStatusData()
      .pipe(
        filter((res: HttpResponse<any>) => res.ok),
        map((res: HttpResponse<any>) => res.body)
      )
      .subscribe((event) => {
        this.bEBuildStatus = event;
      });
  }

  loadChatbox(uuid) {
    this.socket.getEventListener().subscribe((event) => {
      if (event.type === "message") {
        let topic = event.data.topic;
        if (topic === "generator") {
          let data = event.data.content;

          let projectUUID = "";
          let status = "";
          let time = "";
          let position = -1;

          let allKeyValuePairs = data.split(",");
          if (allKeyValuePairs) {
            allKeyValuePairs.forEach((keyval) => {
              let keyAndValArr = keyval.split("=", 2);
              let key = "";
              let val = "";

              if (keyAndValArr) {
                for (let i = 0; i < keyAndValArr.length; i++) {
                  if (i === 0) {
                    key = keyAndValArr[i];
                  } else {
                    val = keyAndValArr[i];
                  }
                }
              }

              if (key === "projectuuid") {
                projectUUID = val;
              } else if (key === "status") {
                status = val;
              } else if (key === "time") {
                time = val;
              } else if (key === "position") {
                position = +val;
              }
            });
          }

          if (uuid === projectUUID) {
            if (status) {
              if (status.trim() === "didnot") {
                if (this.code != "") {
                  this.code = this.code + ",\n";
                }
                this.code =
                  this.code +
                  '{"status": "Error", "detail": "Generation failed at ' +
                  this.generatorList[position] +
                  '"}';
              } else if (status.trim() === "done") {
                if (this.code != "") {
                  this.code = this.code + ",\n";
                }
                this.code =
                  this.code +
                  '{"status": "Success", "detail": "Generation successful at ' +
                  this.generatorList[position] +
                  '"}';
              } else if (status.trim() === "done") {
                if (this.code != "") {
                  this.code = this.code + ",\n";
                }
                this.code =
                  this.code +
                  '{"status": "In progress", "detail": "Generation started at ' +
                  this.generatorList[position] +
                  '"}';
              }
            }
          }
        }
      }
    });
  }

  loadBEGenData(uuid) {
    this.socket.getBEEventListener().subscribe((event) => {
      if (event.type === "message") {
        let topic = event.data.topic;
        if (topic === "generator") {
          let data = event.data.content;

          let projectUUID = "";
          let status = "";
          let time = "";
          let position = -1;

          let allKeyValuePairs = data.split(",");
          if (allKeyValuePairs) {
            allKeyValuePairs.forEach((keyval) => {
              let keyAndValArr = keyval.split("=", 2);
              let key = "";
              let val = "";

              if (keyAndValArr) {
                for (let i = 0; i < keyAndValArr.length; i++) {
                  if (i === 0) {
                    key = keyAndValArr[i];
                  } else {
                    val = keyAndValArr[i];
                  }
                }
              }

              if (key === "projectuuid") {
                projectUUID = val;
              } else if (key === "status") {
                status = val;
              } else if (key === "time") {
                time = val;
              } else if (key === "position") {
                position = +val;
              }
            });
          }

          if (uuid === projectUUID) {
            if (status) {
              if (status.trim() === "didnot") {
                if (this.bEBuildStatus != "") {
                  this.bEBuildStatus = this.bEBuildStatus + ",\n";
                }
                this.bEBuildStatus =
                  this.bEBuildStatus +
                  '{"status": "Error", "detail": "Generation failed at ' +
                  this.generatorList[position] +
                  '"}';
              } else if (status.trim() === "done") {
                if (this.bEBuildStatus != "") {
                  this.bEBuildStatus = this.bEBuildStatus + ",\n";
                }
                this.bEBuildStatus =
                  this.bEBuildStatus +
                  '{"status": "Success", "detail": "Generation successful at ' +
                  this.generatorList[position] +
                  '"}';
              } else if (status.trim() === "done") {
                if (this.bEBuildStatus != "") {
                  this.bEBuildStatus = this.bEBuildStatus + ",\n";
                }
                this.bEBuildStatus =
                  this.bEBuildStatus +
                  '{"status": "In progress", "detail": "Generation started at ' +
                  this.generatorList[position] +
                  '"}';
              }
            }
          }
        }
      }
    });
  }

  loadFEGenData(uuid) {
    this.socket.getFEEventListener().subscribe((event) => {
      if (event.type === "message") {
        let topic = event.data.topic;
        if (topic === "generator") {
          let data = event.data.content;

          let projectUUID = "";
          let status = "";
          let time = "";
          let position = -1;

          let allKeyValuePairs = data.split(",");
          if (allKeyValuePairs) {
            allKeyValuePairs.forEach((keyval) => {
              let keyAndValArr = keyval.split("=", 2);
              let key = "";
              let val = "";

              if (keyAndValArr) {
                for (let i = 0; i < keyAndValArr.length; i++) {
                  if (i === 0) {
                    key = keyAndValArr[i];
                  } else {
                    val = keyAndValArr[i];
                  }
                }
              }

              if (key === "projectuuid") {
                projectUUID = val;
              } else if (key === "status") {
                status = val;
              } else if (key === "time") {
                time = val;
              } else if (key === "position") {
                position = +val;
              }
            });
          }

          if (uuid === projectUUID) {
            if (status) {
              if (status.trim() === "didnot") {
                if (this.fEBuildStatus != "") {
                  this.fEBuildStatus = this.fEBuildStatus + ",\n";
                }
                this.fEBuildStatus =
                  this.fEBuildStatus +
                  '{"status": "Error", "detail": "Generation failed at ' +
                  this.generatorList[position] +
                  '"}';
              } else if (status.trim() === "done") {
                if (this.fEBuildStatus != "") {
                  this.fEBuildStatus = this.fEBuildStatus + ",\n";
                }
                this.fEBuildStatus =
                  this.fEBuildStatus +
                  '{"status": "Success", "detail": "Generation successful at ' +
                  this.generatorList[position] +
                  '"}';
              } else if (status.trim() === "done") {
                if (this.fEBuildStatus != "") {
                  this.fEBuildStatus = this.fEBuildStatus + ",\n";
                }
                this.fEBuildStatus =
                  this.fEBuildStatus +
                  '{"status": "In progress", "detail": "Generation started at ' +
                  this.generatorList[position] +
                  '"}';
              }
            }
          }
        }
      }
    });
  }

  exportAggregateFile(node) {
    this.aggregateService
      .getModelDownloader(node.uuid, node.projectuuid)
      .subscribe((data) => this.downloadFile(data)),
      (error) => this.onError("Error got while exporting"),
      () => {
        console.log("OK");
      };
  }

  downloadFile(data: any) {
    const blob = new Blob([data.body], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    //window.open(url);

    let filename = this.getFileNameFromHttpResponse(data);
    var anchor = document.createElement("a");
    anchor.download = filename;
    anchor.href = url;
    anchor.click();
  }

  protected onError(errorMessage: string) {}

  getFileNameFromHttpResponse(data) {
    var contentDispositionHeader = data.headers.get("content-disposition");
    var result = contentDispositionHeader.split(";")[1].trim().split("=")[1];
    return result.replace(/"/g, "");
  }

  getColor(node){
    return (node.data.color) ?? 'primary'
  }

  getFontSize(node){
    return (node.data.fontsize) ?? ''
  }

  getFontFamily(node){
    return (node.data.fontfamily) ?? ''
  }
}
