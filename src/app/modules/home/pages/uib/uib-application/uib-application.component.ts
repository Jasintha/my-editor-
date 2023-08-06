import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { MatGridListModule } from "@angular/material/grid-list/grid-list-module";
import { Router } from "@angular/router";
import { LoginService } from "@app/core/services/login.services";
import { ProjectService } from "../../projects";
import { FlatTreeControl } from "@angular/cdk/tree";
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from "@angular/material/tree";

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
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
  private _transformer = (node: any, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      data: node,
      level: level,
    };
  };

  tiles: Node[] = [];

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

  constructor(
    private router: Router,
    private loginService: LoginService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.isProssesing = true
    this.currentTab = "application";
    this.loadGridTiles();
  }

  openbox(tile: Node) {
    if (tile.name.toLowerCase().includes(".uib")) {
      tile.type = "UIB";
    }
    this.triggerService(tile);
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
    this.projectService.findAllProjectComponents().subscribe((comps) => {
      this.dataSource.data = comps;
      const process = this.dataSource.data[0].children.filter(
        (parent) => parent.type === "PARENT_PROCESS"
      );
      for (let node of process[0].children) {
        this.tiles = [...this.tiles, node];
      }
      this.isProssesing = false
    });
  }

  changeSplit(val) {
    this.currentTab = val;
    if (val === "dashboard") {
      this.router.navigate([`dashboard`]);
    } else if (val === "application") {
      this.router.navigate([`application`]);
    } else if (val === "runtime") {
      this.router.navigate([`runtime`]);
    }
  }

  logout() {
    this.loginService.logout();
    this.router.navigate([""]);
  }
}
