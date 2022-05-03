import {
  AfterViewInit,
  Component,
  ComponentRef,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  EventEmitter,
  ViewChild,
  Inject,
  ViewContainerRef
} from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, Validators, AbstractControl } from '@angular/forms';
import {
  IRuleNodeConfigurationComponent,
  RuleNodeConfiguration,
  RuleNodeDefinition
} from '@shared/models/rule-node.models';
import { Subscription } from 'rxjs';
import { RuleChainService } from '@core/http/rule-chain.service';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { TranslateService } from '@ngx-translate/core';
import { JsonObjectEditComponent } from '@shared/components/json-object-edit.component';
import { deepClone } from '@core/utils';
import { SelectItem } from 'primeng/api';
import { Observable } from 'rxjs';
import { PageComponent } from '@shared/components/page.component';
import { Store } from '@ngrx/store';
import { AppState } from '@core/core.state';
import {MatTableDataSource} from '@angular/material/table';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {StoryService} from '@core/projectservices/story-technical-view.service';
import {filter, map} from 'rxjs/operators';

@Component({
  selector: 'virtuan-screen-node-config',
  templateUrl: './screen-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ScreenNodeConfigComponent),
    multi: true
  }]
})
export class ScreenNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

  @ViewChild('definedConfigContent', {read: ViewContainerRef, static: true}) definedConfigContainer: ViewContainerRef;

  private requiredValue: boolean;
  get required(): boolean {
    return this.requiredValue;
  }
  @Input()
  set required(value: boolean) {
    this.requiredValue = coerceBooleanProperty(value);
  }

  @Input()
  disabled: boolean;

  @Input()
  allActors: any[];

  @Input()
  ruleNodeId: string;

  nodeDefinitionValue: RuleNodeDefinition;

  isSaving: boolean;
  data: any;
  projectUid: string;
  createType: string;
  pageTemplateItems: any[];
  existingPortals: any[];
  selectedPortal: any;
  selectedScreen: any;

  actionItems: any[] = [];

  @Input()
  set nodeDefinition(nodeDefinition: RuleNodeDefinition) {
    if (this.nodeDefinitionValue !== nodeDefinition) {
      this.nodeDefinitionValue = nodeDefinition;
      if (this.nodeDefinitionValue) {
       // this.validateDefinedDirective();
      }
    }
  }

  get nodeDefinition(): RuleNodeDefinition {
    return this.nodeDefinitionValue;
  }

  definedDirectiveError: string;

  screenNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

//   displayedColumns: string[] = ['actorName', 'permissionLevel', 'actions'];

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              protected storyService: StoryService,
              private fb: FormBuilder) {
    this.screenNodeConfigFormGroup = this.fb.group({
      screenName: '',
      screenTemplate: '',
      screeActions: []
    });
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  loadPortals() {
    this.storyService
        .findPortalsByProjectId(this.projectUid)
        .pipe(
            filter((res: HttpResponse<any[]>) => res.ok),
            map((res: HttpResponse<any[]>) => res.body)
        )
        .subscribe(
            (res: any[]) => {
              if (res) {
                this.existingPortals = res;
              } else {
                this.existingPortals = [];
              }
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
  }

  ngOnInit(): void {
    this.existingPortals = [];
    this.loadPortals();
    this.isSaving = false;
    this.getPageTemplates();
  }

  onScreenTypeChanged(event) {
    this.actionItems = [];
    const screenTemplate = this.screenNodeConfigFormGroup.get(['screenTemplate']).value;
    if(screenTemplate === 'table-page') {
      this.actionItems.push( { label: 'On Load', value: 'on-load' });
    } else if(screenTemplate === 'form-page') {
      this.actionItems.push({ label: 'On Create', value: 'on-create' });
    } else if(screenTemplate === 'aio-table') {
      this.actionItems.push({ label: 'On Load', value: 'on-load' });
      this.actionItems.push({ label: 'On Create', value: 'on-create' });
      this.actionItems.push({ label: 'On Update', value: 'on-update' },);
      this.actionItems.push({ label: 'On Delete', value: 'on-delete' },
      );
    } else if(screenTemplate === 'aio-grid') {
      this.actionItems.push({ label: 'On Load', value: 'on-load' });
      this.actionItems.push({ label: 'On Create', value: 'on-create' });
      this.actionItems.push({ label: 'On Update', value: 'on-update' },);
      this.actionItems.push({ label: 'On Delete', value: 'on-delete' },
      );
    }else if(screenTemplate === 'login-page') {
      this.actionItems.push({ label: 'On Create', value: 'on-create' });
    }else if(screenTemplate === 'form-wizard-page') {
      this.actionItems.push({ label: 'On Create', value: 'on-create' });
    } else {
      this.actionItems.push( { label: 'On Load', value: 'on-load' });
    }
  }

  ngOnDestroy(): void {
    if (this.definedConfigComponentRef) {
      this.definedConfigComponentRef.destroy();
    }
  }

  ngAfterViewInit(): void {
  }

  protected onError(errorMessage: string) {
  //  this.logger.error(errorMessage);
  }

  getPageTemplates() {
    this.pageTemplateItems = [];
    this.pageTemplateItems.push({ label: 'Login Page', value: 'login-page' });
    this.pageTemplateItems.push({ label: 'Register Page', value: 'register-page' });
    this.pageTemplateItems.push({ label: 'Table View', value: 'table-page' });
    this.pageTemplateItems.push({ label: 'Form View', value: 'form-page' });
    this.pageTemplateItems.push({ label: 'Form Wizard View', value: 'form-wizard-page' });
    this.pageTemplateItems.push({ label: 'Grid View', value: 'aio-grid' });
    // this.pageTemplateItems.push({ label: 'All-in-One Table View', value: 'aio-table' });
    // this.pageTemplateItems.push({ label: 'File Upload View', value: 'file-upload-page' });
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.screenNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.screenNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);


    if (this.changeSubscription) {
      this.changeSubscription.unsubscribe();
      this.changeSubscription = null;
    }
    if (this.definedConfigComponent) {


      this.definedConfigComponent.configuration = this.configuration;
      this.changeSubscription = this.definedConfigComponent.configurationChanged.subscribe((configuration) => {
        this.updateModel(configuration);
      });
    } else {

    }
  }

  titleCaseWord(word: string) {
    if (!word) return word;
    return word[0].toUpperCase() + word.substr(1);
  }

  lowerCaseWord(word: string) {
    if (!word) return word;
    return word[0].toLowerCase() + word.substr(1);
  }

  private updateModel(configuration: RuleNodeConfiguration) {

    if (this.definedConfigComponent || this.screenNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {

      this.propagateChange(this.required ? null : configuration);
    }
  }

}