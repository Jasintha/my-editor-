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
import { GlobalPositionStrategy, Overlay, PositionStrategy } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { CreateProjectComponent } from "../create-project/create-project.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UibInternalService } from "../uib-internal-service";

export interface Tile {
  applications: Application []
}

export interface Application {
  title: BasicData,
  labels: BasicData[],
  hstatus: BasicData,
  sstatus: BasicData,
  data: any[],
  projectuuid: string
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

  appCount = 0
  applications: Application[] = [];
  dropDownList = []
  isOverlayOpen: boolean = false;

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

  start = 0;
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  currentTab: string;
  isProssesing = false;
  showFiller = false;
  filteredApplications = []

  constructor(
    private router: Router,
    private uibInternalService: UibInternalService,
    private loginService: LoginService,
    private uibService: UIBService,
    private overlay: Overlay,
  ) {}

  ngOnInit(): void {
    this.isProssesing = false
    this.currentTab = "application";
    this.loadGridTiles();
    this.uibInternalService.getAction().subscribe((action)=> {
      this.loadGridTiles()
    })
  }

  loadGridTiles() {
    this.uibService.queryApps().subscribe({
      next: (value)=> {
        this.appCount = value.length
        this.applications = value
        this.getFilteredApps()
        this.dropDownList = this.applications.map((val)=> val.title.name)
      },
      error: (error)=> {
        console.error(error)
      }
    })
  }

  getFilteredApps(){
    this.filteredApplications = this.applications.slice(this.start, this.start + 10)
  }

  changeSplit(val) {
    this.currentTab = val;
    if (val === "dashboard") {
      this.router.navigate([`dashboard`]);
    } else if (val === "application") {
      this.router.navigate([`application`]);
    } else if (val === "uib-runtime") {
      this.router.navigate([`runtime`]);
    } else if (val === "uib-build") {
        this.router.navigate([`uib-build`]);
      }
  }

  toggleOverlay(){
    const overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      panelClass: 'mat-elevation-z8',
      positionStrategy: this.overlay
        .position()
        .global()
        .right('0')
        .width('900px'),
    });
    const component = new ComponentPortal(CreateProjectComponent);
    const componentRef = overlayRef.attach(component);
    componentRef.instance.dismiss.subscribe(()=> overlayRef.detach())
    overlayRef.backdropClick().subscribe(() => overlayRef.detach());
  }

  setStart(){
    const length = this.start + 10
    if(length >= this.applications.length){
      return 
    } else {
      this.start = length
    }
    this.getFilteredApps()
  }

  resetStart(){
    const length = this.start - 10
    if(length <= 0 ){
      return 
    } else {
      this.start = length
    }
    this.getFilteredApps()
  }

  logout() {
    this.loginService.logout();
    this.router.navigate([""]);
  }
}
