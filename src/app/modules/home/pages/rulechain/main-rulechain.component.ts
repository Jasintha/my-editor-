import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';

import {ActivatedRoute, Router} from '@angular/router';
import {
    inputNodeComponent,
    NodeConnectionInfo,
    ResolvedRuleChainMetaData,
    RuleChain,
    ConnectionPropertyTemplate,
    RuleChainConnectionInfo,
    RuleChainImport,
    RuleChainMetaData,
    ruleChainNodeComponent
} from '@shared/models/rule-chain.models';
import {RuleChainService} from '@core/http/rule-chain.service';
import {FcItemInfo, FlowchartConstants, NgxFlowchartComponent, UserCallbacks} from 'ngx-flowchart/dist/ngx-flowchart';
import {
    FcRuleEdge,
    FcRuleNode,
    FcRuleNodeType,
    getRuleNodeHelpLink,
    LinkLabel,
    RuleNode,
    RuleNodeComponentDescriptor,
    RuleNodeType,
    ruleNodeTypeDescriptors,
    ruleNodeTypesLibrary
} from '@shared/models/rule-node.models';
import {ProjectService} from '@core/projectservices/project.service';
import * as AngularCommon from '@angular/common';
import * as AngularForms from '@angular/forms';
import * as AngularCdkCoercion from '@angular/cdk/coercion';
import * as AngularCdkKeycodes from '@angular/cdk/keycodes';
import * as AngularMaterialChips from '@angular/material/chips';
import * as AngularMaterialAutocomplete from '@angular/material/autocomplete';
import * as AngularMaterialDialog from '@angular/material/dialog';
import * as NgrxStore from '@ngrx/store';
import * as TranslateCore from '@ngx-translate/core';
import * as VirtuanCore from '@core/public-api';
import {ItemBufferService} from '@core/public-api';
import * as VirtuanShared from '@shared/public-api';
import * as VirtuanHomeComponents from '@home/components/public-api';
import * as _moment from 'moment';
import * as AngularRouter from '@angular/router';
import * as AngularCore from '@angular/core';
import * as RxJs from 'rxjs';
import * as RxJsOperators from 'rxjs/operators';
import {CreateApiComponent} from '@home/pages/create-api/create-api.component';
import {CreateSubruleComponent} from '@home/pages/create-subrule/create-subrule.component';
import {MatDialog} from '@angular/material/dialog';
import {CreateModelComponent} from '@home/pages/create-model/create-model.component';
import {MicroserviceModelComponent} from "@home/pages/aggregate/microservice-model.component";
import {CreateEventComponent} from '@home/pages/create-event/create-event.component';
import {CreateHybridfunctionComponent} from '@home/pages/create-hybridfunction/create-hybridfunction.component';
import {CreateLamdafunctionComponent} from '@home/pages/create-lamdafunction/create-lamdafunction.component';
import {CreateTaskComponent} from '@home/pages/create-task/create-task.component';

declare const SystemJS;

const ruleNodeConfigResourcesModulesMap = {
    '@angular/core': SystemJS.newModule(AngularCore),
    '@angular/common': SystemJS.newModule(AngularCommon),
    '@angular/forms': SystemJS.newModule(AngularForms),
    '@angular/router': SystemJS.newModule(AngularRouter),
    '@angular/cdk/keycodes': SystemJS.newModule(AngularCdkKeycodes),
    '@angular/cdk/coercion': SystemJS.newModule(AngularCdkCoercion),
    '@angular/material/chips': SystemJS.newModule(AngularMaterialChips),
    '@angular/material/autocomplete': SystemJS.newModule(AngularMaterialAutocomplete),
    '@angular/material/dialog': SystemJS.newModule(AngularMaterialDialog),
    '@ngrx/store': SystemJS.newModule(NgrxStore),
    rxjs: SystemJS.newModule(RxJs),
    'rxjs/operators': SystemJS.newModule(RxJsOperators),
    '@ngx-translate/core': SystemJS.newModule(TranslateCore),
    '@core/public-api': SystemJS.newModule(VirtuanCore),
    '@shared/public-api': SystemJS.newModule(VirtuanShared),
    '@home/components/public-api': SystemJS.newModule(VirtuanHomeComponents),
    moment: SystemJS.newModule(_moment)
};

const TREE_DATA: any[] = [
    {
        name: 'API',
        children: [{name: 'api1'}, {name: 'api2'}, {name: 'api3'}],
    },
    {
        name: 'Task',
        children: [{name: 'task1'}, {name: 'task2'}, {name: 'task3'}],
    },
    {
        name: 'Process',
        children: [{name: 'process1'}, {name: 'process2'}, {name: 'process3'}],
    },
    {
        name: 'Models',
        children: [
            {
                name: 'model1'
            },
            {
                name: 'model2'
            },
        ],
    },
];

@Component({
    selector: 'virtuan-main-rulechain-page',
    templateUrl: './main-rulechain.component.html',
    styleUrls: ['./rulechain-page.component.scss']
})
export class MainRuleChainComponent implements OnInit {


    ruleChain: RuleChain;
    ruleChainMetaData: ResolvedRuleChainMetaData;
    connectionPropertyTemplates: ConnectionPropertyTemplate[];
    username: string;
//     uid: string;
    ruleNodeComponents: Array<RuleNodeComponentDescriptor>;
    ruleChainLoaded: boolean;
    ruleChainMetaDataLoaded: boolean;
    ruleNodeComponentsLoaded: boolean;
    loadFunctionEditor: boolean;
    connectionPropertyTemplatesLoaded: boolean;
    loadModelView: boolean;
    projectUid: string;
    lambdauid: string;
    modelUid: string;
    private _transformer = (node: any, level: number) => {
        return {
            expandable: !!node.children && node.children.length > 0,
            name: node.name,
            data: node,
            level: level,
        };
    };

    treeControl = new FlatTreeControl<any>(
        node => node.level,
        node => node.expandable,
    );

    treeFlattener = new MatTreeFlattener(
        this._transformer,
        node => node.level,
        node => node.expandable,
        node => node.children,
    );

    hasChild = (_: number, node: any) => node.expandable;

    dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    constructor(private route: ActivatedRoute, private router: Router, private ruleChainService: RuleChainService, private projectService: ProjectService, public dialog: MatDialog) {

    }


//   viewRule(item){
// //   this.router.navigate(["/ruleChains"]);
//     console.log(item);
// //     let url = item.ruleid +'/default/' + item.username + '/' + this.projectUid +'/R';
//     let url = 'ruleChains/' + item.ruleid +'/default/' + item.username + '/' + this.projectUid +'/R';
// //     this.router.navigate([url], {relativeTo:this.route});
//     this.router.navigate([url]);
//   }

    createPopups(node) {
        if (node.type === 'PARENT_API') {
            this.createApi();
        } else if (node.type === 'PARENT_PROCESS') {
            this.createSubrule();
        } else if (node.type === 'PARENT_MODEL'){
            this.createModel();
        } else if (node.type === 'PARENT_EVENT'){
            this.createEvent();
        } else if (node.type === 'PARENT_HYBRID'){
            this.createHybridFunction();
        } else if (node.type === 'PARENT_LAMBDA'){
            this.createLambdaFunction();
        } else if (node.type === 'PARENT_TASK'){
            this.createTask();
        }
    }

    createApi() {
        const dialogRef = this.dialog.open(CreateApiComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: this.projectUid
            }
        });
        dialogRef.afterClosed(
        ).subscribe(result => {
            console.log(`Dialog result: ${result}`);
            this.loadTreeData();
        });
    }

    createSubrule() {
        const dialogRef = this.dialog.open(CreateSubruleComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: this.projectUid
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
            this.loadTreeData();
        });
    }

    createModel() {
        const dialogRef = this.dialog.open(CreateModelComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: this.projectUid
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
            this.loadTreeData();
        });
    }

    createEvent() {
        const dialogRef = this.dialog.open(CreateEventComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: this.projectUid
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
            this.loadTreeData();
        });
    }

    createHybridFunction() {
        const dialogRef = this.dialog.open(CreateHybridfunctionComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: this.projectUid
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
            this.loadTreeData();
        });
    }

    createLambdaFunction() {
        const dialogRef = this.dialog.open(CreateLamdafunctionComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: this.projectUid
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
            this.loadTreeData();
        });
    }

    createTask() {
        const dialogRef = this.dialog.open(CreateTaskComponent, {
            panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
            data: {
                projectUid: this.projectUid
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
            this.loadTreeData();
        });
    }

    viewComponent(item){
        if(item.type === 'MODEL'){
            // load model design editor
            this.viewModel(item);
        } else if(item.type === 'LAMBDA'){
            this.viewFuncEditor(item);
        } else {
            this.viewRule(item);
        }
    }

    viewFuncEditor(item){
        this.ruleChainLoaded = false;
        this.ruleChainMetaDataLoaded = false;
        this.connectionPropertyTemplatesLoaded = false;
        this.ruleNodeComponentsLoaded = false;
        this.ruleChain = null;
        this.ruleChainMetaData = null;
        this.connectionPropertyTemplates = null;
        this.ruleNodeComponents = null;
        this.lambdauid = "";
        this.lambdauid = item.uuid;
        this.loadFunctionEditor = true;
        this.loadModelView = false;
    }

    viewRule(item) {
        this.lambdauid = "";
        this.loadFunctionEditor = false;
        this.ruleChainLoaded = false;
        this.ruleChainMetaDataLoaded = false;
        this.connectionPropertyTemplatesLoaded = false;
        this.ruleNodeComponentsLoaded = false;
        this.loadModelView = false;

        this.username = item.username;
//         this.uid = this.projectUid;
        this.ruleChainService.getRuleChainWithUsernameAndUID(item.ruleid, item.username, this.projectUid).subscribe((ruleChain) => {
            console.log('ruleChain');
            console.log(ruleChain);
            this.ruleChainLoaded = true;
            this.ruleChain = ruleChain;
        });
        this.ruleChainService.getResolvedRuleChainMetadata(item.ruleid, item.username, this.projectUid).subscribe((ruleChainMetaData) => {
            this.ruleChainMetaDataLoaded = true;
            this.ruleChainMetaData = ruleChainMetaData;
        });

        this.ruleChainService.getConnectionPropertyTemplates().subscribe((connectionPropertyTemplates) => {
            this.connectionPropertyTemplatesLoaded = true;
            this.connectionPropertyTemplates = connectionPropertyTemplates;
        });
        this.ruleChainService.getRuleNodeComponents(ruleNodeConfigResourcesModulesMap, this.projectUid, 'default').subscribe((ruleNodeComponents) => {
            this.ruleNodeComponentsLoaded = true;
            this.ruleNodeComponents = ruleNodeComponents;
        });

    }
    viewModel(item){
        this.ruleChainLoaded = false;
        this.ruleChainMetaDataLoaded = false;
        this.connectionPropertyTemplatesLoaded = false;
        this.ruleNodeComponentsLoaded = false;
        this.ruleChain = null;
        this.ruleChainMetaData = null;
        this.connectionPropertyTemplates = null;
        this.ruleNodeComponents = null;
        this.lambdauid = "";
        this.loadFunctionEditor = false;
        this.modelUid = item.uuid;
        this.loadModelView = true;


        // const dialogRef = this.dialog.open(MicroserviceModelComponent, {
        //     data: {
        //         projectUid: this.projectUid
        //     }
        // });
        // dialogRef.afterClosed().subscribe(result => {
        //     console.log(`Dialog result: ${result}`);
        //     this.loadTreeData();
        // });

    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.projectUid = params['projectUid'];
        });
        /*   console.log("fetch data !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            this.username = "user3@gmail.com";
            this.uid = "PgLG2MtA4oUYak7TFznxB4_user3gmailcom";
            this.ruleChainService.getRuleChainWithUsernameAndUID("c9em5d9svk1hvkl2b5t0", "user3@gmail.com", "PgLG2MtA4oUYak7TFznxB4_user3gmailcom").subscribe((ruleChain) => {
              console.log("ruleChain");
              console.log(ruleChain);
              this.ruleChainLoaded = true;
              this.ruleChain = ruleChain;
            });
            this.ruleChainService.getResolvedRuleChainMetadata("c9em5d9svk1hvkl2b5t0", "user3@gmail.com", "PgLG2MtA4oUYak7TFznxB4_user3gmailcom").subscribe((ruleChainMetaData) => {
              this.ruleChainMetaDataLoaded = true;
              this.ruleChainMetaData = ruleChainMetaData;
            });

            this.ruleChainService.getConnectionPropertyTemplates().subscribe((connectionPropertyTemplates) => {
              this.connectionPropertyTemplatesLoaded = true;
              this.connectionPropertyTemplates = connectionPropertyTemplates;
            });
            this.ruleChainService.getRuleNodeComponents(ruleNodeConfigResourcesModulesMap, "PgLG2MtA4oUYak7TFznxB4_user3gmailcom", "default").subscribe((ruleNodeComponents) => {
              this.ruleNodeComponentsLoaded = true;
              this.ruleNodeComponents = ruleNodeComponents;
            }); */
//    this.dataSource.data = TREE_DATA;
        this.loadTreeData();
    }

    loadTreeData(){
        this.projectService.findAllProjectComponents(this.projectUid).subscribe((comps) => {
            this.dataSource.data = comps;
        });
    }

    coins() {
        let url = 'c9em5d9svk1hvkl2b5t0/default/user3@gmail.com/PgLG2MtA4oUYak7TFznxB4_user3gmailcom/R';

        this.router.navigate([url], {relativeTo: this.route});
    }

    notes() {
        this.router.navigate(['notes'], {relativeTo: this.route});
    }

}
