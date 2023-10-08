import { V } from '@angular/cdk/keycodes';
import { HttpClient, HttpResponse } from '@angular/common/http';
import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { createRequestOption } from '@app/shared/util/request-util';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'uib-mapping',
  templateUrl: './mapping-with-table.component.html',
})
export class UIBMappingComponent  implements OnInit{
  @Input() data = {
    label: '',
    value: '',
    formControlName: '',
    dataSource: [],
    displayedColumns: [],
    mappingSource: []
  };

  @Input() formGroup:FormGroup

  constructor(protected http: HttpClient, private ref: ChangeDetectorRef) {}

  dropDowns = [
    {
      label: '',
      formControlName: 'dropdown1',
      options: []
    },
    {
      label: '',
      formControlName: 'dropdown2',
      options: []
    },
    {
      label: '',
      formControlName: 'dropdown3',
      options: []
    } ,
    {
      label: '',
      formControlName: 'dropdown4',
      options: []
    }  
  ]
  
  tableData = {
    label: 'Mapping Table',
    value: '',
    formControlName: 'mappingData',
    displayedColumns: [],
    dataSource: []
  }

  childFormGroup = new FormGroup({
    'dropdown1': new FormControl(null),
    'dropdown2': new FormControl(null),
    'dropdown3': new FormControl(null),
    'dropdown4': new FormControl(null),
  })

  ngOnInit(): void {


    this. tableData = {
      label: this.data.label,
      value: '',
      formControlName: this.data.formControlName,
      displayedColumns: this.data.displayedColumns,
      dataSource: this.formGroup.controls[this.data.formControlName].value ?? []
    }

    this.data.mappingSource.forEach((value, index) => {
      this.query(value.path).subscribe((options)=> {
        let optionsArray = [];
        options.body.forEach((item)=> {
          optionsArray.push({
            key: item.name,
            label: item.name
          })
        })
        this.dropDowns[index] = {
          label: value.label,
          formControlName: value.formControlName,
          options: optionsArray
        }
        this.ref.detectChanges();
      })
      }
    )
  }

  addAssignment(){
    let newValue = {
    }
    if(this.data.mappingSource.length == 2){
      newValue = {
        [this.data.mappingSource[0].label]: this.childFormGroup.controls['dropdown1'].value,
        [this.data.mappingSource[1].label]: this.childFormGroup.controls['dropdown2'].value,
      }
    } else {
      newValue = {
        [this.data.mappingSource[0].label]: this.childFormGroup.controls['dropdown1'].value,
        [this.data.mappingSource[1].label]: this.childFormGroup.controls['dropdown2'].value,
        [this.data.mappingSource[2].label]: this.childFormGroup.controls['dropdown3'].value,
        [this.data.mappingSource[3].label]: this.childFormGroup.controls['dropdown4'].value
      }
    }
  
    this.tableData.dataSource = [...this.tableData.dataSource, newValue]
    this.childFormGroup.controls['dropdown1'].setValue(null)
    this.childFormGroup.controls['dropdown2'].setValue(null)
    this.childFormGroup.controls['dropdown3'].setValue(null)
    this.childFormGroup.controls['dropdown4'].setValue(null)
    this.formGroup.controls[this.data.formControlName].setValue(this.tableData.dataSource)
  }

  query(path): Observable<HttpResponse<any[]>> {
    return this.http.get<any[]>(`${path}`, {observe: 'response' });
  }
}