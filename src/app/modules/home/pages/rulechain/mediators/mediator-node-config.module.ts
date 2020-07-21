import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { MediatorNodeConfigComponent } from './mediator-node-config.component';

//rooting
import { RootNodeConfigComponent } from './rooting/root-node-config.component';

//core
import { ConstantNodeConfigComponent } from './core/constant-node-config.component';

//action
import { PayloadNodeConfigComponent } from './action/payload-node-config.component';
import { EmailInitNodeConfigComponent } from './action/email-init-node-config.component';
import { EmailSendNodeConfigComponent } from './action/email-send-node-config.component';

//filter
import { FilterNodeConfigComponent } from './filter/filter-node-config.component';

//database operations
import { CrudNodeConfigComponent } from './database-operations/crud-node-config.component';

import {MatTableModule} from '@angular/material/table';
@NgModule({
  declarations: [
    MediatorNodeConfigComponent,
    RootNodeConfigComponent,
    PayloadNodeConfigComponent,
    ConstantNodeConfigComponent,
    EmailInitNodeConfigComponent,
    EmailSendNodeConfigComponent,
    FilterNodeConfigComponent,
    CrudNodeConfigComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatTableModule,
  ],
  exports: [
    MediatorNodeConfigComponent,
    RootNodeConfigComponent,
    PayloadNodeConfigComponent,
    ConstantNodeConfigComponent,
    EmailSendNodeConfigComponent,
    EmailInitNodeConfigComponent,
    FilterNodeConfigComponent,
    CrudNodeConfigComponent
  ],
  providers: []
})
export class MediatorNodeConfigModule { }
