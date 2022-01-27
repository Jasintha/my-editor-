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
  selector: 'virtuan-http-header-node-config',
  templateUrl: './http-header-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => HttpHeaderNodeConfigComponent),
    multi: true
  }]
})
export class HttpHeaderNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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

  httpHeaderNodeConfigFormGroup: FormGroup;

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

  datasource: MatTableDataSource<HTTPHeader>;

  displayedColumns: string[] = ['headerType', 'keyinputType', 'keyName', 'valueinputType', 'valueName', 'actions'];

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.httpHeaderNodeConfigFormGroup = this.fb.group({
      headerType: "",
      propertyinputType: "",
      propertyproperty: [],
      propertyparam: [],
      propertyconstant:[],
      propertybranchparam: [],
      valueinputType: "",
      valueparam: [],
      valueproperty: [],
      valueconstant:[],
      valuebranchparam: [],
      redirectAvailable: false,
      redirectType: "",
      inputType: "",
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


  refreshInputTypes(){
    let inputType: string = this.httpHeaderNodeConfigFormGroup.get('inputType').value;
    this.configuration.inputType = inputType;
    if (inputType === 'CONSTANT'){
      this.configuration.param= {};
      this.configuration.property= {};
      this.configuration.branchparam= {};
      this.httpHeaderNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.httpHeaderNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
      this.httpHeaderNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
    } else if (inputType === 'RULE_INPUT'){
      this.configuration.constant= {};
      this.configuration.property= {};
      this.configuration.branchparam= {};
      this.httpHeaderNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
      this.httpHeaderNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.httpHeaderNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.constant= {};
      this.configuration.param= {};
      this.configuration.branchparam= {};
      this.httpHeaderNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
      this.httpHeaderNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.httpHeaderNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.constant= {};
      this.configuration.param= {};
      this.configuration.property= {};
      this.httpHeaderNodeConfigFormGroup.get('constant').patchValue([], {emitEvent: false});
      this.httpHeaderNodeConfigFormGroup.get('param').patchValue([], {emitEvent: false});
      this.httpHeaderNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
    } 
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  refreshKeyInputTypes(){
    let inputType: string = this.httpHeaderNodeConfigFormGroup.get('propertyinputType').value;
    this.configuration.propertyinputType = inputType;

    if (inputType === 'CONSTANT'){
      this.configuration.propertyparam= {};
      this.configuration.propertyproperty= {};
      this.configuration.propertybranchparam= {};

      this.httpHeaderNodeConfigFormGroup.get('propertyparam').patchValue([], {emitEvent: false});
      this.httpHeaderNodeConfigFormGroup.get('propertyproperty').patchValue([], {emitEvent: false});
      this.httpHeaderNodeConfigFormGroup.get('propertybranchparam').patchValue([], {emitEvent: false});

    } else if (inputType === 'RULE_INPUT'){
      this.configuration.propertyconstant= {};
      this.configuration.propertyproperty= {};
      this.configuration.propertybranchparam= {};

      this.httpHeaderNodeConfigFormGroup.get('propertyconstant').patchValue([], {emitEvent: false});
      this.httpHeaderNodeConfigFormGroup.get('propertyproperty').patchValue([], {emitEvent: false});
      this.httpHeaderNodeConfigFormGroup.get('propertybranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.propertyconstant= {};
      this.configuration.propertyparam= {};
      this.configuration.propertybranchparam= {};

      this.httpHeaderNodeConfigFormGroup.get('propertyconstant').patchValue([], {emitEvent: false});
      this.httpHeaderNodeConfigFormGroup.get('propertyparam').patchValue([], {emitEvent: false});
      this.httpHeaderNodeConfigFormGroup.get('propertybranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.propertyconstant= {};
      this.configuration.propertyparam= {};
      this.configuration.propertyproperty= {};

      this.httpHeaderNodeConfigFormGroup.get('propertyconstant').patchValue([], {emitEvent: false});
      this.httpHeaderNodeConfigFormGroup.get('propertyparam').patchValue([], {emitEvent: false});
      this.httpHeaderNodeConfigFormGroup.get('propertyproperty').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  refreshSecondInputTypes(){
    let inputType: string = this.httpHeaderNodeConfigFormGroup.get('valueinputType').value;
    this.configuration.valueinputType = inputType;

    if (inputType === 'CONSTANT'){
      this.configuration.valueparam= {};
      this.configuration.valueproperty= {};
      this.configuration.valuebranchparam= {};

      this.httpHeaderNodeConfigFormGroup.get('valueparam').patchValue([], {emitEvent: false});
      this.httpHeaderNodeConfigFormGroup.get('valueproperty').patchValue([], {emitEvent: false});
      this.httpHeaderNodeConfigFormGroup.get('valuebranchparam').patchValue([], {emitEvent: false});

    } else if (inputType === 'RULE_INPUT'){
      this.configuration.valueconstant= {};
      this.configuration.valueproperty= {};
      this.configuration.valuebranchparam= {};

      this.httpHeaderNodeConfigFormGroup.get('valueconstant').patchValue([], {emitEvent: false});
      this.httpHeaderNodeConfigFormGroup.get('valueproperty').patchValue([], {emitEvent: false});
      this.httpHeaderNodeConfigFormGroup.get('valuebranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'PROPERTY'){
      this.configuration.valueconstant= {};
      this.configuration.valueparam= {};
      this.configuration.valuebranchparam= {};

      this.httpHeaderNodeConfigFormGroup.get('valueconstant').patchValue([], {emitEvent: false});
      this.httpHeaderNodeConfigFormGroup.get('valueparam').patchValue([], {emitEvent: false});
      this.httpHeaderNodeConfigFormGroup.get('valuebranchparam').patchValue([], {emitEvent: false});
    } else if (inputType === 'BRANCH_PARAM'){
      this.configuration.valueconstant= {};
      this.configuration.valueparam= {};
      this.configuration.valueproperty= {};

      this.httpHeaderNodeConfigFormGroup.get('valueconstant').patchValue([], {emitEvent: false});
      this.httpHeaderNodeConfigFormGroup.get('valueparam').patchValue([], {emitEvent: false});
      this.httpHeaderNodeConfigFormGroup.get('valueproperty').patchValue([], {emitEvent: false});
    }

    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  addHTTPHeader(): void{

    let propinputType: string = this.httpHeaderNodeConfigFormGroup.get('propertyinputType').value;
    let valueinputType: string = this.httpHeaderNodeConfigFormGroup.get('valueinputType').value;
    let headerType: string = this.httpHeaderNodeConfigFormGroup.get('headerType').value;

    let propertyName: string = '';
    let valueName: string = '';
    let propertyScope: string = '';
    let valueScope: string = '';

    if (propinputType === 'RULE_INPUT'){
      let selectedPropertyParam = this.httpHeaderNodeConfigFormGroup.get('propertyparam').value;
      propertyName = selectedPropertyParam.inputName;

    } else if (propinputType === 'PROPERTY'){
      let selectedPropertyProperty = this.httpHeaderNodeConfigFormGroup.get('propertyproperty').value;
      propertyName = selectedPropertyProperty.name;
      propertyScope = selectedPropertyProperty.propertyScope;

    } else if (propinputType === 'BRANCH_PARAM'){
      let selectedPropertyBranch = this.httpHeaderNodeConfigFormGroup.get('propertybranchparam').value;
      propertyName = selectedPropertyBranch.name;

    } else if (propinputType === 'CONSTANT'){
      let selectedPropertyConstant = this.httpHeaderNodeConfigFormGroup.get('propertyconstant').value;
      propertyName = selectedPropertyConstant.constantName;
      propertyScope = selectedPropertyConstant.scope;

    }

    if (valueinputType === 'RULE_INPUT'){
      let selectedValueParam = this.httpHeaderNodeConfigFormGroup.get('valueparam').value;
      valueName = selectedValueParam.inputName;

    } else if (valueinputType === 'PROPERTY'){
      let selectedValueProperty = this.httpHeaderNodeConfigFormGroup.get('valueproperty').value;
      valueName = selectedValueProperty.name;
      valueScope = selectedValueProperty.propertyScope;

    } else if (valueinputType === 'BRANCH_PARAM'){
      let selectedValueBranch = this.httpHeaderNodeConfigFormGroup.get('valuebranchparam').value;
      valueName = selectedValueBranch.name;

    } else if (valueinputType === 'CONSTANT'){
      let selectedValueConstant = this.httpHeaderNodeConfigFormGroup.get('valueconstant').value;
      valueName = selectedValueConstant.constantName;
      valueScope = selectedValueConstant.scope;
      
    }

    let header = {
      'headerType': headerType,
      'keyinputType': propinputType,
      'keyName': propertyName,
      'keyScope':propertyScope,
      'valueinputType': valueinputType,
      'valueName': valueName,
      'valueScope': valueScope
    };

    this.configuration.headers.push(header);
    this.updateModel(this.configuration);
    this.datasource = new MatTableDataSource(this.configuration.headers);

    this.configuration.propertyinputType = '';
    this.configuration.valueinputType= '';
    this.configuration.propertyproperty= {};
    this.configuration.propertyparam= {};
    this.configuration.propertybranchparam= {};
    this.configuration.propertyconstant= {};
    this.configuration.valueparam= {};
    this.configuration.valueproperty= {};
    this.configuration.valueconstant= {};
    this.configuration.valuebranchparam= {};

    this.httpHeaderNodeConfigFormGroup.patchValue({
      headerType: "",
      propertyinputType: "",
      propertyproperty: [],
      propertyparam: [],
      propertybranchparam: [],
      propertyconstant: [],
      valueinputType: "",
      valueparam: [],
      valueproperty: [],
      valueconstant:[],
      valuebranchparam: []
    });
  }

  deleteRow(index: number): void{
    this.configuration.headers.splice(index, 1);
    this.datasource = new MatTableDataSource(this.configuration.headers);
    this.updateModel(this.configuration);
  }

  ngAfterViewInit(): void {
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.httpHeaderNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.httpHeaderNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);
    
    if(this.configuration.headers === null || this.configuration.headers === undefined){
        this.configuration.headers = [];
    }
    this.datasource = new MatTableDataSource(this.configuration.headers);
    
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
      
      this.httpHeaderNodeConfigFormGroup.patchValue({
        inputType: this.configuration.inputType,
        param: p,
        constant: c,
        property: property,
        branchparam: branchparam,
        redirectAvailable: this.configuration.redirectAvailable,
        redirectType: this.configuration.redirectType
      });
      
      this.changeSubscription = this.httpHeaderNodeConfigFormGroup.get('param').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.param = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.httpHeaderNodeConfigFormGroup.get('branchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.branchparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.httpHeaderNodeConfigFormGroup.get('constant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.constant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.httpHeaderNodeConfigFormGroup.get('property').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.property = configuration;
          this.updateModel(this.configuration);
        }
      );
      
      this.changeSubscription = this.httpHeaderNodeConfigFormGroup.get('headerType').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.headerType = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.httpHeaderNodeConfigFormGroup.get('propertyproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.propertyproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.httpHeaderNodeConfigFormGroup.get('propertyparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.propertyparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.httpHeaderNodeConfigFormGroup.get('propertyconstant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.propertyconstant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.httpHeaderNodeConfigFormGroup.get('propertybranchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.propertybranchparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.httpHeaderNodeConfigFormGroup.get('valuebranchparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.valuebranchparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.httpHeaderNodeConfigFormGroup.get('valueparam').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.valueparam = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.httpHeaderNodeConfigFormGroup.get('valueconstant').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.valueconstant = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.httpHeaderNodeConfigFormGroup.get('valueproperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.valueproperty = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.httpHeaderNodeConfigFormGroup.get('redirectAvailable').valueChanges.subscribe(
        (configuration: any) => {
          if (!configuration) {
            this.configuration.inputType = ""
            this.configuration.redirectType = ""
            this.configuration.constant= {};
            this.configuration.param= {};
            this.configuration.property= {};
            this.configuration.branchparam= {};
          }
          this.configuration.redirectAvailable = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.httpHeaderNodeConfigFormGroup.get('redirectType').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.redirectType = configuration;
          this.updateModel(this.configuration);
        }
      );

    }
  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.httpHeaderNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}

export interface HTTPHeader {
  headerType: string;
  keyinputType: string;
  keyName: string;
  valueinputType: string;
  valueName: string;
  keyScope: string;
  valueScope: string;
}
