import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewEncapsulation,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { RequirementService } from "@app/core/projectservices/requirement.service";
import { UIBService } from "@app/core/projectservices/uib.service";

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

  @Output() triggerSaveButton = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private uibService: UIBService,
    private requirementService: RequirementService,
    private snackBar: MatSnackBar
  ) {}
  ngOnInit(): void {
    this.requirementService.findAllDesignTreeData().subscribe((data) => {
      this.projectUuid = data.body[0].projectuuid;
    });
  }

  clear() {
    this.isClear = true;
    this.projectForm.reset();
    Object.keys(this.projectForm.controls).forEach((key) => {
      this.projectForm.get(key).setErrors(null);
    });
    this.triggerSaveButton.emit();
  }

  onSubmit() {
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
        this.clear();
        this.triggerSaveButton.emit();
        let msg = "";
        if (value.status == 200) {
          msg = "Created Successfully!";
        } else {
          msg = "Creation Failed!";
        }
        this.snackBar.open(msg, "", {
          duration: 2000,
        });
      },

      error: (error) => {
        console.log(error);
      },
    });
  }
}
