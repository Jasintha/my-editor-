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
  selector: 'tb-event-receiver-node-config',
  templateUrl: './event-receiver-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => EventReceiverNodeConfigComponent),
    multi: true
  }]
})
export class EventReceiverNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
  allEvents: any[];

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

  eventReceiverNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  private configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.eventReceiverNodeConfigFormGroup = this.fb.group({
      eventSource: [],
      subject: [],
      event: []
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
      this.eventReceiverNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.eventReceiverNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);
    console.log("printttt");
    console.log(this.configuration);
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

      let e = this.configuration.event;
      //e = this.allEvents.find(x => x.name === this.configuration.event);
        console.log(e);

      this.eventReceiverNodeConfigFormGroup.patchValue({
        eventSource: this.configuration.eventSource,
        subject: this.configuration.subject,
        event: this.configuration.event
      });

      this.changeSubscription = this.eventReceiverNodeConfigFormGroup.get('event').valueChanges.subscribe(
        (configuration: any) => {
          console.log(configuration);
          this.configuration.event = configuration;
          this.updateModel(this.configuration);
        }
      );
      this.changeSubscription = this.eventReceiverNodeConfigFormGroup.get('eventSource').valueChanges.subscribe(
        (configuration: any) => {
          console.log(configuration);
          this.configuration.eventSource = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.eventReceiverNodeConfigFormGroup.get('subject').valueChanges.subscribe(
        (configuration: any) => {
          console.log(configuration);
          this.configuration.subject = configuration;
          this.updateModel(this.configuration);
        }
      );
    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.eventReceiverNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}

