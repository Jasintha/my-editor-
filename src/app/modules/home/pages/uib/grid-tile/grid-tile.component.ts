import { Component, Input, ViewEncapsulation } from "@angular/core";
import {Node} from 'src/app/modules/home/pages/uib/uib-application/uib-application.component'

@Component({
    selector: 'grid-tile',
    templateUrl: './grid-tile.component.html',
    styleUrls: ['./grid-tile.component.scss'],
    encapsulation: ViewEncapsulation.None
  })
  export class GrideTileComponent {
  @Input()node: Node;

    constructor(){}

  }
  