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
    selector: 'virtuan-encrypt-middleware-node-config',
    templateUrl: './encrypt-middleware-node-config.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => EncryptMiddlewareNodeConfigComponent),
        multi: true
    }]
})
export class EncryptMiddlewareNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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

    encryptMiddlewareNodeConfigFormGroup: FormGroup;

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

    private propagateChange = (v: any) => { };

    constructor(private translate: TranslateService,
                private ruleChainService: RuleChainService,
                private fb: FormBuilder) {
        this.encryptMiddlewareNodeConfigFormGroup = this.fb.group({
          encryption: "",
          keyType: "",
          inputType: [],
          param: [],
          constant: [],
          property: [],
          branchparam: [],
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
    
  refreshKeyInputType(){
    let keyType: string = this.encryptMiddlewareNodeConfigFormGroup.get('keyType').value;
    this.configuration.keyType = keyType;
    
    if (keyType === 'KEY'){
      this.configuration.secondinputType= "";
      this.configuration.secondparam= {};
      this.configuration.secondproperty= {};
      this.configuration.secondbranchparam= {};
      this.configuration.secondconstant= {};
      this.encryptMiddlewareNodeConfigFormGroup.get('secondinputType').patchValue("", {emitEvent: false});
      this.encryptMiddlewareNodeConfigFormGroup.get('secondparam').patchValue([], {emitEvent: false});
      this.encryptMiddlewareNodeConfigFormGroup.get('secondbranchparam').patchValue([], {emitEvent: false});
      this.encryptMiddlewareNodeConfigFormGroup.get('secondproperty').patchValue([], {emitEvent: false});
      this.encryptMiddlewareNodeConfigFormGroup.get('secondconstant').patchValue([], {emitEvent: false});
    } else if (keyType === 'FILE'){
      this.configuration.inputType= "";
      this.configuration.param= {};
      this.configuration.property= {};
      this.configuration.branchparam= {};
      this.configuration.constant= {};
      this.encryptMiddlewareNodeConfigFormGroup.get('inputType').patchValue("", {emitEvent: false});
      this.encryptMiddlewareNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.encryptMiddlewareNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
      this.encryptMiddlewareNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
      this.encryptMiddlewareNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
    }
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }
    
  }

  refreshInputTypes(){

    let inputType: string = this.encryptMiddlewareNodeConfigFormGroup.get('inputType').value;
    this.configuration.inputType = inputType;
    if (inputType === 'CONSTANT'){

      this.configuration.param= {};
      this.configuration.property= {};
      this.configuration.branchparam= {};
      this.encryptMiddlewareNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.encryptMiddlewareNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
      this.encryptMiddlewareNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
    } else if (inputType === 'RULE_INPUT'){
      this.configuration.constant= {};
      this.configuration.property= {};
      this.configuration.branchparam= {};
      this.encryptMiddlewareNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
      this.encryptMiddlewareNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.encryptMiddlewareNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.constant= {};
      this.configuration.param= {};
      this.configuration.branchparam= {};
      this.encryptMiddlewareNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
      this.encryptMiddlewareNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.encryptMiddlewareNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.constant= {};
      this.configuration.param= {};
      this.configuration.property= {};
      this.encryptMiddlewareNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.encryptMiddlewareNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.encryptMiddlewareNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }
  
  refreshSecondInputTypes(){

    let inputType: string = this.encryptMiddlewareNodeConfigFormGroup.get('secondinputType').value;
    this.configuration.secondinputType = inputType;
    if (inputType === 'CONSTANT'){

      this.configuration.secondparam= {};
      this.configuration.secondproperty= {};
      this.configuration.secondbranchparam= {};
      this.encryptMiddlewareNodeConfigFormGroup.get('secondparam').patchValue([], {emitEvent: false});
      this.encryptMiddlewareNodeConfigFormGroup.get('secondbranchparam').patchValue([], {emitEvent: false});
      this.encryptMiddlewareNodeConfigFormGroup.get('secondproperty').patchValue([], {emitEvent: false});
    } else if (inputType === 'RULE_INPUT'){
      this.configuration.secondconstant= {};
      this.configuration.secondproperty= {};
      this.configuration.secondbranchparam= {};
      this.encryptMiddlewareNodeConfigFormGroup.get('secondbranchparam').patchValue([], {emitEvent: false});
      this.encryptMiddlewareNodeConfigFormGroup.get('secondconstant').patchValue([], {emitEvent: false});
      this.encryptMiddlewareNodeConfigFormGroup.get('secondproperty').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.secondconstant= {};
      this.configuration.secondparam= {};
      this.configuration.secondbranchparam= {};
      this.encryptMiddlewareNodeConfigFormGroup.get('secondbranchparam').patchValue([], {emitEvent: false});
      this.encryptMiddlewareNodeConfigFormGroup.get('secondconstant').patchValue([], {emitEvent: false});
      this.encryptMiddlewareNodeConfigFormGroup.get('secondparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.secondconstant= {};
      this.configuration.secondparam= {};
      this.configuration.secondproperty= {};
      this.encryptMiddlewareNodeConfigFormGroup.get('secondconstant').patchValue([], {emitEvent: false});
      this.encryptMiddlewareNodeConfigFormGroup.get('secondparam').patchValue([], {emitEvent: false});
      this.encryptMiddlewareNodeConfigFormGroup.get('secondproperty').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

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
            this.encryptMiddlewareNodeConfigFormGroup.disable({emitEvent: false});
        } else {
            this.encryptMiddlewareNodeConfigFormGroup.enable({emitEvent: false});
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
        
             let p = this.configuration.param;
             let c = this.configuration.constant;
             let property = this.configuration.property;
             let branchparam = this.configuration.branchparam;
                          
             let secondp = this.configuration.secondparam;
             let secondc = this.configuration.secondconstant;
             let secondproperty = this.configuration.secondproperty;
             let secondbranchparam = this.configuration.secondbranchparam;
             
             if(this.configuration.keyType === 'KEY'){
                  if(this.configuration.inputType === 'RULE_INPUT' && this.allRuleInputs){
                    p = this.allRuleInputs.find(x => x.inputName === this.configuration.param.inputName );
                  }      
                  if(this.configuration.inputType === 'CONSTANT' && this.allConstants){
                    c = this.allConstants.find(x => x.constantName === this.configuration.constant.constantName );
                  }      
                  if(this.configuration.inputType === 'PROPERTY' && this.allModelProperties){
                    property = this.allModelProperties.find(x => x.name === this.configuration.property.name );
                  }      
                  if(this.configuration.inputType === 'BRANCH_PARAM' && this.branchAvailability.customClaims){
                    branchparam = this.branchAvailability.customClaims.find(x => x.name === this.configuration.branchparam.name );
                  } 
             } else if(this.configuration.keyType === 'FILE'){
        
                  if(this.configuration.secondinputType === 'RULE_INPUT' && this.allRuleInputs){
                    secondp = this.allRuleInputs.find(x => x.inputName === this.configuration.secondparam.inputName );
                  }      
                  if(this.configuration.secondinputType === 'CONSTANT' && this.allConstants){
                    secondc = this.allConstants.find(x => x.constantName === this.configuration.secondconstant.constantName );
                  }      
                  if(this.configuration.secondinputType === 'PROPERTY' && this.allModelProperties){
                    secondproperty = this.allModelProperties.find(x => x.name === this.configuration.secondproperty.name );
                  }      
                  if(this.configuration.secondinputType === 'BRANCH_PARAM' && this.branchAvailability.customClaims){
                    secondbranchparam = this.branchAvailability.customClaims.find(x => x.name === this.configuration.secondbranchparam.name );
                  } 
                  
             }        
            this.encryptMiddlewareNodeConfigFormGroup.patchValue({
                keyType: this.configuration.keyType,
                inputType: this.configuration.inputType,
                secondinputType: this.configuration.secondinputType,
                param: p,
                constant: c,
                property: property,
                branchparam: branchparam, 
                secondparam: secondp,
                secondconstant: secondc,
                secondproperty: secondproperty,
                secondbranchparam: secondbranchparam, 
                encryption: this.configuration.encryption
            });
            
      
          this.changeSubscription = this.encryptMiddlewareNodeConfigFormGroup.get('param').valueChanges.subscribe(
            (configuration: any) => {
              this.configuration.param = configuration;
              this.updateModel(this.configuration);
            }
          );
    
          this.changeSubscription = this.encryptMiddlewareNodeConfigFormGroup.get('branchparam').valueChanges.subscribe(
            (configuration: any) => {
              this.configuration.branchparam = configuration;
              this.updateModel(this.configuration);
            }
          );
    
          this.changeSubscription = this.encryptMiddlewareNodeConfigFormGroup.get('constant').valueChanges.subscribe(
            (configuration: any) => {
              this.configuration.constant = configuration;
              this.updateModel(this.configuration);
            }
          );
    
          this.changeSubscription = this.encryptMiddlewareNodeConfigFormGroup.get('property').valueChanges.subscribe(
            (configuration: any) => {
              this.configuration.property = configuration;
              this.updateModel(this.configuration);
            }
          );
              
          this.changeSubscription = this.encryptMiddlewareNodeConfigFormGroup.get('secondparam').valueChanges.subscribe(
            (configuration: any) => {
              this.configuration.secondparam = configuration;
              this.updateModel(this.configuration);
            }
          );
    
          this.changeSubscription = this.encryptMiddlewareNodeConfigFormGroup.get('secondbranchparam').valueChanges.subscribe(
            (configuration: any) => {
              this.configuration.secondbranchparam = configuration;
              this.updateModel(this.configuration);
            }
          );
    
          this.changeSubscription = this.encryptMiddlewareNodeConfigFormGroup.get('secondconstant').valueChanges.subscribe(
            (configuration: any) => {
              this.configuration.secondconstant = configuration;
              this.updateModel(this.configuration);
            }
          );
    
          this.changeSubscription = this.encryptMiddlewareNodeConfigFormGroup.get('secondproperty').valueChanges.subscribe(
            (configuration: any) => {
              this.configuration.secondproperty = configuration;
              this.updateModel(this.configuration);
            }
          );      
            this.changeSubscription = this.encryptMiddlewareNodeConfigFormGroup.get('encryption').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.encryption = configuration;
                    this.updateModel(this.configuration);
                }
            );

        }
    }

    private updateModel(configuration: RuleNodeConfiguration) {
        if (this.definedConfigComponent || this.encryptMiddlewareNodeConfigFormGroup.valid) {
            this.propagateChange(configuration);
        } else {
            this.propagateChange(this.required ? null : configuration);
        }
    }

}
