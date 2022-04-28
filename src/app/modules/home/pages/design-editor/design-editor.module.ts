import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

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
import {DesignEditorComponent} from '@home/pages/design-editor/design-editor.component';
import {CreateRequirementComponent} from '@home/pages/design-editor/create-requirement.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {FlexModule} from '@angular/flex-layout';
import {SharedModule} from '@shared/shared.module';
import { EditorModule } from 'primeng/editor';
@NgModule({
    declarations:[
        DesignEditorComponent,
        CreateRequirementComponent
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
        EditorModule,
        SharedModule,
        NgbModule,
        FontAwesomeModule
    ],
    exports:[
        DesignEditorComponent,
        CreateRequirementComponent
    ]
})
export class DesignEditorModule {
}
