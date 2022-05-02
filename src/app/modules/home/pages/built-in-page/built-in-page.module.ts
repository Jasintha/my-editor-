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

@NgModule({
    declarations:[
        BuiltInPageComponent,
        InitPageCreationComponent,
        AddFormControllersComponent,
        SingleWidgetComponent,
        SinglePageViewComponent,
        BuiltInPageDeleteDialogComponent
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
    ],
    exports:[
        BuiltInPageComponent,
        InitPageCreationComponent,
        AddFormControllersComponent,
        SingleWidgetComponent,
        SinglePageViewComponent,
        BuiltInPageDeleteDialogComponent
    ],
    providers: [ ]
})
export class BuiltInPageModule {
}
