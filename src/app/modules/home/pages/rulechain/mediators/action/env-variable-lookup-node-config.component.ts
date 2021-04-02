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
  selector: 'virtuan-env-variable-lookup-node-config',
  templateUrl: './env-variable-lookup-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => EnvVariableLookupNodeConfigComponent),
    multi: true
  }]
})
export class EnvVariableLookupNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
  apptype: string;

  @Input()
  allRoots: any[];

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

  envlookupNodeConfigFormGroup: FormGroup;

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

  datasource: MatTableDataSource<EnvLookup>;

  displayedColumns: string[] = ['propertyinputType', 'propertyName', 'valueinputType', 'valueName', 'actions'];

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.envlookupNodeConfigFormGroup = this.fb.group({
      propertyinputType: "",
      propertyproperty: [],
      propertyreference: [],
      valueconstant:[]
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
  
  refreshInputTypes(){
    let inputType: string = this.envlookupNodeConfigFormGroup.get('propertyinputType').value;
    this.configuration.propertyinputType = inputType;

    if (inputType === 'PROPERTY'){
      this.configuration.propertyreference= {};
      this.envlookupNodeConfigFormGroup.get('propertyreference').patchValue([], {emitEvent: false});
    } else if (inputType === 'REFERENCE'){
      this.configuration.propertyproperty= {};
      this.envlookupNodeConfigFormGroup.get('propertyproperty').patchValue([], {emitEvent: false});
    }
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  addLookup(): void{

    let propinputType: string = this.envlookupNodeConfigFormGroup.get('propertyinputType').value;
    let valueinputType: string = 'CONSTANT';

    let propertyName: string = '';
    let valueName: string = '';

    if (propinputType === 'REFERENCE'){
      let selectedPropertyReference = this.envlookupNodeConfigFormGroup.get('propertyreference').value;
      propertyName = selectedPropertyReference.name;

    } else if (propinputType === 'PROPERTY'){
      let selectedPropertyProperty = this.envlookupNodeConfigFormGroup.get('propertyproperty').value;
      propertyName = selectedPropertyProperty.name;

    }
    
    let selectedValueConstant = this.envlookupNodeConfigFormGroup.get('valueconstant').value;

    if(selectedValueConstant){
        valueName = selectedValueConstant.constantName;
    }


    let lookup = {
      'propertyinputType': propinputType,
      'propertyName': propertyName,
      'valueinputType': valueinputType,
      'valueName': valueName
    };

    this.configuration.envlookups.push(lookup);
    this.updateModel(this.configuration);
    this.datasource = new MatTableDataSource(this.configuration.envlookups);

    this.configuration.propertyinputType = '';
    this.configuration.propertyproperty= {};
    this.configuration.propertyreference= {};
    this.configuration.valueconstant= {};

    this.envlookupNodeConfigFormGroup.patchValue({
      propertyinputType: "",
      propertyproperty: [],
      propertyreference: [],
      valueconstant:[]
    });
  }

  deleteRow(index: number): void{
    this.configuration.envlookups.splice(index, 1);
    this.datasource = new MatTableDataSource(this.configuration.envlookups);
    this.updateModel(this.configuration);
  }

  ngAfterViewInit(): void {
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.envlookupNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.envlookupNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);
    
    if(this.configuration.envlookups === null || this.configuration.envlookups === undefined){
        this.configuration.envlookups = [];
    }
    this.datasource = new MatTableDataSource(this.configuration.envlookups);
    
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

      this.envlookupNodeConfigFormGroup.patchValue({
        inputType: this.configuration.inputType,
        referenceProperty: this.configuration.referenceProperty,
        property: this.configuration.property,
        valueconstant: this.configuration.valueconstant
      });


      this.changeSubscription = this.envlookupNodeConfigFormGroup.get('propertyreference').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.propertyreference = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.envlookupNodeConfigFormGroup.get('propertyproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.propertyproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.envlookupNodeConfigFormGroup.get('valueconstant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.valueconstant = configuration;
          this.updateModel(this.configuration);
        }
      );

    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.envlookupNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}

export interface EnvLookup {
  propertyinputType: string;
  propertyName: string;
  valueinputType: string;
  valueName: string;
}

