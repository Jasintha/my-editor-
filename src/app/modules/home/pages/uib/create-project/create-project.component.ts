import { Component, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";


@Component({
    selector: "create-uib-project",
    templateUrl: "./create-project.component.html",
    styleUrls: [
      "./create-project.component.scss",
    ],
    encapsulation: ViewEncapsulation.None,
  })
export class CreateProjectComponent {
    purposes = [
        't1', 't2'
    ]

    projectForm = this.fb.group({
        projectName: ['', Validators.required],
        description: ['', Validators.required],
        purpose: [null, Validators.required],
    })

    constructor(private fb: FormBuilder){}

        
  updateProfile() {
    this.projectForm.patchValue({
        projectName: '',
        description: '',
        purpose: this.purposes[0]
    });
  }

  onSubmit() {
    console.warn(this.projectForm.value);
  }
}