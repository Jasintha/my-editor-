import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewContainerRef
} from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, Validators, AbstractControl, FormControl, FormArray } from '@angular/forms';
import {
  IRuleNodeConfigurationComponent,
  RuleNodeConfiguration,
  RuleNodeDefinition
} from '@shared/models/rule-node.models';
import { Subscription } from 'rxjs';
import { RuleChainService } from '@core/http/rule-chain.service';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { TranslateService } from '@ngx-translate/core';
import { deepClone } from '@core/utils';
import {MatTableDataSource} from '@angular/material/table';
import { UIBTextAreaInputComponent } from './text-area-input/uib-text-area-input.component';
import { UIBTextInputComponent } from './text-input/uib-text-input.component';
import { UIBDropDownComponent } from './dropdown/uib-dropdown-input.component';
import { UIBFormTableComponent } from './form-table/uib-form-table.component';
import { UIBTreeViewInputComponent } from './tree-view/uib-tree-view.component';

@Component({
  selector: 'virtuan-uib-base-node-config',
  templateUrl: './uib-node-base-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => UibNodeBaseConfigComponent),
    multi: true
  }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UibNodeBaseConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {
  @ViewChild('definedConfigContent', {read: ViewContainerRef, static: true}) definedConfigContainer: ViewContainerRef;
  @ViewChildren('dynamic', {read: ViewContainerRef}) dynamic: QueryList<ViewContainerRef>;

  private componentRef: ComponentRef<UIBTextInputComponent | UIBTextAreaInputComponent>

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

  fields = [
          {
            type: "text",
            name: "firstName",
            label: "First Name",
            value: "",
            required: true,
            options: []
          },
          {
            type: "text",
            name: "lastName",
            label: "Last Name",
            value: "",
            required: true,
            options: []
          },
          {
            type: "text",
            name: "email",
            label: "Email",
            value: "",
            required: true,
            options: []
          },
          {
            type: 'dropdown',
            name: 'country',
            label: 'Country',
            value: 'in',
            required: true,
            options: [
              { key: 'in', label: 'India' },
              { key: 'us', label: 'USA' }
            ]
          },
          {
            type: 'form-table',
            name: 'skills',
            label: 'Skills',
            value: [{
              'qty': '100'
            }, {'qty': '200'}],
            required: true,
            options: [],
            columns: [{
              label: 'Quantity',
              key: 'qty',
              type: 'text'
            },
          {
            label: 'Qualtiy',
            key: 'quality',
            type: 'dropdown',
            options: [
              { key: 'good', label: 'Good' },
              { key: 'bad', label: 'Bad' },
            ]
           },
          ]
          },
          {
            type: "tree-view",
            name: "x",
            label: "Test",
            value: "",
            options: []
          },
        ];

  @Input()
  set nodeDefinition(nodeDefinition: RuleNodeDefinition) {
    if (this.nodeDefinitionValue !== nodeDefinition) {
      this.nodeDefinitionValue = nodeDefinition;
    }
  }

  get nodeDefinition(): RuleNodeDefinition {
    return this.nodeDefinitionValue;
  }

  definedDirectiveError: string;

  uibNodeBaseConfigFormGroup: FormGroup;

  changeSubscription: Subscription;
  components: any = [];

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => { };

  constructor(private resolver: ComponentFactoryResolver, private cdr: ChangeDetectorRef) {}

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  ngOnInit(): void {
    this.createDynamicForm();
    this.createDynamicComponents();
  }

  ngOnDestroy(): void {
    if (this.definedConfigComponentRef) {
      this.definedConfigComponentRef.destroy();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if(this.components.length > 0){
        this.loadComponent()
      }
    }, 0);
  }


  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.uibNodeBaseConfigFormGroup.disable({emitEvent: false});
    } else {
      this.uibNodeBaseConfigFormGroup.enable({emitEvent: true});
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
      this.uibNodeBaseConfigFormGroup?.patchValue({});
    }
    
    this.uibNodeBaseConfigFormGroup.get(this.fields[4].name).valueChanges.subscribe((val)=> {
      console.log(val)
    })
  }

  private updateModel(configuration: RuleNodeConfiguration) {

    if (this.definedConfigComponent || this.uibNodeBaseConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {

      this.propagateChange(this.required ? null : configuration);
    }
  }

  createDynamicForm() {
    let fieldsCtrls = {};
    for (let f of this.fields) {
      if (f.type != "checkbox" && f.type != "form-table") {
        fieldsCtrls[f.name] = new FormControl(
          f.value || "",
          Validators.required
        );
      } else if(f.type == "form-table"){
        fieldsCtrls[f.name] = new FormArray([])
      } else {
        let opts = {};
        for (let opt of f.options) {
          opts[opt.key] = new FormControl(opt.label);
        }
        fieldsCtrls[f.name] = new FormGroup(opts);
      }
    }
    this.uibNodeBaseConfigFormGroup = new FormGroup(fieldsCtrls);
  }

  createDynamicComponents() {
    this.components = [
      {
        type: "text",
        info: {
          formControlName: this.fields[0].name,
          label: "Name",
          value: ''
        },
      },
      {
        type: "text",
        info: {
          formControlName: this.fields[1].name,
          label: "Surname",
          value: ''
        },
      },
      {
        type: "text",
        info: {
          formControlName: this.fields[2].name,
          label: "Email",
          value: ''
        },
      },
      {
        type: "dropdown",
        info: {
          formControlName: this.fields[3].name,
          label: "Country",
          value: 'in',
          options: [
            { key: 'in', label: 'India' },
            { key: 'us', label: 'USA' }
          ]
        },
      },
      {
        type: "form-table",
        info: {
          formControlName: this.fields[4].name,
          label: "Skills",
          value: this.fields[4].value,
          options: [],
          columns: this.fields[4].columns,
        },
      },
      {
        type: "tree-view",
        info: {
          formControlName: 'x',
          label: "foods",
          value: '',
          options: [
            {
                      name: 'AAA',
                      enable: true,
                      children: [
                          {
                              name: 'BBB',
                              enable: true
                          },
                          {
                              name: 'CCC',
                              enable: false
                          }
                      ]
                  }
          ],
        },
      }
    ];
  }

  private loadComponent(): void {
    this.dynamic.map((vcr: ViewContainerRef, index: number) =>{
      vcr.clear();
      let factory
      switch(this.components[index].type){
        case 'text':
          factory = this.resolver.resolveComponentFactory(UIBTextInputComponent)
          break;
        case 'textarea':
          factory = this.resolver.resolveComponentFactory(UIBTextAreaInputComponent)
          break;
        case 'dropdown':
          factory = this.resolver.resolveComponentFactory(UIBDropDownComponent)
          break;
        case 'form-table':
          factory = this.resolver.resolveComponentFactory(UIBFormTableComponent)
          break;
        case 'tree-view':
          factory = this.resolver.resolveComponentFactory(UIBTreeViewInputComponent)
          break;
      }
      this.componentRef = vcr.createComponent(factory)
      this.componentRef.instance.data = this.components[index].info;
      this.componentRef.instance.formGroup = this.uibNodeBaseConfigFormGroup
      this.cdr.markForCheck()
    })
  }
}

export interface uibField {
  name: string;
  value: string;
}


//   ngOnInit(): void {
//     this.fields = [
//       {
//         type: "text",
//         name: "firstName",
//         label: "First Name",
//         value: "",
//         required: true,
//       },
//       {
//         type: "text",
//         name: "lastName",
//         label: "Last Name",
//         value: "",
//         required: true,
//       },
//       {
//         type: "text",
//         name: "email",
//         label: "Email",
//         value: "",
//         required: true,
//       },
//     ];
//     this.createDynamicForm();
//     this.createDynamicComponents();
//   }

//   createDynamicForm() {
//     let fieldsCtrls = {};
//     for (let f of this.fields) {
//       if (f.type != "checkbox") {
//         fieldsCtrls[f.name] = new FormControl(
//           f.value || "",
//           Validators.required
//         );
//       } else {
//         let opts = {};
//         for (let opt of f.options) {
//           opts[opt.key] = new FormControl(opt.value);
//         }
//         fieldsCtrls[f.name] = new FormGroup(opts);
//       }
//     }
//     this.form = new FormGroup(fieldsCtrls);
//   }

//   createDynamicComponents() {
//     this.components = [
//       {
//         type: "text",
//         info: {
//           formControllerName: this.fields[0],
//           label: "Name",
//         },
//       },
//       {
//         type: "text",
//         info: {
//           formControllerName: this.fields[1],
//           label: "Surname",
//         },
//       },
//       {
//         type: "text",
//         info: {
//           formControllerName: this.fields[2],
//           label: "Email",
//         },
//       },
//     ];
//   }

//   writeValue(value: RuleNodeConfiguration): void {
//     this.configuration = deepClone(value);
//     console.log(this.configuration)
//   }
// }
