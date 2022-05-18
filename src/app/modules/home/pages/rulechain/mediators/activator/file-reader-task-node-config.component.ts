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
import { Observable } from 'rxjs';
import { PageComponent } from '@shared/components/page.component';
import { Store } from '@ngrx/store';
import { AppState } from '@core/core.state';
import {MatTableDataSource} from '@angular/material/table';
import { IProject } from '@app/shared/models/model/project.model';
import {Command, ICommand} from '@shared/models/model/command.model';
import {IQuery, Query} from '@shared/models/model/query.model';
import {
  APIInput,
  APIInputType,
  APIParamType,
  IAPIInput,
  IWorkflowMapping,
  WorkflowMapping
} from '@shared/models/model/api-input.model';
import {IDatamodel} from '@shared/models/model/datamodel.model';
import {ICustomObject} from '@shared/models/model/custom-object.model';
import { IAggregate } from '@app/shared/models/model/aggregate.model';
import {IEvent} from '@shared/models/model/microservice-event.model';
import {IViewmodel} from '@shared/models/model/viewmodel.model';
import {ISubrule} from '@shared/models/model/subrule.model';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {filter, map} from 'rxjs/operators';
import { IApi } from '@app/shared/models/model/microservice-api.model';
import {Api} from '@shared/models/model/microservice-api.model';
import {InputPropertyService} from '@core/projectservices/input-property.service';
import {ApiService} from '@core/projectservices/api.service';
import {CommandService} from '@core/projectservices/microservice-command.service';
import {ProjectService} from '@core/projectservices/project.service';
import {QueryService} from '@core/projectservices/microservice-query.service';

@Component({
  selector: 'virtuan-file-reader-task-node-config',
  templateUrl: './file-reader-task-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FileReaderTaskNodeConfigComponent),
    multi: true
  }]
})
export class FileReaderTaskNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
  ruleNodeId: string;

  nodeDefinitionValue: RuleNodeDefinition;

  @Input()
  serviceUuid: string;

  project: IProject;
  aggregates: IAggregate[];
  items: any[];
  viewmodels: IViewmodel[];
  
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

  fileReaderTaskNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              protected projectService: ProjectService,
              private fb: FormBuilder) {
    this.fileReaderTaskNodeConfigFormGroup = this.fb.group({
      fileLocation: ["", Validators.required],
      frequency: ["", Validators.required],
      timeUnit: "",
      time: "",
      fileInputModel: [null, Validators.required],
      fileReaderRecordType: ["", Validators.required],
    });
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    if (this.definedConfigComponentRef) {
      this.definedConfigComponentRef.destroy();
    }
  }

  ngAfterViewInit(): void {
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.fileReaderTaskNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.fileReaderTaskNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  onFileReaderModelChange(){
    let fileInputModel = this.fileReaderTaskNodeConfigFormGroup.get(['fileInputModel']).value;
    this.configuration.fileInputModel = fileInputModel;
    this.updateModel(this.configuration);
  }

  loadServiceAndUpdateForm(){
     this.items = [];
     if (this.serviceUuid) {
        this.projectService
            .findWithModelEventsAndSubrules(this.serviceUuid)
            .pipe(
                filter((mayBeOk: HttpResponse<IProject>) => mayBeOk.ok),
                map((response: HttpResponse<IProject>) => response.body)
            )
            .subscribe(
                (res: IProject) => {
                  this.project = res;
                  this.aggregates = this.project.aggregates;
                  this.viewmodels = this.project.viewmodels;

                  if (this.aggregates) {
                    this.loadAggregates();
                  }
                  if (this.viewmodels) {
                    this.loadViewmodels();
                  }
                  let fileInputModel = this.configuration.fileInputModel;
                  if(fileInputModel && this.items){
                    fileInputModel = this.items.find(x => (x.paramType === this.configuration.returnObj.paramType) && (x.inputType === this.configuration.returnObj.inputType));
                  }
                  this.fileReaderTaskNodeConfigFormGroup.patchValue({
                      fileInputModel: fileInputModel,
                  });
                },
                (res: HttpErrorResponse) => this.onError(res.message)
            );
      }

  }

  loadAggregates() {
    for (let i = 0; i < this.aggregates.length; i++) {
      if (this.aggregates[i].status === 'ENABLED' && this.aggregates[i].type === 'MODEL') {
        const input = {
          id: this.aggregates[i].uuid,
          paramType: APIParamType.BODY,
          inputType: APIInputType.MODEL,
          inputName: this.aggregates[i].name,
        };
        this.items.push(input);
      } else if (this.aggregates[i].status === 'ENABLED' && this.aggregates[i].type === 'DTO') {
        const input = {
          id: this.aggregates[i].uuid,
          paramType: APIParamType.BODY,
          inputType: APIInputType.DTO,
          inputName: this.aggregates[i].name,
        };
        this.items.push(input);
      }
    }
  }

  loadViewmodels() {
    for (let i = 0; i < this.viewmodels.length; i++) {
      if (this.viewmodels[i].status === 'ENABLED') {
        const input = {
          id: this.viewmodels[i].uuid,
          paramType: APIParamType.BODY,
          inputType: APIInputType.DTO,
          inputName: this.viewmodels[i].name,
        };
        this.items.push(input);
      }
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
      this.fileReaderTaskNodeConfigFormGroup.patchValue({
          fileLocation: this.configuration.fileLocation,
          frequency: this.configuration.frequency,
          timeUnit: this.configuration.timeUnit,
          time: this.configuration.time,
          fileReaderRecordType: this.configuration.fileReaderRecordType
      });


    this.changeSubscription = this.fileReaderTaskNodeConfigFormGroup.get('fileLocation').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.fileLocation = configuration;
          this.updateModel(this.configuration);
        }
    );

    this.changeSubscription = this.fileReaderTaskNodeConfigFormGroup.get('fileReaderRecordType').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.fileReaderRecordType = configuration;
          this.updateModel(this.configuration);
        }
    );

    this.changeSubscription = this.fileReaderTaskNodeConfigFormGroup.get('timeUnit').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.timeUnit = configuration;
          this.updateModel(this.configuration);
        }
    );

    this.changeSubscription = this.fileReaderTaskNodeConfigFormGroup.get('time').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.time = configuration;
          this.updateModel(this.configuration);
        }
    );
    this.changeSubscription = this.fileReaderTaskNodeConfigFormGroup.get('frequency').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.frequency = configuration;
          if (configuration === 'SINGLE') {
            this.fileReaderTaskNodeConfigFormGroup.get('time').patchValue('', { emitEvent: false });
            this.fileReaderTaskNodeConfigFormGroup.get('timeUnit').patchValue('', { emitEvent: false });
            this.configuration.time = '';
            this.configuration.timeUnit = '';
          } else {
            if (this.configuration.timeUnit !== 's' && this.configuration.timeUnit !== 'h' && this.configuration.timeUnit !== 'min') {
                this.fileReaderTaskNodeConfigFormGroup.get('timeUnit').patchValue('s', { emitEvent: false });
                this.configuration.timeUnit = 's';
            }
            if (!this.configuration.time) {
                this.fileReaderTaskNodeConfigFormGroup.get('time').patchValue('0', { emitEvent: false });
                this.configuration.time = '0';
            }
          }
          this.updateModel(this.configuration);
        }
    );
    this.loadServiceAndUpdateForm();

    }
  }

  protected onError(errorMessage: string) {
    // this.logger.error(errorMessage);
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

    if (this.definedConfigComponent || this.fileReaderTaskNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {

      this.propagateChange(this.required ? null : configuration);
    }
  }

}
