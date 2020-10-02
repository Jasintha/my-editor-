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
  selector: 'tb-filter-node-config',
  templateUrl: './filter-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FilterNodeConfigComponent),
    multi: true
  }]
})
export class FilterNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
  allRoots: string[];

    domainModelProperties: any[];
    viewModelProperties: any[];

  @Input()
  disabled: boolean;

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

  get nodeDefinition(): RuleNodeDefinition {
    return this.nodeDefinitionValue;
  }

  definedDirectiveError: string;

  filterNodeConfigFormGroup: FormGroup;

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
    this.filterNodeConfigFormGroup = this.fb.group({
      firstinputType: [],
      //entity: [],
      //entityProperty: [],
      //customObject: [],
      //customObjectProperty: [],
      constant: [],
      param: [],
      property: [],
      //variable: [],
      //variableProperty: [],
      condition: [],
      secondinputType: [],
      //secondentity: [],
      //secondentityProperty: [],
      //secondcustomObject: [],
      //secondcustomObjectProperty: [],
      secondconstant: [],
      secondparam: [],
      secondproperty:[],
      //secondvariable: [],
      //secondvariableProperty: [],
      root: [],
      isAsync: false,
      secondroot: [],
      secondisAsync:false,
      errorMsg: "",
      errorAction: ""
    });
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  ngOnInit(): void {
  /*
    if(this.apptype === 'microservice'){
        this.domainModelProperties = this.allModelProperties.filter(p => p.modelType == 'DOMAIN_MODEL');
        this.viewModelProperties = this.allModelProperties.filter(p => p.modelType == 'VIEW_MODEL');
    }
    */
  
  }

  ngOnDestroy(): void {
    if (this.definedConfigComponentRef) {
      this.definedConfigComponentRef.destroy();
    }
  }
  
  refreshInputTypes(){
    let inputType: string = this.filterNodeConfigFormGroup.get('firstinputType').value;
    this.configuration.firstinputType = inputType;

    /*
    if(inputType === 'MODEL'){
      this.configuration.customObject= {};
      this.configuration.customObjectProperty = {};
      this.configuration.constant= {};
      this.configuration.param= {};
      this.configuration.variable= {};
      this.configuration.variableProperty= {};

      this.filterNodeConfigFormGroup.get('customObject').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('customObjectProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('variable').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('variableProperty').patchValue([], {emitEvent: false});

    } else if (inputType === 'DTO'){
      this.configuration.entity= {};
      this.configuration.entityProperty = {};
      this.configuration.constant= {};
      this.configuration.param= {};
      this.configuration.variable= {};
      this.configuration.variableProperty= {};

      this.filterNodeConfigFormGroup.get('entity').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('entityProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('variable').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('variableProperty').patchValue([], {emitEvent: false});

    } else if (inputType === 'VARIABLE'){
      this.configuration.entity= {};
      this.configuration.entityProperty = {};
      this.configuration.customObject= {};
      this.configuration.customObjectProperty = {};
      this.configuration.constant= {};
      this.configuration.param= {};

      this.filterNodeConfigFormGroup.get('entity').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('entityProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('customObject').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('customObjectProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
    }
    */


    if (inputType === 'CONSTANT'){
      //this.configuration.entity= {};
      //this.configuration.entityProperty = {};
      //this.configuration.customObject= {};
      //this.configuration.customObjectProperty = {};
      this.configuration.param= {};
      this.configuration.property= {};
      //this.configuration.variable= {};
      this.configuration.variableProperty= {};

      //this.filterNodeConfigFormGroup.get('entity').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('entityProperty').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('customObject').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('customObjectProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('variable').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('variableProperty').patchValue([], {emitEvent: false});

    } else if (inputType === 'PARAM'){
      //this.configuration.entity= {};
      //this.configuration.entityProperty = {};
      //this.configuration.customObject= {};
      //this.configuration.customObjectProperty = {};
      this.configuration.constant= {};
      this.configuration.property= {};
      //this.configuration.variable= {};
      //this.configuration.variableProperty= {};

      //this.filterNodeConfigFormGroup.get('entity').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('entityProperty').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('customObject').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('customObjectProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('variable').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('variableProperty').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.constant= {};
      this.configuration.param= {};
      this.filterNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  refreshSecondInputTypes(){
    let inputType: string = this.filterNodeConfigFormGroup.get('secondinputType').value;
    this.configuration.secondinputType = inputType;

    /*
    if(inputType === 'MODEL'){
      this.configuration.secondcustomObject= {};
      this.configuration.secondcustomObjectProperty = {};
      this.configuration.secondconstant= {};
      this.configuration.secondparam= {};
      this.configuration.secondvariable= {};
      this.configuration.secondvariableProperty= {};

      this.filterNodeConfigFormGroup.get('secondcustomObject').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondcustomObjectProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondconstant').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondparam').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondvariable').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondvariableProperty').patchValue([], {emitEvent: false});

    } else if (inputType === 'DTO'){
      this.configuration.secondentity= {};
      this.configuration.secondentityProperty = {};
      this.configuration.secondconstant= {};
      this.configuration.secondparam= {};
      this.configuration.secondvariable= {};
      this.configuration.secondvariableProperty= {};

      this.filterNodeConfigFormGroup.get('secondentity').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondentityProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondconstant').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondparam').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondvariable').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondvariableProperty').patchValue([], {emitEvent: false});

    } else if (inputType === 'VARIABLE'){
      this.configuration.secondentity= {};
      this.configuration.secondentityProperty = {};
      this.configuration.secondcustomObject= {};
      this.configuration.secondcustomObjectProperty = {};
      this.configuration.secondconstant= {};
      this.configuration.secondparam= {};

      this.filterNodeConfigFormGroup.get('secondentity').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondentityProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondcustomObject').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondcustomObjectProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondconstant').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondparam').patchValue([], {emitEvent: false});
    }
    */

    if (inputType === 'CONSTANT'){
      //this.configuration.secondentity= {};
      //this.configuration.secondentityProperty = {};
      //this.configuration.secondcustomObject= {};
      //this.configuration.secondcustomObjectProperty = {};
      this.configuration.secondparam= {};
      this.configuration.secondproperty= {};
      //this.configuration.secondvariable= {};
      //this.configuration.secondvariableProperty= {};

      //this.filterNodeConfigFormGroup.get('secondentity').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('secondentityProperty').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('secondcustomObject').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('secondcustomObjectProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondparam').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondproperty').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('secondvariable').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('secondvariableProperty').patchValue([], {emitEvent: false});

    } else if (inputType === 'PARAM'){
      //this.configuration.secondentity= {};
      //this.configuration.secondentityProperty = {};
      //this.configuration.secondcustomObject= {};
      //this.configuration.secondcustomObjectProperty = {};
      this.configuration.secondconstant= {};
      this.configuration.secondproperty= {};
      //this.configuration.secondvariable= {};
      //this.configuration.secondvariableProperty= {};

      //this.filterNodeConfigFormGroup.get('secondentity').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('secondentityProperty').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('secondcustomObject').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('secondcustomObjectProperty').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondconstant').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondproperty').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('secondvariable').patchValue([], {emitEvent: false});
      //this.filterNodeConfigFormGroup.get('secondvariableProperty').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.secondconstant= {};
      this.configuration.secondparam= {};

      this.filterNodeConfigFormGroup.get('secondconstant').patchValue([], {emitEvent: false});
      this.filterNodeConfigFormGroup.get('secondparam').patchValue([], {emitEvent: false});
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
      this.filterNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.filterNodeConfigFormGroup.enable({emitEvent: false});
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
      /*
      let entity = this.configuration.entity;
      let entityProperty = this.configuration.entityProperty;
      if(this.configuration.firstinputType === 'MODEL'){
        entity = this.inputEntities.find(x => x.name === this.configuration.entity.name );
        if(entity){
            if(this.apptype === 'microservice' ){
            if(this.domainModelProperties){
                this.selectedEntityProperties = this.domainModelProperties.filter(p => p.modelName == entity.name);
                entityProperty = this.selectedEntityProperties.find(x => x.name === this.configuration.entityProperty.name );
            } else {
                this.selectedEntityProperties = [];
            }
            
            }else {
          this.selectedEntityProperties = entity.properties;
          entityProperty = entity.properties.find(x => x.name === this.configuration.entityProperty.name );
          }
        }
      }

      let customObject = this.configuration.customObject;
      let customObjectProperty = this.configuration.customObjectProperty;
      if(this.configuration.firstinputType === 'DTO'){
        customObject = this.inputCustomobjects.find(x => x.name === this.configuration.customObject.name );
        if(customObject){
        if(this.apptype === 'microservice' ){
            if(this.viewModelProperties){
                this.selectedCustomObjectProperties = this.viewModelProperties.filter(p => p.modelName == customObject.name);
                customObjectProperty = this.selectedCustomObjectProperties.find(x => x.name === this.configuration.customObjectProperty.name );
            } else {
                this.selectedEntityProperties = [];
            }
        } else {
          this.selectedCustomObjectProperties = customObject.properties;
          customObjectProperty = customObject.properties.find(x => x.name === this.configuration.customObjectProperty.name );
          }
        }
      }

      let variable = this.configuration.variable;
      let variableProperty = this.configuration.variableProperty;

      if(this.configuration.firstinputType === 'VARIABLE'){
        variable = this.allVariables.find(x => x.name === this.configuration.variable.name );
        if(variable.type != 'String' || variable.type != 'Integer' || variable.type != 'Boolean' || variable.type != 'Date' || variable.type != 'Image' || variable.type != 'File'){
          if(variable.pkg == 'model'){
            let modelVariable = this.inputEntities.find(x => x.name === variable.type);
            if(modelVariable){
            if(this.apptype === 'microservice' ){
                if(this.domainModelProperties){
                  this.selectedVariableProperties = this.domainModelProperties.filter(p => p.modelName == variable.type);
                  variableProperty = this.selectedVariableProperties.find(x => x.name === this.configuration.variableProperty.name );
                } else {
                  this.selectedVariableProperties = [];
                }
            }else{
              this.selectedVariableProperties = modelVariable.properties;
              variableProperty = modelVariable.properties.find(x => x.name === this.configuration.variableProperty.name );
              }
            }
          } else {
            let dtoVariable = this.inputCustomobjects.find(x => x.name === variable.type);
            if(dtoVariable){
            if(this.apptype === 'microservice' ){
                if(this.viewModelProperties){
                  this.selectedVariableProperties = this.viewModelProperties.filter(p => p.modelName == variable.type);
                  variableProperty = this.selectedVariableProperties.find(x => x.name === this.configuration.variableProperty.name );
                } else {
                  this.selectedVariableProperties = [];
                }
            } else{
              this.selectedVariableProperties = dtoVariable.properties;
              variableProperty = dtoVariable.properties.find(x => x.name === this.configuration.variableProperty.name );
              }
            }
          }
        }
      }
      */

      let param = this.configuration.param;
      if(this.configuration.firstinputType === 'PARAM'){
        param = this.inputProperties.find(x => x.inputName === this.configuration.param.inputName );
      }

      let constant = this.configuration.constant;
      if(this.configuration.firstinputType === 'CONSTANT'){
        constant = this.allConstants.find(x => x.constantName === this.configuration.constant.constantName );
      }

      let property = this.configuration.property;
      if(this.configuration.firstinputType === 'PROPERTY'){
        property = this.allModelProperties.find(x => x.name === this.configuration.property.name );
      }

      //second input
      /*
      let secondentity = this.configuration.secondentity;
      let secondentityProperty = this.configuration.secondentityProperty;
      if(this.configuration.secondinputType === 'MODEL'){
        secondentity = this.inputEntities.find(x => x.name === this.configuration.secondentity.name );
        if(secondentity){
            if(this.apptype === 'microservice' ){
            if(this.domainModelProperties){
                this.selectedEntityProperties = this.domainModelProperties.filter(p => p.modelName == secondentity.name);
                secondentityProperty = this.selectedEntityProperties.find(x => x.name === this.configuration.secondentityProperty.name );
            } else {
                this.selectedEntityProperties = [];
            }

            }else {
            this.selectedSecondEntityProperties = secondentity.properties;
            secondentityProperty = secondentity.properties.find(x => x.name === this.configuration.secondentityProperty.name );
            }
        }
      }

      let secondcustomObject = this.configuration.secondcustomObject;
      let secondcustomObjectProperty = this.configuration.secondcustomObjectProperty;
      if(this.configuration.secondinputType === 'DTO'){
        secondcustomObject = this.inputCustomobjects.find(x => x.name === this.configuration.secondcustomObject.name );
        if(secondcustomObject){
        if(this.apptype === 'microservice' ){
            if(this.viewModelProperties){
                this.selectedCustomObjectProperties = this.viewModelProperties.filter(p => p.modelName == secondcustomObject.name);
                secondcustomObjectProperty = this.selectedCustomObjectProperties.find(x => x.name === this.configuration.secondcustomObjectProperty.name );
            } else {
                this.selectedEntityProperties = [];
            }
        } else {
          this.selectedSecondCustomObjectProperties = secondcustomObject.properties;
          secondcustomObjectProperty = secondcustomObject.properties.find(x => x.name === this.configuration.secondcustomObjectProperty.name );
          }
        }
      }

      let secondvariable = this.configuration.secondvariable;
      let secondvariableProperty = this.configuration.secondvariableProperty;

      if(this.configuration.secondinputType === 'VARIABLE'){
        secondvariable = this.allVariables.find(x => x.name === this.configuration.secondvariable.name );
        if(secondvariable.type != 'String' || secondvariable.type != 'Integer' || secondvariable.type != 'Boolean' || secondvariable.type != 'Date' || secondvariable.type != 'Image' || secondvariable.type != 'File'){
          if(secondvariable.pkg == 'model'){
            let modelVariable = this.inputEntities.find(x => x.name === secondvariable.type);
            if(modelVariable){
            if(this.apptype === 'microservice' ){
                if(this.domainModelProperties){
                  this.selectedVariableProperties = this.domainModelProperties.filter(p => p.modelName == secondvariable.type);
                  secondvariableProperty = this.selectedVariableProperties.find(x => x.name === this.configuration.secondvariableProperty.name );
                } else {
                  this.selectedVariableProperties = [];
                }
            }else{
              this.selectedSecondVariableProperties = modelVariable.properties;
              secondvariableProperty = modelVariable.properties.find(x => x.name === this.configuration.secondvariableProperty.name );
              }
            }
          } else {
            let dtoVariable = this.inputCustomobjects.find(x => x.name === secondvariable.type);
            if(dtoVariable){
            if(this.apptype === 'microservice' ){
                if(this.viewModelProperties){
                  this.selectedVariableProperties = this.viewModelProperties.filter(p => p.modelName == secondvariable.type);
                  secondvariableProperty = this.selectedVariableProperties.find(x => x.name === this.configuration.secondvariableProperty.name );
                } else {
                  this.selectedVariableProperties = [];
                }
            } else{
              this.selectedSecondVariableProperties = dtoVariable.properties;
              secondvariableProperty = dtoVariable.properties.find(x => x.name === this.configuration.secondvariableProperty.name );
              }
            }
          }
        }
      }
      */

      let secondparam = this.configuration.secondparam;
      if(this.configuration.secondinputType === 'PARAM'){
        secondparam = this.inputProperties.find(x => x.inputName === this.configuration.secondparam.inputName );
      }

      let secondconstant = this.configuration.secondconstant;
      if(this.configuration.secondinputType === 'CONSTANT'){
        secondconstant = this.allConstants.find(x => x.secondconstantName === this.configuration.secondconstant.secondconstantName );
      }

      let secondproperty = this.configuration.secondproperty;
      if(this.configuration.firstinputType === 'PROPERTY'){
        secondproperty = this.allModelProperties.find(x => x.name === this.configuration.secondproperty.name );
      }

      let root = this.configuration.root;
      if(root){
        root = this.allRoots.find(x => x === this.configuration.root );
      }

      let secondroot = this.configuration.secondroot;
      if(secondroot){
        secondroot = this.allRoots.find(x => x === this.configuration.secondroot );
      }

      this.filterNodeConfigFormGroup.patchValue({
        firstinputType: this.configuration.firstinputType,
        //entity: entity,
        //entityProperty: entityProperty,
        //customObject: customObject,
        //customObjectProperty: customObjectProperty,
        //variable: variable,
        //variableProperty: variableProperty,
        param: param,
        constant: constant,
        property: property,
        condition: this.configuration.condition,
        secondinputType: this.configuration.secondinputType,
        //secondentity: secondentity,
        //secondentityProperty: secondentityProperty,
        //secondcustomObject: secondcustomObject,
        //secondcustomObjectProperty: secondcustomObjectProperty,
        //secondvariable: secondvariable,
        //secondvariableProperty: secondvariableProperty,
        secondparam: secondparam,
        secondconstant: secondconstant,
        secondproperty: secondproperty,
        root: root,
        secondroot: secondroot,
        isAsync: this.configuration.isAsync,
        secondisAsync: this.configuration.secondisAsync,
        errorMsg: this.configuration.errorMsg,
        errorAction: this.configuration.errorAction
      });

      this.changeSubscription = this.filterNodeConfigFormGroup.get('root').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.root = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('secondroot').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondroot = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('isAsync').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.isAsync = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('secondisAsync').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondisAsync = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorMsg = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
        (configuration: any) => {
          console.log(configuration);
          this.configuration.errorAction = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('condition').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.condition = configuration;
          this.updateModel(this.configuration);
        }
      );

      /*
      this.changeSubscription = this.filterNodeConfigFormGroup.get('entity').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.entity = configuration;

          console.log(configuration);
          let selectedentity = this.inputEntities.find(x => x.name === configuration.name );
          console.log(selectedentity);
          if(selectedentity){
          if(this.apptype === 'microservice' ){
              if(this.domainModelProperties){
                this.selectedEntityProperties = this.domainModelProperties.filter(p => p.modelName == selectedentity.name);
              } else {
                this.selectedEntityProperties = [];
              }
          }else{
            this.selectedEntityProperties = selectedentity.properties;
            }
          }

          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('entityProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.entityProperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('customObject').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.customObject = configuration;
          let selectedcustomObject = this.inputCustomobjects.find(x => x.name === configuration.name );
          if(selectedcustomObject){
            if(this.apptype === 'microservice' ){
              if(this.viewModelProperties){
                this.selectedCustomObjectProperties = this.viewModelProperties.filter(p => p.modelName == selectedcustomObject.name);
              } else {
                this.selectedCustomObjectProperties = [];
              }
            }else{
            this.selectedCustomObjectProperties = selectedcustomObject.properties;
            }
          }

          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('customObjectProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.customObjectProperty = configuration;
          this.updateModel(this.configuration);
        }
      );
      */

      this.changeSubscription = this.filterNodeConfigFormGroup.get('param').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.param = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('constant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.constant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('property').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.property = configuration;
          this.updateModel(this.configuration);
        }
      );

      /*
      this.changeSubscription = this.filterNodeConfigFormGroup.get('variableProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.variableProperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('variable').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.variable = configuration;

            if(Object.keys(configuration).length !== 0){
                if(configuration.type != 'String' || configuration.type != 'Integer' || configuration.type != 'Boolean' || configuration.type != 'Date' || configuration.type != 'Image' || configuration.type != 'File'){
                    if(configuration.pkg == 'model'){
                        let modelVariable = this.inputEntities.find(x => x.name === configuration.type);
                        if(modelVariable){
                          if(this.apptype === 'microservice' ){
                            if(this.domainModelProperties){
                              this.selectedVariableProperties = this.domainModelProperties.filter(p => p.modelName == configuration.type);
                            } else {
                              this.selectedVariableProperties = [];
                            }
                          }else{
                          this.selectedVariableProperties = modelVariable.properties;
                          }
                        }
                    }else{
                        let dtoVariable = this.inputCustomobjects.find(x => x.name === configuration.type);
                        if(this.apptype === 'microservice' ){
                           if(this.viewModelProperties){
                             this.selectedVariableProperties = this.viewModelProperties.filter(p => p.modelName == configuration.type);
                           } else {
                             this.selectedVariableProperties = [];
                           }
                        }else{
                        this.selectedVariableProperties = dtoVariable.properties;
                        }
                    }
                }
            }
          this.updateModel(this.configuration);
        }
      );
      */

      //second input changes
      /*
      this.changeSubscription = this.filterNodeConfigFormGroup.get('secondentity').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondentity = configuration;
          let selectedsecondentity = this.inputEntities.find(x => x.name === configuration.name );
          if(selectedsecondentity){
            if(this.apptype === 'microservice' ){
              if(this.domainModelProperties){
                this.selectedSecondEntityProperties = this.domainModelProperties.filter(p => p.modelName == selectedsecondentity.name);
                console.log(this.selectedSecondEntityProperties);
              } else {
                this.selectedSecondEntityProperties = [];
              }
            }else{
            this.selectedSecondEntityProperties = selectedsecondentity.properties;
            }
          }

          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('secondentityProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondentityProperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('secondcustomObject').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondcustomObject = configuration;
          let selectedsecondcustomObject = this.inputCustomobjects.find(x => x.name === configuration.name );
          if(selectedsecondcustomObject){
            if(this.apptype === 'microservice' ){
              if(this.viewModelProperties){
                this.selectedSecondCustomObjectProperties = this.viewModelProperties.filter(p => p.modelName == selectedsecondcustomObject.name);
              } else {
                this.selectedSecondCustomObjectProperties = [];
              }
            } else {
            this.selectedSecondCustomObjectProperties = selectedsecondcustomObject.properties;
            }
          }

          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('secondcustomObjectProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondcustomObjectProperty = configuration;
          this.updateModel(this.configuration);
        }
      );
      */

      this.changeSubscription = this.filterNodeConfigFormGroup.get('secondparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('secondconstant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondconstant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('secondproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      /*
      this.changeSubscription = this.filterNodeConfigFormGroup.get('secondvariableProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondvariableProperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.filterNodeConfigFormGroup.get('secondvariable').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondvariable = configuration;

            if(Object.keys(configuration).length !== 0){
                if(configuration.type != 'String' || configuration.type != 'Integer' || configuration.type != 'Boolean' || configuration.type != 'Date' || configuration.type != 'Image' || configuration.type != 'File'){
                    if(configuration.pkg == 'model'){
                        let modelVariable = this.inputEntities.find(x => x.name === configuration.type);
                        if(modelVariable){
                          if(this.apptype === 'microservice' ){
                            if(this.domainModelProperties){
                              this.selectedSecondVariableProperties = this.domainModelProperties.filter(p => p.modelName == configuration.type);
                            } else {
                              this.selectedSecondVariableProperties = [];
                            }
                          }else{
                          this.selectedSecondVariableProperties = modelVariable.properties;
                          }
                        }
                    }else{
                        let dtoVariable = this.inputCustomobjects.find(x => x.name === configuration.type);
                        if(this.apptype === 'microservice' ){
                           if(this.viewModelProperties){
                             this.selectedSecondVariableProperties = this.viewModelProperties.filter(p => p.modelName == configuration.type);
                           } else {
                             this.selectedSecondVariableProperties = [];
                           }
                        }else{
                        this.selectedSecondVariableProperties = dtoVariable.properties;
                        }
                    }
                }
            }
          this.updateModel(this.configuration);
        }
      );
      */

    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.filterNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}
