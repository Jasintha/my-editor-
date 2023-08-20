import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UIBService } from '@app/core/projectservices/uib.service';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'uib-view-source',
  templateUrl: './uib-view-source.component.html'
})
export class UIBViewSourceComponent implements OnInit, OnChanges, OnDestroy {

  sourceCode: string;
  projectUid: string;
  ruleUid: string;
  userName: string;
  sourceId: string;

  theme: string = 'vs';
  editorOptions: any;
  code: string = '';
  themeItems: any[] = [
    { label: 'Dark', value: 'vs-dark' },
    { label: 'Light', value: 'vs' },
  ];
  constructor(
    protected activatedRoute: ActivatedRoute,
    protected uibService: UIBService
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.loadCode();
  }

  loadCode(){
    this.code = "";
    this.editorOptions = { theme: this.theme };
    if (this.projectUid) {
        this.uibService.queryViewSource(this.ruleUid, this.sourceId, this.userName, this.projectUid)
      .subscribe({
        next: (res) => {
          console.log(res)
          this.editorOptions = { theme: this.theme, language: 'go' };
          this.code = this.sourceCode;
        },
        error: (error) => {
          console.error(error)
        }
      }
      )
    }
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params)=> {
      this.projectUid = params.projectUid;
      this.ruleUid = params.ruleId,
      this.userName = params.userName,
      this.sourceId = params.sourceId
      this.loadCode();
    })
  }

  ngOnDestroy() {
  }

}
