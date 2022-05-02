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
  selector: 'virtuan-process-node-config',
  templateUrl: './process-node-config.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ProcessNodeConfigComponent),
    multi: true
  }]
})
export class ProcessNodeConfigComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

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
  allActors: any[];

  @Input()
  ruleNodeId: string;

  nodeDefinitionValue: RuleNodeDefinition;

  datasource: MatTableDataSource<Actor>;

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

  processNodeConfigFormGroup: FormGroup;

  changeSubscription: Subscription;

//   displayedColumns: string[] = ['actorName', 'permissionLevel', 'actions'];

  private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
  private definedConfigComponent: IRuleNodeConfigurationComponent;

  configuration: RuleNodeConfiguration;

  private propagateChange = (v: any) => { };

  constructor(private translate: TranslateService,
              private ruleChainService: RuleChainService,
              private fb: FormBuilder) {
    this.processNodeConfigFormGroup = this.fb.group({
//       createType: "",
//       actorName: "",
//       actor: null,
//       permissionLevel: ""
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

//   addActor(): void{
//     let createType : string = this.processNodeConfigFormGroup.get('createType').value;
//     let actorName = "";
//     let actorId = "";
//
//     if (createType == 'New') {
//       actorName = this.processNodeConfigFormGroup.get('actorName').value;
//     } else {
//       actorName = this.processNodeConfigFormGroup.get('actor').value.name;
//       actorId = this.processNodeConfigFormGroup.get('actor').value.uuid;
//     }
//
//     let actor = {
//       'actorName': actorName,
//       'actorId': actorId,
//       'createType': createType,
//       'permissionLevel': this.processNodeConfigFormGroup.get('permissionLevel').value
//     };
//     this.configuration.actors.push(actor);
//     this.updateModel(this.configuration);
//     this.datasource = new MatTableDataSource(this.configuration.actors);
//     this.processNodeConfigFormGroup.patchValue({
//         createType: "",
//         actorName: "",
//         actor: null,
//         permissionLevel: ""
//     });
//   }

//   deleteRow(index: number): void{
//     this.configuration.actors.splice(index, 1);
//     this.datasource = new MatTableDataSource(this.configuration.actors);
//     this.updateModel(this.configuration);
//   }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.disabled) {
      this.processNodeConfigFormGroup.disable({emitEvent: false});
    } else {
      this.processNodeConfigFormGroup.enable({emitEvent: false});
    }
  }

  writeValue(value: RuleNodeConfiguration): void {

    this.configuration = deepClone(value);
//
//     if(this.configuration.actors === null || this.configuration.actors === undefined){
//         this.configuration.actors = [];
//     }
//      this.datasource = new MatTableDataSource(this.configuration.actors);

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
      //this.processNodeConfigFormGroup.get('payload').patchValue(this.configuration.payload, {emitEvent: false});
      /*
      this.changeSubscription = this.processNodeConfigFormGroup.get('payload').valueChanges.subscribe(
        (configuration: RuleNodeConfiguration) => {



          this.configuration.payload = configuration;
          this.updateModel(this.configuration);
        }
      );
      */
    }
  }

  titleCaseWord(word: string) {
    if (!word) return word;
    return word[0].toUpperCase() + word.substr(1);
  }

  lowerCaseWord(word: string) {
    if (!word) return word;
    return word[0].toLowerCase() + word.substr(1);
  }

  private updateModel(configuration: RuleNodeConfiguration) {

    if (this.definedConfigComponent || this.processNodeConfigFormGroup.valid) {
      this.propagateChange(configuration);
    } else {

      this.propagateChange(this.required ? null : configuration);
    }
  }

}

export interface Actor {
  actorName: string;
  actorId: string;
  createType: string;
  permissionLevel: string;
}