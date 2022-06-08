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
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { filter, map } from 'rxjs/operators';
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
import { StoryService } from '@core/projectservices/story-technical-view.service';
import {PageParam} from '@shared/models/model/page-navigation.model';

@Component({
    selector: 'virtuan-actor-design-view',
    templateUrl: './actor-design-view.component.html',
})
export class ActorDesignViewComponent implements  OnInit, OnDestroy, AfterViewInit {

    // @ViewChild('definedConfigContent', {read: ViewContainerRef, static: true}) definedConfigContainer: ViewContainerRef;

    private requiredValue: boolean;

    @Input()
    projectUid: string;

    ELEMENT_DATA: Actor[] = [];
    // datasource: MatTableDataSource<Actor_Data>;
    dataSource = new MatTableDataSource(this.ELEMENT_DATA);


    actorNodeConfigFormGroup: FormGroup;

    changeSubscription: Subscription;

    displayedColumns: string[] = ['actorName', 'permissionLevel', 'actions'];

    private definedConfigComponentRef: ComponentRef<IRuleNodeConfigurationComponent>;
    private definedConfigComponent: IRuleNodeConfigurationComponent;

    configuration: RuleNodeConfiguration;

    private propagateChange = (v: any) => { };

    constructor(private translate: TranslateService,
                private ruleChainService: RuleChainService,
                protected storyService: StoryService,
                private fb: FormBuilder) {
        this.actorNodeConfigFormGroup = this.fb.group({
            createType: "",
            actorName: "",
            actor: null,
            permissionLevel: ""
        });
    }

    ngOnInit(): void {
        this.loadActors();
    }

    ngOnDestroy(): void {
        if (this.definedConfigComponentRef) {
            this.definedConfigComponentRef.destroy();
        }
    }

    ngAfterViewInit(): void {
    }

    loadActors() {
        this.storyService
            .findActorsByProjectId(this.projectUid)
            .pipe(
                filter((res: HttpResponse<any[]>) => res.ok),
                map((res: HttpResponse<any[]>) => res.body)
            )
            .subscribe(
                (res: any[]) => {
                    if (res) {
                        // this.allActors = res;
                    } else {
                        // this.allActors = [];
                    }
                },
                (res: HttpErrorResponse) => this.onError()
            );
    }

    protected onError() {
    }

    addActor(): void{
        let createType : string = this.actorNodeConfigFormGroup.get('createType').value;
        let actorName = "";
        let actorId = "";

        if (createType == 'New') {
            actorName = this.actorNodeConfigFormGroup.get('actorName').value;
        } else {
            actorName = this.actorNodeConfigFormGroup.get('actor').value.name;
            actorId = this.actorNodeConfigFormGroup.get('actor').value.uuid;
        }

        let actor = {
            'actorName': actorName,
            'actoruuid': actorId,
            'createType': createType,
            'permissionLevel': this.actorNodeConfigFormGroup.get('permissionLevel').value
        };
        this.ELEMENT_DATA.push(actor);
        // this.updateModel(this.configuration);
        this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
        this.actorNodeConfigFormGroup.patchValue({
            createType: "",
            actorName: "",
            actor: null,
            permissionLevel: ""
        });
    }

    deleteRow(index: number): void{
        this.ELEMENT_DATA.splice(index, 1);
        this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
        this.updateModel(this.configuration);
    }

    // setDisabledState(isDisabled: boolean): void {
    //     this.disabled = isDisabled;
    //     if (this.disabled) {
    //         this.actorNodeConfigFormGroup.disable({emitEvent: false});
    //     } else {
    //         this.actorNodeConfigFormGroup.enable({emitEvent: false});
    //     }
    // }

    // writeValue(value: RuleNodeConfiguration): void {
    //
    //     this.configuration = deepClone(value);
    //
    //     if(this.configuration.actors === null || this.configuration.actors === undefined){
    //         this.configuration.actors = [];
    //     }
    //     this.datasource = new MatTableDataSource();
    //
    //     if (this.changeSubscription) {
    //         this.changeSubscription.unsubscribe();
    //         this.changeSubscription = null;
    //     }
    //     if (this.definedConfigComponent) {
    //
    //
    //         this.definedConfigComponent.configuration = this.configuration;
    //         this.changeSubscription = this.definedConfigComponent.configurationChanged.subscribe((configuration) => {
    //             this.updateModel(configuration);
    //         });
    //     } else {
    //         //this.actorNodeConfigFormGroup.get('payload').patchValue(this.configuration.payload, {emitEvent: false});
    //         /*
    //         this.changeSubscription = this.actorNodeConfigFormGroup.get('payload').valueChanges.subscribe(
    //           (configuration: RuleNodeConfiguration) => {
    //
    //
    //
    //             this.configuration.payload = configuration;
    //             this.updateModel(this.configuration);
    //           }
    //         );
    //         */
    //     }
    // }

    titleCaseWord(word: string) {
        if (!word) return word;
        return word[0].toUpperCase() + word.substr(1);
    }

    lowerCaseWord(word: string) {
        if (!word) return word;
        return word[0].toLowerCase() + word.substr(1);
    }

    private updateModel(configuration: RuleNodeConfiguration) {

        if (this.definedConfigComponent || this.actorNodeConfigFormGroup.valid) {
            this.propagateChange(configuration);
        } else {

            // this.propagateChange(this.required ? null : configuration);
        }
    }

}

export interface Actor {
    actorName: string;
    actoruuid: string;
    createType: string;
    permissionLevel: string;
}
