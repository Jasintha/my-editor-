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
  selector: 'tb-root-node-config',
  templateUrl: './root-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => RootNodeConfigComponent),
    multi: true
  }]
})
export class RootNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
  inputEntities: any[];

  @Input()
  inputCustomobjects: any[];

  @Input()
  ruleNodeId: string;

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

  datasource: MatTableDataSource<Param>;

  get nodeDefinition(): RuleNodeDefinition {
    return this.nodeDefinitionValue;
  }

  definedDirectiveError: string;

  rootNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  displayedColumns: string[] = ['name', 'inputType', 'input','record', 'actions'];

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.rootNodeConfigFormGroup = this.fb.group({
      //isAsync: [null, Validators.required],
      paraminputType: '',
      paramName: '',
      paramRecord: '',
      paramentity: [],
      paramcustomObject: [],
      primitive: ''
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
      this.rootNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.rootNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  addParam(): void{

    let inputType: string = this.rootNodeConfigFormGroup.get('paraminputType').value;
    let paramName: string = this.rootNodeConfigFormGroup.get('paramName').value;
    let paramRecord: string = this.rootNodeConfigFormGroup.get('paramRecord').value;

    if (inputType === 'MODEL'){
      let selectedEntity = this.rootNodeConfigFormGroup.get('paramentity').value;
      let entityparam = {
        'name': paramName,
        'inputType': inputType,
        'input': selectedEntity.name,
        'record': paramRecord
      };
      this.configuration.branchParams.push(entityparam);
      this.updateModel(this.configuration);
    } else if (inputType === 'DTO'){
      let selectedDTO = this.rootNodeConfigFormGroup.get('paramcustomObject').value;
      let dtoParam = {
        'name': paramName,
        'inputType': inputType,
        'input': selectedDTO.name,
        'record': paramRecord
      };
      this.configuration.branchParams.push(dtoParam);
      this.updateModel(this.configuration);
    } else if (inputType === 'PRIMITIVE'){
      let selectedprimitive = this.rootNodeConfigFormGroup.get('primitive').value;
      let primitiveParam = {
        'name': paramName,
        'inputType': inputType,
        'input': selectedprimitive,
        'record': paramRecord
      };
      this.configuration.branchParams.push(primitiveParam);
      this.updateModel(this.configuration);
    } else if (inputType === 'ANY'){
      let anyParam = {
        'name': paramName,
        'inputType': inputType,
        'input': '-',
        'record': paramRecord
      };
      this.configuration.branchParams.push(anyParam);
      this.updateModel(this.configuration);
    }

    this.datasource = new MatTableDataSource(this.configuration.branchParams);

    this.rootNodeConfigFormGroup.patchValue({
      paraminputType: '',
      paramName: '',
      paramRecord: '',
      paramentity: [],
      paramcustomObject: [],
      primitive: ''
    });

  }

  deleteRow(index: number): void{
    this.configuration.branchParams.splice(index, 1);
    this.datasource = new MatTableDataSource(this.configuration.branchParams);
    this.updateModel(this.configuration);
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);
    if(this.configuration.branchParams === null || this.configuration.branchParams === undefined){
    console.log("undefined");
        this.configuration.branchParams = [];
    }
    this.datasource = new MatTableDataSource(this.configuration.branchParams);
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

      this.rootNodeConfigFormGroup.patchValue({
        // isAsync: this.configuration.isAsync,
        paraminputType: this.configuration.paraminputType,
        paramName: this.configuration.paramName,
        paramRecord: this.configuration.paramRecord,
        paramentity: this.configuration.paramentity,
        paramcustomObject: this.configuration.paramcustomObject,
        primitive: this.configuration.primitive
      });

  //    this.rootNodeConfigFormGroup.get('isAsync').patchValue(this.configuration.isAsync, {emitEvent: false});
      /*
      this.changeSubscription = this.rootNodeConfigFormGroup.get('isAsync').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {

          this.configuration.isAsync = configuration;
          this.updateModel(this.configuration);
        }
      );
      */

      this.changeSubscription = this.rootNodeConfigFormGroup.get('paraminputType').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {
          this.configuration.paraminputType = configuration;

          if(this.configuration.paraminputType == 'MODEL'){
            this.configuration.paramcustomObject= {};
            this.rootNodeConfigFormGroup.get('paramcustomObject').patchValue([], {emitEvent: false});
          }else if (this.configuration.paraminputType == 'DTO'){
            this.configuration.paramentity= {};
            this.rootNodeConfigFormGroup.get('paramentity').patchValue([], {emitEvent: false});
          }

          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.rootNodeConfigFormGroup.get('paramName').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {
          this.configuration.paramName = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.rootNodeConfigFormGroup.get('paramRecord').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {
          this.configuration.paramRecord = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.rootNodeConfigFormGroup.get('paramentity').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {
          this.configuration.paramentity = configuration;
          this.configuration.paramcustomObject = {};
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.rootNodeConfigFormGroup.get('paramcustomObject').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {
          this.configuration.paramcustomObject = configuration;
          this.configuration.paramentity = {};
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.rootNodeConfigFormGroup.get('primitive').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {
          this.configuration.primitive = configuration;
          this.updateModel(this.configuration);
        }
      );

    }
  }

/*
  useDefinedDirective(): boolean {
    return this.nodeDefinition &&
      (this.nodeDefinition.configDirective &&
       this.nodeDefinition.configDirective.length) && !this.definedDirectiveError;
  }
  */

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.rootNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

  /*

  private validateDefinedDirective() {
    if (this.definedConfigComponentRef) {
      this.definedConfigComponentRef.destroy();
      this.definedConfigComponentRef = null;
    }
    if (this.nodeDefinition.uiResourceLoadError && this.nodeDefinition.uiResourceLoadError.length) {
      this.definedDirectiveError = this.nodeDefinition.uiResourceLoadError;
    } else if (this.nodeDefinition.configDirective && this.nodeDefinition.configDirective.length) {
      if (this.changeSubscription) {
        this.changeSubscription.unsubscribe();
        this.changeSubscription = null;
      }
      this.definedConfigContainer.clear();
      const factory = this.ruleChainService.getRuleNodeConfigFactory(this.nodeDefinition.configDirective);
      this.definedConfigComponentRef = this.definedConfigContainer.createComponent(factory);
      this.definedConfigComponent = this.definedConfigComponentRef.instance;
      this.definedConfigComponent.ruleNodeId = this.ruleNodeId;
      this.definedConfigComponent.configuration = this.configuration;
      this.changeSubscription = this.definedConfigComponent.configurationChanged.subscribe((configuration) => {
        this.updateModel(configuration);
      });
    }
  }



  validate() {
    if (this.useDefinedDirective()) {
      this.definedConfigComponent.validate();
    }
  }
  */
}

export interface Param {
  name: string;
  inputType: string;
  input: string;
  record: string;
}
