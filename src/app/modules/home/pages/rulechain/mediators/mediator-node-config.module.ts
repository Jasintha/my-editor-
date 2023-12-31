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
import { PropertyNodeConfigComponent } from './core/property-node-config.component';

//action
import { PayloadNodeConfigComponent } from './action/payload-node-config.component';
import { EmailInitNodeConfigComponent } from './action/email-init-node-config.component';
import { EmailInitV2NodeConfigComponent } from './action/email-init-v2-node-config.component';
import { EmailSendNodeConfigComponent } from './action/email-send-node-config.component';
import { EmailNodeConfigComponent } from './action/email-node-config.component';
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
import { GRPCCallNodeConfigComponent } from './action/grpc-call-node-config.component';
import { ConnectorNodeConfigComponent } from './connector/connector-node-config.component';
import { ErrorNodeConfigComponent } from './action/error-node-config.component';

//tenant
import { HttpHeaderNodeConfigComponent } from './tenant/http-header-node-config.component';

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
 import { DBDynamicQueryNodeConfigComponent } from './database-operations/db-dynamic-query-node-config.component';
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
import {NewConnectorNodeConfigComponent} from "@home/pages/rulechain/mediators/connector/new-connector-node-config.component";

//design
import {ActorNodeConfigComponent} from "@home/pages/rulechain/mediators/design/actor-node-config.component";
import {ModelNodeConfigComponent} from "@home/pages/rulechain/mediators/design/model-node-config.component";
import {ProcessNodeConfigComponent} from "@home/pages/rulechain/mediators/design/process-node-config.component";
import {ScreenNodeConfigComponent} from "@home/pages/rulechain/mediators/design/screen-node-config.component";

//activator
import {ApiNodeConfigComponent} from "@home/pages/rulechain/mediators/activator/api-node-config.component";
import {DeleteNodeConfigComponent} from "@home/pages/rulechain/mediators/activator/delete-node-config.component";
import {GetNodeConfigComponent} from "@home/pages/rulechain/mediators/activator/get-node-config.component";
import {PostNodeConfigComponent} from "@home/pages/rulechain/mediators/activator/post-node-config.component";
import {PutNodeConfigComponent} from "@home/pages/rulechain/mediators/activator/put-node-config.component";
import {GeneralTaskNodeConfigComponent} from "@home/pages/rulechain/mediators/activator/general-task-node-config.component";
import {MessageSubscriberTaskNodeComponent} from "@home/pages/rulechain/mediators/activator/message-sub-task-node-config.component";
import {FileReaderTaskNodeConfigComponent} from "@home/pages/rulechain/mediators/activator/file-reader-task-node-config.component";
import {ServiceCallTaskNodeConfigComponent} from "@home/pages/rulechain/mediators/activator/service-call-task-node-config.component";
import {GRPCUnaryNodeConfigComponent} from "@home/pages/rulechain/mediators/activator/grpc-unary-node-config.component";
import {GRPCServerSideStrNodeConfigComponent} from "@home/pages/rulechain/mediators/activator/grpc-serverside-str-node-config.component";
import {GRPCClientSideStrNodeConfigComponent} from "@home/pages/rulechain/mediators/activator/grpc-clientside-str-node-config.component";
import {GRPCBidirectionalStrNodeConfigComponent} from "@home/pages/rulechain/mediators/activator/grpc-bidirectional-str-node-config.component";

import {TreeModule} from 'primeng/tree';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { DataViewModule } from 'primeng/dataview';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MonacoEditorModule, NgxMonacoEditorConfig } from 'ngx-monaco-editor';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { SidebarModule } from 'primeng/sidebar';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { AngularSplitModule } from 'angular-split';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { FieldsetModule } from 'primeng/fieldset';
import { StepsModule } from 'primeng/steps';
import { CarouselModule } from 'primeng/carousel';
import { EditorModule } from 'primeng/editor';
import { MenubarModule } from 'primeng/menubar';
import { TabViewModule } from 'primeng/tabview';
import {DeepAssignNodeConfigComponent} from '@home/pages/rulechain/mediators/action/deep-assign-node-config.component';
import { CommonNodeConfigComponent } from './core/common-node-config.component';
import { UibHttpReplyNodeConfigComponent } from './uib/uibHttpReply-node-config.component';
import { UibHttpInputNodeConfigComponent } from './uib/uibHttpInput-node-config.component';
import { UibTraceNodeConfigComponent } from './uib/uibTrace-node-config.component';
import { UIBTextAreaInputComponent } from './uib/uib-node-properties/text-area-input/uib-text-area-input.component';
import { UIBTextInputComponent } from './uib/uib-node-properties/text-input/uib-text-input.component';
import { UibNodeBaseConfigComponent } from './uib/uib-node-properties/uib-node-base-config.component';
import { UIBDropDownComponent } from './uib/uib-node-properties/dropdown/uib-dropdown-input.component';
import { UIBTableComponent } from './uib/uib-node-properties/table/uib-table.component';
import { UIBFormTableComponent } from './uib/uib-node-properties/form-table/uib-form-table.component';
import { UIBTreeViewInputComponent } from './uib/uib-node-properties/tree-view/uib-tree-view.component';
import { UIBDropDownWithChildrenComponent } from './uib/uib-node-properties/dropdown-with-children/dropdown-with-children.component';
import { UIBSectionComponent } from './uib/uib-node-properties/section/uib-section.component';
import { UIBMappingComponent } from './uib/uib-node-properties/mapping-with-table/mapping-with-table.component';

@NgModule({
  declarations: [
    MediatorNodeConfigComponent,
    CommonNodeConfigComponent,
    UibNodeBaseConfigComponent,
    UIBTextAreaInputComponent,
    UIBTextInputComponent,
    UIBDropDownComponent,
    UIBTableComponent,
    UIBFormTableComponent,
    UIBTreeViewInputComponent,
    UIBDropDownWithChildrenComponent,
    UIBSectionComponent,
    UIBMappingComponent,
    RootNodeConfigComponent,
    ErrorBranchNodeConfigComponent,
    PayloadNodeConfigComponent,
    ConstantNodeConfigComponent,
    DomainModelVariableNodeConfigComponent,
    EventReceiverNodeConfigComponent,
    EventPublisherNodeConfigComponent,
    EmailInitNodeConfigComponent,
    EmailInitV2NodeConfigComponent,
    EmailSendNodeConfigComponent,
    EmailNodeConfigComponent,
    FilterNodeConfigComponent,
    CrudNodeConfigComponent,
    ConnectorNodeConfigComponent,
    NewConnectorNodeConfigComponent,
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
    UibHttpInputNodeConfigComponent,
    UibHttpReplyNodeConfigComponent,
    UibTraceNodeConfigComponent,
    IteratorNodeConfigComponent,
    LambdaFunctionNodeConfigComponent,
    ValidatorNodeConfigComponent,
    FileDownloadNodeConfigComponent,
    FileUploadNodeConfigComponent,
    SwitchNodeConfigComponent,
    CallNodeConfigComponent,
    AggregateNodeConfigComponent,
    AssignNodeConfigComponent,
    DeepAssignNodeConfigComponent,
    CPGetterNodeConfigComponent,
    FileReadNodeConfigComponent,
    FileWriteNodeConfigComponent,
    EnvVariableLookupNodeConfigComponent,
    StringTemplateNodeConfigComponent,
    GRPCCallNodeConfigComponent,
    // QueryBuilderNodeConfigComponent,
     DBNodeConfigComponent,
     DBDynamicQueryNodeConfigComponent,
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
    SidecarNodeConfigComponent,
    HttpHeaderNodeConfigComponent,
    ErrorNodeConfigComponent,
    PropertyNodeConfigComponent,
    ActorNodeConfigComponent,
    ModelNodeConfigComponent,
    ProcessNodeConfigComponent,
    ScreenNodeConfigComponent,
    ApiNodeConfigComponent,
    DeleteNodeConfigComponent,
    GetNodeConfigComponent,
    PostNodeConfigComponent,
    PutNodeConfigComponent,
    GeneralTaskNodeConfigComponent,
    MessageSubscriberTaskNodeComponent,
    FileReaderTaskNodeConfigComponent,
    ServiceCallTaskNodeConfigComponent,
    GRPCUnaryNodeConfigComponent,
    GRPCServerSideStrNodeConfigComponent,
    GRPCClientSideStrNodeConfigComponent,
    GRPCBidirectionalStrNodeConfigComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatTableModule,
    MatTreeModule,
    TreeModule,
    ContextMenuModule,
    TableModule,
    CheckboxModule,
    TabViewModule,
    ContextMenuModule,
    RadioButtonModule,
    CarouselModule,
    StepsModule,
    MenubarModule,
    ToastModule,
    DataViewModule,
    FieldsetModule,
    MultiSelectModule,
    InputTextModule,
    InputTextareaModule,
    AngularSplitModule,
    DropdownModule,
    TooltipModule,
    SidebarModule,
  ],
  exports: [
    MediatorNodeConfigComponent,
    CommonNodeConfigComponent,
    UibNodeBaseConfigComponent,
    UIBTextAreaInputComponent,
    UIBTextInputComponent,
    UIBDropDownComponent,
    UIBTableComponent,
    UIBFormTableComponent,
    UIBTreeViewInputComponent,
    UIBDropDownWithChildrenComponent,
    UIBSectionComponent,
    UIBMappingComponent,
    RootNodeConfigComponent,
    ErrorBranchNodeConfigComponent,
    PayloadNodeConfigComponent,
    ConstantNodeConfigComponent,
    DomainModelVariableNodeConfigComponent,
    EventReceiverNodeConfigComponent,
    EventPublisherNodeConfigComponent,
    EmailSendNodeConfigComponent,
    EmailNodeConfigComponent,
    ReferencePropertyNodeConfigComponent,
    ConnectionPropertyNodeConfigComponent,
    EmailInitNodeConfigComponent,
    EmailInitV2NodeConfigComponent,
    FilterNodeConfigComponent,
    CrudNodeConfigComponent,
    ConnectorNodeConfigComponent,
    NewConnectorNodeConfigComponent,
    EventStoreNodeConfigComponent,
    QueryStoreNodeConfigComponent,
    SmsInitNodeConfigComponent,
    BranchNodeConfigComponent,
    HybridFunctionNodeConfigComponent,
    LogNodeConfigComponent,
    UibHttpInputNodeConfigComponent,
    UibHttpReplyNodeConfigComponent,
    UibTraceNodeConfigComponent,
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
    DeepAssignNodeConfigComponent,
    CPGetterNodeConfigComponent,
    FileReadNodeConfigComponent,
    FileWriteNodeConfigComponent,
    EnvVariableLookupNodeConfigComponent,
    StringTemplateNodeConfigComponent,
    GRPCCallNodeConfigComponent,
    // QueryBuilderNodeConfigComponent,
     DBNodeConfigComponent,
     DBDynamicQueryNodeConfigComponent,
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
    SidecarNodeConfigComponent,
    HttpHeaderNodeConfigComponent,
    ErrorNodeConfigComponent,
    PropertyNodeConfigComponent,
    ActorNodeConfigComponent,
    ModelNodeConfigComponent,
    ProcessNodeConfigComponent,
    ScreenNodeConfigComponent,
    ApiNodeConfigComponent,
    DeleteNodeConfigComponent,
    GetNodeConfigComponent,
    PostNodeConfigComponent,
    PutNodeConfigComponent,
    GeneralTaskNodeConfigComponent,
    MessageSubscriberTaskNodeComponent,
    FileReaderTaskNodeConfigComponent,
    ServiceCallTaskNodeConfigComponent,
    GRPCUnaryNodeConfigComponent,
    GRPCServerSideStrNodeConfigComponent,
    GRPCClientSideStrNodeConfigComponent,
    GRPCBidirectionalStrNodeConfigComponent
  ],
  providers: []
})
export class MediatorNodeConfigModule { }
