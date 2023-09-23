import {Component, ComponentFactoryResolver, ComponentRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren, ViewContainerRef} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs/operators';
import { UIBTextInputComponent } from '../text-input/uib-text-input.component';
import { UIBTextAreaInputComponent } from '../text-area-input/uib-text-area-input.component';
import { UIBDropDownComponent } from '../dropdown/uib-dropdown-input.component';
import { UIBFormTableComponent } from '../form-table/uib-form-table.component';
import { UIBTreeViewInputComponent } from '../tree-view/uib-tree-view.component';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'uib-dropdown-children-input',
  templateUrl: './dropdown-with-children.component.html',
})
export class UIBDropDownWithChildrenComponent implements OnInit{
  @ViewChildren('child', {read: ViewContainerRef}) child: QueryList<ViewContainerRef>;

  private componentRef: ComponentRef<UIBTextInputComponent | UIBTextAreaInputComponent>

  @Input() data = {
    label: '',
    value: '',
    formControlName: '',
    options: []
  };

  @Input() formGroup: FormGroup
  children = new BehaviorSubject<any>([])

  constructor(private resolver: ComponentFactoryResolver){}

  ngOnInit(): void {
   // this.formGroup.controls[this.data.formControlName].setValue(this.data.value)

    this.formGroup.controls[this.data.formControlName].valueChanges.subscribe((val)=> {
      this.data.options.filter((type)=> {
        if(type.key == val){
          this.children.next(type.children)
        }
      })
        setTimeout(() => {
          if(this.children.value.length > 0){
           this.loadComponent()
          }
        }, 0);
    })
 }

 private loadComponent(): void {
    this.child.map((vcr: ViewContainerRef, index: number) =>{
      vcr.clear();
      let factory
      switch(this.children.value[index].type){
        case 'text':
          factory = this.resolver.resolveComponentFactory(UIBTextInputComponent)
          break;
        case 'textarea':
          factory = this.resolver.resolveComponentFactory(UIBTextAreaInputComponent)
          break;
        case 'dropdown':
          factory = this.resolver.resolveComponentFactory(UIBDropDownComponent)
          break;
        case 'form-table':
          factory = this.resolver.resolveComponentFactory(UIBFormTableComponent)
          break;
        case 'tree-view':
          factory = this.resolver.resolveComponentFactory(UIBTreeViewInputComponent)
          break;
        case 'dropdown-children':
          factory = this.resolver.resolveComponentFactory(UIBDropDownWithChildrenComponent)
          break;
      }
      this.componentRef = vcr.createComponent(factory)
      this.componentRef.instance.data = {
        label: this.children.value[index].label,
        value: this.children.value[index].value,
        formControlName: this.children.value[index].name
      };
      this.componentRef.instance.formGroup = this.formGroup
    })
  }



}