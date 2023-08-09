import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core";
import {Application} from 'src/app/modules/home/pages/uib/uib-application/uib-application.component'
import { DashboardWidget } from "../uib-dashboard/uib-dashboard.component";

@Component({
    selector: 'dashboard-tile',
    templateUrl: './dashboard-tile.component.html',
    styleUrls: ['./dashboard-tile.component.scss'],
    encapsulation: ViewEncapsulation.None
  })
  export class DashboardTileComponent implements OnInit {
  @Input()widget: DashboardWidget;

    constructor(){}

    ngOnInit(){}

    getColor(color){
      return color;
    }

  }
  