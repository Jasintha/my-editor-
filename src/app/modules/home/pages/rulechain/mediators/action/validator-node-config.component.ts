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
  selector: 'tb-validator-node-config',
  templateUrl: './validator-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ValidatorNodeConfigComponent),
    multi: true
  }]
})
export class ValidatorNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
  apptype: string;

  nodeDefinitionValue: RuleNodeDefinition;

  datasource: MatTableDataSource<Validator>;

  displayedColumns: string[] = ['inputType', 'property', 'condition', 'value', 'join', 'actions'];

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

  validatorNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.validatorNodeConfigFormGroup = this.fb.group({
      validatorinputType: [],
      validatorparam: [],
      validatorproperty: [],
      validatorcondition: [],
      customValue: [],
      join: []
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

  refreshInputTypes(){
    let inputType: string = this.validatorNodeConfigFormGroup.get('validatorinputType').value;
    this.configuration.validatorinputType = inputType;
    if (inputType === 'PARAM'){
      this.configuration.validatorproperty= {};
      this.validatorNodeConfigFormGroup.get('validatorproperty').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.validatorparam= {};
      this.validatorNodeConfigFormGroup.get('validatorparam').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  addValidator(): void{

    let inputType: string = this.validatorNodeConfigFormGroup.get('validatorinputType').value;

    let join: string = this.validatorNodeConfigFormGroup.get('join').value;
    if(join){
    } else {
        join = '';
    }

    let customvalue: string = this.validatorNodeConfigFormGroup.get('customValue').value;

    console.log(customvalue);
    if(customvalue){
    } else {
        customvalue = '';
    }

    if (inputType === 'PARAM'){
      let selectedParam = this.validatorNodeConfigFormGroup.get('validatorparam').value;
      let validatorparam = {
        'inputType': inputType,
        'condition': this.validatorNodeConfigFormGroup.get('validatorcondition').value,
        'join': join,
        'value': customvalue,
        'property': selectedParam.inputName
      };
      this.configuration.validators.push(validatorparam);
      this.updateModel(this.configuration);
    } else if (inputType === 'PROPERTY'){
      let selectedProperty = this.validatorNodeConfigFormGroup.get('validatorproperty').value;
      let validatorproperty = {
        'inputType': inputType,
        'condition': this.validatorNodeConfigFormGroup.get('validatorcondition').value,
        'join': join,
        'value': customvalue,
        'property': selectedProperty.name
      };

      console.log(validatorproperty);

      this.configuration.validators.push(validatorproperty);
      this.updateModel(this.configuration);
    }

    this.datasource = new MatTableDataSource(this.configuration.validators);

    this.validatorNodeConfigFormGroup.get('validatorinputType').patchValue([], {emitEvent: false});
    this.validatorNodeConfigFormGroup.get('validatorparam').patchValue([], {emitEvent: false});
    this.validatorNodeConfigFormGroup.get('validatorproperty').patchValue([], {emitEvent: false});
    this.validatorNodeConfigFormGroup.get('join').patchValue("", {emitEvent: false});
    this.validatorNodeConfigFormGroup.get('customValue').patchValue("", {emitEvent: false});
    this.validatorNodeConfigFormGroup.get('validatorcondition').patchValue("", {emitEvent: false});

  }

  deleteRow(index: number): void{
    this.configuration.validators.splice(index, 1);
    this.datasource = new MatTableDataSource(this.configuration.validators);
    this.updateModel(this.configuration);
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.validatorNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.validatorNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);
    this.datasource = new MatTableDataSource(this.configuration.validators);

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
      this.changeSubscription = this.validatorNodeConfigFormGroup.get('validatorparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.validatorparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.validatorNodeConfigFormGroup.get('validatorproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.validatorproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.validatorNodeConfigFormGroup.get('validatorcondition').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.validatorcondition = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.validatorNodeConfigFormGroup.get('customValue').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.customValue = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.validatorNodeConfigFormGroup.get('join').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.join = configuration;
          this.updateModel(this.configuration);
        }
      );

    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {

    if (this.definedConfigComponent || this.validatorNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}


export interface Validator {
  inputType: string;
  property: string;
  condition: string;
  join: string;
  value: string;
}
