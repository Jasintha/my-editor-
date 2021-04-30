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
  selector: 'virtuan-casbin-auth-middleware-node-config',
  templateUrl: './casbin-auth-middleware-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CasbinAuthMiddlewareNodeConfigComponent),
    multi: true
  }]
})
export class CasbinAuthMiddlewareNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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

  casbinAuthMiddlewareNodeConfigFormGroup: FormGroup;

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
    this.casbinAuthMiddlewareNodeConfigFormGroup = this.fb.group({
      policyInputType: "",
      inlinePolicyContent: "",
      inputType: [],
      param: [],
      constant: [],
      property: [],
      branchparam: []
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

    let inputType: string = this.casbinAuthMiddlewareNodeConfigFormGroup.get('inputType').value;
    this.configuration.inputType = inputType;
    if (inputType === 'CONSTANT'){

      this.configuration.param= {};
      this.configuration.property= {};
      this.configuration.branchparam= {};
      this.casbinAuthMiddlewareNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.casbinAuthMiddlewareNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
      this.casbinAuthMiddlewareNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
    } else if (inputType === 'RULE_INPUT'){
      this.configuration.constant= {};
      this.configuration.property= {};
      this.configuration.branchparam= {};
      this.casbinAuthMiddlewareNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
      this.casbinAuthMiddlewareNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.casbinAuthMiddlewareNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.constant= {};
      this.configuration.param= {};
      this.configuration.branchparam= {};
      this.casbinAuthMiddlewareNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
      this.casbinAuthMiddlewareNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.casbinAuthMiddlewareNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.constant= {};
      this.configuration.param= {};
      this.configuration.property= {};
      this.casbinAuthMiddlewareNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.casbinAuthMiddlewareNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.casbinAuthMiddlewareNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }
  
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.casbinAuthMiddlewareNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.casbinAuthMiddlewareNodeConfigFormGroup.enable({emitEvent: false});
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
      if(this.configuration.inputType === 'RULE_INPUT' && this.allRuleInputs){
        p = this.allRuleInputs.find(x => x.inputName === this.configuration.param.inputName );
      }

      let c = this.configuration.constant;
      if(this.configuration.inputType === 'CONSTANT' && this.allConstants){
        c = this.allConstants.find(x => x.constantName === this.configuration.constant.constantName );
      }

      let property = this.configuration.property;
      if(this.configuration.inputType === 'PROPERTY' && this.allModelProperties){
        property = this.allModelProperties.find(x => x.name === this.configuration.property.name );
      }

      let branchparam = this.configuration.branchparam;
      if(this.configuration.inputType === 'BRANCH_PARAM' && this.branchAvailability.branchParams){
        branchparam = this.branchAvailability.branchParams.find(x => x.name === this.configuration.branchparam.name );
      }
      
      this.casbinAuthMiddlewareNodeConfigFormGroup.patchValue({
        policyInputType: this.configuration.policyInputType,
        inlinePolicyContent: this.configuration.inlinePolicyContent,
        inputType: this.configuration.inputType,
        param: p,
        constant: c,
        property: property,
        branchparam: branchparam
      });

      this.changeSubscription = this.casbinAuthMiddlewareNodeConfigFormGroup.get('policyInputType').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.policyInputType = configuration;

          if(configuration == 'INLINE'){
             this.configuration.inputType = "";
             this.configuration.param= {};
             this.configuration.property= {};
             this.configuration.branchparam= {};
             this.configuration.constant= {};

            this.casbinAuthMiddlewareNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
            this.casbinAuthMiddlewareNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
            this.casbinAuthMiddlewareNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
            this.casbinAuthMiddlewareNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
            this.casbinAuthMiddlewareNodeConfigFormGroup.get('inputType').patchValue("", {emitEvent: false});

          } else {
            this.configuration.inlinePolicyContent = "";
            this.casbinAuthMiddlewareNodeConfigFormGroup.get('inlinePolicyContent').patchValue("", {emitEvent: false});
          }

          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.casbinAuthMiddlewareNodeConfigFormGroup.get('inlinePolicyContent').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.inlinePolicyContent = configuration;
          this.updateModel(this.configuration);
        }
      );
      
      this.changeSubscription = this.casbinAuthMiddlewareNodeConfigFormGroup.get('param').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.param = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.casbinAuthMiddlewareNodeConfigFormGroup.get('branchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.branchparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.casbinAuthMiddlewareNodeConfigFormGroup.get('constant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.constant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.casbinAuthMiddlewareNodeConfigFormGroup.get('property').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.property = configuration;
          this.updateModel(this.configuration);
        }
      );

    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.casbinAuthMiddlewareNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}
