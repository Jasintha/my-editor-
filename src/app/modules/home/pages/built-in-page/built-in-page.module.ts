import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDividerModule} from '@angular/material/divider';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSelectModule} from '@angular/material/select';
import {MatRadioModule} from '@angular/material/radio';
import {MatTableModule} from '@angular/material/table';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatToolbarModule} from '@angular/material/toolbar';
import {FlexModule} from '@angular/flex-layout';
import { SharedModule } from '@shared/shared.module';
import {BuiltInPageComponent} from '@home/pages/built-in-page/built-in-page.component';
import {InitPageCreationComponent} from '@home/pages/built-in-page/init-page-creation.component';
import { PanelModule } from 'primeng/panel';
import { DataViewModule } from 'primeng/dataview';
import {ButtonModule} from 'primeng/button';
import {RadioButtonModule} from 'primeng/radiobutton';
import {SplitButtonModule} from 'primeng/splitbutton';
import {CheckboxModule} from 'primeng/checkbox';
import {DropdownModule} from 'primeng/dropdown';
import {LottieAnimationViewModule} from 'ng-lottie';
import {AddFormControllersComponent} from '@home/pages/built-in-page/add-form-controllers.component';
import {SingleWidgetComponent} from '@home/pages/built-in-page/single-widget.component';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {NgbDropdownModule} from '@ng-bootstrap/ng-bootstrap';
import {SinglePageViewComponent} from '@home/pages/built-in-page/single-page.component';
import {BuiltInPageDeleteDialogComponent} from '@home/pages/built-in-page/built-in-page-delete-dialog.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import {PageGridHandlerComponent} from '@home/pages/built-in-page/page-grid-handler.component';
import {WidgetSelectDialogComponent} from '@home/pages/built-in-page/widget-select-dialog.component';
import {ViewModelConfigComponent} from '@home/pages/built-in-page/view-model-config.component';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { PickListModule } from 'primeng/picklist';
import {CustomPageViewComponent} from '@home/pages/built-in-page/custom-page.component';
import {CustomPageApiDialogComponent} from '@home/pages/built-in-page/custom-page-api-dialog.component';
import {FilterPageComponent} from '@home/pages/built-in-page/filter-page.component';
import {ModelChangeConfirmDialogComponent} from '@home/pages/built-in-page/model-change-confirm-dialog.component';
import {PageSaveConfirmDialogComponent} from '@home/pages/built-in-page/page-save-confirm-dialog.component';
import {PageActionEventComponent} from '@home/pages/built-in-page/page-action-event.component';
import {ButtonEventHandleComponent} from '@home/pages/built-in-page/button-event-handle.component';
import {StepFieldMapperComponent} from '@home/pages/built-in-page/step-field-mapper.component';
import {FieldsetModule} from 'primeng/fieldset';
import {FlexGridHandlerComponent} from '@home/pages/built-in-page/flex-grid-handler.component';
import {CreateGridComponent} from '@home/pages/built-in-page/create-grid.component';
import {MonacoEditorModule} from 'ngx-monaco-editor';
// import { LayoutBasicSettingsComponent } from './flex-grid-handler/layout-basic-settings.component';
// import { LayoutArrangementComponent } from './flex-grid-handler/layout-arrangement.component';

@NgModule({
    declarations:[
        BuiltInPageComponent,
        InitPageCreationComponent,
        AddFormControllersComponent,
        SingleWidgetComponent,
        SinglePageViewComponent,
        BuiltInPageDeleteDialogComponent,
        PageGridHandlerComponent,
        WidgetSelectDialogComponent,
        ViewModelConfigComponent,
        PageActionEventComponent,
        CustomPageViewComponent,
        CustomPageApiDialogComponent,
        FilterPageComponent,
        ModelChangeConfirmDialogComponent,
        PageSaveConfirmDialogComponent,
        ButtonEventHandleComponent,
        StepFieldMapperComponent,
        FlexGridHandlerComponent,
        // LayoutBasicSettingsComponent,
        // LayoutArrangementComponent,
        CreateGridComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        MatSidenavModule,
        MatFormFieldModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        ReactiveFormsModule,
        MatDividerModule,
        MatInputModule,
        MatCheckboxModule,
        MatSelectModule,
        CommonModule,
        MatRadioModule,
        FormsModule,
        MatTableModule,
        MatSnackBarModule,
        MatToolbarModule,
        FlexModule,
        SharedModule,
        PanelModule,
        DataViewModule,
        ButtonModule,
        RadioButtonModule,
        SplitButtonModule,
        CheckboxModule,
        DropdownModule,
        CommonModule,
        NgxSpinnerModule,
        TableModule,
        InputTextModule,
        PickListModule,
        FieldsetModule,
        MonacoEditorModule
    ],
    exports:[
        BuiltInPageComponent,
        InitPageCreationComponent,
        AddFormControllersComponent,
        SingleWidgetComponent,
        SinglePageViewComponent,
        BuiltInPageDeleteDialogComponent,
        PageGridHandlerComponent,
        WidgetSelectDialogComponent,
        ViewModelConfigComponent,
        PageActionEventComponent,
        CustomPageViewComponent,
        CustomPageApiDialogComponent,
        FilterPageComponent,
        ModelChangeConfirmDialogComponent,
        PageSaveConfirmDialogComponent,
        ButtonEventHandleComponent,
        StepFieldMapperComponent,
        FlexGridHandlerComponent,
        // LayoutBasicSettingsComponent,
        // LayoutArrangementComponent,
        CreateGridComponent
    ],
    providers: [ ]
})
export class BuiltInPageModule {
}
