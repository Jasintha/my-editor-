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
import { TreeNode, MenuItem } from 'primeng/api';
import { StoryService } from '@core/projectservices/story-technical-view.service';
import { AggregateService } from '@core/projectservices/microservice-aggregate.service';
import {MicroserviceAddModelDialogComponent} from "@home/pages/aggregate/microservice-add-model-dialog.component";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {EventManagerService} from '@shared/events/event.type';
import {NgxSpinnerService} from 'ngx-spinner';
import {DesignAssets} from '@core/projectservices/design-assets.service';
import {
    IStoryModelRequest,
    IStoryProcessRequest,
    IStoryScreenRequest,
    StoryModelRequest,
    StoryProcessRequest
} from '@shared/models/model/design-assets.model';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {MatStepper} from '@angular/material/stepper';
import {Aggregate, IAggregate} from '@shared/models/model/aggregate.model';
import {IProperty} from '@shared/models/model/property.model';


@Component({
    selector: 'virtuan-ste-field-mapper',
    templateUrl: './step-field-mapper.component.html',
})
export class StepFieldMapperComponent implements  OnInit, OnDestroy, AfterViewInit {

    modelAttributes: IProperty[];
    selectedModelAttributes: IProperty[];
    stepHeader: string = '';

    private propagateChange = (v: any) => { };

    constructor(public dialog: MatDialog,
                private fb: FormBuilder,
                public dialogRef: MatDialogRef<StepFieldMapperComponent>,
                @Inject(MAT_DIALOG_DATA)  public data: any,
                protected eventManager: EventManagerService) {
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    createStep(): void {
        for(const attribute of this.modelAttributes) {
            if(attribute.isSelected) {
            this.selectedModelAttributes.push(attribute)
            }
        }
        const step = {header: this.stepHeader, attributes: this.selectedModelAttributes}
        this.dialogRef.close(step);
    }

    ngOnInit(): void {
        this.modelAttributes = this.data.modelAttributes;
        this.selectedModelAttributes = [];
    }

    ngOnDestroy(): void {
    }

    ngAfterViewInit(): void {
    }
}
