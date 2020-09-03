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
  selector: 'tb-email-send-node-config',
  templateUrl: './email-send-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => EmailSendNodeConfigComponent),
    multi: true
  }]
})
export class EmailSendNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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

  emailSendNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  private configuration: RuleNodeConfiguration;
  
  selectedVariableProperties: any[];
  selectedVariablePropertiesForParameter: any[];
  
  datasource: MatTableDataSource<EmailBodyParameter>;

  displayedColumns: string[] = ['parameterName', 'inputType', 'input', 'property', 'actions'];

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.emailSendNodeConfigFormGroup = this.fb.group({
      emailSubject: [],
      toemailinputType: [],
      toemailparam: [],
      toemailconstant: [],
      toemailproperty: [],
      //toemailvariable: [],
      //toemailvariableProperty: [],
      parameterinputType: [],
      //parametervariable: [],
      //parametervariableProperty: [],
      parameterparam: [],
      parameterproperty: [],
      emailBody: [],
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
  console.log("came to refresh");
    let inputType: string = this.emailSendNodeConfigFormGroup.get('toemailinputType').value;
    this.configuration.toemailinputType = inputType;
    if (inputType === 'CONSTANT'){
    console.log("came to constant");
      this.configuration.toemailparam= {};
      this.configuration.toemailproperty= {};
      //this.configuration.toemailvariable= {};
      //this.configuration.toemailvariableProperty = {};

      this.emailSendNodeConfigFormGroup.get('toemailparam').patchValue([], {emitEvent: false});
      this.emailSendNodeConfigFormGroup.get('toemailproperty').patchValue([], {emitEvent: false});
      //this.emailSendNodeConfigFormGroup.get('toemailvariable').patchValue([], {emitEvent: false});
      //this.emailSendNodeConfigFormGroup.get('toemailvariableProperty').patchValue([], {emitEvent: false});
    } else if (inputType === 'PARAM'){
      this.configuration.toemailconstant= {};
      this.configuration.toemailproperty= {};
      //this.configuration.toemailvariable= {};
      //this.configuration.toemailvariableProperty = {};
      this.emailSendNodeConfigFormGroup.get('toemailconstant').patchValue([], {emitEvent: false});
      this.emailSendNodeConfigFormGroup.get('toemailproperty').patchValue([], {emitEvent: false});
      //this.emailSendNodeConfigFormGroup.get('toemailvariable').patchValue([], {emitEvent: false});
      //this.emailSendNodeConfigFormGroup.get('toemailvariableProperty').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.toemailconstant= {};
      this.configuration.toemailparam= {};
      this.emailSendNodeConfigFormGroup.get('toemailconstant').patchValue([], {emitEvent: false});
      this.emailSendNodeConfigFormGroup.get('toemailparam').patchValue([], {emitEvent: false});
    }
    /*
    else if (inputType === 'VARIABLE'){
      this.configuration.toemailconstant= {};
      this.configuration.toemailparam= {};
      this.emailSendNodeConfigFormGroup.get('toemailconstant').patchValue([], {emitEvent: false});
      this.emailSendNodeConfigFormGroup.get('toemailparam').patchValue([], {emitEvent: false});
    }
    */

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  refreshParameterInputTypes(){
  console.log("came to refresh");
    let inputType: string = this.emailSendNodeConfigFormGroup.get('parameterinputType').value;
    this.configuration.parameterinputType = inputType;
    if (inputType === 'PARAM'){
      this.configuration.parameterproperty= {};
      //this.configuration.parametervariableProperty = {};
      this.emailSendNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});
      //this.emailSendNodeConfigFormGroup.get('parametervariableProperty').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.parameterparam= {};
      this.emailSendNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
    }
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  addParameter(): void{
  
    let number = this.configuration.emailbodyParameters.length + 1;
    let inputType: string = this.emailSendNodeConfigFormGroup.get('parameterinputType').value;
    
    if (inputType === 'PARAM'){
      let selectedParameterParam = this.emailSendNodeConfigFormGroup.get('parameterparam').value;
      let parameter = {
        'parameterName': '$'+ number,
        'inputType': inputType,
        'input': '-',
        'property': selectedParameterParam.inputName
      };
      this.configuration.emailbodyParameters.push(parameter);
      this.updateModel(this.configuration);
    } else if (inputType === 'PROPERTY'){
      let selectedParameterProperty = this.emailSendNodeConfigFormGroup.get('parameterproperty').value;
      let parameterproperty = {
        'parameterName': '$'+ number,
        'inputType': inputType,
        'input': '-',
        'property': selectedParameterProperty.name
      };
      this.configuration.emailbodyParameters.push(parameterproperty);
      this.updateModel(this.configuration);
    }
     /*
     else if (inputType === 'VARIABLE'){
      let selectedParameterVariable = this.emailSendNodeConfigFormGroup.get('parametervariable').value;
      if(selectedParameterVariable.type == 'String' || 
         selectedParameterVariable.type == 'Integer' ||
         selectedParameterVariable.type == 'Boolean' ||
         selectedParameterVariable.type == 'Date' ||
         selectedParameterVariable.type == 'Image' ||
         selectedParameterVariable.type == 'File'){         
          let parameter = {
            'parameterName': '$'+ number,
            'inputType': inputType,
            'input': '-',
            'property': selectedParameterVariable.name
          };       
          this.configuration.emailbodyParameters.push(parameter);  
          this.updateModel(this.configuration);          
      } else {
          let selectedParameterVariableProperty = this.emailSendNodeConfigFormGroup.get('parametervariableProperty').value;
          let parameter = {
            'parameterName': '$'+ number,
            'inputType': inputType,
            'input': selectedParameterVariable.name,
            'property': selectedParameterVariableProperty.name
          };   
          this.configuration.emailbodyParameters.push(parameter);
          this.updateModel(this.configuration);
      }      
    }
    */
    
    this.datasource = new MatTableDataSource(this.configuration.emailbodyParameters);
  
    this.emailSendNodeConfigFormGroup.get('parameterinputType').patchValue([], {emitEvent: false});
    //this.emailSendNodeConfigFormGroup.get('parametervariable').patchValue([], {emitEvent: false});
    //this.emailSendNodeConfigFormGroup.get('parametervariableProperty').patchValue([], {emitEvent: false});
    this.emailSendNodeConfigFormGroup.get('parameterparam').patchValue([], {emitEvent: false});
    this.emailSendNodeConfigFormGroup.get('parameterproperty').patchValue([], {emitEvent: false});

  }

  deleteRow(index: number): void{
    this.configuration.emailbodyParameters.splice(index, 1);
    this.datasource = new MatTableDataSource(this.configuration.emailbodyParameters);
    this.updateModel(this.configuration);
  }

  ngAfterViewInit(): void {
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.emailSendNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.emailSendNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

  console.log("email init node write value");
  console.log(value);

    this.configuration = deepClone(value);
    this.datasource = new MatTableDataSource(this.configuration.emailbodyParameters);
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
      let v = this.configuration.toemailvariable;
      let vp = this.configuration.toemailvariableProperty;

      if(this.configuration.toemailinputType === 'VARIABLE'){
        v = this.allVariables.find(x => x.name === this.configuration.toemailvariable.name );
        if(v.type != 'String' || v.type != 'Integer' || v.type != 'Boolean' || v.type != 'Date' || v.type != 'Image' || v.type != 'File'){
          if(v.pkg == 'model'){
            let modelVariable = this.inputEntities.find(x => x.name === v.type);
            if(modelVariable){
              if(this.apptype === 'microservice' ){
                if(this.domainModelProperties){
                  this.selectedVariableProperties = this.domainModelProperties.filter(p => p.modelName == v.type);
                  vp = this.selectedVariableProperties.find(x => x.name === this.configuration.toemailvariableProperty.name );
                } else {
                  this.selectedVariableProperties = [];
                }
              }else{
              this.selectedVariableProperties = modelVariable.properties;
              vp = modelVariable.properties.find(x => x.name === this.configuration.toemailvariableProperty.name );
              }
            }
          } else {
            let dtoVariable = this.inputCustomobjects.find(x => x.name === v.type);
            if(dtoVariable){
              if(this.apptype === 'microservice' ){
                if(this.viewModelProperties){
                  this.selectedVariableProperties = this.viewModelProperties.filter(p => p.modelName == v.type);
                  vp = this.selectedVariableProperties.find(x => x.name === this.configuration.toemailvariableProperty.name );
                } else {
                  this.selectedVariableProperties = [];
                }
              }else{
              this.selectedVariableProperties = dtoVariable.properties;
              vp = dtoVariable.properties.find(x => x.name === this.configuration.toemailvariableProperty.name );
              }
            }

          }
        }
      }
      */

      let p = this.configuration.toemailparam;
      if(this.configuration.toemailinputType === 'PARAM'){
        p = this.inputProperties.find(x => x.inputName === this.configuration.toemailparam.inputName );
      }

      let c = this.configuration.toemailconstant;
      if(this.configuration.toemailinputType === 'CONSTANT'){
        c = this.allConstants.find(x => x.constantName === this.configuration.toemailconstant.constantName );
      }

      let property = this.configuration.toemailproperty;
      if(this.configuration.toemailinputType === 'PROPERTY'){
        property = this.allModelProperties.find(x => x.name === this.configuration.toemailproperty.name );
      }

      this.emailSendNodeConfigFormGroup.patchValue({
        emailSubject: this.configuration.emailSubject,
        toemailinputType: this.configuration.toemailinputType,
        toemailparam: p,
        toemailconstant: c,
        toemailproperty: property,
       // toemailvariable: v,
       // toemailvariableProperty: vp,
        parameterinputType: this.configuration.parameterinputType,
       // parametervariable: this.configuration.parametervariable,
       // parametervariableProperty: this.configuration.parametervariableProperty,
        parameterparam: this.configuration.parameterparam,
        parameterproperty: this.configuration.parameterproperty,
        emailBody: this.configuration.emailBody
      });

      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('emailBody').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.emailBody = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('emailSubject').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.emailSubject = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('toemailparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.toemailparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('parameterparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('toemailconstant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.toemailconstant = configuration;

          console.log(this.configuration);
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('toemailproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.toemailproperty = configuration;

          console.log(this.configuration);
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('parameterproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parameterproperty = configuration;

          console.log(this.configuration);
          this.updateModel(this.configuration);
        }
      );


      /*
      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('toemailvariableProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.toemailvariableProperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('parametervariableProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parametervariableProperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('toemailvariable').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.toemailvariable = configuration;
          console.log("variable selected");
          console.log(configuration);
          
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

      this.changeSubscription = this.emailSendNodeConfigFormGroup.get('parametervariable').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.parametervariable = configuration;

            if(Object.keys(configuration).length !== 0){
                if(configuration.type != 'String' || configuration.type != 'Integer' || configuration.type != 'Boolean' || configuration.type != 'Date' || configuration.type != 'Image' || configuration.type != 'File'){
                    if(configuration.pkg == 'model'){
                        let modelVariable = this.inputEntities.find(x => x.name === configuration.type);
                        if(modelVariable){
                          if(this.apptype === 'microservice' ){
                            if(this.domainModelProperties){
                              this.selectedVariablePropertiesForParameter = this.domainModelProperties.filter(p => p.modelName == configuration.type);
                            } else {
                              this.selectedVariablePropertiesForParameter = [];
                            }
                          }else{
                          this.selectedVariablePropertiesForParameter = modelVariable.properties;
                          }
                        }
                    }else{
                        let dtoVariable = this.inputCustomobjects.find(x => x.name === configuration.type);
                        if(this.apptype === 'microservice' ){
                           if(this.viewModelProperties){
                             this.selectedVariablePropertiesForParameter = this.viewModelProperties.filter(p => p.modelName == configuration.type);
                           } else {
                             this.selectedVariablePropertiesForParameter = [];
                           }
                        }else{
                        this.selectedVariablePropertiesForParameter = dtoVariable.properties;
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
    if (this.definedConfigComponent || this.emailSendNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}

export interface EmailBodyParameter {
  parameterName: string;
  inputType: string;
  input: string;
  property: string;
}
