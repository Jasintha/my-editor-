import { I } from "@angular/cdk/keycodes";
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewEncapsulation,
} from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { RequirementService } from "@app/core/projectservices/requirement.service";
import { UIBService } from "@app/core/projectservices/uib.service";
import { Input } from "@material-ui/core";
import { UibInternalService } from "../uib-internal-service";
import { style } from "@angular/animations";

@Component({
  selector: "create-uib-project",
  templateUrl: "./create-project.component.html",
  styleUrls: ["./create-project.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class CreateProjectComponent implements OnInit {
  purposes = ["Integration"];

  projectForm = this.fb.group({
    projectName: ["", Validators.required],
    description: ["", Validators.required],
    purpose: [null, Validators.required],
  });

  projectUuid: string;
  isClear = false;
  isEdit = false;
  projState = 'Create'
  enableProgress = false

  @Output() dismiss = new EventEmitter<any>();
  
  constructor(
    private fb: FormBuilder,
    private uibService: UIBService,
    private requirementService: RequirementService,
    private snackBar: MatSnackBar,
    private uibInternalService: UibInternalService
  ) {}
  ngOnInit(): void {
    if (this.projectUuid) {
      this.isEdit = true;
      this.projState = 'Edit'
      this.projectForm.patchValue({
        purpose: this.purposes[0]
      })
    } else {
      this.requirementService.findAllDesignTreeData().subscribe((data) => {
        this.projectUuid = data.body[0].projectuuid;
      });
    }
  }

  clear() {
    this.isClear = true;
    this.projectForm.reset();
    Object.keys(this.projectForm.controls).forEach((key) => {
      this.projectForm.get(key).setErrors(null);
    });
    this.dismiss.emit();
  }

  onSubmit() {
    this.enableProgress = true;
    if (this.isEdit) {
      const newProject = {
        requirements: [
          {
            requirementUUID: "r0001",
            description: "<p>ZxXX</p>",
          },
        ],
        name: this.projectForm.get(["projectName"]).value,
        projectUuid: this.projectUuid,
        epicCreateType: "new",
        description: this.projectForm.get(["description"]).value,
        status: "NEW",
        epicuuid: "",
        referenceName: this.projectForm.get(["projectName"]).value,
      };
      this.uibService.updateUIBProject(newProject).subscribe({
        next: (value) => {
          this.enableProgress = false
          this.clear();
          this.dismiss.emit();
          let msg = "";
          if (value.status == 200) {
            msg = "Updated Successfully!";
          } else {
            msg = "Updation Failed!";
          }
          this.snackBar.open(msg, '', {
            duration: 1000,
            panelClass: 'snackbar-success',
            horizontalPosition: 'right',
            verticalPosition: 'top'
          })
        },

        error: (error) => {
          this.enableProgress = false
          console.log(error);
        },
      });
      this.uibInternalService.setAction('update')
    } else {
      const newProject = {
        requirements: [
          {
            requirementUUID: "r0001",
            description: "<p>ZxXX</p>",
          },
        ],
        name: this.projectForm.get(["projectName"]).value,
        projectUuid: this.projectUuid,
        epicCreateType: "new",
        description: this.projectForm.get(["description"]).value,
        status: "NEW",
        epicuuid: "",
        referenceName: this.projectForm.get(["projectName"]).value,
      };
      this.uibService.createUIBProject(newProject, this.projectUuid).subscribe({
        next: (value) => {
          this.enableProgress = false
          this.clear();
          this.dismiss.emit();
          let msg = "";
          let style = "";
          if (value.status == 200) {
            msg = "Created Successfully!";
            style = 'snackbar-success';
          } else {
            msg = "Creation Failed!";
            style = 'snackbar-failed'
          }
          this.snackBar.open(msg, '', {
            duration: 1000,
            panelClass: style,
            horizontalPosition: 'right',
            verticalPosition: 'top'
          })
        },
        error: (error) => {
          this.enableProgress = false
          console.log(error);
        },
      });
      this.uibInternalService.setAction('create')
    }
    this.dismiss.emit();
  }
}
