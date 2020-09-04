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
import {
  ControlValueAccessor,
  FormControl,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR,
  Validators,
  AbstractControl
} from '@angular/forms';
import {
  IRuleNodeConfigurationComponent,
  RuleNodeConfiguration,
  RuleNodeDefinition
} from '@shared/models/rule-node.models';
import {ModelSelectionFields, QuestionBase} from '@shared/models/question-base.models';
import {Subscription} from 'rxjs';
import {RuleChainService} from '@core/http/rule-chain.service';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {TranslateService} from '@ngx-translate/core';
import {JsonObjectEditComponent} from '@shared/components/json-object-edit.component';
import {deepClone} from '@core/utils';
import {Observable} from 'rxjs';
import {PageComponent} from '@shared/components/page.component';
import {Store} from '@ngrx/store';
import {AppState} from '@core/core.state';
import {MatTableDataSource} from '@angular/material/table';



@Component({
  selector: 'tb-connector-node-config',
  templateUrl: './connector-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ConnectorNodeConfigComponent),
    multi: true
  }]
})
export class ConnectorNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

  @ViewChild('definedConfigContent', {read: ViewContainerRef, static: true}) definedConfigContainer: ViewContainerRef;

  // @Input() fields: QuestionBase[] = [];

  connectorConfigFormGroup: FormGroup;

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
  nodeClazz: string;

  @Input()
  inputEntities: any[];

  @Input()
  ruleEntities: any[];

  @Input()
  inputCustomobjects: any[];

  @Input()
  inputProperties: any[];

  @Input()
  allFields: any[];

  @Input()
  allConstants: any[];

  @Input()
  allSavedObjects: any[];

  @Input()
  allVariables: any[];


  allRuleProperties:ModelValueproperties[] =[
    {
      type: "PROPERTY",
      name: "cusname",
      valuetype: "primitive"
    },
    {
      type: "PROPERTY",
      name: "cusproduct",
      valuetype: "object"
    },
    {
      type: "PROPERTY",
      name: "cusorders",
      valuetype: "list"
    },
    {
      type: "CONSTANT",
      name: "useremail",
      valuetype: "primitive"
    },
    {
      type: "PARAM",
      name: "id",
      valuetype: "primitive"
    }
  ];

  allPrimitiveObjectsValue:ModelPrimitiveproperties[]=[
    {
      type: "PRIMITIVE",
      name: "TEXT",
    },
    {
      type: "PRIMITIVE",
      name: "NUMBER",
    },
    {
      type: "DTO",
      name: "Customer"
    },
  ];


  // emptyFeids: ModelSelectionFields[] = [];

  nodeDefinitionValue: RuleNodeDefinition;


  fields: QuestionBase[] = [
    {
      controlType: "textbox",
      key: "firstName",
      label: "First name",
      order: 1,
      required: true,
      value: ""
    },
    {
      controlType: "textbox",
      key: "emailAddress",
      label: "Email",
      value: "",
      type: "email",
      order: 2,
      required: true
    },
    {
      controlType: "dropdown",
      type: "multiple",
      key: "brave",
      value: "",
      label: "Bravery Rating",
      options: [
        {
          key: "solid",
          value: "Solid"
        }
      ],
      order: 5,
      required: true
    },
    {
      controlType: "dynamic_object",
      key: "prices",
      label: "price",
      order: 6
    }
  ];

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

  changeSubscription: Subscription;

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  private configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => {
  };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder)
  {
  }


  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  ngOnInit(): void {
    this.connectorConfigFormGroup = this.toFormGroup(this.fields);
    console.log("form checking");
    console.log(this.connectorConfigFormGroup);
  }




  toFormGroup(questions: QuestionBase[]) {
    const group: any = {};

    questions.forEach(question => {
      group[question.key] = question.required ? new FormControl(question.value || '', Validators.required)
          : new FormControl(question.value || '');
    });

    return new FormGroup(group);
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
      this.connectorConfigFormGroup.disable({emitEvent: false});
    } else {
      this.connectorConfigFormGroup.enable({emitEvent: false});
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

      this.fields.forEach(question => {
        this.connectorConfigFormGroup.get(question.key).patchValue(this.configuration.connector[question.key], {emitEvent: false});
        this.changeSubscription = this.connectorConfigFormGroup.get(question.key).valueChanges.subscribe(
            (configuration: RuleNodeConfiguration) => {
              this.configuration.connector[question.key] = configuration;
              this.updateModel(this.configuration);
            }
        );

      });

    }


  }

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.connectorConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      let blah = this.required ? null : configuration;
      this.propagateChange(this.required ? null : configuration);
    }
  }

  checkControlType(contain: string):boolean{
    //contain.includes static||dynamic_object||dynamic_value--->true
    return contain.includes('static') || contain.includes('dynamic_object') || contain.includes('dynamic_value');
  }

  checkType(contain: string):boolean{
    return contain.includes('DTO') || contain.includes('PRIMITIVE');
  }

  generatePropertyArray(controlType: string): Array<any> {
    let proArray = [];
    let isStatic = controlType.includes('static');
    let isDynamic_object = controlType.includes('dynamic_object');
    let isDynamic_value = controlType.includes('dynamic_value');

    let A_Array = this.allRuleProperties.filter(property =>
        property.type == 'PARAM' || (property.type == 'PROPERTY' && property.valuetype == 'primitive' ));

    let B_Array = this.allRuleProperties.filter(property =>
        property.type == 'PROPERTY' && property.valuetype == 'object' );

    let C_Array = this.allRuleProperties.filter(property =>
        property.type == 'CONSTANT');

    if (isStatic === false && isDynamic_object === false && isDynamic_value === false) {
      proArray = [];
    } else if (isStatic === false && isDynamic_object === false && isDynamic_value === true) {
      proArray = A_Array;
    } else if (isStatic === false && isDynamic_object === true && isDynamic_value === false) {
      proArray = B_Array;
    } else if (isStatic === false && isDynamic_object === true && isDynamic_value === true) {
      proArray = A_Array.concat(B_Array);
    } else if (isStatic === true && isDynamic_object === false && isDynamic_value === false) {
      proArray = C_Array;
    } else if (isStatic === true && isDynamic_object === false && isDynamic_value === true) {
      proArray = A_Array.concat(C_Array);
    } else if (isStatic === true && isDynamic_object === true && isDynamic_value === false) {
      proArray = B_Array.concat(C_Array);
    } else if (isStatic === true && isDynamic_object === true && isDynamic_value === true) {
      proArray = A_Array.concat(B_Array,C_Array);
    }

    return proArray;
  }

  generatePrimitiveArray(type: string): Array<any> {
    let primArray = [];
    let isPrimitive = type.includes('PRIMITIVE');
    let isDTO = type.includes('DTO');

    let A_Array = this.allPrimitiveObjectsValue.filter(property =>
        property.type == 'PRIMITIVE');
    let B_Array = this.allPrimitiveObjectsValue.filter(property =>
        property.type == 'DTO');

    if (isPrimitive === false && isDTO === false) {
      primArray = [];
    } else if (isPrimitive === false && isDTO === true) {
      primArray = B_Array;
    } else if (isPrimitive === true && isDTO === false) {
      primArray = A_Array;
    } else if (isPrimitive === true && isDTO === true) {
      primArray = A_Array.concat(B_Array);
    }

    return primArray;
  }


}

class ModelValueproperties{
  type: string;
  name: string;
  valuetype: string;
}

class ModelPrimitiveproperties{
  type: string;
  name: string;
}


