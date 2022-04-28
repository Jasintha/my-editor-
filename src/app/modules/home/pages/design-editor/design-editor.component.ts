import { Component, OnInit, ViewEncapsulation, OnChanges, SimpleChanges, Input } from '@angular/core';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faPencil } from '@fortawesome/free-solid-svg-icons';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { faPerson } from '@fortawesome/free-solid-svg-icons';
import { faDisplay } from '@fortawesome/free-solid-svg-icons';
import { faGears } from '@fortawesome/free-solid-svg-icons';
import {RequirementService} from '@core/projectservices/requirement.service';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import { IRequirement, Requirement, IEpic, IStory } from '@shared/models/model/requirement.model';

@Component({
  selector: 'virtuan-design-editor',
  templateUrl: './design-editor.component.html',
  styleUrls: ['./design-editor.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DesignEditorComponent implements OnInit, OnChanges {
  title = 'jasiz';
  faPlus = faPlus;
  faPencilSquare = faPencil;
  faWindowClose = faClose;
  faPerson = faPerson;
  faMobileScreen = faDisplay;
  faGear = faGears;
  @Input()
  requirementUid: string;

  @Input()
  desprojectUid: string;
  currentReq: IRequirement;

  constructor( private requirementService: RequirementService) { }

  ngOnChanges(changes: SimpleChanges) {
    console.log("this.requirementUid");
    console.log(this.requirementUid);
    this.loadReq();
  }

  loadReq(){
    this.requirementService
        .find(this.requirementUid ,this.desprojectUid)
        .pipe(
            filter((mayBeOk: HttpResponse<IRequirement>) => mayBeOk.ok),
            map((response: HttpResponse<IRequirement>) => response.body)
        )
        .subscribe(
            (res: IRequirement) => {
              this.currentReq = res;
            }
        );
  }

  ngOnInit(): void {


  }

}
