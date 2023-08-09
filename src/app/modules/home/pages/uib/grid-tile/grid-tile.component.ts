import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core";
import {Application} from 'src/app/modules/home/pages/uib/uib-application/uib-application.component'

@Component({
    selector: 'grid-tile',
    templateUrl: './grid-tile.component.html',
    styleUrls: ['./grid-tile.component.scss'],
    encapsulation: ViewEncapsulation.None
  })
  export class GridTileComponent implements OnInit {
  @Input()app: Application;

    constructor(){}

    ngOnInit(){
      console.log(this.app.data)
    }

    getColor(color){
      return color;
    }

  }
  