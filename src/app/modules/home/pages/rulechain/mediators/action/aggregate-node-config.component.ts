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
    selector: 'tb-aggregate-node-config',
    templateUrl: './aggregate-node-config.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => AggregateNodeConfigComponent),
        multi: true
    }]
})
export class AggregateNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
    allRuleInputs: any[];

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

   @Input()
   allReferenceProperties: any[];

    nodeDefinitionValue: RuleNodeDefinition;


    @Input()
    set nodeDefinition(nodeDefinition: RuleNodeDefinition) {
        if (this.nodeDefinitionValue !== nodeDefinition) {
            this.nodeDefinitionValue = nodeDefinition;
            if (this.nodeDefinitionValue) {
            }
        }
    }

    get nodeDefinition(): RuleNodeDefinition {
        return this.nodeDefinitionValue;
    }

    definedDirectiveError: string;

    aggregateNodeConfigFormGroup: FormGroup;

    changeSubscription: Subscription;

    private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
    private definedConfigComponent: IRuleNodeConfigurationComponent;

    configuration: RuleNodeConfiguration;

    selectedVariableProperties: any[];

    private propagateChange = (v: any) => { };

    constructor(private translate: TranslateService,
                private ruleChainService: RuleChainService,
                private fb: FormBuilder) {
        this.aggregateNodeConfigFormGroup = this.fb.group({
            secondinputType: [],
            secondconstant: [],
            secondparam: [],
            secondproperty:[],
            secondbranchparam: [],
            property: [],
            referenceProperty: [],
            inputType: '',
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

    ngAfterViewInit(): void {
    }

    refreshSecondInputTypes(){
        let inputType: string = this.aggregateNodeConfigFormGroup.get('secondinputType').value;
        this.configuration.secondinputType = inputType;
        if (inputType === 'CONSTANT'){
            this.configuration.secondparam= {};
            this.configuration.secondproperty= {};
            this.configuration.secondbranchparam= {};
            this.aggregateNodeConfigFormGroup.get('secondparam').patchValue([], {emitEvent: false});
            this.aggregateNodeConfigFormGroup.get('secondproperty').patchValue([], {emitEvent: false});
            this.aggregateNodeConfigFormGroup.get('secondbranchparam').patchValue([], {emitEvent: false});

        } else if (inputType === 'RULE_INPUT'){

            this.configuration.secondconstant= {};
            this.configuration.secondproperty= {};
            this.configuration.secondbranchparam= {};
            this.aggregateNodeConfigFormGroup.get('secondconstant').patchValue([], {emitEvent: false});
            this.aggregateNodeConfigFormGroup.get('secondproperty').patchValue([], {emitEvent: false});
            this.aggregateNodeConfigFormGroup.get('secondbranchparam').patchValue([], {emitEvent: false});
        } else if (inputType === 'PROPERTY'){
            this.configuration.secondconstant= {};
            this.configuration.secondparam= {};
            this.configuration.secondbranchparam= {};

            this.aggregateNodeConfigFormGroup.get('secondconstant').patchValue([], {emitEvent: false});
            this.aggregateNodeConfigFormGroup.get('secondparam').patchValue([], {emitEvent: false});
            this.aggregateNodeConfigFormGroup.get('secondbranchparam').patchValue([], {emitEvent: false});
        } else if (inputType === 'BRANCH_PARAM'){
            this.configuration.secondconstant= {};
            this.configuration.secondparam= {};
            this.configuration.secondproperty= {};
            this.aggregateNodeConfigFormGroup.get('secondconstant').patchValue([], {emitEvent: false});
            this.aggregateNodeConfigFormGroup.get('secondparam').patchValue([], {emitEvent: false});
            this.aggregateNodeConfigFormGroup.get('secondproperty').patchValue([], {emitEvent: false});
        }

        if (this.definedConfigComponent) {
            this.propagateChange(this.configuration);
        }

    }


    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        if (this.disabled) {
            this.aggregateNodeConfigFormGroup.disable({emitEvent: false});
        } else {
            this.aggregateNodeConfigFormGroup.enable({emitEvent: false});
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

            //second input

            let secondparam = this.configuration.secondparam;
            if(this.configuration.secondinputType === 'RULE_INPUT' && this.allRuleInputs){
                secondparam = this.allRuleInputs.find(x => x.inputName === this.configuration.secondparam.inputName );
            }

            let secondconstant = this.configuration.secondconstant;
            if(this.configuration.secondinputType === 'CONSTANT' && this.allConstants){
                secondconstant = this.allConstants.find(x => x.constantName === this.configuration.secondconstant.constantName );
            }

            let secondproperty = this.configuration.secondproperty;
            if(this.configuration.secondinputType === 'PROPERTY' && this.allModelProperties){
                secondproperty = this.allModelProperties.find(x => x.name === this.configuration.secondproperty.name );
            }

            let secondbranchparam = this.configuration.secondbranchparam;
            if(this.configuration.secondinputType === 'BRANCH_PARAM' && this.branchAvailability.branchParams){
                secondbranchparam = this.branchAvailability.branchParams.find(x => x.name === this.configuration.secondbranchparam.name );
            }
            // property array
            let property = this.configuration.property;
            if(this.configuration.inputType === 'PROPERTY' && this.allModelProperties){
                property = this.allModelProperties.find(x => x.name === this.configuration.property.name );
            }

            let referenceProperty = this.configuration.referenceProperty;
            if(this.configuration.inputType === 'REFERENCE' && this.allReferenceProperties){
                referenceProperty = this.allReferenceProperties.find(x => x.name === this.configuration.referenceProperty.name );
            }

            let branchparam = this.configuration.branchparam;
            if(this.configuration.inputType === 'BRANCH_PARAM' && this.branchAvailability.branchParams){
                branchparam = this.branchAvailability.branchParams.find(x => x.name === this.configuration.branchparam.name );
            }

            this.aggregateNodeConfigFormGroup.patchValue({
                secondbranchparam: secondbranchparam,
                secondinputType: this.configuration.secondinputType,
                secondparam: secondparam,
                secondconstant: secondconstant,
                secondproperty: secondproperty,
                property: property,
                referenceProperty: referenceProperty,
                branchparam: branchparam,
                inputType: this.configuration.inputType,
            });

            this.changeSubscription = this.aggregateNodeConfigFormGroup.get('secondbranchparam').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.secondbranchparam = configuration;
                    this.updateModel(this.configuration);
                }
            );

            //second input changes

            this.changeSubscription = this.aggregateNodeConfigFormGroup.get('secondparam').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.secondparam = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.aggregateNodeConfigFormGroup.get('secondconstant').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.secondconstant = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.aggregateNodeConfigFormGroup.get('secondproperty').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.secondproperty = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.aggregateNodeConfigFormGroup.get('property').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.property = configuration;
                    this.configuration.branchparam = {};
                    this.configuration.referenceProperty = {};
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.aggregateNodeConfigFormGroup.get('referenceProperty').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.referenceProperty = configuration;
                    this.configuration.branchparam = {};
                    this.configuration.property = {};
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.aggregateNodeConfigFormGroup.get('branchparam').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.branchparam = configuration;
                    this.configuration.property = {};
                    this.configuration.referenceProperty = {};
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.aggregateNodeConfigFormGroup.get('inputType').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.inputType = configuration;
                    if(this.configuration.inputType == 'PROPERTY'){
                        this.configuration.branchparam= {};
                        this.configuration.referenceProperty = {};
                        this.aggregateNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
                        this.aggregateNodeConfigFormGroup.get('referenceProperty').patchValue([], {emitEvent: false});
                    }else if (this.configuration.inputType == 'BRANCH_PARAM'){
                        this.configuration.property= {};
                        this.configuration.referenceProperty = {};
                        this.aggregateNodeConfigFormGroup.get('referenceProperty').patchValue([], {emitEvent: false});
                        this.aggregateNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
                    }else if (this.configuration.inputType == 'REFERENCE'){
                        this.configuration.property= {};
                        this.configuration.branchparam= {};
                        this.aggregateNodeConfigFormGroup.get('branchparam').patchValue([], {emitEvent: false});
                        this.aggregateNodeConfigFormGroup.get('property').patchValue([], {emitEvent: false});
                    }
                    this.updateModel(this.configuration);
                }
            );

        }
    }


    private updateModel(configuration: RuleNodeConfiguration) {
        if (this.definedConfigComponent || this.aggregateNodeConfigFormGroup.valid) {
            this.propagateChange(configuration);
        } else {
            this.propagateChange(this.required ? null : configuration);
        }
    }
}
