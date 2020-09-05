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
  selector: 'tb-constant-node-config',
  templateUrl: './constant-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ConstantNodeConfigComponent),
    multi: true
  }]
})
export class ConstantNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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

  datasource: MatTableDataSource<Constant>;

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

  constantNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  displayedColumns: string[] = ['constantName', 'constantType', 'customValue', 'actions'];

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.constantNodeConfigFormGroup = this.fb.group({
      constantName: [],
      constantType: [],
      customValue: []
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

  addConstant(): void{
    let constant = {
      'constantName': this.constantNodeConfigFormGroup.get('constantName').value,
      'constantType': this.constantNodeConfigFormGroup.get('constantType').value,
      'customValue': this.constantNodeConfigFormGroup.get('customValue').value
    };
    this.configuration.constants.push(constant);
    this.updateModel(this.configuration);
    this.datasource = new MatTableDataSource(this.configuration.constants);
    this.constantNodeConfigFormGroup.patchValue({
      constantName: '',
      constantType: '',
      customValue: ''
    });
  }

  deleteRow(index: number): void{
    this.configuration.constants.splice(index, 1);
    this.datasource = new MatTableDataSource(this.configuration.constants);
    this.updateModel(this.configuration);
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.constantNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.constantNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);
    this.datasource = new MatTableDataSource(this.configuration.constants);

    if (this.changeSubscription) {
      this.changeSubscription.unsubscribe();
      this.changeSubscription = null;
    }
    if (this.definedConfigComponent) {
    console.log("came inside definedCOnfig Component");
    console.log(this.configuration);
      this.definedConfigComponent.configuration = this.configuration;
      this.changeSubscription = this.definedConfigComponent.configurationChanged.subscribe((configuration) => {
        this.updateModel(configuration);
      });
    } else {
      //this.constantNodeConfigFormGroup.get('payload').patchValue(this.configuration.payload, {emitEvent: false});
      /*
      this.changeSubscription = this.constantNodeConfigFormGroup.get('payload').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {

          console.log("payload node value cahnge sub");
          console.log(configuration);
          this.configuration.payload = configuration;
          this.updateModel(this.configuration);
        }
      );
      */
    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {

  console.log("update model");
    if (this.definedConfigComponent || this.constantNodeConfigFormGroup.valid) {
      console.log("came valid");
      console.log(configuration);
      this.propagateChange(configuration);
    } else {
     console.log("came else block");

     let blah = this.required ? null : configuration;
     console.log("blahhh log");
     console.log(blah);
      this.propagateChange(this.required ? null : configuration);
    }
  }

}

export interface Constant {
  constantName: string;
  constantType: string;
  customValue: string;
}
