import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ElementRef,
  QueryList,
} from '@angular/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
// import { NGXLogger } from 'ngx-logger';
import { FileUpload } from 'primeng/fileupload';
import { ITheme, Theme } from '@shared/models/model/theme.model';
import { ThemeService } from './theme.service';
// import { ToolbarTrackerService } from 'app/core';
import { ProjectService } from '@core/projectservices/project.service';
import { IProject } from '@shared/models/model/project.model';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'virtuan-theme-update',
  templateUrl: './theme-update.component.html',
  styleUrls: ['./theme.scss'],
})
export class ThemeUpdateComponent implements OnDestroy, OnInit {
  @ViewChild('fileInput') fileInput: FileUpload;

  // @Input('projectUid') projectUid: string;
  // @Input('themeId') themeId: string;
  // @Input('rowValues') rowValues: string;
  // @Input('creatStatus') creatStatus: string;
  // @Input('isVisible') isVisible: boolean;
  @Input() projectUid: string;
  @Input() pageId: string;
  @Output() isVisibleEvent = new EventEmitter<boolean>();

  @ViewChild('defaultOpen') defaultOpen: ElementRef;
  element: HTMLElement;
  rowValues: string;
  currentTheme: ITheme;
  themeId: string;
  isSaving: boolean;
  useDefaults: boolean;
  defaultValues = {
    themestyle: 'round',
    inputStyle: 'materialDesign',
    buttonTheme: 'themeStyle1',
    toolbarposition: 'fixed',
    footerposition: 'fixed',
    themeselected: true,
    footervisibility: true,
    primaryColor: '#1a202e',
    primaryLightColor: '#ffffff',
    primaryMediumColor: '#141924',
    secondaryColor: '#5c77ff',
    secondaryMediumColor: '#5c77ff',
  };

  // projectId: number;
  project: IProject;
  // projectUid: string;

  editForm = this.fb.group({
    id: [],
    themestyle: [],
    inputStyle: [],
    buttonTheme: [],
    toolbarposition: [],
    footerposition: [],
    footervisibility: [],
    themeselected: [],
    primaryColor: [],
    primaryLightColor: [],
    primaryMediumColor: [],
    secondaryColor: [],
    secondaryMediumColor: [],
  });

  constructor(
    // private logger: NGXLogger,
    protected themeService: ThemeService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    // protected toolbarTrackerService: ToolbarTrackerService,
    protected projectService: ProjectService,
    private spinnerService: NgxSpinnerService
  ) {
    // this.toolbarTrackerService.setIsEntityPage('yes');
  }

  ngOnInit() {
    this.navigate('general');
    this.getThemeData();

  }

  getThemeData() {
    if(this.rowValues) {
      const obj = JSON.parse(this.rowValues);
      this.currentTheme = obj;
      this.useDefaults = obj.default;
      this.isSaving = false;
      this.updateForm(obj);
    }
  }

  updateForm(theme: ITheme) {
    this.useDefaults = theme.default;
    if (theme.footervisibility) {
      this.editForm.patchValue({
        id: theme.uuid,
        default: theme.default,
        themestyle: theme.themestyle,
        inputStyle: theme.inputStyle,
        buttonTheme: theme.buttonTheme,
        toolbarposition: theme.toolbarposition,
        footerposition: theme.footerposition,
        themeselected: theme.themeselected,
        footervisibility: theme.footervisibility,
        primaryColor: theme.primaryColor,
        primaryLightColor: theme.primaryLightColor,
        primaryMediumColor: theme.primaryMediumColor,
        secondaryColor: theme.secondaryColor,
        secondaryMediumColor: theme.secondaryMediumColor,
      });
    } else {
      this.editForm.patchValue({
        id: theme.uuid,
        themestyle: theme.themestyle,
        inputStyle: theme.inputStyle,
        buttonTheme: theme.buttonTheme,
        toolbarposition: theme.toolbarposition,
        footerposition: theme.footerposition,
        themeselected: theme.themeselected,
        footervisibility: false,
        primaryColor: theme.primaryColor,
        primaryLightColor: theme.primaryLightColor,
        primaryMediumColor: theme.primaryMediumColor,
        secondaryColor: theme.secondaryColor,
        secondaryMediumColor: theme.secondaryMediumColor,
      });
    }
    this.enableDisableForm(false);
  }

  previousState() {
    this.isVisibleEvent.emit(false);
  }

  save() {
    this.spinnerService.show();
    this.isSaving = true;
    const theme = this.createFromForm();
    if (theme.uuid) {
      theme.name = this.currentTheme.name;
      this.subscribeToSaveResponse(this.themeService.update(theme, this.projectUid));
    } else {
      this.subscribeToSaveResponse(this.themeService.create(theme, this.projectUid));
    }
  }

  private createFromForm(): ITheme {
    return {
      ...new Theme(),
      uuid: this.editForm.get(['id']).value,
      themestyle: this.editForm.get(['themestyle']).value,
      inputStyle: this.editForm.get(['inputStyle']).value,
      buttonTheme: this.editForm.get(['buttonTheme']).value,
      default: this.useDefaults,
      layoutorientationRTL: false,
      toolbarposition: this.editForm.get(['toolbarposition']).value,
      footerposition: this.editForm.get(['footerposition']).value,
      footervisibility: this.editForm.get(['footervisibility']).value,
      themeselected: this.editForm.get(['themeselected']).value,
      primaryColor: this.editForm.get(['primaryColor']).value,
      primaryLightColor: this.editForm.get(['primaryLightColor']).value,
      primaryMediumColor: this.editForm.get(['primaryMediumColor']).value,
      secondaryColor: this.editForm.get(['secondaryColor']).value,
      secondaryMediumColor: this.editForm.get(['secondaryMediumColor']).value,
      projectUuid: this.projectUid,
    };
  }

  changeDefaults(event) {
    this.useDefaults = event;
    this.enableDisableForm(true);
  }

  enableDisableForm(reset) {
    if (this.useDefaults) {
      if (reset) {
        this.resetToDefaults();
      }
      this.editForm.disable();
    } else {
      this.editForm.enable();
    }
  }

  resetToDefaults() {
    this.editForm.patchValue({
      themestyle: this.defaultValues.themestyle,
      inputStyle: this.defaultValues.inputStyle,
      buttonTheme: this.defaultValues.buttonTheme,
      toolbarposition: this.defaultValues.toolbarposition,
      footerposition: this.defaultValues.footerposition,
      themeselected: this.defaultValues.themeselected,
      footervisibility: this.defaultValues.footervisibility,
      primaryColor: this.defaultValues.primaryColor,
      primaryLightColor: this.defaultValues.primaryLightColor,
      primaryMediumColor: this.defaultValues.primaryMediumColor,
      secondaryColor: this.defaultValues.secondaryColor,
      secondaryMediumColor: this.defaultValues.secondaryMediumColor,
    });
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITheme>>) {
    result.subscribe(
      (res: any) => {
        let savedTheme: ITheme = res.body;
        this.uploadLogo(savedTheme.uuid);
        this.onSaveSuccess();
      },
      () => this.onSaveError()
    );
  }

  uploadLogo(themeId) {
    const formData = new FormData();
    if (this.fileInput.files.length > 0) {
      this.fileInput.files.forEach(file => {
        formData.append('file', file);
      });
      this.subscribeToSaveImageResponse(this.themeService.imageUpload(formData, themeId, this.projectUid));
    }
  }

  protected subscribeToSaveImageResponse(result: Observable<HttpResponse<any>>) {
    result.subscribe(
      () => this.onSaveImageSuccess(),
      () => this.onSaveImageError()
    );
  }

  protected onSaveImageSuccess() {}

  protected onSaveImageError() {}

  protected onSaveSuccess() {
    this.spinnerService.hide();
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError() {
    this.spinnerService.hide();
    this.isSaving = false;
  }
  protected onError(errorMessage: string) {
    // this.logger.error(errorMessage);
  }

  ngOnDestroy() {
    // this.toolbarTrackerService.setProjectUUID('');
    // this.toolbarTrackerService.setIsEntityPage('no');
  }

  navigate(tabName) {
    let i;
    const tabcontent = document.querySelectorAll('.tab-contentx');
    for (i = 0; i < tabcontent.length; i++) {
      const tabContent = tabcontent[i] as HTMLElement;
      tabContent.style.display = 'none';
    }

    const tablinks = document.querySelectorAll('.tablinksx');
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(' active', '');
    }
    this.element = document.getElementById(tabName) as HTMLElement;
    this.element.style.display = 'block';
    this.element.classList.add('active');
  }
}
