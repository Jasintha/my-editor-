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

@Component({
  selector: 'virtuan-api-group-node-config',
  templateUrl: './api-group-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => APIGroupNodeConfigComponent),
    multi: true
  }]
})
export class APIGroupNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
  inputEntities: any[];

  @Input()
  allVariables: any[];

  @Input()
  inputProperties: any[];

  @Input()
  allConstants: any[];

  @Input()
  inputCustomobjects: any[];
  
  @Input()
  allModelProperties: any[];

  @Input()
  allProperties: any[];

  @Input()
  apptype: string;

  @Input()
  allRoots: any[];

  @Input()
  allApis: any[];

  @Input()
  allRuleInputs: any[];

  @Input() branchAvailability: any;

    domainModelProperties: any[];
    viewModelProperties: any[];

  @Input()
  disabled: boolean;

  @Input()
  ruleNodeId: string;
  
  @Input()
  allReferenceProperties: any[];

  nodeDefinitionValue: RuleNodeDefinition;

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

  apiGroupNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;
  
  selectedVariableProperties: any[];
  selectedSecondVariableProperties: any[];
  selectedEntityProperties: any[];
  selectedCustomObjectProperties: any[];
  selectedSecondEntityProperties: any[];
  selectedSecondCustomObjectProperties: any[];

  datasource: MatTableDataSource<APIGroup>;

  displayedColumns: string[] = ['apiUIName', 'actions'];

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.apiGroupNodeConfigFormGroup = this.fb.group({
      group: "",
      contextPathPattern: "",
      api: []
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

  addAPIGroup(): void{

    let api = this.apiGroupNodeConfigFormGroup.get('api').value;
    let apiUIName = "";
    let apiname = "";
    let apiid = "";

    if(api){
        apiUIName = api.name;
        let apinameTrimmed = apiname.replace(/\s/g, "");
        apiname = this.titleCaseWord(apinameTrimmed);

        if (api.type === 'COMMAND' || api.type === 'QUERY'){
            apiid = api.type + "_" + api.uuid;
        } else {
            apiid = "API_" + api.uuid;
        }
    }

    let apigroup = {
      'apiUIName': apiUIName,
      'apiName': apiname,
      'apiID': apiid
    };

    this.configuration.apiGroups.push(apigroup);
    this.configuration.api= {};
    this.updateModel(this.configuration);
    this.datasource = new MatTableDataSource(this.configuration.apiGroups);

    this.apiGroupNodeConfigFormGroup.patchValue({
      api: []
    });
  }

  deleteRow(index: number): void{
    this.configuration.apiGroups.splice(index, 1);
    this.datasource = new MatTableDataSource(this.configuration.apiGroups);
    this.updateModel(this.configuration);
  }

  ngAfterViewInit(): void {
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.apiGroupNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.apiGroupNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);
    
    if(this.configuration.apiGroups === null || this.configuration.apiGroups === undefined){
        this.configuration.apiGroups = [];
    }
    this.datasource = new MatTableDataSource(this.configuration.apiGroups);
    
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

      this.apiGroupNodeConfigFormGroup.patchValue({
        group: this.configuration.group,
        contextPathPattern: this.configuration.contextPathPattern
      });

      this.changeSubscription = this.apiGroupNodeConfigFormGroup.get('group').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.group = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.apiGroupNodeConfigFormGroup.get('contextPathPattern').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.contextPathPattern = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.apiGroupNodeConfigFormGroup.get('api').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.api = configuration;
          this.updateModel(this.configuration);
        }
      );

    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.apiGroupNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

  titleCaseWord(word: string) {
    if (!word) return word;
    return word[0].toUpperCase() + word.substr(1);
  }

}

export interface APIGroup {
  apiUIName: string;
  apiName: string;
  apiID: string;
}
