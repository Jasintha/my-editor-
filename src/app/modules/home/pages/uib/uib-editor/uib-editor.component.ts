import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
import { LoginService } from "@app/core/services/login.services";
import { ProjectService } from "../../projects";
import { MatTreeFlatDataSource, MatTreeFlattener } from "@angular/material/tree";
import { FlatTreeControl } from "@angular/cdk/tree";
import { AddOperationService } from "@app/core/projectservices/add-operations.service";
import { EventTypes } from "@app/shared/events/event.queue";
import { Subscription } from "rxjs";
import { EventManagerService } from "@app/shared/events/event.type";
import { MatDialog } from "@angular/material/dialog";
import { ServicefileComponent } from "../../servicefile/servicefile.component";
  
  @Component({
    selector: "uib-editor-page",
    templateUrl: "./uib-editor.component.html",
    styleUrls: [
      "./uib-editor.component.scss",
       "../../rulechain/rulechain-page.component.scss",
    ],
    encapsulation: ViewEncapsulation.None
  })
  export class UibEditorPageComponent implements OnInit{
    private _transformer = (node: any, level: number) => {
      return {
        expandable: !!node.children && node.children.length > 0,
        name: node.name,
        data: node,
        level: level,
      };
    };
    isCreatingProject = true;
    
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
  
    dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    activeNode: any;
    projectUid: string;
    ruleprojectUid: string;
    editorType: string;
    userName: string;
    currentTab: string;
    eventSubscriber: Subscription;
    eventSubscriberUi: Subscription;
    
    constructor(private router: Router,
       private loginService: LoginService,
       private projectService: ProjectService,
       private eventManager: EventManagerService,
       private addOperationService: AddOperationService
       ){}
    ngOnInit(): void {
      this.currentTab = "uib-editor"
      this.loadTreeData();
      this.registerChangeEditorTree()
    }

    changeSplit(val){
      this.currentTab = "uib-editor"
      if (val === "dashboard") {
        this.router.navigate([`dashboard`]);
      } else if (val === "application") {
        this.router.navigate([`application`]);
      } else if (val === "uib-editor") {
        this.router.navigate([`uib-editor`]);
      } else if (val === "uib-build") {
          this.router.navigate([`uib-build`]);
        }
  }

  refreshTree() {
    this.loadTreeData();
  }

  loadTreeData() {
    this.projectService.findAllProjectComponents().subscribe((comps) => {
      this.dataSource.data = comps;
    });
  }

  registerChangeEditorTree() {
    this.eventSubscriber = this.eventManager
      .on(EventTypes.editorTreeListModification)
      .subscribe((_event) => this.loadTreeData());
  }

  add(node) {
    if(node.type !== 'MODEL' && node.type !== 'LAMBDA'){
      node.editorType = 'UIB';
    }
    this.addOperationService.createPopups(node, node.projectuuid, "Create");
  }

  selectActiveNode(node) {
    this.isCreatingProject = false 
    this.activeNode = node;
    this.projectUid = this.activeNode.data.projectuuid;

    if (node.type === "MODEL") {
      this.router.navigate(["service/model"], {
        queryParams: { projectUid: node.projectuuid, modelUid: node.uuid },
      });
    } else if (node.type === "LAMBDA") {
      this.router.navigate(["service/lambda"], {
        queryParams: {
          projectUid: node.projectuuid,
          lamdafunctionUuid: node.uuid,
        },
      });
    } else if (
      node.type === "API" ||
      node.type === "COMMAND" ||
      node.type === "QUERY" ||
      node.type === "TASK" ||
      node.type === "MAIN_TASK" ||
      node.type === "SERVICEFILE" ||
      node.type === "WORKFLOW"  ||
      node.type === 'UIB'
    ) {
      this.viewRule(node);
    }
  }

  viewRule(item) {
    this.ruleprojectUid = item.projectuuid;
    if (item.type === "SERVICEFILE") {
      this.editorType = "servicefile";
    } else if(item.type === "UIB"){
      this.editorType = "uib";
    } else if (item.type === "MAIN_TASK") {
      this.editorType = "maintask";
    } else {
      this.editorType = "default";
    }
    this.userName = item.username;
    this.router.navigate(["uib-editor/rulechain"], {
      queryParams: {
        ruleId: item.ruleid,
        username: this.userName,
        ruleprojectUid: this.ruleprojectUid,
        editorType: this.editorType,
      },
    });
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

  logout(){
    this.loginService.logout();
    this.router.navigate(['']);
}

  }
  