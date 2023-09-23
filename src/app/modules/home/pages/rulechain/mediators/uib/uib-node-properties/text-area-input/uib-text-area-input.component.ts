import {Component, Input, OnInit, Output} from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'uib-text-area-input',
  styleUrls: ['./uib-text-area-input.component.scss'],
  templateUrl: './uib-text-area-input.component.html',
})
export class UIBTextAreaInputComponent implements OnInit{
  @Input() data = {
    label: '',
    value: '',
    formControlName: ''
  };

  @Input() formGroup:FormGroup

  ngOnInit(): void {
   // this.formGroup.controls[this.data.formControlName].patchValue(this.data.value)
 }

}