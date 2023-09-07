import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef, ViewChild, ElementRef, Renderer2, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UIBService } from '@app/core/projectservices/uib.service';

@Component({
  selector: 'uib-view-source',
  templateUrl: './uib-view-source.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIBViewSourceComponent implements OnInit, OnChanges, OnDestroy {
  projectUid: string;
  ruleUid: string;
  userName: string;
  sourceId: string;
  language: string;
  title: string;

  theme: string = 'vs';
  editorOptions: any;
  code: string = '';
  themeItems: any[] = [
    { label: 'Dark', value: 'vs-dark' },
    { label: 'Light', value: 'vs' },
  ];
  constructor(
    protected activatedRoute: ActivatedRoute,
    protected uibService: UIBService,
    private changeDetectorRef: ChangeDetectorRef,
  private el: ElementRef,
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.loadCode();
  }

  loadCode(){
    this.editorOptions = { theme: this.theme, language: this.language};
    if (this.projectUid) {
        this.uibService.queryViewSource(this.ruleUid, this.sourceId, this.userName, this.projectUid)
      .subscribe({
        next: (res) => {
          this.code = res;
          this.changeDetectorRef.markForCheck()
        },
        error: (error) => {
          this.code = error.text;
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
      this.sourceId = params.sourceId,
      this.language = params.language,
      this.theme = params.theme,
      this.title = params.title
      this.loadCode();
    })
  }

  save() {
    this.uibService
      .updateViewSource(this.code,this.ruleUid, this.sourceId, this.userName, this.projectUid)
      .subscribe(
        (res) => {
          console.log(res)
         },
      );
  }

  ngOnDestroy() {
  }

}
