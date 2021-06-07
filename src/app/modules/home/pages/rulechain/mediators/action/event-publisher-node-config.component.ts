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

@Component({
  selector: 'virtuan-event-publisher-node-config',
  templateUrl: './event-publisher-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => EventPublisherNodeConfigComponent),
    multi: true
  }]
})
export class EventPublisherNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
  allConnectionProperties: any[];

  @Input()
  disabled: boolean;

  @Input()
  ruleNodeId: string;

  @Input()
  allEvents: any[];

  @Input()
  allModelProperties: any[];

  @Input()
  allConstants: any[];

  @Input()
  allRuleInputs: any[];

  @Input() branchAvailability: any;


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

  eventPublisherNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.eventPublisherNodeConfigFormGroup = this.fb.group({
    //  eventSource: [],
      subject: [],
      event: [],
      inputType: "",
      constant: [],
      param: [],
      property: [],
      branchparam: [],
      esConnection: [],
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
      this.eventPublisherNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.eventPublisherNodeConfigFormGroup.enable({emitEvent: false});
    }
  }
  
  refreshInputTypes(){
    let inputType: string = this.eventPublisherNodeConfigFormGroup.get('inputType').value;
    this.configuration.inputType = inputType;

     if (inputType === 'CONSTANT'){
      this.configuration.param= {};
      this.configuration.property= {};
      this.configuration.branchparam= {};
      
      this.eventPublisherNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.eventPublisherNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
      this.eventPublisherNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
      
    } else if (inputType === 'RULE_INPUT'){
      this.configuration.constant= {};
      this.configuration.property= {};
      this.configuration.branchparam= {};
      
      this.eventPublisherNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.eventPublisherNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
      this.eventPublisherNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.constant= {};
      this.configuration.param= {};
      this.configuration.branchparam= {};
      this.eventPublisherNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.eventPublisherNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.eventPublisherNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.constant= {};
      this.configuration.param= {};
      this.configuration.property= {};
      this.eventPublisherNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.eventPublisherNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.eventPublisherNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
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

      let param = this.configuration.param;
      if(this.configuration.inputType === 'RULE_INPUT' && this.allRuleInputs){
        param = this.allRuleInputs.find(x => x.inputName === this.configuration.param.inputName );
      }

      let constant = this.configuration.constant;
      if(this.configuration.inputType === 'CONSTANT' && this.allConstants){
        constant = this.allConstants.find(x => x.constantName === this.configuration.constant.constantName );
      }

      let property = this.configuration.property;
      if(this.configuration.inputType === 'PROPERTY' && this.allModelProperties){
        property = this.allModelProperties.find(x => x.name === this.configuration.property.name );
      }

      let branchparam = this.configuration.branchparam;
      if(this.configuration.inputType === 'BRANCH_PARAM' && this.branchAvailability.branchParams){
        branchparam = this.branchAvailability.branchParams.find(x => x.name === this.configuration.branchparam.name );
      }

      let esConnection = this.configuration.esConnection;
      if(this.configuration.esConnection){
        esConnection = this.allConnectionProperties.find(x => x.name === this.configuration.esConnection.name );
      }

      let e = this.configuration.event;
     // e = this.allEvents.find(x => x.name === this.configuration.event);

      this.eventPublisherNodeConfigFormGroup.patchValue({
      //  eventSource: this.configuration.eventSource,
        inputType: this.configuration.inputType,
        esConnection: esConnection,
        subject: this.configuration.subject,
        event: this.configuration.event,
        errorMsg: this.configuration.errorMsg,
        errorAction: this.configuration.errorAction,
        param: param,
        constant: constant,
        branchparam: branchparam,
        property: property
      });

      this.changeSubscription = this.eventPublisherNodeConfigFormGroup.get('event').valueChanges.subscribe(
        (configuration: any) => {

          this.configuration.event = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.eventPublisherNodeConfigFormGroup.get('param').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.param = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.eventPublisherNodeConfigFormGroup.get('constant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.constant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.eventPublisherNodeConfigFormGroup.get('property').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.property = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.eventPublisherNodeConfigFormGroup.get('branchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.branchparam = configuration;
          this.updateModel(this.configuration);
        }
      );

    /*
      this.changeSubscription = this.eventPublisherNodeConfigFormGroup.get('eventSource').valueChanges.subscribe(
        (configuration: any) => {

          this.configuration.eventSource = configuration;
          this.updateModel(this.configuration);
        }
      );
    */
      this.changeSubscription = this.eventPublisherNodeConfigFormGroup.get('subject').valueChanges.subscribe(
        (configuration: any) => {

          this.configuration.subject = configuration;
          this.updateModel(this.configuration);
        }
      );
      
      this.changeSubscription = this.eventPublisherNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorMsg = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.eventPublisherNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
        (configuration: any) => {

          this.configuration.errorAction = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.eventPublisherNodeConfigFormGroup.get('esConnection').valueChanges.subscribe(
        (configuration: any) => {

          this.configuration.esConnection = configuration;
          this.updateModel(this.configuration);
        }
      );
    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.eventPublisherNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}

