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
  selector: 'virtuan-iterator-node-config',
  templateUrl: './iterator-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => IteratorNodeConfigComponent),
    multi: true
  }]
})
export class IteratorNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
  disabled: boolean;

  @Input()
  ruleNodeId: string;

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
  allRoots: any[];

  @Input() branchAvailability: any;

  @Input()
  apptype: string;

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

  iteratorNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.iteratorNodeConfigFormGroup = this.fb.group({
      property: [],
      inputType: '',
      branchparam: [],
      assignedProperty: [],
    //  root: [],
    //  isAsync: false,
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
  console.log(this.allModelProperties);
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
      this.iteratorNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.iteratorNodeConfigFormGroup.enable({emitEvent: false});
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
      /*
      let root = this.configuration.root;
      if(root && this.allRoots){
        root = this.allRoots.find(x => x === this.configuration.root );
      }
      */

      let property = this.configuration.property;
      if(this.configuration.inputType === 'PROPERTY' && this.allModelProperties){
        property = this.allModelProperties.find(x => x.name === this.configuration.property.name );
      }

      let assignedProperty = this.configuration.assignedProperty;
      if(assignedProperty && this.allModelProperties){
        assignedProperty = this.allModelProperties.find(x => x.name === this.configuration.assignedProperty.name );
      }

      let branchparam = this.configuration.branchparam;
      if(this.configuration.inputType === 'BRANCH_PARAM' && this.branchAvailability.branchParams){
        branchparam = this.branchAvailability.branchParams.find(x => x.name === this.configuration.branchparam.name );
      }

      this.iteratorNodeConfigFormGroup.patchValue({
        property: property,
        assignedProperty: assignedProperty,
        branchparam: branchparam,
        inputType: this.configuration.inputType,
       // root: root,
       // isAsync: this.configuration.isAsync,
        errorMsg: this.configuration.errorMsg,
        errorAction: this.configuration.errorAction
      });

      /*
      this.changeSubscription = this.iteratorNodeConfigFormGroup.get('isAsync').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.isAsync = configuration;
          this.updateModel(this.configuration);
        }
      );
      */

      this.changeSubscription = this.iteratorNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorMsg = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.iteratorNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
        (configuration: any) => {
          console.log(configuration);
          this.configuration.errorAction = configuration;
          this.updateModel(this.configuration);
        }
      );

      /*
      this.changeSubscription = this.iteratorNodeConfigFormGroup.get('root').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.root = configuration;
          this.updateModel(this.configuration);
        }
      );
      */

      this.changeSubscription = this.iteratorNodeConfigFormGroup.get('property').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.property = configuration;
          this.configuration.branchparam = {};
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.iteratorNodeConfigFormGroup.get('branchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.branchparam = configuration;
          this.configuration.property = {};
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.iteratorNodeConfigFormGroup.get('assignedProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.assignedProperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.iteratorNodeConfigFormGroup.get('inputType').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.inputType = configuration;
          if(this.configuration.inputType == 'PROPERTY'){
            this.configuration.branchparam= {};
            this.iteratorNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
          }else if (this.configuration.inputType == 'BRANCH_PARAM'){
            this.configuration.property= {};
            this.iteratorNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
          }
          this.updateModel(this.configuration);
        }
      );

    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {

    if (this.definedConfigComponent || this.iteratorNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}

