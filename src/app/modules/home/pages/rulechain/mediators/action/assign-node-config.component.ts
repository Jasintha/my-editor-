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
  selector: 'tb-assign-node-config',
  templateUrl: './assign-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AssignNodeConfigComponent),
    multi: true
  }]
})
export class AssignNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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

  assignNodeConfigFormGroup: FormGroup;

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

  displayedColumns: string[] = ['parameterName', 'inputType', 'input', 'property', 'actions'];

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.assignNodeConfigFormGroup = this.fb.group({
      inputType: [],
      property: [],
      referenceProperty: [],
      secondinputType: [],
      secondconstant: [],
      secondparam: [],
      secondproperty:[],
      secondbranchparam: []
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
    let inputType: string = this.assignNodeConfigFormGroup.get('inputType').value;
    this.configuration.inputType = inputType;

    if (inputType === 'PROPERTY'){
      this.configuration.referenceProperty= {};
      this.assignNodeConfigFormGroup.get('referenceProperty').patchValue([], {emitEvent: false});
    } else if (inputType === 'REFERENCE'){
      this.configuration.property= {};
      this.assignNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
    }
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  refreshSecondInputTypes(){
    let inputType: string = this.assignNodeConfigFormGroup.get('secondinputType').value;
    this.configuration.secondinputType = inputType;

    if (inputType === 'CONSTANT'){
      this.configuration.secondparam= {};
      this.configuration.secondproperty= {};
      this.configuration.secondbranchparam= {};

      this.assignNodeConfigFormGroup.get('secondparam').patchValue([], {emitEvent: false});
      this.assignNodeConfigFormGroup.get('secondproperty').patchValue([], {emitEvent: false});
      this.assignNodeConfigFormGroup.get('secondbranchparam').patchValue([], {emitEvent: false});

    } else if (inputType === 'PARAM'){
      this.configuration.secondconstant= {};
      this.configuration.secondproperty= {};
      this.configuration.secondbranchparam= {};

      this.assignNodeConfigFormGroup.get('secondconstant').patchValue([], {emitEvent: false});
      this.assignNodeConfigFormGroup.get('secondproperty').patchValue([], {emitEvent: false});
      this.assignNodeConfigFormGroup.get('secondbranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.secondconstant= {};
      this.configuration.secondparam= {};
      this.configuration.secondbranchparam= {};

      this.assignNodeConfigFormGroup.get('secondconstant').patchValue([], {emitEvent: false});
      this.assignNodeConfigFormGroup.get('secondparam').patchValue([], {emitEvent: false});
      this.assignNodeConfigFormGroup.get('secondbranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.secondconstant= {};
      this.configuration.secondparam= {};
      this.configuration.secondproperty= {};

      this.assignNodeConfigFormGroup.get('secondconstant').patchValue([], {emitEvent: false});
      this.assignNodeConfigFormGroup.get('secondparam').patchValue([], {emitEvent: false});
      this.assignNodeConfigFormGroup.get('secondproperty').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  ngAfterViewInit(): void {
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.assignNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.assignNodeConfigFormGroup.enable({emitEvent: false});
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

      let property = this.configuration.property;
      if(this.configuration.inputType === 'PROPERTY' && this.allModelProperties){
        property = this.allModelProperties.find(x => x.name === this.configuration.property.name );
      }

      let referenceProperty = this.configuration.referenceProperty;
      if(this.configuration.inputType === 'REFERENCE' && this.allReferenceProperties){
        referenceProperty = this.allReferenceProperties.find(x => x.name === this.configuration.referenceProperty.name );
      }

      //second input


      let secondparam = this.configuration.secondparam;
      if(this.configuration.secondinputType === 'PARAM' && this.inputProperties){
        secondparam = this.inputProperties.find(x => x.inputName === this.configuration.secondparam.inputName );
      }

      let secondconstant = this.configuration.secondconstant;
      if(this.configuration.secondinputType === 'CONSTANT' && this.allConstants){
        secondconstant = this.allConstants.find(x => x.constantName === this.configuration.secondconstant.constantName );
      }

      let secondproperty = this.configuration.secondproperty;
      if(this.configuration.secondinputType === 'PROPERTY' && this.allModelProperties){
        secondproperty = this.allModelProperties.find(x => x.name === this.configuration.secondproperty.name );
      }

      let secondbranchparam = this.configuration.secondbranchparam;
      if(this.configuration.secondinputType === 'BRANCH_PARAM' && this.branchAvailability.branchParams){
        secondbranchparam = this.branchAvailability.branchParams.find(x => x.name === this.configuration.secondbranchparam.name );
      }

      this.assignNodeConfigFormGroup.patchValue({
        inputType: this.configuration.inputType,
        referenceProperty: referenceProperty,
        property: property,
        secondbranchparam: secondbranchparam,
        secondinputType: this.configuration.secondinputType,
        secondparam: secondparam,
        secondconstant: secondconstant,
        secondproperty: secondproperty
      });

      this.changeSubscription = this.assignNodeConfigFormGroup.get('referenceProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.referenceProperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.assignNodeConfigFormGroup.get('property').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.property = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.assignNodeConfigFormGroup.get('secondbranchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondbranchparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      //second input changes

      this.changeSubscription = this.assignNodeConfigFormGroup.get('secondparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.assignNodeConfigFormGroup.get('secondconstant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondconstant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.assignNodeConfigFormGroup.get('secondproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.assignNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}
