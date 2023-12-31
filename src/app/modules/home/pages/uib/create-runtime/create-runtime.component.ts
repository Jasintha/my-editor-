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

@Component({
  selector: "create-uib-runtime",
  templateUrl: "./create-runtime.component.html",
  styleUrls: ["./create-runtime.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class CreateRuntimeComponent implements OnInit {
  purposes = ["Integration"];
  revisionTypes = ['Branch', 'Main']

  runtimeForm = this.fb.group({
    runtimeName: ["", Validators.required],
    category: [null, Validators.required],
    repoUrl: ["", Validators.required],
    revision: ["", Validators.required],
    revisionType:  [null, Validators.required],
    path: ["", Validators.required],
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
      this.runtimeForm.patchValue({
        category: this.purposes[0]
      })
    } else {
      this.requirementService.findAllDesignTreeData().subscribe((data) => {
        this.projectUuid = data.body[0].projectuuid;
      });
    }
  }

  clear() {
    this.isClear = true;
    this.runtimeForm.reset();
    Object.keys(this.runtimeForm.controls).forEach((key) => {
      this.runtimeForm.get(key).setErrors(null);
    });
    this.dismiss.emit();
  }

  onSubmit() {
    console.log(this.runtimeForm.controls)
    this.enableProgress = true;
    const newRuntime = {
      runtimeName: this.runtimeForm.get(["runtimeName"]).value,
      category: this.runtimeForm.get(["category"]).value,
      repoUrl: this.runtimeForm.get(["repoUrl"]).value,
      revision: this.runtimeForm.get(["revision"]).value,
      revisionType: this.runtimeForm.get(["revisionType"]).value,
      path: this.runtimeForm.get(["path"]).value,
    };
      this.uibService.createUIBRuntime(newRuntime).subscribe({
        next: (value) => {
          this.enableProgress = false
          this.clear();
          this.dismiss.emit();
          let msg = "";
          if (value.status == 200) {
            msg = "Runtime Created Successfully!";
          } else {
            msg = "Creation Failed!";
          }
          this.snackBar.open(msg, '', {
            duration: 500,
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
      this.uibInternalService.setAction('create')
  }
}
