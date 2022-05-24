import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {APIInput, APIInputType, APIParamType, IAPIInput} from '@shared/models/model/api-input.model';
import {MatTableDataSource} from '@angular/material/table';
import {IProject} from '@shared/models/model/project.model';
import {ISubrule, ISubruleParameter, Subrule, SubruleParameter} from '@shared/models/model/subrule.model';
import {IAggregate} from '@shared/models/model/aggregate.model';
import {IDatamodel} from '@shared/models/model/datamodel.model';
import {ICustomObject} from '@shared/models/model/custom-object.model';
import {IViewmodel} from '@shared/models/model/viewmodel.model';
import {ActivatedRoute} from '@angular/router';
import {filter, map} from 'rxjs/operators';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SubruleService} from '@core/projectservices/sub-rule.service';
import {ProjectService} from '@core/projectservices/project.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {EventManagerService} from '@shared/events/event.type';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {IHybridfunction} from '@shared/models/model/hybridfunction.model';
import {IApi} from '@shared/models/model/microservice-api.model';
import {NgxSpinnerService} from 'ngx-spinner';
interface Item {
  value: any;
  label: string;
}
@Component({
  selector: 'virtuan-create-subrule',
  templateUrl: './create-subrule.component.html',
  styleUrls: ['./create-subrule.component.scss']
})
export class CreateSubruleComponent implements OnInit {

  projectUid: string;
  isSaving: boolean;
  project: IProject;
  currentSubrule: ISubrule;
  returnItems: Item[];
  items: Item[];
  subruleParams: ISubruleParameter[];
  aggregates: IAggregate[];
  viewmodels: IViewmodel[];
  datamodels: IDatamodel[] = [];
  customObjects: ICustomObject[];
  allReturnItems: IAPIInput[];

  typeSelected: string;

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
  ];


  displayedColumns: string[] = ['name', 'datatype', 'recordtype', 'actions'];
  dataSource: MatTableDataSource<APIInput>;

  editForm = this.fb.group({
    id: [],
    name: ['', [Validators.required]],
    returnObj: '',
    returnRecordType: '',
    paramName: '',
    paramDataType: '',
    paramRecordType: '',
  });

  constructor(
      private fb: FormBuilder,
      protected subruleService: SubruleService,
      protected activatedRoute: ActivatedRoute,
      protected projectService: ProjectService,
      public dialogRef: MatDialogRef<CreateSubruleComponent>,
      @Inject(MAT_DIALOG_DATA)  public data: any,
      private _snackBar: MatSnackBar,
      protected eventManager: EventManagerService,
      private spinnerService: NgxSpinnerService,
  ) {
    this.typeSelected = 'square-jelly-box';
  }

  ngOnInit(): void {
    this.spinnerService.hide();
    this.getSubRuleData();
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (this.isVisible) {
  //     this.getSubRuleData();
  //   }
  // }

  getSubRuleData() {
    this.projectUid = this.data.projectUid;
    this.isSaving = false;
    this.returnItems = [];
    this.allReturnItems = [];
    this.items = [];
    this.subruleParams = [];
    this.dataSource = new MatTableDataSource(this.subruleParams);
    this.addPrimitivesForReturnSelect();
    this.addPrimitivesForParamSelect();
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
                this.datamodels = this.project.datamodels;
                this.aggregates = this.project.aggregates;
                this.viewmodels = this.project.viewmodels;
                this.customObjects = this.project.customObjects;

                if (this.project.apptypesID === 'microservice') {
                  this.loadMicroserviceModels();
                } else if (this.project.apptypesID === 'virtuan.webapp-v2') {
                  this.loadWebappModels();
                }

                if (this.data.createStatus === 'Update') {
                  this.loadUpdateForm();
                }
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

  loadWebappModels() {
    if (this.datamodels) {
      this.loadEntities();
    }
    if (this.customObjects) {
      this.loadCustomObjects();
    }
  }

  loadCustomObjects() {
    for (let i = 0; i < this.customObjects.length; i++) {
      if (this.customObjects[i].status === 'ENABLED') {
        const dropdownLabel = this.customObjects[i].name;
        const input: APIInput = {
          id: this.customObjects[i].uuid,
          paramType: APIParamType.BODY,
          inputType: APIInputType.DTO,
          inputName: this.customObjects[i].name,
        };
        const returnObj: APIInput = {
          id: this.customObjects[i].uuid,
          paramType: APIParamType.RETURN,
          inputType: APIInputType.DTO,
          inputName: this.customObjects[i].name,
        };
        this.items.push({ label: dropdownLabel, value: input });
        this.returnItems.push({ label: dropdownLabel, value: returnObj });
        this.allReturnItems.push(returnObj);
      }
    }
  }

  loadEntities() {
    for (let i = 0; i < this.datamodels.length; i++) {
      if (this.datamodels[i].status === 'ENABLED') {
        const dropdownLabel = this.datamodels[i].name;
        const input: APIInput = {
          id: this.datamodels[i].uuid,
          paramType: APIParamType.BODY,
          inputType: APIInputType.MODEL,
          inputName: this.datamodels[i].name,
        };
        const returnObj: APIInput = {
          id: this.datamodels[i].uuid,
          paramType: APIParamType.RETURN,
          inputType: APIInputType.MODEL,
          inputName: this.datamodels[i].name,
        };
        this.items.push({ label: dropdownLabel, value: input });
        this.returnItems.push({ label: dropdownLabel, value: returnObj });
        this.allReturnItems.push(returnObj);
      }
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
    this.returnItems.push({ label: dropdownLabelText, value: stringReturnObj });
    this.returnItems.push({ label: dropdownLabelNumber, value: intReturnObj });
    this.returnItems.push({ label: dropdownLabelFloat, value: floatReturnObj });
    this.returnItems.push({ label: dropdownLabelBoolean, value: boolReturnObj });
    this.returnItems.push({ label: dropdownLabelDate, value: dateReturnObj });
    this.allReturnItems.push(stringReturnObj);
    this.allReturnItems.push(intReturnObj);
    this.allReturnItems.push(floatReturnObj);
    this.allReturnItems.push(boolReturnObj);
    this.allReturnItems.push(dateReturnObj);
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
    const dropdownLabelFile = 'FILE';
    const fileReturnObj: APIInput = {
      id: '',
      paramType: APIParamType.BODY,
      inputType: APIInputType.FILE,
      inputName: '_pfile',
    };
    this.items.push({ label: dropdownLabelText, value: stringReturnObj });
    this.items.push({ label: dropdownLabelNumber, value: intReturnObj });
    this.items.push({ label: dropdownLabelFloat, value: floatReturnObj });
    this.items.push({ label: dropdownLabelBoolean, value: boolReturnObj });
    this.items.push({ label: dropdownLabelDate, value: dateReturnObj });
    this.items.push({ label: dropdownLabelFile, value: fileReturnObj });
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
      const param: SubruleParameter = {
        paramRecordType: paramType,
        inputName: paramDataType.inputName,
        inputType: paramDataType.inputType,
        paramName,
      };

      this.subruleParams.push(param);
      this.dataSource = new MatTableDataSource(this.subruleParams);
    }
  }

  deleteRow(param) {
    const index = this.subruleParams.indexOf(param);
    this.subruleParams.splice(index, 1);
    this.dataSource = new MatTableDataSource(this.subruleParams);
  }

  loadUpdateForm() {
    this.subruleService
        .find(this.data.uuid ,this.projectUid)
        .pipe(
            filter((mayBeOk: HttpResponse<IHybridfunction>) => mayBeOk.ok),
            map((response: HttpResponse<IHybridfunction>) => response.body)
        )
        .subscribe(
            (res: IApi) => {
              this.currentSubrule = res;
              this.updateForm(res);
            }
        );
    // const obj = JSON.parse(this.rowData);
  }

  updateForm(subrule: ISubrule) {
    if (this.currentSubrule.params) {
      this.subruleParams = this.currentSubrule.params;
      this.dataSource = new MatTableDataSource(this.subruleParams);
    }
    let returnObj: APIInput;

    if (subrule.returnObj) {
      returnObj = this.allReturnItems.find(
          item => item.inputType === subrule.returnObj.inputType && item.inputName === subrule.returnObj.inputName
      );
    } else {
      returnObj = subrule.returnObj;
    }

    this.editForm.patchValue({
      id: subrule.uuid,
      name: subrule.name,
      returnObj: returnObj,
      returnRecordType: subrule.returnRecordType,
    });
  }

  previousState() {
    // this.isVisibleEvent.emit(false);
  }

  save() {
    this.spinnerService.show();
    this.isSaving = true;
    const subrule = this.createFromForm();
    if (subrule.uuid) {
      subrule.status = this.currentSubrule.status;
      this.subscribeToSaveResponse(this.subruleService.update(subrule, this.projectUid));
    } else {
      this.subscribeToSaveResponse(this.subruleService.create(subrule, this.projectUid));
    }
  }

  private createFromForm(): ISubrule {
    return {
      ...new Subrule(),
      uuid: this.editForm.get(['id']).value,
      params: this.subruleParams,
      name: this.editForm.get(['name']).value,
      projectUuid: this.projectUid,
      returnObj: this.editForm.get(['returnObj']).value,
      returnRecordType: this.editForm.get(['returnRecordType']).value,
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ISubrule>>) {
    result.subscribe(
        () => this.onSaveSuccess(),
        () => this.onSaveError()
    );
  }

  protected onSaveSuccess() {
    this.spinnerService.hide();
    this.isSaving = false;
    this.eventManager.dispatch(
        new AppEvent(EventTypes.editorTreeListModification, {
          name: 'editorTreeListModification',
          content: 'Add an SubRule',
        })
    );
    this.dialogRef.close();
    this._snackBar.open('Saved successfully!', 'Close');
    // this.previousState();
  }

  protected onSaveError() {
    this.spinnerService.hide();
    this.isSaving = false;
    this._snackBar.open('Error occurred while saving!', 'Close');
  }
  protected onError(errorMessage: string) {
    this._snackBar.open('Error occurred while saving!', 'Close');
    // this.logger.error(errorMessage);
  }

}
