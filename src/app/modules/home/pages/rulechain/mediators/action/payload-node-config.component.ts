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
import {MatTableDataSource} from "@angular/material/table";

@Component({
  selector: 'virtuan-payload-node-config',
  templateUrl: './payload-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PayloadNodeConfigComponent),
    multi: true
  }]
})
export class PayloadNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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

  @Input() branchAvailability: any;

  @Input()
  allRuleInputs: any[];

  @Input()
  allConstants: any[];

  @Input()
  allDomainModelsWithSub: any[];

  @Input()
  allModelProperties: any[];

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

  payloadNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

  datasource: MatTableDataSource<PayloadParameter>;

  displayedColumns: string[] = ['colName', 'inputType', 'input', 'property', 'actions'];

  ChildrenOfSelectedProperty : any[] = []

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.payloadNodeConfigFormGroup = this.fb.group({
      payload: "",
      payloadType: "",
      assignedtoinputType: "",
      payloadInputType: "",
      url: "",
      assignedProperty: [],
      assignedReference: [],
      errorMsg: "",
      errorAction: "",
      propertyinputType: "",
      propertyproperty: [],
      propertyreference: [],
      propertyparam: [],
      propertyconstant: [],
      colName: "",
      childrenParam: [],
      mapping: []
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
      this.payloadNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.payloadNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  addChildrenProperties(modelprop, propertyType){
    if (modelprop) {
        if (propertyType === "valueProperty") {
            let parent = modelprop.name
            for (let domModel of this.allDomainModelsWithSub) {
                if (modelprop.type === domModel.nameTitleCase) {
                    for (let child of domModel.design.children) {
                        let childProp = {
                            'name': parent + "." + child.data.name,
                            'inputType': child.data.type,
                            'childName': child.data.name,
                            'dataType': child.data.propertytype
                        }
                        this.ChildrenOfSelectedProperty.push(childProp)
                    }
                }
            }
        } else if (propertyType === "reference") {
            // console.log("value -------",modelprop)
            let parent = modelprop.name
            // if (modelprop.record === "m"){
            for (let domModel of this.allDomainModelsWithSub) {
                if (modelprop.modelproperty.name === domModel.name) {
                    for (let child of domModel.design.children) {
                        let childProp = {
                            'name': parent + "." + child.data.name,
                            'inputType': child.data.type,
                            'childName': child.data.name,
                            'dataType': child.data.propertytype,
                            'modelproperty': {
                                'data': {
                                    'path': child.data.path
                                }
                            }
                        }
                        this.ChildrenOfSelectedProperty.push(childProp)
                    }
                }
            }
            // }
        }
    }
  }

  refreshInputTypes(){
    let inputType: string = this.payloadNodeConfigFormGroup.get('propertyinputType').value;
    this.configuration.propertyinputType = inputType;

    if (inputType === 'PROPERTY'){
      this.configuration.propertyreference= {};
      this.configuration.propertyparam= {};
      this.configuration.propertyconstant= {};
      this.payloadNodeConfigFormGroup.get('propertyreference').patchValue([], {emitEvent: false});
      this.payloadNodeConfigFormGroup.get('propertyparam').patchValue([], {emitEvent: false});
      this.payloadNodeConfigFormGroup.get('propertyconstant').patchValue([], {emitEvent: false});
    } else if (inputType === 'REFERENCE'){
      this.configuration.propertyproperty= {};
      this.configuration.propertyparam= {};
      this.configuration.propertyconstant= {};
      this.payloadNodeConfigFormGroup.get('propertyproperty').patchValue([], {emitEvent: false});
      this.payloadNodeConfigFormGroup.get('propertyparam').patchValue([], {emitEvent: false});
      this.payloadNodeConfigFormGroup.get('propertyconstant').patchValue([], {emitEvent: false});
    } else if (inputType === 'RULE_INPUT'){
      this.configuration.propertyproperty= {};
      this.configuration.propertyconstant= {};
      this.configuration.propertyreference= {};
      this.payloadNodeConfigFormGroup.get('propertyproperty').patchValue([], {emitEvent: false});
      this.payloadNodeConfigFormGroup.get('propertyreference').patchValue([], {emitEvent: false});
      this.payloadNodeConfigFormGroup.get('propertyconstant').patchValue([], {emitEvent: false});
    } else if (inputType === 'CONSTANT'){
      this.configuration.propertyproperty= {};
      this.configuration.propertyparam= {};
      this.configuration.propertyreference= {};
      this.payloadNodeConfigFormGroup.get('propertyproperty').patchValue([], {emitEvent: false});
      this.payloadNodeConfigFormGroup.get('propertyreference').patchValue([], {emitEvent: false});
      this.payloadNodeConfigFormGroup.get('propertyparam').patchValue([], {emitEvent: false});
    }
    if (this.definedConfigComponent) {
      this.propagateChange(this.configuration);
    }

  }

  addParameter(): void{
    let inputType: string = this.payloadNodeConfigFormGroup.get('assignedtoinputType').value;
    let colName = this.payloadNodeConfigFormGroup.get('colName').value;

    if (inputType === 'PROPERTY') {
      let selectedParameterProperty = this.payloadNodeConfigFormGroup.get('childrenParam').value;
      let parameterproperty = {
        'colName': colName,
        'inputType': inputType,
        'input': '-',
        'property': selectedParameterProperty.name,
        'type': selectedParameterProperty.dataType
      };
      this.configuration.payloadParameters.push(parameterproperty);
      this.datasource = new MatTableDataSource(this.configuration.payloadParameters);
      this.updateModel(this.configuration);
    } else if (inputType === 'REFERENCE') {
      let selectedParameterProperty = this.payloadNodeConfigFormGroup.get('childrenParam').value;
      let parameterproperty = {
        'colName': colName,
        'inputType': inputType,
        'input': '-',
        'property': selectedParameterProperty.modelproperty.data.path,
        'type': selectedParameterProperty.dataType
      };
      this.configuration.payloadParameters.push(parameterproperty);
      this.datasource = new MatTableDataSource(this.configuration.payloadParameters);
      this.updateModel(this.configuration);
    }

    this.configuration.childrenParam= {};
    this.configuration.colName= '';

    this.payloadNodeConfigFormGroup.get('childrenParam').patchValue([], {emitEvent: false});
    this.payloadNodeConfigFormGroup.get('colName').patchValue([], {emitEvent: false});
  }

  deleteRow(index: number): void{
    this.configuration.payloadParameters.splice(index, 1);
    this.datasource = new MatTableDataSource(this.configuration.payloadParameters);
    this.updateModel(this.configuration);
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);
    if(this.configuration.payloadParameters === null || this.configuration.payloadParameters === undefined){
      this.configuration.payloadParameters = [];
    }

    if(this.configuration.assignedtoinputType === null || this.configuration.assignedtoinputType === undefined){
      this.configuration.assignedtoinputType = {};
    }

    this.datasource = new MatTableDataSource(this.configuration.payloadParameters);


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

      let assignedProperty = this.configuration.assignedProperty;
      if(this.configuration.assignedtoinputType === 'PROPERTY' && assignedProperty && this.allModelProperties){
        assignedProperty = this.allModelProperties.find(x => x.name === this.configuration.assignedProperty.name );
          this.addChildrenProperties(assignedProperty,'valueProperty')
      }

      let assignedReference = this.configuration.assignedReference;
      if(this.configuration.assignedtoinputType === 'REFERENCE' && assignedReference && this.allReferenceProperties){
        assignedReference = this.allReferenceProperties.find(x => x.name === this.configuration.assignedReference.name );
          this.addChildrenProperties(assignedReference,"reference")
      }

      let propertyproperty = this.configuration.propertyproperty;
      if(this.configuration.propertyinputType === 'PROPERTY' && this.allModelProperties){
        propertyproperty = this.allModelProperties.find(x => x.name === this.configuration.propertyproperty.name );
      }

      let propertyreference = this.configuration.propertyreference;
      if(this.configuration.propertyinputType === 'REFERENCE' && this.allReferenceProperties){
        propertyreference = this.allReferenceProperties.find(x => x.name === this.configuration.propertyreference.name );
      }

      let propertyparam = this.configuration.propertyparam;
      if(this.configuration.propertyinputType === 'RULE_INPUT' && this.allReferenceProperties){
        propertyparam = this.allRuleInputs.find(x => x.inputName === this.configuration.propertyparam.inputName );
      }

      let propertyconstant = this.configuration.propertyconstant;
        console.log("*********************",propertyconstant)
      if(this.configuration.propertyinputType === 'CONSTANT' && this.allReferenceProperties){
        propertyconstant = this.allConstants.find(x => x.constantName === this.configuration.propertyconstant.constantName );
        console.log("======================",propertyconstant)
      }

      this.payloadNodeConfigFormGroup.patchValue({
        assignedProperty: assignedProperty,
        url: this.configuration.url,
        payloadInputType: this.configuration.payloadInputType,
        payload: this.configuration.payload,
        payloadType: this.configuration.payloadType,
        mapping : this.configuration.mapping,
        assignedtoinputType: this.configuration.assignedtoinputType,
        assignedReference: assignedReference,
        errorMsg: this.configuration.errorMsg,
        errorAction: this.configuration.errorAction,
        propertyinputType: this.configuration.propertyinputType,
        propertyproperty: propertyproperty,
        propertyreference: propertyreference,
        propertyparam: propertyparam,
        propertyconstant: propertyconstant,
        childrenParam: this.configuration.childrenParam
      });

        this.changeSubscription = this.payloadNodeConfigFormGroup.get('childrenParam').valueChanges.subscribe(
            (configuration: any) => {
                this.configuration.childrenParam = configuration;
                this.updateModel(this.configuration);
            }
        );

      this.changeSubscription = this.payloadNodeConfigFormGroup.get('propertyinputType').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.propertyinputType = configuration;
            if (this.configuration.propertyinputType == 'PROPERTY'){
                this.configuration.propertyconstant = {};
                this.configuration.propertyreferenc = {};
                this.configuration.propertyparam = {};
                this.payloadNodeConfigFormGroup.get('propertyconstant').patchValue([], {emitEvent: false});
                this.payloadNodeConfigFormGroup.get('propertyreferenc').patchValue([], {emitEvent: false});
                this.payloadNodeConfigFormGroup.get('propertyparam').patchValue([], {emitEvent: false});
            } else if (this.configuration.propertyinputType == 'RULE_INPUT'){
                this.configuration.propertyconstant = {};
                this.configuration.propertyreferenc = {};
                this.configuration.propertyproperty = {};
                this.payloadNodeConfigFormGroup.get('propertyconstant').patchValue([], {emitEvent: false});
                this.payloadNodeConfigFormGroup.get('propertyreferenc').patchValue([], {emitEvent: false});
                this.payloadNodeConfigFormGroup.get('propertyproperty').patchValue([], {emitEvent: false});
            } else if (this.configuration.propertyinputType == 'REFERENCE'){
                this.configuration.propertyconstant = {};
                this.configuration.propertyparam = {};
                this.configuration.propertyproperty = {};
                this.payloadNodeConfigFormGroup.get('propertyconstant').patchValue([], {emitEvent: false});
                this.payloadNodeConfigFormGroup.get('propertyparam').patchValue([], {emitEvent: false});
                this.payloadNodeConfigFormGroup.get('propertyproperty').patchValue([], {emitEvent: false});
            } else if (this.configuration.propertyinputType == 'CONSTANT'){
                this.configuration.propertyreferenc = {};
                this.configuration.propertyparam = {};
                this.configuration.propertyproperty = {};
                this.payloadNodeConfigFormGroup.get('propertyreferenc').patchValue([], {emitEvent: false});
                this.payloadNodeConfigFormGroup.get('propertyparam').patchValue([], {emitEvent: false});
                this.payloadNodeConfigFormGroup.get('propertyproperty').patchValue([], {emitEvent: false});
            }

            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.payloadNodeConfigFormGroup.get('propertyproperty').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.propertyproperty = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.payloadNodeConfigFormGroup.get('propertyconstant').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.propertyconstant = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.payloadNodeConfigFormGroup.get('propertyreference').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.propertyreference = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.payloadNodeConfigFormGroup.get('propertyparam').valueChanges.subscribe(
          (configuration: any) => {
            this.configuration.propertyparam = configuration;
            this.updateModel(this.configuration);
          }
      );

      this.changeSubscription = this.payloadNodeConfigFormGroup.get('errorMsg').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorMsg = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.payloadNodeConfigFormGroup.get('errorAction').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.errorAction = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.payloadNodeConfigFormGroup.get('payload').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {
          this.configuration.payload = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.payloadNodeConfigFormGroup.get('payloadType').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {
          this.configuration.payloadType = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.payloadNodeConfigFormGroup.get('mapping').valueChanges.subscribe(
          (configuration: RuleNodeConfiguration) => {
            this.configuration.mapping = configuration;
            this.updateModel(this.configuration);
          }
      );
      
      this.changeSubscription = this.payloadNodeConfigFormGroup.get('assignedReference').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.assignedReference = configuration;
          this.ChildrenOfSelectedProperty = [];
          this.addChildrenProperties(configuration,"reference")
          this.updateModel(this.configuration);
        }
      );
      
      this.changeSubscription = this.payloadNodeConfigFormGroup.get('assignedProperty').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.assignedProperty = configuration;
          this.ChildrenOfSelectedProperty = [];
          this.addChildrenProperties(configuration,"valueProperty")
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.payloadNodeConfigFormGroup.get('url').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.url = configuration;
          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.payloadNodeConfigFormGroup.get('payloadInputType').valueChanges.subscribe(
        (configuration: any) => {
          this.configuration.payloadInputType = configuration;

          if(this.configuration.payloadInputType == 'INLINE'){
            this.configuration.url= "";
            this.payloadNodeConfigFormGroup.get('url').patchValue("", {emitEvent: false});
          }else if (this.configuration.payloadInputType == 'REMOTE_PATH'){
            this.configuration.payload= "";
            this.payloadNodeConfigFormGroup.get('payload').patchValue("", {emitEvent: false});
          }

          this.updateModel(this.configuration);
        }
      );

      this.changeSubscription = this.payloadNodeConfigFormGroup.get('assignedtoinputType').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {

          this.configuration.assignedtoinputType = configuration;
          if(this.configuration.assignedtoinputType == 'PROPERTY'){
            this.configuration.assignedReference= {};
            this.payloadNodeConfigFormGroup.get('assignedReference').patchValue([], {emitEvent: false});
          }else if (this.configuration.assignedtoinputType == 'REFERENCE'){
            this.configuration.assignedProperty= {};
            this.payloadNodeConfigFormGroup.get('assignedProperty').patchValue([], {emitEvent: false});
          }
          this.updateModel(this.configuration);
        }
      );
    }
  }

/*
  useDefinedDirective(): boolean {
    return this.nodeDefinition &&
      (this.nodeDefinition.configDirective &&
       this.nodeDefinition.configDirective.length) && !this.definedDirectiveError;
  }
  */

  private updateModel(configuration: RuleNodeConfiguration) {
    if (this.definedConfigComponent || this.payloadNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {
      this.propagateChange(this.required ? null : configuration);
    }
  }

}

export interface PayloadParameter {
  colName: string;
  inputType: string;
  input: string;
  property: string;
  type: string;
}

