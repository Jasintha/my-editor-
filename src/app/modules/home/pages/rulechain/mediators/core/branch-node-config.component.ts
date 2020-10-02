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
  selector: 'tb-branch-node-config',
  templateUrl: './branch-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => BranchNodeConfigComponent),
    multi: true
  }]
})
export class BranchNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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

  nodeDefinitionValue: RuleNodeDefinition;

  @Input()
  allRoots: string[];

  errorOptions: any[] = [{'name': 'Log & Continue', 'id': 1}, {'name': 'Log & Exit', 'id': 2}, {'name': 'Return', 'id': 3}];

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

  branchNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;


  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.branchNodeConfigFormGroup = this.fb.group({
      root: "",
      isAsync: false,
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
      this.branchNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.branchNodeConfigFormGroup.enable({emitEvent: false});
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

      let root = this.configuration.root;
      if(root && this.allRoots){
      console.log(this.allRoots);
        root = this.allRoots.find(x => x === this.configuration.root );
      }
      let errorAction = this.configuration.errorAction;
      //if(errorAction > 0){
       // errorAction = this.errorOptions.find(x => x.id === this.configuration.errorAction );
     // }

      this.branchNodeConfigFormGroup.patchValue({
        root: root,
        isAsync: this.configuration.isAsync,
        errorMsg: this.configuration.errorMsg,
        errorAction: errorAction
      });

      this.changeSubscription = this.branchNodeConfigFormGroup.get('isAsync').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.isAsync = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.branchNodeConfigFormGroup.get('root').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.root = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.branchNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorMsg = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.branchNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
        (configuration: any) => {
          console.log(configuration);
          this.configuration.errorAction = configuration;
          this.updateModel(this.configuration);
        }
      );
    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {

    if (this.definedConfigComponent || this.branchNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}
