import {Component, Inject, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {FormBuilder, Validators} from '@angular/forms';
import {ProjectService} from '@core/projectservices/project.service';
import {IViewmodel} from '@shared/models/model/viewmodel.model';
import {IAggregate} from '@shared/models/model/aggregate.model';
import {ILamdafunction, ILamdafunctionParameter, Lamdafunction, LamdafunctionParameter} from '@shared/models/model/lamdafunction.model';
import {APIInput, APIInputType, APIParamType, IAPIInput} from '@shared/models/model/api-input.model';
import {IProject} from '@shared/models/model/project.model';
import {LamdafunctionService} from '@core/projectservices/function.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {filter, map} from 'rxjs/operators';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {MatTableDataSource} from '@angular/material/table';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {EventManagerService} from '@shared/events/event.type';
interface Item {
  value: any;
  label: string;
}
@Component({
  selector: 'virtuan-create-lamdafunction',
  templateUrl: './create-lamdafunction.component.html',
  styleUrls: ['./create-lamdafunction.component.scss']
})
export class CreateLamdafunctionComponent implements OnInit {

  isSaving: boolean;
  project: IProject;
  currentLamdafunction: ILamdafunction;
  returnItems: Item[];
  allReturnItems: IAPIInput[];
  items: Item[];
  lamdafunctionParams: ILamdafunctionParameter[];
  aggregates: IAggregate[];
  viewmodels: IViewmodel[];
  projectUid: string;

  displayedColumns: string[] = ['name', 'datatype', 'recordtype', 'actions'];
  ELEMENT_DATA: APIInput[] = [];
  dataSource = new MatTableDataSource(this.ELEMENT_DATA);

  languageItems: Item[] = [
    { label: 'Golang', value: 'go' },
    { label: 'JavaScript', value: 'javascript' },
  ];

  paramRecorditems: Item[] = [
    { label: 'Single', value: 's' },
    { label: 'Multiple', value: 'm' },
  ];
  paramDataTypeItems: Item[] = [
    { label: 'TEXT', value: 'TEXT' },
    { label: 'NUMBER', value: 'NUMBER' },
    { label: 'FLOAT', value: 'FLOAT' },
    { label: 'TRUE_OR_FALSE', value: 'TRUE_OR_FALSE' },
    { label: 'DATE', value: 'DATE' },
    { label: 'ANY', value: 'ANY' },
  ];

  editForm = this.fb.group({
    id: [],
    name: ['', [Validators.required]],
    language: ['', [Validators.required]],
    returnObj: [],
    returnRecordType: [],
    paramName: [],
    paramDataType: [],
    paramRecordType: [],
  });

  constructor(
      protected lamdafunctionService: LamdafunctionService,
      protected activatedRoute: ActivatedRoute,
      private fb: FormBuilder,
      protected projectService: ProjectService,
      protected eventManager: EventManagerService,
      public dialogRef: MatDialogRef<CreateLamdafunctionComponent>,
      @Inject(MAT_DIALOG_DATA)  public data: any,
  ) {}


  ngOnInit(): void {
    this.getFunctionData();
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (this.isVisible) {
  //     this.getFunctionData();
  //   }
  // }

  getFunctionData() {
    this.projectUid = this.data.projectUid;
    this.isSaving = false;
    this.returnItems = [];
    this.allReturnItems = [];
    this.items = [];
    this.lamdafunctionParams = [];
    this.addPrimitivesForReturnSelect();
    // this.addPrimitivesForParamSelect();
    if (this.projectUid) {
      this.projectService
          .findWithModelsAndEvents(this.projectUid)
          .pipe(
              filter((res: HttpResponse<IProject>) => res.ok),
              map((res: HttpResponse<IProject>) => res.body)
          )
          .subscribe(
              (res: IProject) => {
                this.project = res;
                this.aggregates = this.project.aggregates;
                this.viewmodels = this.project.viewmodels;
                this.loadMicroserviceModels();
                if (this.aggregates) {
                  // this.loadAggregates();
                }
                if (this.viewmodels) {
                  // this.loadViewmodels();
                }
                // if (this.createStatus == 'update') {
                //   this.loadUpdateForm();
                // }
              },
              (res: HttpErrorResponse) => this.onError(res.message)
          );
    }
  }

  onReturnObjChange() {
    const returnObjType = this.editForm.get(['returnRecordType']).value;
    if (returnObjType !== 's' && returnObjType !== 'm') {
      this.editForm.get('returnRecordType').patchValue('s', { emitEvent: true });
    }
  }

  loadMicroserviceModels() {
    if (this.aggregates) {
      this.loadAggregates();
    }
    if (this.viewmodels) {
      this.loadViewmodels();
    }
  }

  loadAggregates() {
    for (let i = 0; i < this.aggregates.length; i++) {
      if (this.aggregates[i].status === 'ENABLED') {
        const dropdownLabel = this.aggregates[i].name;
        let type: APIInputType;

        if (this.aggregates[i].type === 'MODEL') {
          type = APIInputType.MODEL;
        } else {
          type = APIInputType.DTO;
        }
        const input = {
          id: this.aggregates[i].uuid,
          paramType: APIParamType.BODY,
          inputType: type,
          inputName: this.aggregates[i].name,
        };
        const returnObj = {
          id: this.aggregates[i].uuid,
          paramType: APIParamType.RETURN,
          inputType: type,
          inputName: this.aggregates[i].name,
        };
        this.items.push({ label: dropdownLabel, value: input });
        this.returnItems.push({ label: dropdownLabel, value: returnObj });
        this.allReturnItems.push(returnObj);
      }
    }
  }

  loadViewmodels() {
    for (let i = 0; i < this.viewmodels.length; i++) {
      if (this.viewmodels[i].status === 'ENABLED') {
        const dropdownLabel = this.viewmodels[i].name;
        const input = {
          id: this.viewmodels[i].uuid,
          paramType: APIParamType.BODY,
          inputType: APIInputType.DTO,
          inputName: this.viewmodels[i].name,
        };
        const returnObj = {
          id: this.viewmodels[i].uuid,
          paramType: APIParamType.RETURN,
          inputType: APIInputType.DTO,
          inputName: this.viewmodels[i].name,
        };
        this.items.push({ label: dropdownLabel, value: input });
        this.returnItems.push({ label: dropdownLabel, value: returnObj });
        this.allReturnItems.push(returnObj);
      }
    }
  }
  addPrimitivesForReturnSelect() {
    const dropdownLabelText = 'TEXT';
    const stringReturnObj: APIInput = {
      id: '',
      paramType: APIParamType.RETURN,
      inputType: APIInputType.TEXT,
      inputName: '_s',
    };
    const dropdownLabelNumber = 'NUMBER';
    const intReturnObj: APIInput = {
      id: '',
      paramType: APIParamType.RETURN,
      inputType: APIInputType.NUMBER,
      inputName: '_i',
    };
    const dropdownLabelFloat = 'FLOAT';
    const floatReturnObj: APIInput = {
      id: '',
      paramType: APIParamType.RETURN,
      inputType: APIInputType.FLOAT,
      inputName: '_f',
    };
    const dropdownLabelBoolean = 'TRUE_OR_FALSE';
    const boolReturnObj: APIInput = {
      id: '',
      paramType: APIParamType.RETURN,
      inputType: APIInputType.TRUE_OR_FALSE,
      inputName: '_b',
    };
    const dropdownLabelDate = 'DATE';
    const dateReturnObj: APIInput = {
      id: '',
      paramType: APIParamType.RETURN,
      inputType: APIInputType.DATE,
      inputName: '_t',
    };
    const dropdownLabelAny = 'ANY';
    const anyReturnObj: APIInput = {
      id: '',
      paramType: APIParamType.RETURN,
      inputType: APIInputType.ANY,
      inputName: '_a',
    };

    this.returnItems.push({ label: dropdownLabelText, value: stringReturnObj });
    this.returnItems.push({ label: dropdownLabelNumber, value: intReturnObj });
    this.returnItems.push({ label: dropdownLabelFloat, value: floatReturnObj });
    this.returnItems.push({ label: dropdownLabelBoolean, value: boolReturnObj });
    this.returnItems.push({ label: dropdownLabelDate, value: dateReturnObj });
    this.returnItems.push({ label: dropdownLabelAny, value: anyReturnObj });

    this.allReturnItems.push(stringReturnObj);
    this.allReturnItems.push(intReturnObj);
    this.allReturnItems.push(floatReturnObj);
    this.allReturnItems.push(boolReturnObj);
    this.allReturnItems.push(dateReturnObj);
    this.allReturnItems.push(anyReturnObj);
  }

  addPrimitivesForParamSelect() {
    const dropdownLabelText = 'TEXT';
    const stringReturnObj: APIInput = {
      id: '',
      paramType: APIParamType.BODY,
      inputType: APIInputType.TEXT,
      inputName: '_ps',
    };
    const dropdownLabelNumber = 'NUMBER';
    const intReturnObj: APIInput = {
      id: '',
      paramType: APIParamType.BODY,
      inputType: APIInputType.NUMBER,
      inputName: '_pi',
    };
    const dropdownLabelFloat = 'FLOAT';
    const floatReturnObj: APIInput = {
      id: '',
      paramType: APIParamType.BODY,
      inputType: APIInputType.FLOAT,
      inputName: '_pf',
    };
    const dropdownLabelBoolean = 'TRUE_OR_FALSE';
    const boolReturnObj: APIInput = {
      id: '',
      paramType: APIParamType.BODY,
      inputType: APIInputType.TRUE_OR_FALSE,
      inputName: '_pb',
    };
    const dropdownLabelDate = 'DATE';
    const dateReturnObj: APIInput = {
      id: '',
      paramType: APIParamType.BODY,
      inputType: APIInputType.DATE,
      inputName: '_pt',
    };
    this.items.push({ label: dropdownLabelText, value: stringReturnObj });
    this.items.push({ label: dropdownLabelNumber, value: intReturnObj });
    this.items.push({ label: dropdownLabelFloat, value: floatReturnObj });
    this.items.push({ label: dropdownLabelBoolean, value: boolReturnObj });
    this.items.push({ label: dropdownLabelDate, value: dateReturnObj });
  }

  addRow() {
    const paramType = this.editForm.get(['paramRecordType']).value;
    const paramName = this.editForm.get(['paramName']).value;
    const paramDataType = this.editForm.get(['paramDataType']).value;

    if (paramType === null || paramName === '' || paramName === null || paramDataType === null) {
      // this.messageService.add({
      //   severity: 'warn',
      //   summary: 'Warn',
      //   detail: 'Please fill all the fields',
      // });
    } else {
      const param: LamdafunctionParameter = {
        paramRecordType: paramType,
        inputType: paramDataType,
        inputName: paramName,
      };

      this.lamdafunctionParams.push(param);
      this.ELEMENT_DATA.push(param);
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    }
  }

  deleteRow(param) {
    const index = this.lamdafunctionParams.indexOf(param);
    this.lamdafunctionParams.splice(index, 1);

    const indexnum = this.ELEMENT_DATA.indexOf(param);
    this.ELEMENT_DATA.splice(indexnum, 1);
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
  }

  // loadUpdateForm() {
  //   const obj = JSON.parse(this.rowData);
  //   this.currentLamdafunction = obj;
  //   this.updateForm(obj);
  // }

  updateForm(lamdafunction: ILamdafunction) {
    if (this.currentLamdafunction.params) {
      this.lamdafunctionParams = this.currentLamdafunction.params;
    }

    let returnObj: APIInput;

    if (lamdafunction.returnObj) {
      returnObj = this.allReturnItems.find(
          item => item.inputType === lamdafunction.returnObj.inputType && item.inputName === lamdafunction.returnObj.inputName
      );
    } else {
      returnObj = lamdafunction.returnObj;
    }

    this.editForm.patchValue({
      id: lamdafunction.uuid,
      name: lamdafunction.name,
      language: lamdafunction.language,
      returnObj,
      returnRecordType: lamdafunction.returnRecordType,
    });
  }

  previousState() {
    this.eventManager.dispatch(
        new AppEvent(EventTypes.editorTreeListModification, {
          name: 'editorTreeListModification',
          content: 'Add an API',
        })
    );
    // this.isVisibleEvent.emit(false);
    this.dialogRef.close();
  }

  save() {
    // this.spinnerService.show();
    this.isSaving = true;
    const lamdafunction = this.createFromForm();
    if (lamdafunction.uuid) {
      lamdafunction.status = this.currentLamdafunction.status;
      lamdafunction.fnType = this.currentLamdafunction.fnType;
      lamdafunction.methodType = this.currentLamdafunction.methodType;
      this.subscribeToSaveResponse(this.lamdafunctionService.update(lamdafunction, this.projectUid));
    } else {
      this.subscribeToSaveResponse(this.lamdafunctionService.create(lamdafunction, this.projectUid));
    }
  }

  private createFromForm(): ILamdafunction {
    return {
      ...new Lamdafunction(),
      uuid: this.editForm.get(['id']).value,
      params: this.lamdafunctionParams,
      name: this.editForm.get(['name']).value,
      language: this.editForm.get(['language']).value,
      projectUuid: this.projectUid,
      returnObj: this.editForm.get(['returnObj']).value,
      returnRecordType: this.editForm.get(['returnRecordType']).value,
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ILamdafunction>>) {
    result.subscribe(
        () => this.onSaveSuccess(),
        () => this.onSaveError()
    );
  }

  protected onSaveSuccess() {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError() {
    this.isSaving = false;
  }
  protected onError(errorMessage: string) {
    // this.logger.error(errorMessage);
  }


}
