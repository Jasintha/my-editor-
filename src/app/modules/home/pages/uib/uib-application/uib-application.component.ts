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
import { icon } from "leaflet";

export interface Tile {
  applications: Application []
}

export interface Application {
  title: BasicData,
  labels: BasicData[],
  hstatus: BasicData,
  sstatus: BasicData,
  data: any[]
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
  private _transformer = (node: any, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      data: node,
      level: level,
    };
  };

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

  constructor(
    private router: Router,
    private loginService: LoginService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.isProssesing = false
    this.currentTab = "application";
    this.loadGridTiles();
  }

  openbox(tile: Application) {
    // if (tile.name.toLowerCase().includes(".uib")) {
    //   tile.type = "UIB";
    // }
    // this.triggerService(tile);
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
    this.applications = [
      {
        title: {
          name: 'test 1',
          color: 'green',
          icon: 'share'
        },
        labels: [
          {
            name: 'test label',
            color: 'yellow',
            icon: undefined
          },
          {
            name: 'test label',
            color: 'blue',
            icon: undefined
          }
        ],
        hstatus: {
          name: 'healthy',
          color: 'green',
          icon: 'favorite'
        },
        sstatus: {
          name: 'synced',
          color: 'green',
          icon: 'sync'
        },
        data:{
          'a': 123,
          'b': 234,
          'c': 456
        }
      },
      {
        title: {
          name: 'test 2',
          color: 'green',
          icon: 'share'
        },
        labels: [
          {
            name: 'test label',
            color: 'yellow',
            icon: undefined
          },
          {
            name: 'test label',
            color: 'blue',
            icon, undefined
          }
        ],
        hstatus: {
          name: 'healthy',
          color: 'green',
          icon: 'favorite'
        },
        sstatus: {
          name: 'synced',
          color: 'green',
          icon: 'sync'
        },
        data: {
        
        }
      },
      {
        title: {
          name: 'test 3',
          color: 'green',
          icon: 'share'
        },
        labels: [
          {
            name: 'test label',
            color: 'yellow',
            icon: undefined
          },
          {
            name: 'test label',
            color: 'blue',
            icon, undefined
          }
        ],
        hstatus: {
          name: 'healthy',
          color: 'green',
          icon: 'favorite'
        },
        sstatus: {
          name: 'synced',
          color: 'green',
          icon: 'sync'
        },
        data: {
          'a': 123,
          'b': 234,
          'c': 456
        }
      },
      {
        title: {
          name: 'test 4',
          color: 'green',
          icon: 'share'
        },
        labels: [
          {
            name: 'test label',
            color: 'yellow',
            icon: undefined
          },
          {
            name: 'test label',
            color: 'blue',
            icon, undefined
          }
        ],
        hstatus: {
          name: 'healthy',
          color: 'green',
          icon: 'favorite'
        },
        sstatus: {
          name: 'synced',
          color: 'green',
          icon: 'sync'
        },
        data: {
          'a': 123,
          'b': 234,
          'c': 456
        }
      },
      {
        title: {
          name: 'test 5',
          color: 'green',
          icon: 'share'
        },
        labels: [
          {
            name: 'test label',
            color: 'yellow',
            icon: undefined
          },
          {
            name: 'test label',
            color: 'blue',
            icon, undefined
          }
        ],
        hstatus: {
          name: 'healthy',
          color: 'green',
          icon: 'favorite'
        },
        sstatus: {
          name: 'synced',
          color: 'green',
          icon: 'sync'
        },
        data: {
          'a': 123,
          'b': 234,
          'c': 456
        }
      },
      {
        title: {
          name: 'test 6',
          color: 'green',
          icon: 'share'
        },
        labels: [
          {
            name: 'test label',
            color: 'yellow',
            icon: undefined
          },
          {
            name: 'test label',
            color: 'blue',
            icon, undefined
          }
        ],
        hstatus: {
          name: 'healthy',
          color: 'green',
          icon: 'favorite'
        },
        sstatus: {
          name: 'synced',
          color: 'green',
          icon: 'sync'
        },
        data: {
          'a': 123,
          'b': 234,
          'c': 456
        }
      }
    ] as Application[]
    // this.projectService.findAllProjectComponents().subscribe((comps) => {
    //   this.dataSource.data = comps;
    //   const process = this.dataSource.data[0].children.filter(
    //     (parent) => parent.type === "PARENT_PROCESS"
    //   );
    //   for (let node of process[0].children) {
    //     this.tiles = [...this.tiles, node];
    //   }
    //   this.isProssesing = false
    // });
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
