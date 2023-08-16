import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { RequirementService } from "@app/core/projectservices/requirement.service";
import { UIBService } from "@app/core/projectservices/uib.service";
import { da } from "date-fns/locale";


@Component({
    selector: "create-uib-project",
    templateUrl: "./create-project.component.html",
    styleUrls: [
      "./create-project.component.scss",
    ],
    encapsulation: ViewEncapsulation.None,
  })
export class CreateProjectComponent implements OnInit{
    purposes = [
        'Integration'
    ]

    projectForm = this.fb.group({
        projectName: ['', Validators.required],
        description: ['', Validators.required],
        purpose: [null, Validators.required],
    })

    projectUuid: string

    constructor(private fb: FormBuilder, private uibService: UIBService, private requirementService: RequirementService){}
  ngOnInit(): void {
    this.requirementService.findAllDesignTreeData().subscribe((data)=>{
      this.projectUuid = data.body[0].projectuuid
    })
  }

        
  updateProfile() {
    this.projectForm.patchValue({
        projectName: '',
        description: '',
        purpose: this.purposes[0]
    });
  }

  onSubmit() {
    const newProject = {
    requirements: [
        {
            requirementUUID: "r0001",
            description: "<p>ZxXX</p>"
        }
    ],
    name: this.projectForm.get(['projectName']).value, 
    projectUuid: this.projectUuid,
    epicCreateType: "new",
    description: this.projectForm.get(['description']).value,
    status: "NEW",
    epicuuid: "",
    referenceName: this.projectForm.get(['projectName']).value, 
    }
    this.uibService.createUIBProject(newProject, this.projectUuid).subscribe((value)=> {
      console.log(value)
    })
  }
}