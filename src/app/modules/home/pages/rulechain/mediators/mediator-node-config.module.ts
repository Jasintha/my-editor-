import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { MediatorNodeConfigComponent } from './mediator-node-config.component';
import { MatTreeModule } from '@angular/material/tree';
//rooting
import { RootNodeConfigComponent } from './rooting/root-node-config.component';

//core
import { ConstantNodeConfigComponent } from './core/constant-node-config.component';
import { DomainModelVariableNodeConfigComponent } from './core/domain-model-variable-node-config.component';

//action
import { PayloadNodeConfigComponent } from './action/payload-node-config.component';
import { EmailInitNodeConfigComponent } from './action/email-init-node-config.component';
import { EmailSendNodeConfigComponent } from './action/email-send-node-config.component';
import { EventPublisherNodeConfigComponent } from './action/event-publisher-node-config.component';
import { EventReceiverNodeConfigComponent } from './action/event-receiver-node-config.component';

import { ConnectorNodeConfigComponent } from './connector/connector-node-config.component';

//filter
import { FilterNodeConfigComponent } from './filter/filter-node-config.component';

//database operations
import { CrudNodeConfigComponent } from './database-operations/crud-node-config.component';

//cqrs
import { EventStoreNodeConfigComponent } from './cqrs/event-store-node-config.component';
import { QueryStoreNodeConfigComponent } from './cqrs/query-store-node-config.component';

import {MatTableModule} from '@angular/material/table';
@NgModule({
  declarations: [
    MediatorNodeConfigComponent,
    RootNodeConfigComponent,
    PayloadNodeConfigComponent,
    ConstantNodeConfigComponent,
    DomainModelVariableNodeConfigComponent,
    EventReceiverNodeConfigComponent,
    EventPublisherNodeConfigComponent,
    EmailInitNodeConfigComponent,
    EmailSendNodeConfigComponent,
    FilterNodeConfigComponent,
    CrudNodeConfigComponent,
    ConnectorNodeConfigComponent,
    EventStoreNodeConfigComponent,
    QueryStoreNodeConfigComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatTableModule,
    MatTreeModule
  ],
  exports: [
    MediatorNodeConfigComponent,
    RootNodeConfigComponent,
    PayloadNodeConfigComponent,
    ConstantNodeConfigComponent,
    DomainModelVariableNodeConfigComponent,
    EventReceiverNodeConfigComponent,
    EventPublisherNodeConfigComponent,
    EmailSendNodeConfigComponent,
    EmailInitNodeConfigComponent,
    FilterNodeConfigComponent,
    CrudNodeConfigComponent,
    ConnectorNodeConfigComponent,
    EventStoreNodeConfigComponent,
    QueryStoreNodeConfigComponent
  ],
  providers: []
})
export class MediatorNodeConfigModule { }
