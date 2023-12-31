import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { LoginService } from "@app/core/services/login.services";
import { ProjectService } from "../../projects";
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from "@angular/material/tree";
import { FlatTreeControl } from "@angular/cdk/tree";
import { AddOperationService } from "@app/core/projectservices/add-operations.service";
import { EventTypes } from "@app/shared/events/event.queue";
import { Subscription } from "rxjs";
import { EventManagerService } from "@app/shared/events/event.type";
import { AggregateService } from "@app/core/projectservices/microservice-aggregate.service";
import { DeleteOperationService } from "@app/core/projectservices/delete-operations.service";
import { UIBService } from "@app/core/projectservices/uib.service";
import { UibInternalService } from "../uib-internal-service";

@Component({
  selector: "uib-editor-page",
  templateUrl: "./uib-editor.component.html",
  styleUrls: [
    "./uib-editor.component.scss",
    "../../rulechain/rulechain-page.component.scss",
  ],
  encapsulation: ViewEncapsulation.None,
})
export class UibEditorPageComponent implements OnInit {
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
  healthStatusIcon: string;
  activeNode: any;
  projectUid: string;
  ruleprojectUid: string;
  editorType: string;
  userName: string;
  currentTab: string;
  eventSubscriber: Subscription;
  eventSubscriberUi: Subscription;
  fromApplication = false;
  editorOptions = {theme: 'vs', language: 'xml'};
  code = ''
  constructor(
    private router: Router,
    private loginService: LoginService,
    private projectService: ProjectService,
    private eventManager: EventManagerService,
    private addOperationService: AddOperationService,
    private aggregateService: AggregateService,
    private deleteOperationService: DeleteOperationService,
    private uibService: UIBService,
    private activatedRoute: ActivatedRoute,
    private uibInternalService: UibInternalService
  ) {}
  ngOnInit(): void {
    this.currentTab = "application";
    this.uibInternalService.getAction().subscribe((action) => {
      this.refreshTree();
    });
    this.loadTreeData();
    this.registerChangeEditorTree();
  }

  changeSplit(val) {
    this.currentTab = "application";
    if (val === "dashboard") {
      this.router.navigate([`dashboard`]);
    } else if (val === "application") {
      this.router.navigate([`application`]);
    } else if (val === "uib-runtime") {
      this.router.navigate([`uib-runtime`]);
    } else if (val === "uib-build") {
      this.router.navigate([`uib-build`]);
    }
  }

  refreshTree() {
    this.loadTreeData();
    this.registerChangeEditorTree();
  }

  loadTreeData() {
    if (this.mainUUID == undefined || this.healthStatusIcon == undefined) {
      this.fromApplication = true
      this.mainUUID = localStorage.getItem("mainProjectId");
      this.healthStatusIcon = localStorage.getItem("healthStatusIcon");
      this.uibService.findProjectComponents(this.mainUUID).subscribe({
        next: (comps) => {
          this.dataSource.data = comps;
          setTimeout(()=>{
            this.openFirst(this.dataSource.data[0]?.children[0]);
          }, 500)
        },
        error: (error) => {
          console.error(error);
        },
      });
    } else {
      this.uibService.findProjectComponents(this.mainUUID).subscribe({
        next: (comps) => {
          this.dataSource.data = comps;
        },
        error: (error) => {
          console.error(error);
        },
      });
    }
  }

  registerChangeEditorTree() {
    this.eventSubscriber = this.eventManager
      .on(EventTypes.editorTreeListModification)
      .subscribe((_event) => this.loadTreeData());
  }

  add(node) {
    this.addOperationService.createPopups(node, node.projectuuid, "Create");
  }

  openFirst(node) {
    if (node?.isParent || this.fromApplication == false) {
      return;
    } else {
      this.fromApplication = false;
      this.viewRule(node);
    }
  }

  selectActiveNode(selectedNode) {
    if (selectedNode.data.isParent) {
      return;
    }
    const node = selectedNode.data;
    this.isCreatingProject = false;
    this.projectUid = node.projectuuid;
    if (node.type === "Scripts" || node.type === "MODEL") {
      if (node.is_editable) {
        this.router.navigate(["uib-editor/edit-source"], {
          queryParams: {
            projectUid: node.projectuuid,
            ruleId: node.uuid,
            userName: node.username,
            sourceId: node.uibid,
            language: node.editor_lan ?? "xml",
            title: node.editor_title ?? "",
            theme: node.editor_theme ?? "vs",
          },
        });
      } else {
        this.router.navigate(["uib-editor/view-source"], {
          queryParams: {
            projectUid: node.projectuuid,
            ruleId: node.uuid,
            userName: node.username,
            sourceId: node.uibid,
            language: node.editor_lan ?? "xml",
            title: node.editor_title ?? "",
            theme: node.editor_theme ?? "vs",
          },
        });
      }
    } else {
      this.viewRule(node);
    }
  }

  viewRule(item) {
    if (this.mainUUID == undefined || this.healthStatusIcon == undefined) {
      this.mainUUID = localStorage.getItem("mainProjectId");
      this.healthStatusIcon = localStorage.getItem("healthStatusIcon");
    }
    this.ruleprojectUid = item.projectuuid;
    this.editorType = "uib";
    this.userName = item.username;
    this.router.navigate(["uib-editor/rulechain"], {
      queryParams: {
        mainId: this.mainUUID,
        ruleId: item.ruleid,
        username: this.userName,
        ruleprojectUid: this.ruleprojectUid,
        editorType: this.editorType,
        hstatusIcon: this.healthStatusIcon,
      },
    });
  }

  exportAggregateFile(selectedNode) {
    const node = selectedNode;
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

  viewSourceCode(node) {
    this.isCreatingProject = false;
    this.projectUid = node.projectuuid;
    if (node.is_editable) {
      this.router.navigate(["uib-editor/edit-source"], {
        queryParams: {
          projectUid: node.projectuuid,
          ruleId: node.ruleid,
          userName: node.username,
          sourceId: node.uibid,
          language: node.editor_lan ?? "xml",
          title: node.editor_title ?? "Source Code",
          theme: node.editor_theme ?? "vs",
        },
      });
    } else {
      this.router.navigate(["uib-editor/view-source"], {
        queryParams: {
          projectUid: node.projectuuid,
          ruleId: node.ruleid,
          userName: node.username,
          sourceId: node.uibid,
          language: node.editor_lan ?? "xml",
          title: node.editor_title ?? "Source Code",
          theme: node.editor_theme ?? "vs",
        },
      });
    }
  }

  backToApp() {
    this.router.navigate([`application`]);
  }

  edit(item) {
    const node = item;
    this.projectUid = node.projectuuid;
    this.addOperationService.editPopups(node, this.projectUid, "Update");
  }

  delete(item) {
    const node = item;
    this.projectUid = node.projectuuid;
    this.deleteOperationService.delete(node, this.projectUid);
  }

  getColor(node) {
    return node.data.color ?? "primary";
  }

  getFontSize(node) {
    return node.data.fontsize ?? "";
  }

  getFontFamily(node) {
    return node.data.fontfamily ?? "";
  }

  logout() {
    this.loginService.logout();
    this.router.navigate([""]);
  }
}
