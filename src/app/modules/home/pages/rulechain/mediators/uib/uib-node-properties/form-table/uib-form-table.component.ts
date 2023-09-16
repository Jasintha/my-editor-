import { Component, Input, OnInit } from "@angular/core";
import { FormArray, FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: "uib-form-table",
  templateUrl: "./uib-form-table.component.html",
})
export class UIBFormTableComponent implements OnInit {
  @Input() data = {
    label: "",
    value: [],
    formControlName: "",
    columns: [],
  };

  @Input() formGroup: FormGroup;

  ngOnInit(): void {}

  handler(): FormArray {
    return this.formGroup.get(this.data.formControlName) as FormArray;
  }

  newRow(): FormGroup {
    let opts = {};
    for (let opt of this.data.columns) {
      opts[opt.key] = new FormControl("");
    }

    return new FormGroup(opts);
  }

  add() {
    this.handler().push(this.newRow());
  }

  remove(i: number) {
    this.handler().removeAt(i);
  }
}
