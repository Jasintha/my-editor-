import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'uib-text-input',
  styleUrls: ['./uib-text-input.component.scss'],
  templateUrl: './uib-text-input.component.html',
})
export class UIBTextInputComponent implements OnInit{
  @Input() data = {
    label: '',
    value: '',
    formControlName: '',
    hide: false
  };

  @Input() formGroup:FormGroup

  ngOnInit(): void {}

}