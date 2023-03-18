import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { filter, map } from 'rxjs/operators';

import { ILamdafunction } from '@shared/models/model/lamdafunction.model';
import { LamdafunctionService } from '@core/projectservices/function.service';

@Component({
  selector: 'virtuan-lamdafunction-editor',
  templateUrl: './function-editor.component.html'
})
export class LamdafunctionEditorComponent implements OnInit, OnChanges, OnDestroy {

  lamdafunctionUuid: string;
  projectUid: string;

  lamdafunction: ILamdafunction;
  //projectId: number;
  theme: string = 'vs';
  editorOptions: any;
  code: string = '';
  themeItems: any[] = [
    { label: 'Dark', value: 'vs-dark' },
    { label: 'Light', value: 'vs' },
  ];
  constructor(
    protected activatedRoute: ActivatedRoute,
    protected lamdafunctionService: LamdafunctionService
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.loadCode();
  }

  loadCode(){
    this.code = "";
    this.editorOptions = { theme: this.theme };
    if (this.lamdafunctionUuid && this.projectUid) {
      this.lamdafunctionService
          .find(this.lamdafunctionUuid, this.projectUid)
          .pipe(
              filter((res: HttpResponse<ILamdafunction>) => res.ok),
              map((res: HttpResponse<ILamdafunction>) => res.body)
          )
          .subscribe(
              (res: ILamdafunction) => {
                this.lamdafunction = res;
                this.editorOptions = { theme: this.theme, language: this.lamdafunction.language };
                this.code = this.lamdafunction.code;
              },
              (res: HttpErrorResponse) => this.onError(res.message)
          );
    }
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params)=> {
      this.projectUid = params.projectUid;
      this.lamdafunctionUuid = params.lamdafunctionUuid;
      this.loadCode();
    })
  }

  ngOnDestroy() {
  }

  previousState() {
    window.history.back();
  }

  onChange() {
    this.editorOptions = { theme: this.theme, language: this.lamdafunction.language };
  }

  save() {
    this.lamdafunction.code = this.code;
    this.lamdafunctionService
      .saveCode(this.lamdafunction, this.projectUid)
      .pipe(
        filter((res: HttpResponse<ILamdafunction>) => res.ok),
        map((res: HttpResponse<ILamdafunction>) => res.body)
      )
      .subscribe(
        (res: ILamdafunction) => {
//           this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Successfully Saved' });
        },
        (res: HttpErrorResponse) => this.onSaveError()
      );
  }

  protected onSaveError() {
//     this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error occurred while saving' });
  }

  protected onError(errorMessage: string) {
    // this.logger.error(errorMessage);
  }
}
