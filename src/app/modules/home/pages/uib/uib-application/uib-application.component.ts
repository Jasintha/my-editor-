import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { MatGridListModule } from "@angular/material/grid-list/grid-list-module";
import { Router } from "@angular/router";
import { LoginService } from "@app/core/services/login.services";
import { ProjectService } from "../../projects";
import { FlatTreeControl } from "@angular/cdk/tree";
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from "@angular/material/tree";
import { icon } from "leaflet";
import { UIBService } from "@app/core/projectservices/uib.service";
import { MatSidenav } from "@angular/material/sidenav";

export interface Tile {
  applications: Application []
}

export interface Application {
  title: BasicData,
  labels: BasicData[],
  hstatus: BasicData,
  sstatus: BasicData,
  data: any[]
  meta: {
    projectuuid: string
  }
}

export interface BasicData {
  name: string;
  color: string;
  icon: string | undefined;
}

export interface Node {
  isParent: boolean;
  name: string;
  projectuuid: string;
  ruleid: string;
  status: string;
  type: string;
  username: string;
  uuid: string;
}

@Component({
  selector: "uib-application-page",
  templateUrl: "./uib-application.component.html",
  styleUrls: [
    "./uib-application.component.scss",
    "../../rulechain/rulechain-page.component.scss",
  ],
  encapsulation: ViewEncapsulation.None,
})
export class UibApplicationPageComponent implements OnInit {
  @ViewChild('drawer') drawer: MatSidenav;
  private _transformer = (node: any, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      data: node,
      level: level,
    };
  };

  appCount = 0
  applications: Application[] = [];

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
  currentTab: string;
  isProssesing = false;
  showFiller = false;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private projectService: ProjectService,
    private uibService: UIBService
  ) {}

  ngOnInit(): void {
    this.isProssesing = false
    this.currentTab = "application";
    this.loadGridTiles();
  }

  openbox(app: Application) {
    this.router.navigate(["uib-editor"], {
      queryParams: {
        projectUid: app.meta?.projectuuid
      }
    })
  }

  triggerService(item) {
    let editorType = "";
    if (item.type === "SERVICEFILE") {
      editorType = "servicefile";
    } else if (item.type === "UIB") {
      editorType = "uib";
    } else if (item.type === "MAIN_TASK") {
      editorType = "maintask";
    } else {
      editorType = "default";
    }
    this.router.navigate(["uib-service/rulechain"], {
      queryParams: {
        ruleId: item.ruleid,
        username: item.username,
        ruleprojectUid: item.projectuuid,
        editorType: editorType,
      },
    });
  }

  loadGridTiles() {
    this.uibService.queryApps().subscribe({
      next: (value)=> {
        this.appCount = value.length
        this.applications = value as unknown as Application[]
      },
      error: (error)=> {
        console.error(error)
      }
    })
  }

  changeSplit(val) {
    this.currentTab = val;
    if (val === "dashboard") {
      this.router.navigate([`dashboard`]);
    } else if (val === "application") {
      this.router.navigate([`application`]);
    } else if (val === "uib-runtime") {
      this.router.navigate([`application`]);
    } else if (val === "uib-build") {
        this.router.navigate([`uib-build`]);
      }
  }

  toggleOverlay(){
    this.drawer.toggle();
  }

  logout() {
    this.loginService.logout();
    this.router.navigate([""]);
  }
}
