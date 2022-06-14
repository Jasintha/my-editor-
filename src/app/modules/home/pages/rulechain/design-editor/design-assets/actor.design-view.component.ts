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
import {IPageNavigation, PageNavigation, PageParam} from '@shared/models/model/page-navigation.model';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {IStoryActor, IStoryActorRequest, StoryActor, StoryActorRequest} from '@shared/models/model/design-assets.model';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EventManagerService} from '@shared/events/event.type';
import {NgxSpinnerService} from 'ngx-spinner';
import {DesignAssets} from '@core/projectservices/design-assets.service';

@Component({
    selector: 'virtuan-actor-design-view',
    templateUrl: './actor-design-view.component.html',
})
export class ActorDesignViewComponent implements  OnInit, OnDestroy, AfterViewInit {

    // @ViewChild('definedConfigContent', {read: ViewContainerRef, static: true}) definedConfigContainer: ViewContainerRef;

    private requiredValue: boolean;
    projectUid: string;
    storyUuid: string;
    allActors: any[] = [];


    ELEMENT_DATA: IStoryActor[] = [];
    // datasource: MatTableDataSource<Actor_Data>;
    dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    isSaving: boolean;


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
                private fb: FormBuilder,
                public dialogRef: MatDialogRef<ActorDesignViewComponent>,
                @Inject(MAT_DIALOG_DATA)  public data: any,
                protected eventManager: EventManagerService,
                private spinnerService: NgxSpinnerService,
                private designAssetsService: DesignAssets) {
        this.actorNodeConfigFormGroup = this.fb.group({
            createType: "",
            actorName: "",
            actor: null,
            permissionLevel: ""
        });
    }

    ngOnInit(): void {
        this.isSaving = false;
        this.projectUid =  this.data.projectUid;
        this.storyUuid = this.data.storyUuid;
        this.loadActors();
        if (this.data.story.storyActors){
            this.update();
        }
    }

    update(){
        this.ELEMENT_DATA = this.data.story.storyActors;
        this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);

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
                        this.allActors = res;
                    } else {
                        this.allActors = [];
                    }
                },
                (res: HttpErrorResponse) => this.onError()
            );
    }

    addActor(): void{
        let createType : string = this.actorNodeConfigFormGroup.get('createType').value;
        let actorName = "";
        let actorId = "";

        if (createType === 'New') {
            actorName = this.actorNodeConfigFormGroup.get('actorName').value;
        } else {
            actorName = this.actorNodeConfigFormGroup.get('actor').value.name;
            actorId = this.actorNodeConfigFormGroup.get('actor').value.uuid;
        }

        const actor: StoryActor = {
            actorName: actorName,
            actoruuid : actorId,
            createType : createType,
            permissionLevel : this.actorNodeConfigFormGroup.get('permissionLevel').value,
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

    private createFromForm(): IStoryActorRequest {
        return {
            ...new StoryActorRequest(),
            storyUuid: this.storyUuid,
            actors: this.ELEMENT_DATA,
        };
    }

    save() {
        this.isSaving = true;
        const storyActorRequest = this.createFromForm();
        if (storyActorRequest) {
            this.subscribeToSaveResponse(this.designAssetsService.actorUpdate(storyActorRequest, this.projectUid));
        } else {
            this.subscribeToSaveResponse(this.designAssetsService.actorUpdate(storyActorRequest, this.projectUid));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IStoryActorRequest>>) {
        result.subscribe(
            () => this.onSaveSuccess(),
            () => this.onSaveError()
        );
    }

    protected onSaveSuccess() {
        this.isSaving = false;
        this.eventManager.dispatch(
            new AppEvent(EventTypes.editorUITreeListModification, {
                name: 'editorUITreeListModification',
                content: 'Add an page navigation',
            })
        );
        this.dialogRef.close();
    }

    protected onSaveError() {// this.spinnerService.hide();
        this.isSaving = false;
    }
    protected onError() {
        // this.logger.error(errorMessage);
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
