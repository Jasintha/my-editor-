import {Component, Input, OnInit} from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'uib-section',
  templateUrl: './uib-section.component.html',
})
export class UIBSectionComponent implements OnInit{
  @Input() data = {
    label: '',
    value: '',
    formControlName: ''
  };

  @Input() formGroup:FormGroup

  ngOnInit(): void { }

}