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
import {CreateTaskComponent} from '@home/pages/create-task/create-task.component';
import {TaskDeleteDialogComponent} from '@home/pages/create-task/task-delete-dialog.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {FlexModule} from '@angular/flex-layout';
import {SharedModule} from '@shared/shared.module';
import {MainMenuComponent} from '@home/pages/main-menu/main-menu.component';
import {PageNavigationComponent} from '@home/pages/page-navigation/page-navigation.component';
import {PageNavigationDeleteDialogComponent} from '@home/pages/page-navigation/page-navigation-delete-dialog.component';


@NgModule({
    declarations:[
        PageNavigationComponent,
        PageNavigationDeleteDialogComponent
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
        SharedModule
    ],
    exports:[
        PageNavigationComponent,
        PageNavigationDeleteDialogComponent
    ]
})
export class PageNavigationModule {
}
