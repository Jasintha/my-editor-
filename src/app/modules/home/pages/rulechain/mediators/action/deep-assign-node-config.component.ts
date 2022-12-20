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
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {SelectionModel} from '@angular/cdk/collections';
import {DomainModelProperty} from '@home/pages/rulechain/mediators/core/reference-property-node-config.component';

interface ExampleFlatNode {
    expandable: boolean;
    name: string;
    level: number;
    data: any;
}

interface DomainModelNode {
    label: string;
    data: any;
    children?: DomainModelNode[];
}
@Component({
    selector: 'virtuan-deep-assign-node-config',
    templateUrl: './deep-assign-node-config.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => DeepAssignNodeConfigComponent),
        multi: true
    }]
})
export class DeepAssignNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
    allDomainModelsWithSub: any[];

    @Input()
    allViewModelsWithSub: any[];

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
    private _transformer = (node: DomainModelNode, level: number) => {
        return {
            expandable: !!node.children && node.children.length > 0,
            name: node.label,
            level,
            data: node.data
        };
    }

    treeControlVal = new FlatTreeControl<ExampleFlatNode>(
        node => node.level, node => node.expandable);
    treeFlattenerVal = new MatTreeFlattener(
        this._transformer, node => node.level, node => node.expandable, node => node.children);

    dataSourceVal = new MatTreeFlatDataSource(this.treeControlVal, this.treeFlattenerVal);


    hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

    getLevel = (node: ExampleFlatNode) => node.level;

    /** The selection for checklist */
    checklistSelectionVal = new SelectionModel<ExampleFlatNode>(false /* multiple */); // &&&&

//////////////////////////////////////////////////////////////////////////////
    private _transformer1 = (node: DomainModelNode, level: number) => {
        return {
            expandable: !!node.children && node.children.length > 0,
            name: node.label,
            level,
            data: node.data
        };
    }

    treeControlProp = new FlatTreeControl<ExampleFlatNode>(
        node => node.level, node => node.expandable);
    treeFlattenerProp = new MatTreeFlattener(
        this._transformer, node => node.level, node => node.expandable, node => node.children);

    dataSourceProp = new MatTreeFlatDataSource(this.treeControlProp, this.treeFlattenerProp);


    hasChildProp = (_: number, node: ExampleFlatNode) => node.expandable;

    getLevelProp = (node: ExampleFlatNode) => node.level;

    /** The selection for checklist */
    checklistSelectionProp = new SelectionModel<ExampleFlatNode>(false /* multiple */); // &&&&

    definedDirectiveError: string;

    deepAssignNodeConfigFormGroup: FormGroup;

    changeSubscription: Subscription;
    changeSubscriptionProp: Subscription;
    private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
    private definedConfigComponent: IRuleNodeConfigurationComponent;

    configuration: RuleNodeConfiguration;

    selectedVariableProperties: any[];
    selectedSecondVariableProperties: any[];
    selectedEntityProperties: any[];
    selectedCustomObjectProperties: any[];
    selectedSecondEntityProperties: any[];
    selectedSecondCustomObjectProperties: any[];

    datasource: MatTableDataSource<Assignment>;

    displayedColumns: string[] = ['propertyinputType', 'propertyName','propertyAttribute', 'propertyAttributeType',  'valueinputType', 'valueName','valueAttribute',
        'valueAttributeType', 'actions'];

    private propagateChange = (v: any) => { };

    constructor(private translate: TranslateService,
                private ruleChainService: RuleChainService,
                private fb: FormBuilder) {
        this.deepAssignNodeConfigFormGroup = this.fb.group({
            propertyinputType: "",
            propertyproperty: [],
            propertyreference: [],
            valueinputType: "",
            valueparam: [],
            valueproperty: [],
            valueconstant:[],
            valuebranchparam: []
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
        let inputType: string = this.deepAssignNodeConfigFormGroup.get('propertyinputType').value;
        this.configuration.propertyinputType = inputType;

        if (inputType === 'PROPERTY'){
            this.configuration.propertyreference= {};
            this.deepAssignNodeConfigFormGroup.get('propertyreference').patchValue([], {emitEvent: false});
        } else if (inputType === 'REFERENCE'){
            this.configuration.propertyproperty= {};
            this.deepAssignNodeConfigFormGroup.get('propertyproperty').patchValue([], {emitEvent: false});
        } else if (inputType === 'RETURN'){
            this.configuration.propertyreference= {};
            this.configuration.propertyproperty= {};
        }
        if (this.definedConfigComponent) {
            this.propagateChange(this.configuration);
        }

    }

    refreshSecondInputTypes(){
        let inputType: string = this.deepAssignNodeConfigFormGroup.get('valueinputType').value;
        this.configuration.valueinputType = inputType;

        if (inputType === 'CONSTANT'){
            this.configuration.valueparam= {};
            this.configuration.valueproperty= {};
            this.configuration.valuebranchparam= {};

            this.deepAssignNodeConfigFormGroup.get('valueparam').patchValue([], {emitEvent: false});
            this.deepAssignNodeConfigFormGroup.get('valueproperty').patchValue([], {emitEvent: false});
            this.deepAssignNodeConfigFormGroup.get('valuebranchparam').patchValue([], {emitEvent: false});

        } else if (inputType === 'RULE_INPUT'){
            this.configuration.valueconstant= {};
            this.configuration.valueproperty= {};
            this.configuration.valuebranchparam= {};

            this.deepAssignNodeConfigFormGroup.get('valueconstant').patchValue([], {emitEvent: false});
            this.deepAssignNodeConfigFormGroup.get('valueproperty').patchValue([], {emitEvent: false});
            this.deepAssignNodeConfigFormGroup.get('valuebranchparam').patchValue([], {emitEvent: false});
        } else if (inputType === 'PROPERTY'){
            this.configuration.valueconstant= {};
            this.configuration.valueparam= {};
            this.configuration.valuebranchparam= {};

            this.deepAssignNodeConfigFormGroup.get('valueconstant').patchValue([], {emitEvent: false});
            this.deepAssignNodeConfigFormGroup.get('valueparam').patchValue([], {emitEvent: false});
            this.deepAssignNodeConfigFormGroup.get('valuebranchparam').patchValue([], {emitEvent: false});
        } else if (inputType === 'BRANCH_PARAM'){
            this.configuration.valueconstant= {};
            this.configuration.valueparam= {};
            this.configuration.valueproperty= {};

            this.deepAssignNodeConfigFormGroup.get('valueconstant').patchValue([], {emitEvent: false});
            this.deepAssignNodeConfigFormGroup.get('valueparam').patchValue([], {emitEvent: false});
            this.deepAssignNodeConfigFormGroup.get('valueproperty').patchValue([], {emitEvent: false});
        }

        if (this.definedConfigComponent) {
            this.propagateChange(this.configuration);
        }

    }

    addAssignment(): void{
        const checklistSelectionProp = this.checklistSelectionProp.selected[0];
        let selectedProperty : DomainModelProperty;
        if(checklistSelectionProp){
            selectedProperty = {
                name: checklistSelectionProp.name,
                data: checklistSelectionProp.data
            };
        }

        const checklistSelectionVal = this.checklistSelectionVal.selected[0];
        let selectedValue : DomainModelProperty;
        if(checklistSelectionVal){
            selectedValue = {
                name: checklistSelectionVal.name,
                data: checklistSelectionVal.data
            };
        }
        let propinputType: string = this.deepAssignNodeConfigFormGroup.get('propertyinputType').value;
        let valueinputType: string = this.deepAssignNodeConfigFormGroup.get('valueinputType').value;

        let propertyName: string = '';
        let valueName: string = '';
        let propertyScope: string = '';
        let valueScope: string = '';

        if (propinputType === 'REFERENCE'){
            let selectedPropertyReference = this.deepAssignNodeConfigFormGroup.get('propertyreference').value;
            propertyName = selectedPropertyReference.name;

        } else if (propinputType === 'PROPERTY'){
            let selectedPropertyProperty = this.deepAssignNodeConfigFormGroup.get('propertyproperty').value;
            propertyName = selectedPropertyProperty.name;
            propertyScope= selectedPropertyProperty.propertyScope;

        }

        if (valueinputType === 'RULE_INPUT'){
            let selectedValueParam = this.deepAssignNodeConfigFormGroup.get('valueparam').value;
            valueName = selectedValueParam.inputName;

        } else if (valueinputType === 'PROPERTY'){
            let selectedValueProperty = this.deepAssignNodeConfigFormGroup.get('valueproperty').value;
            valueName = selectedValueProperty.name;
            valueScope = selectedValueProperty.propertyScope;

        } else if (valueinputType === 'BRANCH_PARAM'){
            let selectedValueBranch = this.deepAssignNodeConfigFormGroup.get('valuebranchparam').value;
            valueName = selectedValueBranch.name;

        } else if (valueinputType === 'CONSTANT'){
            let selectedValueConstant = this.deepAssignNodeConfigFormGroup.get('valueconstant').value;
            valueName = selectedValueConstant.constantName;
            valueScope = selectedValueConstant.scope;

        }

        let assignment = {
            'propertyinputType': propinputType,
            'propertyName': propertyName,
            'propertyAttributeType': selectedProperty.data.propertytype,
            'propertyAttribute': selectedProperty.name,
            'propertyScope':propertyScope,
            'valueinputType': valueinputType,
            'valueAttributeType': selectedValue.data.propertytype,
            'valueAttribute': selectedValue.name,
            'valueName': valueName,
            'valueScope': valueScope
        };

        this.configuration.assignments.push(assignment);
        this.updateModel(this.configuration);
        this.datasource = new MatTableDataSource(this.configuration.assignments);

        this.configuration.propertyinputType = '';
        this.configuration.valueinputType= '';
        this.configuration.propertyproperty= {};
        this.configuration.propertyreference= {};
        this.configuration.valueparam= {};
        this.configuration.valueproperty= {};
        this.configuration.valueconstant= {};
        this.configuration.valuebranchparam= {};

        this.deepAssignNodeConfigFormGroup.patchValue({
            propertyinputType: "",
            propertyproperty: [],
            propertyreference: [],
            valueinputType: "",
            valueparam: [],
            valueproperty: [],
            valueconstant:[],
            valuebranchparam: []
        });
    }

    deleteRow(index: number): void{
        this.configuration.assignments.splice(index, 1);
        this.datasource = new MatTableDataSource(this.configuration.assignments);
        this.updateModel(this.configuration);
    }

    ngAfterViewInit(): void {
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        if (this.disabled) {
            this.deepAssignNodeConfigFormGroup.disable({emitEvent: false});
        } else {
            this.deepAssignNodeConfigFormGroup.enable({emitEvent: false});
        }
    }

    writeValue(value: RuleNodeConfiguration): void {

        this.configuration = deepClone(value);

        if(this.configuration.assignments === null || this.configuration.assignments === undefined){
            this.configuration.assignments = [];
        }
        this.datasource = new MatTableDataSource(this.configuration.assignments);

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
            this.changeSubscription = this.deepAssignNodeConfigFormGroup.get('propertyreference').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.propertyreference = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.deepAssignNodeConfigFormGroup.get('propertyproperty').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.propertyproperty = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.deepAssignNodeConfigFormGroup.get('valuebranchparam').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.valuebranchparam = configuration;
                    this.updateModel(this.configuration);
                }
            );


            this.changeSubscription = this.deepAssignNodeConfigFormGroup.get('valueparam').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.valueparam = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.deepAssignNodeConfigFormGroup.get('valueconstant').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.valueconstant = configuration;
                    this.updateModel(this.configuration);
                }
            );

            this.changeSubscription = this.deepAssignNodeConfigFormGroup.get('valueproperty').valueChanges.subscribe(
                (configuration: any) => {
                    this.configuration.valueproperty = configuration;
                    this.updateModel(this.configuration);
                }
            );

        }
// &&&&
        this.changeSubscription = this.deepAssignNodeConfigFormGroup.get('valueproperty').valueChanges.subscribe(
            (configuration: any) => {
                // this.configuration.modelpropertyproperty = configuration;

                if(configuration.propertyDataType === 'MODEL' && configuration.record === 's'){
                    const selectedbranchparamdomainModel = this.allDomainModelsWithSub.find(x => x.nameTitleCase === configuration.type );
                    if(selectedbranchparamdomainModel){
                        const designtree : any[] = [];
                        designtree.push(selectedbranchparamdomainModel.design);
                        this.dataSourceVal.data = designtree;
                    }
                } else if (configuration.propertyDataType === 'DTO' && configuration.record === 's'){
                    const selectedbranchparamviewModel = this.allViewModelsWithSub.find(x => x.nameTitleCase === configuration.type );
                    if(selectedbranchparamviewModel){
                        const designtree : any[] = [];
                        designtree.push(selectedbranchparamviewModel.design);
                        this.dataSourceVal.data = designtree;
                    }
                } else {
                    this.dataSourceVal = new MatTreeFlatDataSource(this.treeControlVal, this.treeFlattenerVal);
                }
                // this.updateModel(this.configuration);
            }
        );

        this.changeSubscriptionProp = this.deepAssignNodeConfigFormGroup.get('propertyproperty').valueChanges.subscribe(
            (configuration: any) => {
                // this.configuration.modelpropertyproperty = configuration;

                if(configuration.propertyDataType === 'MODEL' && configuration.record === 's'){
                    const selectedbranchparamdomainModel = this.allDomainModelsWithSub.find(x => x.nameTitleCase === configuration.type );
                    if(selectedbranchparamdomainModel){
                        const designtree : any[] = [];
                        designtree.push(selectedbranchparamdomainModel.design);
                        this.dataSourceProp.data = designtree;
                    }
                } else if (configuration.propertyDataType === 'DTO' && configuration.record === 's'){
                    const selectedbranchparamviewModel = this.allViewModelsWithSub.find(x => x.nameTitleCase === configuration.type );
                    if(selectedbranchparamviewModel){
                        const designtree : any[] = [];
                        designtree.push(selectedbranchparamviewModel.design);
                        this.dataSourceProp.data = designtree;
                    }
                } else {
                    this.dataSourceProp = new MatTreeFlatDataSource(this.treeControlProp, this.treeFlattenerProp);
                }
                // this.updateModel(this.configuration);
            }
        );

    }


    checkboxClickProp(node){
        this.checklistSelectionProp.toggle(node);
    }
    checkboxClickVal(node){
        this.checklistSelectionVal.toggle(node);
    }
    private updateModel(configuration: RuleNodeConfiguration) {
        if (this.definedConfigComponent || this.deepAssignNodeConfigFormGroup.valid) {
            this.propagateChange(configuration);
        } else {
            this.propagateChange(this.required ? null : configuration);
        }
    }

}

export interface Assignment {
    propertyinputType: string;
    propertyName: string;
    valueinputType: string;
    valueName: string;
    propertyScope: string;
    valueScope: string;
}

