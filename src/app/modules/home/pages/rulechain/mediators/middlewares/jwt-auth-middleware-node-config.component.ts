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
  selector: 'virtuan-jwt-auth-middleware-node-config',
  templateUrl: './jwt-auth-middleware-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => JWTAuthMiddlewareNodeConfigComponent),
    multi: true
  }]
})
export class JWTAuthMiddlewareNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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

  datasource: MatTableDataSource<Param>;
  displayedColumns: string[] = ['name', 'inputType', 'input','record', 'actions'];

  get nodeDefinition(): RuleNodeDefinition {
    return this.nodeDefinitionValue;
  }

  definedDirectiveError: string;

  jwtAuthMiddlewareNodeConfigComponent: FormGroup;

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
    this.jwtAuthMiddlewareNodeConfigComponent = this.fb.group({
      signingKeyType: "",
      inputType: [],
      param: [],
      constant: [],
      property: [],
      branchparam: [],
      secondinputType: [],
      secondconstant: [],
      secondparam: [],
      secondproperty:[],
      secondbranchparam: [],
      basepathinputType: [],
      basepathconstant: [],
      basepathparam: [],
      basepathproperty:[],
      basepathbranchparam: [],
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
      this.jwtAuthMiddlewareNodeConfigComponent.disable({emitEvent: false});
    } else {
      this.jwtAuthMiddlewareNodeConfigComponent.enable({emitEvent: false});
    }
  }
  
  refreshSigningKeyInputType(){
    let signingKeyType: string = this.jwtAuthMiddlewareNodeConfigComponent.get('signingKeyType').value;
    this.configuration.signingKeyType = signingKeyType;
    
    if (signingKeyType === 'KEY'){
      this.configuration.basepathinputType= "";   
      this.configuration.secondinputType= "";    
      this.configuration.basepathparam= {};
      this.configuration.basepathproperty= {};
      this.configuration.basepathbranchparam= {};
      this.configuration.basepathconstant= {};
      this.configuration.secondparam= {};
      this.configuration.secondproperty= {};
      this.configuration.secondbranchparam= {};
      this.configuration.secondconstant= {};
      this.jwtAuthMiddlewareNodeConfigComponent.get('basepathinputType').patchValue("", {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('secondinputType').patchValue("", {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('secondparam').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('secondbranchparam').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('secondproperty').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('secondconstant').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('basepathparam').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('basepathbranchparam').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('basepathproperty').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('basepathconstant').patchValue([], {emitEvent: false});        
    } else if (signingKeyType === 'FILE_PATH'){
      this.configuration.param= {};
      this.configuration.property= {};
      this.configuration.branchparam= {};
      this.configuration.constant= {};
      this.jwtAuthMiddlewareNodeConfigComponent.get('param').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('branchparam').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('property').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('constant').patchValue([], {emitEvent: false});
    }
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }
    
  }

  refreshInputTypes(){

    let inputType: string = this.jwtAuthMiddlewareNodeConfigComponent.get('inputType').value;
    this.configuration.inputType = inputType;
    if (inputType === 'CONSTANT'){

      this.configuration.param= {};
      this.configuration.property= {};
      this.configuration.branchparam= {};
      this.jwtAuthMiddlewareNodeConfigComponent.get('param').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('branchparam').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('property').patchValue([], {emitEvent: false});
    } else if (inputType === 'RULE_INPUT'){
      this.configuration.constant= {};
      this.configuration.property= {};
      this.configuration.branchparam= {};
      this.jwtAuthMiddlewareNodeConfigComponent.get('branchparam').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('constant').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('property').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.constant= {};
      this.configuration.param= {};
      this.configuration.branchparam= {};
      this.jwtAuthMiddlewareNodeConfigComponent.get('branchparam').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('constant').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('param').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.constant= {};
      this.configuration.param= {};
      this.configuration.property= {};
      this.jwtAuthMiddlewareNodeConfigComponent.get('constant').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('param').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('property').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }
  
  refreshBasePathInputTypes(){

    let inputType: string = this.jwtAuthMiddlewareNodeConfigComponent.get('basepathinputType').value;
    this.configuration.basepathinputType = inputType;
    if (inputType === 'CONSTANT'){

      this.configuration.basepathparam= {};
      this.configuration.basepathproperty= {};
      this.configuration.basepathbranchparam= {};
      this.jwtAuthMiddlewareNodeConfigComponent.get('basepathparam').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('basepathbranchparam').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('basepathproperty').patchValue([], {emitEvent: false});
    } else if (inputType === 'RULE_INPUT'){
      this.configuration.basepathconstant= {};
      this.configuration.basepathproperty= {};
      this.configuration.basepathbranchparam= {};
      this.jwtAuthMiddlewareNodeConfigComponent.get('basepathbranchparam').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('basepathconstant').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('basepathproperty').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.basepathconstant= {};
      this.configuration.basepathparam= {};
      this.configuration.basepathbranchparam= {};
      this.jwtAuthMiddlewareNodeConfigComponent.get('basepathbranchparam').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('basepathconstant').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('basepathparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.basepathconstant= {};
      this.configuration.basepathparam= {};
      this.configuration.basepathproperty= {};
      this.jwtAuthMiddlewareNodeConfigComponent.get('basepathconstant').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('basepathparam').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('basepathproperty').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }
  
  refreshSecodInputTypes(){

    let inputType: string = this.jwtAuthMiddlewareNodeConfigComponent.get('secondinputType').value;
    this.configuration.secondinputType = inputType;
    if (inputType === 'CONSTANT'){

      this.configuration.secondparam= {};
      this.configuration.secondproperty= {};
      this.configuration.secondbranchparam= {};
      this.jwtAuthMiddlewareNodeConfigComponent.get('secondparam').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('secondbranchparam').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('secondproperty').patchValue([], {emitEvent: false});
    } else if (inputType === 'RULE_INPUT'){
      this.configuration.secondconstant= {};
      this.configuration.secondproperty= {};
      this.configuration.secondbranchparam= {};
      this.jwtAuthMiddlewareNodeConfigComponent.get('secondbranchparam').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('secondconstant').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('secondproperty').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.secondconstant= {};
      this.configuration.secondparam= {};
      this.configuration.secondbranchparam= {};
      this.jwtAuthMiddlewareNodeConfigComponent.get('secondbranchparam').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('secondconstant').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('secondparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.secondconstant= {};
      this.configuration.secondparam= {};
      this.configuration.secondproperty= {};
      this.jwtAuthMiddlewareNodeConfigComponent.get('secondconstant').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('secondparam').patchValue([], {emitEvent: false});
      this.jwtAuthMiddlewareNodeConfigComponent.get('secondproperty').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }
  
  deleteRow(index: number): void{
    this.configuration.customClaims.splice(index, 1);
    this.datasource = new MatTableDataSource(this.configuration.customClaims);
    this.updateModel(this.configuration);
  }
  
  addParam(): void{

    let inputType: string = this.jwtAuthMiddlewareNodeConfigComponent.get('paraminputType').value;
    let paramName: string = this.jwtAuthMiddlewareNodeConfigComponent.get('paramName').value;
    let paramRecord: string = this.jwtAuthMiddlewareNodeConfigComponent.get('paramRecord').value;

    if (inputType === 'MODEL'){
      let selectedEntity = this.jwtAuthMiddlewareNodeConfigComponent.get('paramentity').value;
      let entityparam = {
        'name': paramName,
        'inputType': inputType,
        'input': selectedEntity.name,
        'record': paramRecord
      };
      this.configuration.customClaims.push(entityparam);
      this.updateModel(this.configuration);
    } else if (inputType === 'DTO'){
      let selectedDTO = this.jwtAuthMiddlewareNodeConfigComponent.get('paramcustomObject').value;
      let dtoParam = {
        'name': paramName,
        'inputType': inputType,
        'input': selectedDTO.name,
        'record': paramRecord
      };
      this.configuration.customClaims.push(dtoParam);
      this.updateModel(this.configuration);
    } else if (inputType === 'PRIMITIVE'){
      let selectedprimitive = this.jwtAuthMiddlewareNodeConfigComponent.get('primitive').value;
      let primitiveParam = {
        'name': paramName,
        'inputType': inputType,
        'input': selectedprimitive,
        'record': paramRecord
      };
      this.configuration.customClaims.push(primitiveParam);
      this.updateModel(this.configuration);
    } else if (inputType === 'ANY'){
      let anyParam = {
        'name': paramName,
        'inputType': inputType,
        'input': '-',
        'record': paramRecord
      };
      this.configuration.customClaims.push(anyParam);
      this.updateModel(this.configuration);
    }

    this.datasource = new MatTableDataSource(this.configuration.customClaims);

    this.jwtAuthMiddlewareNodeConfigComponent.patchValue({
      paraminputType: '',
      paramName: '',
      paramRecord: '',
      paramentity: [],
      paramcustomObject: [],
      primitive: ''
    });

  }
  
  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);
    if(this.configuration.customClaims === null || this.configuration.customClaims === undefined){
        this.configuration.customClaims = [];
    }
    this.datasource = new MatTableDataSource(this.configuration.customClaims);

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
     
     let basepathp = this.configuration.basepathparam;
     let basepathc = this.configuration.basepathconstant;
     let basepathproperty = this.configuration.basepathproperty;
     let basepathbranchparam = this.configuration.basepathbranchparam;
     
     let secondp = this.configuration.secondparam;
     let secondc = this.configuration.secondconstant;
     let secondproperty = this.configuration.secondproperty;
     let secondbranchparam = this.configuration.secondbranchparam;
     
     if(this.configuration.signingKeyType === 'KEY'){
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
     } else if(this.configuration.signingKeyType === 'FILE_PATH'){
          if(this.configuration.basepathinputType === 'RULE_INPUT' && this.allRuleInputs){
            basepathp = this.allRuleInputs.find(x => x.inputName === this.configuration.basepathparam.inputName );
          }      
          if(this.configuration.basepathinputType === 'CONSTANT' && this.allConstants){
            basepathc = this.allConstants.find(x => x.constantName === this.configuration.basepathconstant.constantName );
          }      
          if(this.configuration.basepathinputType === 'PROPERTY' && this.allModelProperties){
            basepathproperty = this.allModelProperties.find(x => x.name === this.configuration.basepathproperty.name );
          }      
          if(this.configuration.basepathinputType === 'BRANCH_PARAM' && this.branchAvailability.customClaims){
            basepathbranchparam = this.branchAvailability.customClaims.find(x => x.name === this.configuration.basepathbranchparam.name );
          } 
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
     
     
      this.jwtAuthMiddlewareNodeConfigComponent.patchValue({
        signingKeyType: this.configuration.signingKeyType,
        inputType: this.configuration.inputType,
        basepathinputType: this.configuration.basepathinputType,
        secondinputType: this.configuration.secondinputType,
        param: p,
        constant: c,
        property: property,
        branchparam: branchparam,   
        basepathparam: basepathp,
        basepathconstant: basepathc,
        basepathproperty: basepathproperty,
        basepathbranchparam: basepathbranchparam,    
        secondparam: secondp,
        secondconstant: secondc,
        secondproperty: secondproperty,
        secondbranchparam: secondbranchparam,   
        paraminputType: this.configuration.paraminputType,
        paramName: this.configuration.paramName,
        paramRecord: this.configuration.paramRecord,
        paramentity: this.configuration.paramentity,
        paramcustomObject: this.configuration.paramcustomObject,
        primitive: this.configuration.primitive
      });
      
      this.changeSubscription = this.jwtAuthMiddlewareNodeConfigComponent.get('param').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.param = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.jwtAuthMiddlewareNodeConfigComponent.get('branchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.branchparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.jwtAuthMiddlewareNodeConfigComponent.get('constant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.constant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.jwtAuthMiddlewareNodeConfigComponent.get('property').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.property = configuration;
          this.updateModel(this.configuration);
        }
      );
      
      this.changeSubscription = this.jwtAuthMiddlewareNodeConfigComponent.get('basepathparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.basepathparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.jwtAuthMiddlewareNodeConfigComponent.get('basepathbranchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.basepathbranchparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.jwtAuthMiddlewareNodeConfigComponent.get('basepathconstant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.basepathconstant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.jwtAuthMiddlewareNodeConfigComponent.get('basepathproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.basepathproperty = configuration;
          this.updateModel(this.configuration);
        }
      );
      
      this.changeSubscription = this.jwtAuthMiddlewareNodeConfigComponent.get('secondparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.jwtAuthMiddlewareNodeConfigComponent.get('secondbranchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondbranchparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.jwtAuthMiddlewareNodeConfigComponent.get('secondconstant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondconstant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.jwtAuthMiddlewareNodeConfigComponent.get('secondproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.secondproperty = configuration;
          this.updateModel(this.configuration);
        }
      );
      
      this.changeSubscription = this.jwtAuthMiddlewareNodeConfigComponent.get('paraminputType').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {
          this.configuration.paraminputType = configuration;

          if(this.configuration.paraminputType == 'MODEL'){
            this.configuration.paramcustomObject= {};
            this.jwtAuthMiddlewareNodeConfigComponent.get('paramcustomObject').patchValue([], {emitEvent: false});
          }else if (this.configuration.paraminputType == 'DTO'){
            this.configuration.paramentity= {};
            this.jwtAuthMiddlewareNodeConfigComponent.get('paramentity').patchValue([], {emitEvent: false});
          }

          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.jwtAuthMiddlewareNodeConfigComponent.get('paramName').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {
          this.configuration.paramName = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.jwtAuthMiddlewareNodeConfigComponent.get('paramRecord').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {
          this.configuration.paramRecord = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.jwtAuthMiddlewareNodeConfigComponent.get('paramentity').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {
          this.configuration.paramentity = configuration;
          this.configuration.paramcustomObject = {};
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.jwtAuthMiddlewareNodeConfigComponent.get('paramcustomObject').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {
          this.configuration.paramcustomObject = configuration;
          this.configuration.paramentity = {};
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.jwtAuthMiddlewareNodeConfigComponent.get('primitive').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {
          this.configuration.primitive = configuration;
          this.updateModel(this.configuration);
        }
      );

    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.jwtAuthMiddlewareNodeConfigComponent.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}


export interface Param {
  name: string;
  inputType: string;
  input: string;
  record: string;
}
