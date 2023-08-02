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
    selector: 'virtuan-uibTrace-node-config',
    templateUrl: './uibTrace-node-config.component.html',
    providers: [{
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UibTraceNodeConfigComponent),
      multi: true
    }]
  })
  export class UibTraceNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {
  
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
    allRuleInputs: any[];
  
    @Input()
    allConstants: any[];
  
    @Input()
    inputCustomobjects: any[];
  
    @Input()
    allModelProperties: any[];
  
    @Input()
    apptype: string;
  
    @Input() branchAvailability: any;
  
    nodeDefinitionValue: RuleNodeDefinition;
  
    datasource: MatTableDataSource<uibField>;
  
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
  
    uibTraceNodeConfigFormGroup: FormGroup;
  
    changeSubscription: Subscription;
  
    displayedColumns: string[] = ['name', 'value', 'actions'];
  
    private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
    private definedConfigComponent: IRuleNodeConfigurationComponent;
  
    configuration: RuleNodeConfiguration;
  
    private propagateChange = (v: any) => { };
  
    constructor(private translate: TranslateService,
                private ruleChainService: RuleChainService,
                private fb: FormBuilder) {
      this.uibTraceNodeConfigFormGroup = this.fb.group({
        name: [],
        value: [],
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
  
    addUIBFields(): void{
    
      let inputValue: string = this.uibTraceNodeConfigFormGroup.get('value').value;
      let inputName: string = this.uibTraceNodeConfigFormGroup.get('name').value;
  
       let uibparameter = {
          'name': inputName,
          'value': inputValue,
        };
        this.configuration.callProperties.push(uibparameter);
        this.updateModel(this.configuration);
      
      this.datasource = new MatTableDataSource(this.configuration.callProperties);
      this.configuration.value = {};
      this.configuration.name= {};
    
      this.uibTraceNodeConfigFormGroup.patchValue({
        name: '',
        value: '',
      });
  
    }
  
    deleteRow(index: number): void{
      this.configuration.callProperties.splice(index, 1);
      this.datasource = new MatTableDataSource(this.configuration.callProperties);
      this.updateModel(this.configuration);
    }
  
    setDisabledState(isDisabled: boolean): void {
      this.disabled = isDisabled;
      if (this.disabled) {
        this.uibTraceNodeConfigFormGroup.disable({emitEvent: false});
      } else {
        this.uibTraceNodeConfigFormGroup.enable({emitEvent: false});
      }
    }
  
    writeValue(value: RuleNodeConfiguration): void {
  
      this.configuration = deepClone(value);
      if(this.configuration.callProperties === null || this.configuration.callProperties === undefined){
          this.configuration.callProperties = [];
      }
      this.datasource = new MatTableDataSource(this.configuration.callProperties);
  
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
  
        this.uibTraceNodeConfigFormGroup.patchValue({
          name: this.configuration.name,
          value: this.configuration.value,
        });
  
        this.changeSubscription = this.uibTraceNodeConfigFormGroup.get('name').valueChanges.subscribe(
          (configuration: RuleNodeConfiguration) => {
            this.configuration.name = configuration;
            this.updateModel(this.configuration);
          }
        );

        this.changeSubscription = this.uibTraceNodeConfigFormGroup.get('value').valueChanges.subscribe(
            (configuration: RuleNodeConfiguration) => {
              this.configuration.value = configuration;
              this.updateModel(this.configuration);
            }
          );
  
      }
    }
  
    private updateModel(configuration: RuleNodeConfiguration) {
  
      if (this.definedConfigComponent || this.uibTraceNodeConfigFormGroup.valid) {
        this.propagateChange(configuration);
      } else {
  
        this.propagateChange(this.required ? null : configuration);
      }
    }
  
  }
  
  export interface uibField {
    name: string;
    value: string;
  }
  