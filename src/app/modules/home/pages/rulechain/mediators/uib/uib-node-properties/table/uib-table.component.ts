import {Component, Input, OnInit} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { any, string } from 'prop-types';

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
    dataSource: any,
    hide: false
  };

  @Input() formGroup:FormGroup

  ngOnInit(): void {}

}