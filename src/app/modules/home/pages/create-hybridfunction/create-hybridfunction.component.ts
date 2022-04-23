import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {ProjectService} from '@core/projectservices/project.service';
import {ActivatedRoute} from '@angular/router';
import {ICustomObject} from '@shared/models/model/custom-object.model';
import {IDatamodel} from '@shared/models/model/datamodel.model';
import {IViewmodel} from '@shared/models/model/viewmodel.model';
import {IAggregate} from '@shared/models/model/aggregate.model';
import {IHybridfunction,
  IHybridfunctionParameter,
  Hybridfunction, HybridfunctionParameter} from '@shared/models/model/hybridfunction.model';
import {IProject} from '@shared/models/model/project.model';
import {HybridfunctionService} from '@core/projectservices/hybrid-function.service';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import { Observable } from 'rxjs';
import {APIInput, APIInputType, APIParamType} from '@shared/models/model/api-input.model';
import {filter, map} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {EventManagerService} from '@shared/events/event.type';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {IEvent} from '@shared/models/model/microservice-event.model';
import {IApi} from '@shared/models/model/microservice-api.model';
interface Item {
  value: any;
  label: string;
}
@Component({
  selector: 'virtuan-create-hybridfunction',
  templateUrl: './create-hybridfunction.component.html',
  styleUrls: ['./create-hybridfunction.component.scss']
})
export class CreateHybridfunctionComponent implements OnInit {

  isSaving: boolean;
  // projectId: number;
  project: IProject;
  currentHybridfunction: IHybridfunction;
  returnItems: Item[];
  items: Item[];
  hybridfunctionParams: IHybridfunctionParameter[];
  aggregates: IAggregate[];
  viewmodels: IViewmodel[];
  datamodels: IDatamodel[] = [];
  customObjects: ICustomObject[];
  projectUid: string;

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

  displayedColumns: string[] = ['name', 'datatype', 'recordtype', 'actions'];
  ELEMENT_DATA: APIInput[] = [];
  dataSource = new MatTableDataSource(this.ELEMENT_DATA);

  editForm = this.fb.group({
    id: [],
    name: ['', [Validators.required]],
    returnObj: [],
    returnRecordType: [],
    paramName: [],
    paramDataType: [],
    paramRecordType: [],
  });

  onReturnObjChange() {
    const returnObjType = this.editForm.get(['returnRecordType']).value;
    if (returnObjType !== 's' && returnObjType !== 'm') {
      this.editForm.get('returnRecordType').patchValue('s', { emitEvent: true });
    }
  }

  constructor(
      protected hybridfunctionService: HybridfunctionService,
      protected activatedRoute: ActivatedRoute,
      private fb: FormBuilder,
      protected projectService: ProjectService,
      protected eventManager: EventManagerService,
      @Inject(MAT_DIALOG_DATA)  public data: any,
      public dialogRef: MatDialogRef<CreateHybridfunctionComponent>,
  ) {}

  ngOnInit(): void {
    this.getHybridFunctionData();
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (this.isVisible) {
  //     this.getHybridFunctionData();
  //   }
  // }

  getHybridFunctionData() {
    this.projectUid = this.data.projectUid;
    this.isSaving = false;
    this.returnItems = [];
    this.items = [];
    this.hybridfunctionParams = [];
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
          // id: this.customObjects[i].uuid,
          paramType: APIParamType.BODY,
          inputType: APIInputType.DTO,
          inputName: this.customObjects[i].name,
        };
        const returnObj: APIInput = {
          // id: this.customObjects[i].uuid,
          paramType: APIParamType.RETURN,
          inputType: APIInputType.DTO,
          inputName: this.customObjects[i].name,
        };
        this.items.push({ label: dropdownLabel, value: input });
        this.returnItems.push({ label: dropdownLabel, value: returnObj });
      }
    }
  }

  loadEntities() {
    for (let i = 0; i < this.datamodels.length; i++) {
      if (this.datamodels[i].status === 'ENABLED') {
        const dropdownLabel = this.datamodels[i].name;
        const input: APIInput = {
          // id: this.datamodels[i].uuid,
          paramType: APIParamType.BODY,
          inputType: APIInputType.MODEL,
          inputName: this.datamodels[i].name,
        };
        const returnObj: APIInput = {
          //  id: this.datamodels[i].uuid,
          paramType: APIParamType.RETURN,
          inputType: APIInputType.MODEL,
          inputName: this.datamodels[i].name,
        };
        this.items.push({ label: dropdownLabel, value: input });
        this.returnItems.push({ label: dropdownLabel, value: returnObj });
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
    const dropdownLabelAny = 'ANY';
    const anyReturnObj: APIInput = {
      id: '',
      paramType: APIParamType.RETURN,
      inputType: APIInputType.ANY,
      inputName: '_pa',
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
      const param: HybridfunctionParameter = {
        paramRecordType: paramType,
        inputName: paramDataType.inputName,
        inputType: paramDataType.inputType,
        paramName,
      };

      this.hybridfunctionParams.push(param);
      this.ELEMENT_DATA.push(param);
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    }
  }

  deleteRow(param) {
    const index = this.hybridfunctionParams.indexOf(param);
    this.hybridfunctionParams.splice(index, 1);

    const indexnum = this.ELEMENT_DATA.indexOf(param);
    this.ELEMENT_DATA.splice(indexnum, 1);
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
  }

  loadUpdateForm() {
    // const obj = JSON.parse(this.rowData);
    this.hybridfunctionService
        .find(this.data.uuid ,this.projectUid)
        .pipe(
            filter((mayBeOk: HttpResponse<IHybridfunction>) => mayBeOk.ok),
            map((response: HttpResponse<IHybridfunction>) => response.body)
        )
        .subscribe(
            (res: IApi) => {
              this.currentHybridfunction = res;
              this.updateForm(res);
            }
        );
  }

  updateForm(hybridfunction: IHybridfunction) {
    if (this.currentHybridfunction.params) {
      this.hybridfunctionParams = this.currentHybridfunction.params;

      this.ELEMENT_DATA = this.currentHybridfunction.params;
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    }

    this.editForm.patchValue({
      id: hybridfunction.uuid,
      name: hybridfunction.name,
      returnObj: hybridfunction.returnObj,
      returnRecordType: hybridfunction.returnRecordType,
    });
  }

  previousState() {
    // this.isVisibleEvent.emit(false);
  }

  save() {
    // this.spinnerService.show();
    this.isSaving = true;
    const hybridfunction = this.createFromForm();
    if (hybridfunction.uuid) {
      hybridfunction.status = this.currentHybridfunction.status;
      this.subscribeToSaveResponse(this.hybridfunctionService.update(hybridfunction, this.projectUid));
    } else {
      this.subscribeToSaveResponse(this.hybridfunctionService.create(hybridfunction, this.projectUid));
    }
  }

  private createFromForm(): IHybridfunction {
    return {
      ...new Hybridfunction(),
      uuid: this.editForm.get(['id']).value,
      params: this.hybridfunctionParams,
      name: this.editForm.get(['name']).value,
      projectUuid: this.projectUid,
      returnObj: this.editForm.get(['returnObj']).value,
      returnRecordType: this.editForm.get(['returnRecordType']).value,
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IHybridfunction>>) {
    result.subscribe(
        () => this.onSaveSuccess(),
        () => this.onSaveError()
    );
  }

  protected onSaveSuccess() {
    // this.spinnerService.hide();
    this.isSaving = false;
    this.eventManager.dispatch(
        new AppEvent(EventTypes.editorTreeListModification, {
          name: 'editorTreeListModification',
          content: 'Add an Hybrid Function',
        })
    );
    this.dialogRef.close();
    //this.previousState();
  }

  protected onSaveError() {
    // this.spinnerService.hide();
    this.isSaving = false;
  }
  protected onError(errorMessage: string) {
    // this.logger.error(errorMessage);
  }

}
