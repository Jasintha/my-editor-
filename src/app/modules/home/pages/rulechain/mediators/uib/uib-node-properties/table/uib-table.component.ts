import {Component, Input, OnInit} from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'uib-table',
  styleUrls: ['./uib-table.component.scss'],
  templateUrl: './uib-table.component.html',
})
export class UIBTableComponent  implements OnInit{
  @Input() data = {
    label: '',
    value: '',
    formControlName: '',
    displayedColumns: [],
    dataSource: []
  };

  @Input() formGroup:FormGroup

  ngOnInit(): void {}

}