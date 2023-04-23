import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { MicroserviceModelComponent } from './microservice-model.component';
import {TreeModule} from "primeng/tree";
import { MultiSelectModule } from 'primeng/multiselect';
import { ContextMenuModule } from 'primeng/contextmenu';

import { DataViewModule } from 'primeng/dataview';
import { DropdownModule } from 'primeng/dropdown';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';

import {MatDialogModule} from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDividerModule} from '@angular/material/divider';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSelectModule} from '@angular/material/select';
import {MatRadioModule} from '@angular/material/radio';
import {MatTableModule} from '@angular/material/table';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { MicroserviceAddModelDialogComponent } from './microservice-add-model-dialog.component';
import { MicroserviceAddModelConstraintsDialogComponent } from './microservice-add-model-constraints-dialog.component';
import {MatCardModule} from '@angular/material/card';
import {MatTooltipModule} from '@angular/material/tooltip';

import {MatToolbarModule} from '@angular/material/toolbar';
import {FlexModule} from '@angular/flex-layout';

import { SharedModule } from '@shared/shared.module';
import {ListboxModule} from 'primeng/listbox';
import {OrderListModule} from 'primeng/orderlist';
import { MatRippleModule } from '@angular/material/core';

@NgModule({
  declarations: [MicroserviceModelComponent, MicroserviceAddModelDialogComponent, MicroserviceAddModelConstraintsDialogComponent],
    imports: [
        CommonModule,
        RouterModule,
        TreeModule,
        MultiSelectModule,
        ContextMenuModule,
        PanelModule,
        ButtonModule,
        DataViewModule,
        TableModule,
        CheckboxModule,
        RadioButtonModule,
        ContextMenuModule,
        MultiSelectModule,
        DropdownModule,
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
        MatCardModule,
        MatRippleModule,
        MatTooltipModule,
        MatToolbarModule,
        FlexModule,
        SharedModule,
        ListboxModule,
        OrderListModule
    ],exports:[MicroserviceModelComponent, MicroserviceAddModelDialogComponent, MicroserviceAddModelConstraintsDialogComponent]
})
export class AggregateModule { }
