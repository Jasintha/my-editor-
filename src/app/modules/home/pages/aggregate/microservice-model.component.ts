import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';

import { Observable } from 'rxjs';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { TreeNode, MenuItem } from 'primeng/api';
import { AggregateService } from '@core/projectservices/microservice-aggregate.service';
import {ProjectService} from '@core/projectservices/project.service';
import { IProject } from '@app/shared/models/model/project.model';

import {MatDialog} from '@angular/material/dialog';
import {MicroserviceAddModelDialogComponent} from '@home/pages/aggregate/microservice-add-model-dialog.component';
import {
  MicroserviceAddModelConstraintsDialogComponent
} from '@home/pages/aggregate/microservice-add-model-constraints-dialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';


@Component({
  selector: 'virtuan-microservice-model',
  templateUrl: './microservice-model.component.html',
  styleUrls: ['./microservice-model.component.scss'],
  //  encapsulation: ViewEncapsulation.None
})
export class MicroserviceModelComponent implements OnInit, OnChanges {

  @Input()
  modelUid: string;
  @Input()
  projectUid: string;

  project: IProject;
  projectType: string;
  aggregateId: string;
  data: TreeNode[];
  items: MenuItem[];

  selectedNode: TreeNode;

  constructor(
      protected activatedRoute: ActivatedRoute,
      private router: Router
      , public dialog: MatDialog,
      // protected toolbarTrackerService: ToolbarTrackerService,
      // private spinnerService: NgxSpinnerService,
      // private modalService: NgbModal,
      protected aggregateService: AggregateService,
      protected projectService: ProjectService,
      private snackBar: MatSnackBar
  ) {
    // this.toolbarTrackerService.setIsEntityPage('yes');
  }
  ngOnChanges(changes: SimpleChanges) {
    this.loadDesign()
  }

  loadDesign() {
    this.aggregateService
        .findDesignById(this.modelUid,this.projectUid)
        .pipe(
            filter((res: HttpResponse<TreeNode>) => res.ok),
            map((res: HttpResponse<TreeNode>) => res.body)
        )
        .subscribe(
            (res: TreeNode) => {
              this.data = [];
              console.log(res)
              this.data.push(res);

              this.expandAll();
            },
            (res: HttpErrorResponse) => this.onError()
        );
  }

  deleteNode(e) {
    this.removeNode(this.data);
  }

  editNode(node) {
    this.editModel(node);
  }

  addNodeConstraints(node) {
    this.addConstraints(node);
  }

  removeNode(nodes) {
    for (let i = 0; i < nodes.length; i++) {
      if (this.selectedNode === nodes[i]) {
        console.log('equal found');
        nodes.splice(i, 1);
        break;
      } else {
        if (nodes[i].children !== undefined) {
          this.removeNode(nodes[i].children);
        }
      }
    }
  }

  contextMenu(menuevent, contextMenu) {
    this.items = [
      { label: 'Delete', icon: 'pi pi-trash', command: event => this.deleteNode(event) },
      { label: 'Edit', icon: 'pi pi-pencil', command: event => this.editNode(menuevent) },
    ];
    if (menuevent.node.data.type === 'property' && !menuevent.node.data.isNotPersist) {
      this.items.push({
        label: 'Configurations',
        icon: 'pi pi-info',
        command: event => this.addNodeConstraints(menuevent),
      });
    }
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      //this.aggregateId = params['id'];
      //this.projectId = params['projId'];
      //this.projectUid = params['projectUid'];
      this.getProjectType();
      // this.toolbarTrackerService.setProjectUUID(this.projectUid);
    });

    this.loadDesign();
    //console.log(this.data);
  }


  expandAll(){
    this.data.forEach( node => {
      this.expandRecursive(node, true);
    } );
  }
  private expandRecursive(node:TreeNode, isExpand:boolean){
    node.expanded = isExpand;
    // if (node.children){
    //   node.children.forEach( childNode => {
    //     this.expandRecursive(childNode, isExpand);
    //   } );
    // }
  }
  getProjectType() {
    console.log(this.projectUid)
    if (this.projectUid) {
      this.projectService
          .find(this.projectUid)
          .pipe(
              filter((mayBeOk: HttpResponse<IProject>) => mayBeOk.ok),
              map((response: HttpResponse<IProject>) => response.body)
          )
          .subscribe(
              (res: IProject) => {
                if (res && res.apptypesID) {
                  this.projectType = res.apptypesID;
                }
              },
              (res: HttpErrorResponse) => this.onError()
          );
    }
  }

  onNodeSelect(event) {
    let selectedNode: TreeNode = event.node;
    if (selectedNode.data.type === 'collection' || selectedNode.data.type === 'list') {
      this.addModel(event);
    }
  }

  previousState() {
    //window.history.back();
    let url = 'aggregate/proj/' + this.projectUid;
    this.router.navigate([url]);
  }
  /*
	public void onNodeSelect(NodeSelectEvent event) {
		selectedItem = event.getTreeNode();
	}
*/

  public ngOnDestroy() {
    // this.toolbarTrackerService.setIsEntityPage('no');
    // this.toolbarTrackerService.setProjectUUID('');
    // this.socket.close();
  }

  editModel(event) {
    console.log("3")
    let currentName = event.node.data.name.replace(/\s/g, '');
    let currentNameLowercase = currentName.toLowerCase();
    let namelength: number = currentNameLowercase.length;
    let currentNodeType = event.node.data.type;
    const dialogRef = this.dialog.open(MicroserviceAddModelDialogComponent, {
      panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
      data: {
        edit: true,
        type: event.node.data.type,
        name: currentName,
        propertytype: event.node.data.propertytype,
        selectedEntity: event.node.data.selectedEntity,
        selectedPropGroup: event.node.data.selectedPropGroup,
        isNotPersist: event.node.data.isNotPersist,

      }
    });
    dialogRef.afterClosed().subscribe((result: any) => {

      let eventkey = event.node.key.slice(0, -namelength);
            let nameTrimmed = result.name.replace(/\s/g, '');
            let nameLowerCase = nameTrimmed.toLowerCase();
            let datakey = eventkey + '_' + nameLowerCase;
            let data = this.addToTreeNode(result);

            let styleClass = 'fa fa-list';

            if (result.type === 'property') {
              styleClass = 'fa fa-check';
            } else if (result.type === 'collection') {
              styleClass = 'fa fa-cubes';
            }
            event.node.icon = styleClass;
            event.node.label = result.name;
            event.node.key = datakey;
            // event.node.styleClass = 'test';
            event.node.data = Object.assign(event.node.data, result);
    });

    // const modalRef = this.modalService.open(MicroServiceAddModelConstraintsDialogComponent, { size: 'lg', backdrop: 'static' });
    // modalRef.componentInstance.edit = true;
    // modalRef.componentInstance.data = event.node.data;
    // modalRef.componentInstance.modelId = this.aggregateId;
    // modalRef.componentInstance.projectUid = this.projectUid;
    // modalRef.result.then(
    //     result => {
    //       let eventkey = event.node.key.slice(0, -namelength);
    //       let nameTrimmed = result.name.replace(/\s/g, '');
    //       let nameLowerCase = nameTrimmed.toLowerCase();
    //       let datakey = eventkey + '_' + nameLowerCase;
    //       let data = this.addToTreeNode(result);
    //
    //       let styleClass = 'fa fa-list';
    //
    //       if (result.type === 'property') {
    //         styleClass = 'fa fa-check';
    //       } else if (result.type === 'collection') {
    //         styleClass = 'fa fa-cubes';
    //       }
    //       event.node.icon = styleClass;
    //       event.node.label = result.name;
    //       event.node.key = datakey;
    //       // event.node.styleClass = 'test';
    //       event.node.data = Object.assign(event.node.data, result);
    //
    //       if ((currentNodeType === 'collection' || currentNodeType === 'list') && result.type === 'property') {
    //         event.node.children = [];
    //       }
    //
    //       console.log(event);
    //     },
    //     reason => {
    //       // Left blank intentionally, nothing to do here
    //     }
    // );
  }

  /**
   * add constraint properties to the model
   * @param event
   */
  addConstraints(event) {
    const currentName = event.node.data.name.replace(/\s/g, '');
    const datakey = event.node.key;
    const type = event.node.data.type;
    const dialogRef = this.dialog.open(MicroserviceAddModelConstraintsDialogComponent, {
      panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
      data: {
        edit : true,
        data : event.node.data,
        projectUid : this.projectUid,
        projectType : this.projectType,

      }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
          // console.log(`Dialog result: `, result);
            let styleClass = 'fa fa-list';
            if (type === 'property') {
              styleClass = 'fa fa-check';
            } else if (type === 'collection') {
              styleClass = 'fa fa-cubes';
            }
            event.node.icon = styleClass;
            event.node.label = currentName;
            event.node.key = datakey;

            event.node.data = Object.assign(event.node.data, result);
      console.log(event.node.data)
        }
    );
    // const modalRef = this.modalService.open(MicroServiceAddModelConstraintsDialogComponent, {
    //   size: 'lg',
    //   backdrop: 'static',
    // });
    // modalRef.componentInstance.edit = true;
    // modalRef.componentInstance.data = event.node.data;
    // modalRef.componentInstance.projectUid = this.projectUid;
    // modalRef.componentInstance.projectType = this.projectType;
    // modalRef.result.then(
    //     result => {
    //       let styleClass = 'fa fa-list';
    //       if (type === 'property') {
    //         styleClass = 'fa fa-check';
    //       } else if (type === 'collection') {
    //         styleClass = 'fa fa-cubes';
    //       }
    //       event.node.icon = styleClass;
    //       event.node.label = currentName;
    //       event.node.key = datakey;
    //       event.node.data = Object.assign(event.node.data, result);
    //     },
    //     reason => {
    //       // Left blank intentionally, nothing to do here
    //     }
    // );
  }

  addModel(event) {
    const dialogRef = this.dialog.open(MicroserviceAddModelDialogComponent, {
      panelClass: ['virtuan-dialog', 'virtuan-fullscreen-dialog'],
      data: {
        edit : false,
        modelId : this.aggregateId,
        projectUid : this.projectUid,

      }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      console.log(`Dialog result: `, result);
      const eventkey = event.node.key;
            const nameTrimmed = result.name.replace(/\s/g, '');
            const nameLowerCase = nameTrimmed.toLowerCase();
            // let titleName = this.titleCaseWord(nameLowerCase);
            const datakey = eventkey + '_' + nameLowerCase;
            const data = this.addToTreeNode(result);
            data.key = datakey;
            console.log(event.node.children);
            if (!event.node.children) {
              event.node.children = [];
            }
            event.node.children.push(data);
            // const aggregateData = { aggregateId: this.aggregateId, data: this.data };
            //this.subscribeToSaveResponse(this.aggregateService.saveModelDesign(aggregateData, this.projectUid));
    });
    // const modalRef = this.modalService.open(MicroServiceAddModelDialogComponent, { size: 'lg', backdrop: 'static' });
    // modalRef.componentInstance.edit = false;
    // modalRef.componentInstance.modelId = this.aggregateId;
    // //modalRef.componentInstance.projectId = this.projectId
    // modalRef.componentInstance.projectUid = this.projectUid;
    //
    // modalRef.result.then(
    //     result => {
    //       const eventkey = event.node.key;
    //       const nameTrimmed = result.name.replace(/\s/g, '');
    //       const nameLowerCase = nameTrimmed.toLowerCase();
    //       // let titleName = this.titleCaseWord(nameLowerCase);
    //       const datakey = eventkey + '_' + nameLowerCase;
    //       const data = this.addToTreeNode(result);
    //       data.key = datakey;
    //       console.log(event.node.children);
    //       if (!event.node.children) {
    //         event.node.children = [];
    //       }
    //       event.node.children.push(data);
    //       //const aggregateData = { aggregateId: this.aggregateId, data: this.data };
    //       //this.subscribeToSaveResponse(this.aggregateService.saveModelDesign(aggregateData, this.projectUid));
    //     },
    //     reason => {
    //       // Left blank intentionally, nothing to do here
    //     }
    // );


  }

  titleCaseWord(word: string) {
    if (!word) return word;
    return word[0].toUpperCase() + word.substr(1);
  }

  save() {
    // this.spinnerService.show();
    const aggregateData = { aggregateId: this.modelUid, data: this.data };
    console.log(aggregateData)
    this.subscribeToSaveResponse(this.aggregateService.saveModelDesign(aggregateData, this.projectUid));

  }

  addToTreeNode(data) {
    let styleClass = 'fa fa-list';

    if (data.type === 'property') {
      styleClass = 'fa fa-check';
    } else if (data.type === 'collection') {
      styleClass = 'fa fa-cubes';
    } else if (data.type === 'entity') {
      styleClass = 'fa fa-object-group';
    } else if (data.type === 'property-group') {
      styleClass = 'fa fa-object-ungroup';
    }

    let node: TreeNode = {
      label: data.name,
      icon: styleClass,
      data: data,
      children: [],
    };

    return node;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<any>>) {
    result.subscribe(
        () => this.onSaveSuccess(),
        () => this.onSaveError()
    );
  }

  protected onSaveSuccess() {
    console.log("Successfully")
    // this.spinnerService.hide();
    this.snackBar.open('Login Successfully!', 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
      panelClass: ['greenNoMatch']
    });
    this.loadDesign()
  }

  protected onSaveError() {
    // this.spinnerService.hide();
  }

  protected onError() {}
}
