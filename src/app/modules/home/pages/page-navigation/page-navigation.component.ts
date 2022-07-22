import {Component, Inject, Input, OnInit} from '@angular/core';
import { IPage } from '@app/shared/models/model/page.model';
import {INavigationParam, IPageNavigation, NavigationParam, PageNavigation, PageParam} from '@shared/models/model/page-navigation.model';
import {SelectItem} from 'primeng/api';
import {IProject} from '@shared/models/model/project.model';
import {FormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EventManagerService} from '@shared/events/event.type';
import {APIInput} from '@shared/models/model/api-input.model';
import {MatTableDataSource} from '@angular/material/table';
import {BuiltInPageService} from '@core/projectservices/built-in-page.service';
import {ActivatedRoute} from '@angular/router';
import {ProjectService} from '@core/projectservices/project.service';
import {PageNavigationService} from '@core/projectservices/page-navigation.service';
import {Observable} from 'rxjs';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {IEvent} from '@shared/models/model/microservice-event.model';
import {filter, map} from 'rxjs/operators';
import {IProperty} from '@shared/models/model/property.model';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {IMainMenu} from '@shared/models/model/main-menu.model';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'virtuan-page-navigation',
  templateUrl: './page-navigation.component.html',
  styleUrls: ['./page-navigation.component.scss']
})
export class PageNavigationComponent implements OnInit {
  currentPage: IPage;
  isSaving: boolean;
  allpages: IPage[];
  pages: SelectItem[];
  eventItems: SelectItem[];
  modelProperties: SelectItem[];
  // projectId: number;
  project: IProject;
  navigationParams: INavigationParam[];
  projectUid: string;
  eventType: SelectItem[] = [
    { label: 'On load', value: 'e0' },
    { label: 'Click on Item', value: 'e1' },
  ];

  displayedColumns: string[] = ['name', 'property' ,'actions'];
  ELEMENT_DATA: NavigationParam[] = [];
  dataSource = new MatTableDataSource(this.ELEMENT_DATA);
  typeSelected: string;

  editForm = this.fb.group({
    id: [],
    event: [''],
    paramName: [],
    paramProperty: [],
  });

  constructor(
      protected pageNavigationService: PageNavigationService,
      protected pageService: BuiltInPageService,
      protected activatedRoute: ActivatedRoute,
      private fb: FormBuilder,
      protected projectService: ProjectService,
      public dialogRef: MatDialogRef<PageNavigationComponent>,
      @Inject(MAT_DIALOG_DATA)  public data: any,
      protected eventManager: EventManagerService,
      private spinnerService: NgxSpinnerService,
  ) {
    this.typeSelected = 'square-jelly-box';
  }

  ngOnInit(): void {
    this.updateForm();
    if (this.data.currentPage) {
      this.editForm.patchValue({
        fromPage: this.data.currentPage
      })
      this.setPageProperties();
    }
  }

  async updateForm() {
    if( this.data && this.data.navigationParams){
      this.navigationParams = this.data.navigationParams;
      this.ELEMENT_DATA =  this.navigationParams;
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    }
  }

  previousState() {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.navigationParams);
  }

  addRow() {
    const paramName = this.editForm.get(['paramName']).value;
    const paramProperty = this.editForm.get(['paramProperty']).value;

    if (paramName === '' || paramName === null || paramProperty === null) {
      // this.messageService.add({
      //   severity: 'warn',
      //   summary: 'Warn',
      //   detail: 'Please fill all the fields',
      // });
    } else {
      const param: NavigationParam = {
        name: paramName,
        value: paramProperty,
      };

      this.navigationParams.push(param);
      this.ELEMENT_DATA.push(param);
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    }
  }

  setPageProperties() {
    this.modelProperties = [];
    this.navigationParams = [];
    const currentPage: IPage = this.data.currentPage;
    let currentDatamodeProperties: IProperty[];
    if (currentPage.pagetype === 'api-page') {
      currentDatamodeProperties = currentPage.model.config.children;
      for (let i = 0; i < currentDatamodeProperties.length; i++) {
        if (currentDatamodeProperties[i].data.type === 'property') {
          const dropdownLabel = currentDatamodeProperties[i].label.toLowerCase( );
          this.modelProperties.push({ label: dropdownLabel, value: dropdownLabel });
        }
      }
    }
  }

  deleteRow(param) {
    const indexnum = this.ELEMENT_DATA.indexOf(param);
    this.ELEMENT_DATA.splice(indexnum, 1);
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);

    const index = this.navigationParams.indexOf(param);
    this.navigationParams.splice(index, 1);
  }
}
