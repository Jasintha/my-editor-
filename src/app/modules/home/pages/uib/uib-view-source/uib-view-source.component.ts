import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef, ViewChild, ElementRef, Renderer2, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UIBService } from '@app/core/projectservices/uib.service';
import { NGX_MONACO_EDITOR_CONFIG, NgxMonacoEditorConfig } from 'ngx-monaco-editor';

const monacoConfig: NgxMonacoEditorConfig = {
  defaultOptions: { scrollBeyondLastLine: false },
  baseUrl: './assets',
  onMonacoLoad: () => {
    const monaco = (window as any).monaco;
    console.log(monaco);
}
};

@Component({
  selector: 'uib-view-source',
  templateUrl: './uib-view-source.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NGX_MONACO_EDITOR_CONFIG, useValue: monacoConfig },
  ]
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
    this.editorOptions = {...this.editorOptions, theme: this.theme, language: this.language, automaticLayout: true};
    if (this.projectUid) {
        this.uibService.queryViewSource(this.ruleUid, this.sourceId, this.userName, this.projectUid)
      .subscribe({
        next: (res) => {
          console.log(res)
          this.code = res;
          this.changeDetectorRef.markForCheck()
          if(!this.el.nativeElement.innerHTML.includes('monaco-scrollable-element')){
            window.location.reload()
          }
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
