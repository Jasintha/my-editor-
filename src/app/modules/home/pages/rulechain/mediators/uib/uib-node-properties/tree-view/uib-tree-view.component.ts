import { SelectionModel } from '@angular/cdk/collections';
import { I } from '@angular/cdk/keycodes';
import { FlatTreeControl } from '@angular/cdk/tree';
import {Component, Input, OnInit} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

class TodoItemFlatNode{
    expandable: boolean;
    name: string;
    data: {};
    level: number
}

@Component({
  selector: 'uib-tree-view-input',
  templateUrl: './uib-tree-view.component.html',
})
export class UIBTreeViewInputComponent implements OnInit{
  @Input() data = {
    label: '',
    value: '',
    formControlName: '',
    options: []
  };

  @Input() formGroup: FormGroup

  private _transformer = (node: any, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      data: node,
      level: level,
    };
  };

  getLevel = (node: TodoItemFlatNode) => node.level;
  
  isExpandable = (node: TodoItemFlatNode) => node.expandable;

  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

  treeControl = new FlatTreeControl<any>(
    (node) => node.level,
    (node) => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true);
  formList = []
  addedList = []
  ngOnInit(): void {
    this.loadTreeData()
    this.checklistSelection.changed.subscribe((v)=> {
      if(v.added){
        this.addedList.push(v.added[0].name)
      }
      this.formGroup.controls[this.data.formControlName].setValue(String(this.addedList.reverse()))
    })
 }

 loadTreeData() {
  this.dataSource.data = this.data.options
  }
  
  descendantsAllSelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

    /* Checks all the parents when a leaf node is selected/unselected */
    checkAllParentsSelection(node: TodoItemFlatNode): void {
        let parent: TodoItemFlatNode | null = this.getParentNode(node);
        while (parent) {
          this.checkRootNodeSelection(parent);
          parent = this.getParentNode(parent);
        }
      }
    
      /** Check root node checked state and change it accordingly */
      checkRootNodeSelection(node: TodoItemFlatNode): void {
        const nodeSelected = this.checklistSelection.isSelected(node);
        const descendants = this.treeControl.getDescendants(node);
        const descAllSelected = descendants.every(child =>
          this.checklistSelection.isSelected(child)
        );
        if (nodeSelected && !descAllSelected) {
          this.checklistSelection.deselect(node);
        } else if (!nodeSelected && descAllSelected) {
          this.checklistSelection.select(node);
        }
      }

       /* Get the parent node of a node */
  getParentNode(node: TodoItemFlatNode): TodoItemFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

}