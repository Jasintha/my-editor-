import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { MediatorNodeConfigComponent } from './mediator-node-config.component';
import { MatTreeModule } from '@angular/material/tree';
//rooting
import { RootNodeConfigComponent } from './rooting/root-node-config.component';

//core
import { ConstantNodeConfigComponent } from './core/constant-node-config.component';
import { BranchNodeConfigComponent } from './core/branch-node-config.component';
import { DomainModelVariableNodeConfigComponent } from './core/domain-model-variable-node-config.component';

//action
import { PayloadNodeConfigComponent } from './action/payload-node-config.component';
import { EmailInitNodeConfigComponent } from './action/email-init-node-config.component';
import { EmailSendNodeConfigComponent } from './action/email-send-node-config.component';
import { EventPublisherNodeConfigComponent } from './action/event-publisher-node-config.component';
import { EventReceiverNodeConfigComponent } from './action/event-receiver-node-config.component';
import { SmsInitNodeConfigComponent } from './action/sms-init-node-config.component';
import { SmsSendNodeConfigComponent } from './action/sms-send-node-config.component';
import { LambdaFunctionNodeConfigComponent } from './action/lambda-function-node-config.component';
import { ValidatorNodeConfigComponent } from './action/validator-node-config.component';
import { LogNodeConfigComponent } from './action/log-node-config.component';
import { IteratorNodeConfigComponent } from './action/iterator-node-config.component';
import { FileUploadNodeConfigComponent } from './action/file-upload-node-config.component';
import { FileDownloadNodeConfigComponent } from './action/file-download-node-config.component';
import { CallNodeConfigComponent } from './action/call-node-config.component';

import { ConnectorNodeConfigComponent } from './connector/connector-node-config.component';

//filter
import { FilterNodeConfigComponent } from './filter/filter-node-config.component';
import { SwitchNodeConfigComponent } from './filter/switch-node-config.component';

//shopify
import { ShopifyInitNodeConfigComponent } from './shopify/shopify-init-node-config.component';
import { ShopifyEventNodeConfigComponent } from './shopify/shopify-event-node-config.component';
import { ShopifyProductNodeConfigComponent } from './shopify/shopify-product-node-config.component';
import { ShopifyOrderNodeConfigComponent } from './shopify/shopify-order-node-config.component';

//database operations
import { CrudNodeConfigComponent } from './database-operations/crud-node-config.component';

//cqrs
import { EventStoreNodeConfigComponent } from './cqrs/event-store-node-config.component';
import { QueryStoreNodeConfigComponent } from './cqrs/query-store-node-config.component';

import {MatTableModule} from '@angular/material/table';
import {AggregateNodeConfigComponent} from "@home/pages/rulechain/mediators/action/aggregate-node-config.component";
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
    QueryStoreNodeConfigComponent,
    ShopifyInitNodeConfigComponent,
    ShopifyEventNodeConfigComponent,
    ShopifyProductNodeConfigComponent,
    SmsInitNodeConfigComponent,
    SmsSendNodeConfigComponent,
    ShopifyOrderNodeConfigComponent,
    BranchNodeConfigComponent,
    LogNodeConfigComponent,
    IteratorNodeConfigComponent,
    LambdaFunctionNodeConfigComponent,
    ValidatorNodeConfigComponent,
    FileDownloadNodeConfigComponent,
    FileUploadNodeConfigComponent,
    SwitchNodeConfigComponent,
    CallNodeConfigComponent,
    AggregateNodeConfigComponent
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
    QueryStoreNodeConfigComponent,
    SmsInitNodeConfigComponent,
    BranchNodeConfigComponent,
    LogNodeConfigComponent,
    IteratorNodeConfigComponent,
    SmsSendNodeConfigComponent,
    ShopifyInitNodeConfigComponent,
    ShopifyEventNodeConfigComponent,
    ShopifyProductNodeConfigComponent,
    ShopifyOrderNodeConfigComponent,
    LambdaFunctionNodeConfigComponent,
    ValidatorNodeConfigComponent,
    FileDownloadNodeConfigComponent,
    FileUploadNodeConfigComponent,
    SwitchNodeConfigComponent,
    CallNodeConfigComponent,
    AggregateNodeConfigComponent
  ],
  providers: []
})
export class MediatorNodeConfigModule { }
