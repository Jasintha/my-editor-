import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { MediatorNodeConfigComponent } from './mediator-node-config.component';
import { MatTreeModule } from '@angular/material/tree';
//rooting
import { RootNodeConfigComponent } from './rooting/root-node-config.component';
import { ErrorBranchNodeConfigComponent } from './rooting/error-branch-node-config.component';

//core
import { ConstantNodeConfigComponent } from './core/constant-node-config.component';
import { BranchNodeConfigComponent } from './core/branch-node-config.component';
import { DomainModelVariableNodeConfigComponent } from './core/domain-model-variable-node-config.component';
import { ReferencePropertyNodeConfigComponent } from './core/reference-property-node-config.component';
import { ConnectionPropertyNodeConfigComponent } from './core/connection-property-node-config.component';

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
import { HybridFunctionNodeConfigComponent } from './action/hybrid-function-node-config.component';
import { AssignNodeConfigComponent } from './action/assign-node-config.component';
import { EnvVariableLookupNodeConfigComponent } from './action/env-variable-lookup-node-config.component';
import { StringTemplateNodeConfigComponent } from './action/string-template-node-config.component';
import { CPGetterNodeConfigComponent } from './action/cp-getter-node-config.component';
import { FileReadNodeConfigComponent } from './action/file-read-node-config.component';
import { FileWriteNodeConfigComponent } from './action/file-write-node-config.component';

import { ConnectorNodeConfigComponent } from './connector/connector-node-config.component';

//Sidecar
import { SidecarNodeConfigComponent } from './sidecar/sidecar-node-config.component';

//filter
import { FilterNodeConfigComponent } from './filter/filter-node-config.component';
import { SwitchNodeConfigComponent } from './filter/switch-node-config.component';

//main
import { APIGroupNodeConfigComponent } from './main/api-group-node-config.component';
import { ContextPropertyNodeConfigComponent } from './main/context-property-node-config.component';
import { GRPCServerNodeConfigComponent } from './main/grpc-server-config.component';
import { RESTServerNodeConfigComponent } from './main/rest-server-config.component';

//middlewares
import { BasicAuthMiddlewareNodeConfigComponent } from './middlewares/basic-auth-middleware-node-config.component';
import { JWTAuthMiddlewareNodeConfigComponent } from './middlewares/jwt-auth-middleware-node-config.component';
import { BodyLimitMiddlewareNodeConfigComponent } from './middlewares/body-limit-middleware-node-config.component';
import { CasbinAuthMiddlewareNodeConfigComponent } from './middlewares/casbin-auth-middleware-node-config.component';
import { CoreMiddlewareNodeConfigComponent } from './middlewares/core-middleware-node-config.component';
import { TimeoutMiddlewareNodeConfigComponent } from './middlewares/timeout-middleware-node-config.component';
import {EncryptMiddlewareNodeConfigComponent} from "./middlewares/encrypt-middleware-node-config.component";

//extend
import { SubRuleNodeConfigComponent } from './extend/sub-rule-node-config.component';

//shopify
import { ShopifyInitNodeConfigComponent } from './shopify/shopify-init-node-config.component';
import { ShopifyEventNodeConfigComponent } from './shopify/shopify-event-node-config.component';
import { ShopifyProductNodeConfigComponent } from './shopify/shopify-product-node-config.component';
import { ShopifyOrderNodeConfigComponent } from './shopify/shopify-order-node-config.component';

//database operations
import { CrudNodeConfigComponent } from './database-operations/crud-node-config.component';
 import { DBNodeConfigComponent } from './database-operations/db-node-config.component';
import { DashboardQueryNodeConfigComponent } from './database-operations/dashboard-query-node-config.component';
// import { QueryBuilderNodeConfigComponent } from './database-operations/query-builder-node-config.component';

//cqrs
import { EventStoreNodeConfigComponent } from './cqrs/event-store-node-config.component';
import { QueryStoreNodeConfigComponent } from './cqrs/query-store-node-config.component';

import {MatTableModule} from '@angular/material/table';
import {AggregateNodeConfigComponent} from "@home/pages/rulechain/mediators/action/aggregate-node-config.component";

//pdftemp
import {PdfNodeConfigComponent} from "@home/pages/rulechain/mediators/pdf/pdf-node-config.component";
import {ExcelWriteNodeConfigComponent} from "@home/pages/rulechain/mediators/excel/excel-write-node-config.component";
import {ExcelReadNodeConfigComponent} from "@home/pages/rulechain/mediators/excel/excel-read-node-config.component";
import {ExcelCopyNodeConfigComponent} from "@home/pages/rulechain/mediators/excel/excel-copy-node-config.component";
import {ExcelDeleteNodeConfigComponent} from "@home/pages/rulechain/mediators/excel/excel-delete-node-config.component";
@NgModule({
  declarations: [
    MediatorNodeConfigComponent,
    RootNodeConfigComponent,
    ErrorBranchNodeConfigComponent,
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
    ReferencePropertyNodeConfigComponent,
    ConnectionPropertyNodeConfigComponent,
    EventStoreNodeConfigComponent,
    QueryStoreNodeConfigComponent,
    ShopifyInitNodeConfigComponent,
    ShopifyEventNodeConfigComponent,
    ShopifyProductNodeConfigComponent,
    JWTAuthMiddlewareNodeConfigComponent,
    HybridFunctionNodeConfigComponent,
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
    AggregateNodeConfigComponent,
    AssignNodeConfigComponent,
    CPGetterNodeConfigComponent,
    FileReadNodeConfigComponent,
    FileWriteNodeConfigComponent,
    EnvVariableLookupNodeConfigComponent,
    StringTemplateNodeConfigComponent,
    // QueryBuilderNodeConfigComponent,
     DBNodeConfigComponent,
     DashboardQueryNodeConfigComponent,
     SubRuleNodeConfigComponent,
      PdfNodeConfigComponent,
    ExcelWriteNodeConfigComponent,
    ExcelReadNodeConfigComponent,
    ExcelCopyNodeConfigComponent,
    ExcelDeleteNodeConfigComponent,
    APIGroupNodeConfigComponent,
    ContextPropertyNodeConfigComponent,
    GRPCServerNodeConfigComponent,
    RESTServerNodeConfigComponent,
    BasicAuthMiddlewareNodeConfigComponent,
    BodyLimitMiddlewareNodeConfigComponent,
    CasbinAuthMiddlewareNodeConfigComponent,
    CoreMiddlewareNodeConfigComponent,
    TimeoutMiddlewareNodeConfigComponent,
    EncryptMiddlewareNodeConfigComponent,
    SidecarNodeConfigComponent
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
    ErrorBranchNodeConfigComponent,
    PayloadNodeConfigComponent,
    ConstantNodeConfigComponent,
    DomainModelVariableNodeConfigComponent,
    EventReceiverNodeConfigComponent,
    EventPublisherNodeConfigComponent,
    EmailSendNodeConfigComponent,
    ReferencePropertyNodeConfigComponent,
    ConnectionPropertyNodeConfigComponent,
    EmailInitNodeConfigComponent,
    FilterNodeConfigComponent,
    CrudNodeConfigComponent,
    ConnectorNodeConfigComponent,
    EventStoreNodeConfigComponent,
    QueryStoreNodeConfigComponent,
    SmsInitNodeConfigComponent,
    BranchNodeConfigComponent,
    HybridFunctionNodeConfigComponent,
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
    AggregateNodeConfigComponent,
    AssignNodeConfigComponent,
    CPGetterNodeConfigComponent,
    FileReadNodeConfigComponent,
    FileWriteNodeConfigComponent,
    EnvVariableLookupNodeConfigComponent,
    StringTemplateNodeConfigComponent,
    // QueryBuilderNodeConfigComponent,
     DBNodeConfigComponent,
     DashboardQueryNodeConfigComponent,
     SubRuleNodeConfigComponent,
    PdfNodeConfigComponent,
    ExcelWriteNodeConfigComponent,
    ExcelReadNodeConfigComponent,
    ExcelCopyNodeConfigComponent,
    ExcelDeleteNodeConfigComponent,
    APIGroupNodeConfigComponent,
    ContextPropertyNodeConfigComponent,
    GRPCServerNodeConfigComponent,
    RESTServerNodeConfigComponent,
    JWTAuthMiddlewareNodeConfigComponent,
    BasicAuthMiddlewareNodeConfigComponent,
    BodyLimitMiddlewareNodeConfigComponent,
    CasbinAuthMiddlewareNodeConfigComponent,
    CoreMiddlewareNodeConfigComponent,
    TimeoutMiddlewareNodeConfigComponent,
    EncryptMiddlewareNodeConfigComponent,
    SidecarNodeConfigComponent
  ],
  providers: []
})
export class MediatorNodeConfigModule { }
