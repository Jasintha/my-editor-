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
  selector: 'virtuan-crud-node-config',
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
  allProperties: any[];
  
  @Input() branchAvailability: any;
  
  @Input()
  allReferenceProperties: any[];

  @Input()
  allRuleInputs: any[];

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
      property: [],
      crudinputType: "",
      crudparam: [],
      crudconstant: [],
      crudproperty: [],
      crudbranchparam: [],
      errorMsg: "",
      errorAction: "",
      assignedProperty: [],
      assignedtoinputType: "",
      assignedReference: []
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

    if (inputType === 'RULE_INPUT'){
      this.configuration.crudconstant= {};
      this.configuration.crudproperty= {};
      this.configuration.crudbranchparam= {};

      this.crudNodeConfigFormGroup.get('crudconstant').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudproperty').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudbranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY' || inputType === 'VPROP' ){
      this.configuration.crudparam= {};
      this.configuration.crudconstant= {};
      this.configuration.crudbranchparam= {};

      this.crudNodeConfigFormGroup.get('crudconstant').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudparam').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudbranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'CONSTANT'){
      this.configuration.crudparam= {};
      this.configuration.crudproperty= {};
      this.configuration.crudbranchparam= {};

      this.crudNodeConfigFormGroup.get('crudproperty').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudparam').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudbranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.crudparam= {};
      this.configuration.crudproperty= {};
      this.configuration.crudconstant= {};

      this.crudNodeConfigFormGroup.get('crudproperty').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudparam').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudconstant').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  refreshDbActions(){

    let action: string = this.crudNodeConfigFormGroup.get('dbAction').value;
    this.configuration.dbAction = action;

    if(action === 'UPDATE' || action === 'CREATE'){
      this.configuration.crudinputType= "";
      this.configuration.crudparam= {};
      this.configuration.crudconstant= {};
      this.configuration.crudproperty= {};
      this.configuration.crudbranchparam= {};

      this.configuration.entity= {};

      this.configuration.assignedtoinputType= "";
      this.configuration.assignedProperty= {};
      this.configuration.assignedReference= {};

      this.crudNodeConfigFormGroup.get('entity').patchValue([], {emitEvent: false});

      this.crudNodeConfigFormGroup.get('assignedtoinputType').patchValue("", {emitEvent: false});
      this.crudNodeConfigFormGroup.get('assignedProperty').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('assignedReference').patchValue([], {emitEvent: false});

      this.crudNodeConfigFormGroup.get('crudinputType').patchValue("", {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudparam').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudbranchparam').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudconstant').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudproperty').patchValue([], {emitEvent: false});
    } else {
      this.configuration.property= {};
      this.crudNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});

      if(action === 'DELETE' || action === 'DELETEALL'){
        this.configuration.assignedtoinputType= "";
        this.configuration.assignedProperty= {};
        this.configuration.assignedReference= {};

        this.crudNodeConfigFormGroup.get('assignedtoinputType').patchValue("", {emitEvent: false});
        this.crudNodeConfigFormGroup.get('assignedProperty').patchValue([], {emitEvent: false});
        this.crudNodeConfigFormGroup.get('assignedReference').patchValue([], {emitEvent: false});
      }

      if(action === 'FINDALL' || action === 'DELETEALL'){
        this.configuration.crudinputType= "";
        this.configuration.crudparam= {};
        this.configuration.crudconstant= {};
        this.configuration.crudproperty= {};
        this.configuration.crudbranchparam= {};

        this.crudNodeConfigFormGroup.get('crudinputType').patchValue("", {emitEvent: false});
        this.crudNodeConfigFormGroup.get('crudparam').patchValue([], {emitEvent: false});
        this.crudNodeConfigFormGroup.get('crudbranchparam').patchValue([], {emitEvent: false});
        this.crudNodeConfigFormGroup.get('crudconstant').patchValue([], {emitEvent: false});
        this.crudNodeConfigFormGroup.get('crudproperty').patchValue([], {emitEvent: false});
      }

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
      if((this.configuration.dbAction === 'FIND' || this.configuration.dbAction === 'FINDALL' || this.configuration.dbAction === 'DELETEALL' || this.configuration.dbAction === 'DELETE') && entity && this.inputEntities){
      entity = this.inputEntities.find(x => x.name === this.configuration.entity.name );
      }

      let property = this.configuration.property;
      if((this.configuration.dbAction === 'CREATE' || this.configuration.dbAction === 'UPDATE') && property && this.allModelProperties){
        property = this.allModelProperties.find(x => x.name === this.configuration.property.name );
      }

      //crud input


      let crudparam = this.configuration.crudparam;
      if(this.configuration.crudinputType === 'RULE_INPUT' && this.allRuleInputs){
        crudparam = this.allRuleInputs.find(x => x.inputName === this.configuration.crudparam.inputName );
      }

      let crudconstant = this.configuration.crudconstant;
      if(this.configuration.crudinputType === 'CONSTANT' && this.allConstants){
        crudconstant = this.allConstants.find(x => x.constantName === this.configuration.crudconstant.constantName );
      }

      let crudproperty = this.configuration.crudproperty;
      if(this.configuration.crudinputType === 'PROPERTY' && this.allModelProperties){
        crudproperty = this.allModelProperties.find(x => x.name === this.configuration.crudproperty.name );
      }
      
      let assignedProperty = this.configuration.assignedProperty;
      if(this.configuration.assignedtoinputType === 'PROPERTY' && assignedProperty && this.allModelProperties){
        assignedProperty = this.allModelProperties.find(x => x.name === this.configuration.assignedProperty.name );
      }
      
      let assignedReference = this.configuration.assignedReference;
      if(this.configuration.assignedtoinputType === 'REFERENCE' && assignedReference && this.allReferenceProperties){
        assignedReference = this.allReferenceProperties.find(x => x.name === this.configuration.assignedReference.name );
      }
      
      let crudbranchparam = this.configuration.crudbranchparam;
      if(this.configuration.crudinputType === 'BRANCH_PARAM' && this.branchAvailability.branchParams){
        crudbranchparam = this.branchAvailability.branchParams.find(x => x.name === this.configuration.crudbranchparam.name );
      }

      this.crudNodeConfigFormGroup.patchValue({
        dbType: this.configuration.dbType,
        dbAction: this.configuration.dbAction,
        entity: entity,
        crudinputType: this.configuration.crudinputType,
        crudconstant: crudconstant,
        crudproperty: crudproperty,
        crudparam: crudparam,
        crudbranchparam: crudbranchparam,
        errorMsg: this.configuration.errorMsg,
        errorAction: this.configuration.errorAction,
        assignedProperty: assignedProperty,
        property: property,
        assignedtoinputType: this.configuration.assignedtoinputType,
        assignedReference: assignedReference
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

      this.changeSubscription = this.crudNodeConfigFormGroup.get('property').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.property = configuration;
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
      
      this.changeSubscription = this.crudNodeConfigFormGroup.get('assignedReference').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.assignedReference = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.crudNodeConfigFormGroup.get('assignedtoinputType').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {

          this.configuration.assignedtoinputType = configuration;
          if(this.configuration.assignedtoinputType == 'PROPERTY' || this.configuration.assignedtoinputType == 'VPROP' ){
            this.configuration.assignedReference= {};
            this.crudNodeConfigFormGroup.get('assignedReference').patchValue([], {emitEvent: false});
          }else if (this.configuration.assignedtoinputType == 'REFERENCE'){
            this.configuration.assignedProperty= {};
            this.crudNodeConfigFormGroup.get('assignedProperty').patchValue([], {emitEvent: false});
          }
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

      this.changeSubscription = this.crudNodeConfigFormGroup.get('crudbranchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.crudbranchparam = configuration;
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
