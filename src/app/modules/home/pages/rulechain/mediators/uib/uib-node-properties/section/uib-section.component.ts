import {Component, Input, OnInit} from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'uib-text-input',
  styleUrls: ['./uib-text-input.component.scss'],
  templateUrl: './uib-text-input.component.html',
})
export class UIBTextInputComponent implements OnInit{
  @Input() data = {
    label: '',
    value: '',
    formControlName: ''
  };

  @Input() formGroup:FormGroup

  ngOnInit(): void {
    //this.formGroup.controls[this.data.formControlName].patchValue(this.data.value)
 }

}