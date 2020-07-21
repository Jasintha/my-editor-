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

  private configuration: RuleNodeConfiguration;
  
  selectedVariableProperties: any[];
  selectedEntityProperties: any[];
  selectedCustomObjectProperties: any[];

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.crudNodeConfigFormGroup = this.fb.group({
      dbAction: [],
      entity: [],
      crudinputType: [],
      crudentity: [],
      crudentityProperty: [],
      crudcustomObject: [],
      crudcustomObjectProperty: [],
      crudparam: [],
      crudvariable: [],
      crudvariableProperty: [],
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

    } else if (inputType === 'PARAM'){
      this.configuration.crudentity= {};
      this.configuration.crudentityProperty = {};
      this.configuration.crudcustomObject= {};
      this.configuration.crudcustomObjectProperty = {};
      this.configuration.crudvariable= {};
      this.configuration.crudvariableProperty= {};

      this.crudNodeConfigFormGroup.get('crudentity').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudentityProperty').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudcustomObject').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudcustomObjectProperty').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudvariable').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudvariableProperty').patchValue([], {emitEvent: false});
    } else if (inputType === 'VARIABLE'){
      this.configuration.crudentity= {};
      this.configuration.crudentityProperty = {};
      this.configuration.crudcustomObject= {};
      this.configuration.crudcustomObjectProperty = {};
      this.configuration.crudparam= {};

      this.crudNodeConfigFormGroup.get('crudentity').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudentityProperty').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudcustomObject').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudcustomObjectProperty').patchValue([], {emitEvent: false});
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
      this.configuration.crudentity= {};
      this.configuration.crudentityProperty = {};
      this.configuration.crudcustomObject= {};
      this.configuration.crudcustomObjectProperty = {};
      this.configuration.crudparam= {};
      this.configuration.crudvariable= {};
      this.configuration.crudvariableProperty= {};

      this.crudNodeConfigFormGroup.get('crudinputType').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudentity').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudentityProperty').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudcustomObject').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudcustomObjectProperty').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudparam').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudvariable').patchValue([], {emitEvent: false});
      this.crudNodeConfigFormGroup.get('crudvariableProperty').patchValue([], {emitEvent: false});

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

      let crudentity = this.configuration.crudentity;
      let crudentityProperty = this.configuration.crudentityProperty;
      if(this.configuration.crudinputType === 'MODEL'){
        crudentity = this.inputEntities.find(x => x.name === this.configuration.crudentity.name );
        if(crudentity){
          this.selectedEntityProperties = crudentity.properties;
          crudentityProperty = crudentity.properties.find(x => x.name === this.configuration.crudentityProperty.name );
        }
      }

      let crudcustomObject = this.configuration.crudcustomObject;
      let crudcustomObjectProperty = this.configuration.crudcustomObjectProperty;
      if(this.configuration.crudinputType === 'DTO'){
        crudcustomObject = this.inputCustomobjects.find(x => x.name === this.configuration.crudcustomObject.name );
        if(crudcustomObject){
          this.selectedCustomObjectProperties = crudcustomObject.properties;
          crudcustomObjectProperty = crudcustomObject.properties.find(x => x.name === this.configuration.crudcustomObjectProperty.name );
        }
      }

      let crudvariable = this.configuration.crudvariable;
      let crudvariableProperty = this.configuration.crudvariableProperty;

      if(this.configuration.crudinputType === 'VARIABLE'){
        crudvariable = this.allVariables.find(x => x.name === this.configuration.crudvariable.name );
        if(crudvariable.type != 'String' || crudvariable.type != 'Integer' || crudvariable.type != 'Boolean' || crudvariable.type != 'Date' || crudvariable.type != 'Image' || crudvariable.type != 'File'){
          if(crudvariable.pkg == 'model'){
            let modelVariable = this.inputEntities.find(x => x.name === crudvariable.type);
            if(modelVariable){
              this.selectedVariableProperties = modelVariable.properties;
              crudvariableProperty = modelVariable.properties.find(x => x.name === this.configuration.crudvariableProperty.name );
            }
          } else {
            let dtoVariable = this.inputCustomobjects.find(x => x.name === crudvariable.type);
            if(dtoVariable){
              this.selectedVariableProperties = dtoVariable.properties;
              crudvariableProperty = dtoVariable.properties.find(x => x.name === this.configuration.crudvariableProperty.name );
            }
          }
        }
      }

      let crudparam = this.configuration.crudparam;
      if(this.configuration.crudinputType === 'PARAM'){
        crudparam = this.inputProperties.find(x => x.inputName === this.configuration.crudparam.inputName );
      }

      this.crudNodeConfigFormGroup.patchValue({
        dbAction: this.configuration.dbAction,
        entity: entity,
        crudinputType: this.configuration.crudinputType,
        crudentity: crudentity,
        crudentityProperty: crudentityProperty,
        crudcustomObject: crudcustomObject,
        crudcustomObjectProperty: crudcustomObjectProperty,
        crudvariable: crudvariable,
        crudvariableProperty: crudvariableProperty,
        crudparam: crudparam
      });

      /*
      this.changeSubscription = this.crudNodeConfigFormGroup.get('dbAction').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.dbAction = configuration;
          this.updateModel(this.configuration);
        }
      );
      */

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

      this.changeSubscription = this.crudNodeConfigFormGroup.get('crudentity').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.crudentity = configuration;
          let selectedcrudentity = this.inputEntities.find(x => x.name === configuration.name );
          if(selectedcrudentity){
            this.selectedEntityProperties = selectedcrudentity.properties;
          }

          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.crudNodeConfigFormGroup.get('crudentityProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.crudentityProperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.crudNodeConfigFormGroup.get('crudcustomObject').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.crudcustomObject = configuration;
          let selectedcrudcustomObject = this.inputCustomobjects.find(x => x.name === configuration.name );
          if(selectedcrudcustomObject){
            this.selectedCustomObjectProperties = selectedcrudcustomObject.properties;
          }

          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.crudNodeConfigFormGroup.get('crudcustomObjectProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.crudcustomObjectProperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.crudNodeConfigFormGroup.get('crudparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.crudparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.crudNodeConfigFormGroup.get('crudvariableProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.crudvariableProperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.crudNodeConfigFormGroup.get('crudvariable').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.crudvariable = configuration;

            if(Object.keys(configuration).length !== 0){
                if(configuration.type != 'String' || configuration.type != 'Integer' || configuration.type != 'Boolean' || configuration.type != 'Date' || configuration.type != 'Image' || configuration.type != 'File'){
                    if(configuration.pkg == 'model'){
                        let modelVariable = this.inputEntities.find(x => x.name === configuration.type);
                        if(modelVariable){
                          this.selectedVariableProperties = modelVariable.properties;
                        }
                    }else{
                        let dtoVariable = this.inputCustomobjects.find(x => x.name === configuration.type);
                        this.selectedVariableProperties = dtoVariable.properties;
                    }
                }
            }
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
