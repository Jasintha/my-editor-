import { V } from "@angular/cdk/keycodes";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { defaultHttpOptions } from "@app/core/http/public-api";
import { UIBService } from "@app/core/projectservices/uib.service";
import { createRequestOption } from "@app/shared/util/request-util";
import { BehaviorSubject, Observable, of } from "rxjs";

@Component({
  selector: "uib-mapping",
  templateUrl: "./mapping-with-table.component.html",
})
export class UIBMappingComponent implements OnInit {
  @Input() data = {
    label: "",
    value: "",
    formControlName: "",
    dataSource: [],
    displayedColumns: [],
    mappingSource: {
      data: [],
    },
  };

  @Input() formGroup: FormGroup;

  enableFirstTree = false;
  enableFirstDropDown = false;

  enableSecondTree = false;
  enableSecondDropDown = false;

  constructor(protected http: HttpClient, private ref: ChangeDetectorRef,     
    private uibService: UIBService,
    ) {}

  dropDowns = [
    {
      label: "",
      formControlName: "dropdown1",
      options: [],
    },
    {
      label: "",
      formControlName: "dropdown2",
      options: [],
    },
    {
      label: "",
      formControlName: "dropdown3",
      options: [],
    },
    {
      label: "",
      formControlName: "dropdown4",
      options: [],
    },
  ];

  tableData = {
    label: "Mapping Table",
    value: "",
    formControlName: "mappingData",
    displayedColumns: [],
    dataSource: [],
  };

  childFormGroup = new FormGroup({
    dropdown1: new FormControl(null),
    dropdown2: new FormControl(null),
    dropdown3: new FormControl(null),
    dropdown4: new FormControl(null),
  });

  ngOnInit(): void {
    this.tableData = {
      label: this.data.label,
      value: "",
      formControlName: this.data.formControlName,
      displayedColumns: this.data.displayedColumns,
      dataSource:
        this.formGroup.controls[this.data.formControlName].value ?? [],
    };

    this.data.mappingSource.data.forEach((value, index) => {
      this.query(value.path).subscribe((options) => {
        let optionsArray = [];
        options.forEach((item) => {
          optionsArray.push({
            key: item.key,
            label: item.value,
            type: item.type,
            path: item.path
          });
        });
        this.dropDowns[index] = {
          label: value.label,
          formControlName: value.formControlName,
          options: optionsArray,
        };
        this.ref.detectChanges();
      });
    });

    this.childFormGroup.controls["dropdown1"].valueChanges.subscribe(
      (first) => {
        const index = this.dropDowns[0].options.filter((item)=> item.key === first)[0]
        if (index.type === "tree") {
          this.query(index.path).subscribe({
            next: (comps) => {
              this.dropDowns[2] = {
                label: this.data.mappingSource.data[0].child.label,
                formControlName: this.data.mappingSource.data[0].child
                  .formControlName,
                options: comps
              };
              this.enableFirstTree = true;
              this.enableFirstDropDown = false;
              this.ref.detectChanges();
            },
          });
        } else {
          this.query(
            index.path
          ).subscribe((options) => {
            let optionsArray = [];
            options.forEach((item) => {
              optionsArray.push({
                key: item.key,
                label: item.value,
              });
            });
            this.dropDowns[2] = {
              label: this.data.mappingSource.data[0].child.label,
              formControlName: this.data.mappingSource.data[0].child
                .formControlName,
              options: optionsArray,
            };
            this.enableFirstTree = false;
            this.enableFirstDropDown = true;
            this.ref.detectChanges();
          });
        }
      }
    );

    this.childFormGroup.controls["dropdown2"].valueChanges.subscribe(
      (first) => {
        const index = this.dropDowns[1].options.filter((item)=> item.key === first)[0]
        if (index.type === "tree") {
          this.query(index.path).subscribe({
            next: (comps) => {
              this.dropDowns[3] = {
                label: this.data.mappingSource.data[1].child.label,
                formControlName: this.data.mappingSource.data[1].child
                  .formControlName,
                options: comps
              };
              this.enableFirstTree = true;
              this.enableFirstDropDown = false;
              this.ref.detectChanges();
            },
          });
        } else {
          this.query(index.path).subscribe({
            next: (comps) => {
              let optionsArray = [];
              comps.forEach((item) => {
                optionsArray.push({
                  key: item.key,
                  label: item.value,
                });
              });
              this.dropDowns[3] = {
                label: this.data.mappingSource.data[1].child.label,
                formControlName: this.data.mappingSource.data[1].child
                  .formControlName,
                options: optionsArray
              };
              this.enableSecondTree = false;
              this.enableSecondDropDown = true;
              this.ref.detectChanges();
            },
          });
        }
      }
    );
  }

  addAssignment() {
    const newValue = {
      [this.data.mappingSource.data[0].label]: this.childFormGroup.controls[
        "dropdown1"
      ].value,
      [this.data.mappingSource.data[1].label]: this.childFormGroup.controls[
        "dropdown2"
      ].value,
      [this.data.mappingSource.data[0].child.label]: this.childFormGroup.controls[
        "dropdown3"
      ].value,
      [this.data.mappingSource.data[1].child.label]: this.childFormGroup.controls[
        "dropdown4"
      ].value,
    };

    this.tableData.dataSource = [...this.tableData.dataSource, newValue];
    this.enableFirstTree = false;
    this.enableFirstDropDown = false;
    this.enableSecondTree = false;
    this.enableSecondDropDown = false;
    this.formGroup.controls[this.data.formControlName].setValue(
      this.tableData.dataSource
    );
  }

  query(path): Observable<any[]> {
    return this.http.get<any[]>(`${path}`, defaultHttpOptions());
  }
}
