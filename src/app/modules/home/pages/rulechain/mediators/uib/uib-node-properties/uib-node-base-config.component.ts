import {
  AfterViewChecked,
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
import { UIBDropDownWithChildrenComponent } from './dropdown-with-children/dropdown-with-children.component';
import { UIBSectionComponent } from './section/uib-section.component';
import { UIBMappingComponent } from './mapping-with-table/mapping-with-table.component';

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
  dynamicBuildCompleted = false;

  @Input() fields: any;

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
    if(this.fields == null){
      this.fields = [
        {
          type: "mapping",
          name: "mappingData",
          label: "Sample Section",
          value: "",
          required: true,
          dataSource: [],
          displayedColumns: ['From', 'To'],
          mappingSource: {
          data:[
            {
              label: 'From',
              formControlName: 'dropdown1',
              path: 'http://universities.hipolabs.com/search?name=middle',
              child: {
                  label: 'From_Data',
                  formControlName: 'dropdown3',
                  info: [
                    {
                      type: 'tree',
                      path: 'XX'
                    },
                    {
                      type: 'dropdown',
                      path: 'http://universities.hipolabs.com/search?name=middle',
                    }
                  ]
              }
            },
            {
              label: 'To',
              formControlName: 'dropdown2',
              path: 'http://universities.hipolabs.com/search?name=middle',
              child:  {
                label: 'To_Data',
                formControlName: 'dropdown4',
                info: [
                  {
                    type: 'dropdown',
                    path: 'http://universities.hipolabs.com/search?name=middle',
                  },
                  {
                    type: 'tree',
                    path: 'XX'
                  },
                ]
              },
            },
          ]
        }
        },
        //  {
        //   type: "text",
        //   name: "firstName",
        //   label: "First Name",
        //   value: "",
        //   required: true,
        //   options: []
        //  }
        // {
        //   type: "text",
        //   name: "lastName",
        //   label: "Last Name",
        //   value: "",
        //   required: true,
        //   options: []
        // },
        // {
        //   type: "text",
        //   name: "email",
        //   label: "Email",
        //   value: "",
        //   required: true,
        //   options: []
        // },
        // {
        //   type: 'dropdown',
        //   name: 'country',
        //   label: 'Country',
        //   value: 'in',
        //   required: true,
        //   options: [
        //     { key: 'in', label: 'India' },
        //     { key: 'us', label: 'USA' }
        //   ]
        // },
        // {
        //   type: 'form-table',
        //   name: 'skills',
        //   label: 'Skills',
        //   value: [{
        //     'qty': '100'
        //   }, {'qty': '200'}],
        //   required: true,
        //   options: [],
        //   columns: [{
        //     label: 'Quantity',
        //     key: 'qty',
        //     type: 'text'
        //   },
        // {
        //   label: 'Qualtiy',
        //   key: 'quality',
        //   type: 'dropdown',
        //   options: [
        //     { key: 'good', label: 'Good' },
        //     { key: 'bad', label: 'Bad' },
        //   ]
        //  },
        // ]
        // },
        // {
        //   type: "tree-view",
        //   name: "testTree",
        //   label: "Test",
        //   value: "",
        //   options: [
        //   {
        //             name: 'AAA',
        //             enable: true,
        //             children: [
        //                 {
        //                     name: 'BBB',
        //                     enable: true
        //                 },
        //                 {
        //                     name: 'CCC',
        //                     enable: false
        //                 }
        //             ]
        //         }
        // ],
        // },
        // {
        //   type: 'dropdown-children',
        //   name: 'happy',
        //   label: 'Happy',
        //   value: 'no',
        //   options: [
        //     { key: 'yes', label: 'Yes', children:[{
        //       type: "textarea",
        //       name: "templateName",
        //       label: "TemplateName",
        //       value: "",
        //       hide: false
        //     }] },
        //     { key: 'no', label: 'No' }
        //   ],
        // },
      ];
    }
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
      if(this.uibNodeBaseConfigFormGroup.touched === false && this.configuration.callProperties.length > 0){

        this.uibNodeBaseConfigFormGroup.patchValue(this.configuration.callProperties[0])

        for(var i of this.fields){
         if(i.type === 'form-table'){
          if (this.configuration.callProperties[0][i.name]?.length > 0) {
            const array = this.uibNodeBaseConfigFormGroup.get(i.name) as FormArray;
            array.clear();
      
            this.configuration.callProperties[0][i.name].forEach(item => {
              const group = this.getCustomFormForup(i.columns)
              Object.keys(group.controls).forEach(key => {
                group.patchValue({
                  [key]: item[key]
                });
              });
              array.controls.push(group);
            });
          }
         }

         else if(i.type === 'mapping'){
          i.dataSource = this.configuration.callProperties[0][i.name]
         }
        }
      }

      this.uibNodeBaseConfigFormGroup?.valueChanges.subscribe((val)=> {
          this.configuration.callProperties = [...[], val]
            setTimeout(() => {
            this.updateModel(this.configuration)
            },0)
      })

    }
  }

  getCustomFormForup(cols){
    let opts = {};
    for (let opt of cols) {
      opts[opt.key] = new FormControl(null);
    }

    return new FormGroup(opts);
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
      if (f.type != "checkbox" && f.type != "form-table" && f.type != "dropdown-children") {
        fieldsCtrls[f.name] = new FormControl(
         null,
          Validators.required
        );
      } else if(f.type == "form-table"){
        fieldsCtrls[f.name] = new FormArray([])
      } else if(f.type == "dropdown-children") {
          for (let opt of f.options) {
            if(opt.children){
              for (let ch of opt.children) {
                fieldsCtrls[ch.name] = new FormControl(
                  null,
                  Validators.required
                );
              }
            }
          }
          fieldsCtrls[f.name] = new FormControl(
            null,
            Validators.required
          );
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
    this.components = []
    for(var i of this.fields){
      this.components.push({
        type: i.type,
        info: {
          formControlName: i.name,
          label: i.label,
          value: i.value,
          options: i.options,
          columns: i.columns,
          displayedColumns: i.displayedColumns,
          dataSource: i.dataSource,
          hide: i.hide,
          mappingSource: i.mappingSource
        },
      })
    }
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
        case 'dropdown-children':
          factory = this.resolver.resolveComponentFactory(UIBDropDownWithChildrenComponent)
          break;
        case 'section':
          factory = this.resolver.resolveComponentFactory(UIBSectionComponent)
          break;
        case 'mapping':
          factory = this.resolver.resolveComponentFactory(UIBMappingComponent)
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
