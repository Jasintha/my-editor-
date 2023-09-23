import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'uib-dropdown-input',
  styleUrls: ['./uib-dropdown-input.component.scss'],
  templateUrl: './uib-dropdown-input.component.html',
})
export class UIBDropDownComponent implements OnInit{
  @Input() data = {
    label: '',
    value: '',
    formControlName: '',
    options: []
  };

  @Input() formGroup: FormGroup

  ngOnInit(): void {
    //this.formGroup.controls[this.data.formControlName].setValue(this.data.value)
 }

}