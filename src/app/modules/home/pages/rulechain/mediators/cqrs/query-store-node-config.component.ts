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
  selector: 'tb-query-store-node-config',
  templateUrl: './query-store-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => QueryStoreNodeConfigComponent),
    multi: true
  }]
})
export class QueryStoreNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
  disabled: boolean;

  @Input()
  ruleNodeId: string;

  @Input()
  queryDb: string;

  @Input()
  commandDb: string;

  @Input()
  allModelProperties: any[];

  @Input()
  apptype: string;

  readOnlyDbType: boolean;

  domainModelProperties: any[];
  viewModelProperties: any[];

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

  queryStoreNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;
  
  selectedVariableProperties: any[];
  selectedEntityProperties: any[];
  selectedCustomObjectProperties: any[];

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.queryStoreNodeConfigFormGroup = this.fb.group({
      dbType:[],
      dbAction: [],
      queryAction: [],
      customObject: [],
      query: [],
      entity:[],
      errorMsg: "",
      errorAction: "",
      assignedProperty: []
    });
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  ngOnInit(): void {
    this.readOnlyDbType = false;

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
      this.queryStoreNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.queryStoreNodeConfigFormGroup.enable({emitEvent: false});
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

      let customObject = this.configuration.customObject;
      if(customObject){
        customObject = this.inputCustomobjects.find(x => x.name === this.configuration.customObject.name );
      }

      let entity = this.configuration.entity;
      if(entity){
        entity = this.inputEntities.find(x => x.name === this.configuration.entity.name );
      }

      let assignedProperty = this.configuration.assignedProperty;
      if(assignedProperty && this.allModelProperties){
        assignedProperty = this.allModelProperties.find(x => x.name === this.configuration.assignedProperty.name );
      }

      console.log(this.configuration.entity);
      console.log(this.inputEntities);

      let dbType = '';
      if(this.queryDb && this.queryDb !== ''){
        dbType = this.queryDb;
        this.readOnlyDbType = true;
      } else {
        dbType = this.configuration.dbType;
        this.readOnlyDbType = false;
      }

      this.queryStoreNodeConfigFormGroup.patchValue({
        dbType: dbType,
        queryAction: this.configuration.queryAction,
        customObject: customObject,
        query: this.configuration.query,
        entity: entity,
        errorMsg: this.configuration.errorMsg,
        errorAction: this.configuration.errorAction,
        assignedProperty: assignedProperty
      });

      this.changeSubscription = this.queryStoreNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorMsg = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.queryStoreNodeConfigFormGroup.get('assignedProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.assignedProperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.queryStoreNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
        (configuration: any) => {
          console.log(configuration);
          this.configuration.errorAction = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.queryStoreNodeConfigFormGroup.get('query').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.query = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.queryStoreNodeConfigFormGroup.get('queryAction').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.queryAction = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.queryStoreNodeConfigFormGroup.get('dbType').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.dbType = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.queryStoreNodeConfigFormGroup.get('customObject').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.customObject = configuration;
          this.configuration.entity = {};
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.queryStoreNodeConfigFormGroup.get('entity').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.entity = configuration;
          this.configuration.customObject = {};
          this.updateModel(this.configuration);
        }
      );
    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.queryStoreNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}
