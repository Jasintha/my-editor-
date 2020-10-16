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
  selector: 'tb-crud-node-config',
  templateUrl: './crud-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CrudNodeConfigComponent),
    multi: true
  }]
})
export class CrudNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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

  crudNodeConfigFormGroup: FormGroup;

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
    this.crudNodeConfigFormGroup = this.fb.group({
      dbType:[],
      dbAction: [],
      entity: [],
      crudinputType: [],
      crudparam: [],
      crudconstant: [],
      crudproperty: [],
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

  }

  ngOnDestroy(): void {
    if (this.definedConfigComponentRef) {
      this.definedConfigComponentRef.destroy();
    }
  }
  
  refreshInputTypes(){
    let inputType: string = this.crudNodeConfigFormGroup.get('crudinputType').value;
    this.configuration.crudinputType = inputType;
    /*
    if(inputType === 'MODEL'){
      this.configuration.crudcustomObject= {};
      this.configuration.crudcustomObjectProperty = {};
      this.configuration.crudparam= {};
      this.configuration.crudvariable= {};
      this.configuration.crudvariableProperty= {};

      this.crudNodeConfigFormGroup.get('crudcustomObject').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudcustomObjectProperty').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudparam').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudvariable').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudvariableProperty').patchValue([], {emitEvent: false});

    } else if (inputType === 'DTO'){
      this.configuration.crudentity= {};
      this.configuration.crudentityProperty = {};
      this.configuration.crudparam= {};
      this.configuration.crudvariable= {};
      this.configuration.crudvariableProperty= {};

      this.crudNodeConfigFormGroup.get('crudentity').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudentityProperty').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudparam').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudvariable').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudvariableProperty').patchValue([], {emitEvent: false});

    }
    */

    if (inputType === 'PARAM'){
      this.configuration.crudconstant= {};
      this.configuration.crudproperty= {};

      this.crudNodeConfigFormGroup.get('crudconstant').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudproperty').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.crudparam= {};
      this.configuration.crudconstant= {};

      this.crudNodeConfigFormGroup.get('crudconstant').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'CONSTANT'){
      this.configuration.crudparam= {};
      this.configuration.crudproperty= {};

      this.crudNodeConfigFormGroup.get('crudproperty').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudparam').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  refreshDbActions(){

    let action: string = this.crudNodeConfigFormGroup.get('dbAction').value;
    this.configuration.dbAction = action;

    if(action === 'FIND' || action === 'DELETE'){

    } else {
      this.configuration.crudinputType= '';
      //this.configuration.crudentity= {};
      //this.configuration.crudentityProperty = {};
      //this.configuration.crudcustomObject= {};
      //this.configuration.crudcustomObjectProperty = {};
      this.configuration.crudparam= {};
      this.configuration.crudconstant= {};
      this.configuration.crudproperty= {};

      this.crudNodeConfigFormGroup.get('crudinputType').patchValue([], {emitEvent: false});
     // this.crudNodeConfigFormGroup.get('crudentity').patchValue([], {emitEvent: false});
     // this.crudNodeConfigFormGroup.get('crudentityProperty').patchValue([], {emitEvent: false});
     // this.crudNodeConfigFormGroup.get('crudcustomObject').patchValue([], {emitEvent: false});
     // this.crudNodeConfigFormGroup.get('crudcustomObjectProperty').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudparam').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudconstant').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudproperty').patchValue([], {emitEvent: false});

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
      this.crudNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.crudNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

  console.log("email init node write value");
  console.log(value);

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

      let entity = this.configuration.entity;
      entity = this.inputEntities.find(x => x.name === this.configuration.entity.name );

      //crud input


      let crudparam = this.configuration.crudparam;
      if(this.configuration.crudinputType === 'PARAM'){
        crudparam = this.inputProperties.find(x => x.inputName === this.configuration.crudparam.inputName );
      }

      let crudconstant = this.configuration.crudconstant;
      if(this.configuration.secondinputType === 'CONSTANT'){
        crudconstant = this.allConstants.find(x => x.constantName === this.configuration.crudconstant.constantName );
      }

      let crudproperty = this.configuration.crudproperty;
      if(this.configuration.firstinputType === 'PROPERTY'){
        crudproperty = this.allModelProperties.find(x => x.name === this.configuration.crudproperty.name );
      }

      let assignedProperty = this.configuration.assignedProperty;
      if(assignedProperty && this.allModelProperties){
        assignedProperty = this.allModelProperties.find(x => x.name === this.configuration.assignedProperty.name );
      }

      this.crudNodeConfigFormGroup.patchValue({
        dbType: this.configuration.dbType,
        dbAction: this.configuration.dbAction,
        entity: entity,
        crudinputType: this.configuration.crudinputType,
       // crudentity: crudentity,
       // crudentityProperty: crudentityProperty,
       // crudcustomObject: crudcustomObject,
       // crudcustomObjectProperty: crudcustomObjectProperty,
        crudconstant: crudconstant,
        crudproperty: crudproperty,
        crudparam: crudparam,
        errorMsg: this.configuration.errorMsg,
        errorAction: this.configuration.errorAction,
        assignedProperty: assignedProperty
      });

      /*
      this.changeSubscription = this.crudNodeConfigFormGroup.get('dbAction').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.dbAction = configuration;
          this.updateModel(this.configuration);
        }
      );
      */

      this.changeSubscription = this.crudNodeConfigFormGroup.get('dbType').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.dbType = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.crudNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorMsg = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.crudNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
        (configuration: any) => {
          console.log(configuration);
          this.configuration.errorAction = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.crudNodeConfigFormGroup.get('entity').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.entity = configuration;

          //let selectedentity = this.inputEntities.find(x => x.name === configuration.name );
          //if(selectedentity){
          //  this.selectedEntityProperties = selectedentity.properties;
          //}

          this.updateModel(this.configuration);
        }
      );

      //crud input changes


      this.changeSubscription = this.crudNodeConfigFormGroup.get('crudparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.crudparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.crudNodeConfigFormGroup.get('crudproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.crudproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.crudNodeConfigFormGroup.get('crudconstant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.crudconstant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.crudNodeConfigFormGroup.get('assignedProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.assignedProperty = configuration;
          this.updateModel(this.configuration);
        }
      );



    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.crudNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}
