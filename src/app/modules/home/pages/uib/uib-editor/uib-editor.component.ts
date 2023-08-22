import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { LoginService } from "@app/core/services/login.services";
import { ProjectService } from "../../projects";
import { MatTreeFlatDataSource, MatTreeFlattener } from "@angular/material/tree";
import { FlatTreeControl } from "@angular/cdk/tree";
import { AddOperationService } from "@app/core/projectservices/add-operations.service";
import { EventTypes } from "@app/shared/events/event.queue";
import { Subscription } from "rxjs";
import { EventManagerService } from "@app/shared/events/event.type";
import { AggregateService } from "@app/core/projectservices/microservice-aggregate.service";
import { DeleteOperationService } from "@app/core/projectservices/delete-operations.service";
import { UIBService } from "@app/core/projectservices/uib.service";
  
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

    mainUUID: string;
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
       private addOperationService: AddOperationService,
       private aggregateService: AggregateService,
       private deleteOperationService: DeleteOperationService,
       private uibService: UIBService,
       private activatedRoute: ActivatedRoute
       ){}
    ngOnInit(): void {
      this.activatedRoute.queryParams.subscribe((params)=> {
        this.mainUUID = params.projectUid;
      });
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
    this.uibService.findProjectComponents(this.mainUUID).subscribe({
      next: (comps) => {
      this.dataSource.data = comps;
      },
      error: (error)=> {
        console.error(error)
      }
    });
  }

  registerChangeEditorTree() {
    this.eventSubscriber = this.eventManager
      .on(EventTypes.editorTreeListModification)
      .subscribe((_event) => this.loadTreeData());
  }

  add(node) {
    this.addOperationService.createPopups(node, node.projectuuid, "Create");
  }

  selectActiveNode(selectedNode) {
    if(selectedNode.data.isParent){
      return
    }
    const node = selectedNode.data
    this.isCreatingProject = false 
    this.projectUid = node.projectuuid;

   if (node.type === "Scripts" || node.type === "MODEL") {
    this.router.navigate(["uib-editor/source"], {
      queryParams: {
        projectUid: node.projectuuid,
        ruleId: node.uuid,
        userName: node.username,
        sourceId: node.uibid,
        editable: node.is_editable,
        languge: node.editor_lan ?? 'text',
        title: node.editor_title ?? '',
        theme: node.editor_theme ?? 'vs'
      },
    });
    } else {
      this.viewRule(node);
    }
  }

  viewRule(item) {
    this.ruleprojectUid = item.projectuuid;
    this.editorType = "uib";
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

  exportAggregateFile(selectedNode) {
    const node = selectedNode
    this.aggregateService
      .getModelDownloader(node.uuid, node.projectuuid)
      .subscribe((data) => this.downloadFile(data)),
      (_error) => this.onError("Error got while exporting"),
      () => {
        console.log("OK");
      };
  }

  downloadFile(data: any) {
    const blob = new Blob([data.body], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    let filename = this.getFileNameFromHttpResponse(data);
    var anchor = document.createElement("a");
    anchor.download = filename;
    anchor.href = url;
    anchor.click();
  }

  protected onError(_errorMessage: string) {}

  getFileNameFromHttpResponse(data) {
    var contentDispositionHeader = data.headers.get("content-disposition");
    var result = contentDispositionHeader.split(";")[1].trim().split("=")[1];
    return result.replace(/"/g, "");
  }

  viewSourceCode(node){
    this.isCreatingProject = false 
    this.projectUid = node.projectuuid;
    console.log(node)

      this.router.navigate(["uib-editor/source"], {
        queryParams: {
          projectUid: node.projectuuid,
          ruleId: node.ruleid,
          userName: node.username,
          sourceId: node.uibid
        },
      });
   
  }

  edit(item) {
    const node = item
    this.projectUid = node.projectuuid;
    this.addOperationService.editPopups(node, this.projectUid, "Update");
  }

  delete(item) {
    const node = item
    this.projectUid = node.projectuuid;
    this.deleteOperationService.delete(node, this.projectUid);
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
  