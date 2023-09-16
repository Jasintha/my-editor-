import {Component, Input} from '@angular/core';

@Component({
  selector: 'uib-table',
  styleUrls: ['./uib-table.component.scss'],
  templateUrl: './uib-table.component.html',
})
export class UIBTableComponent {
  @Input() displayedColumns: string[]
  @Input() dataSource
}