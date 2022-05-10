import {Component, Inject, Input, OnDestroy, OnInit} from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { MessageService, SelectItem } from 'primeng/api';
import { FormBuilder, FormGroup } from '@angular/forms';
import {IKeyData} from '@shared/models/model/keydata.model';
import {IEnvironment} from '@shared/models/model/environment.model';
import {NgxSpinnerService} from 'ngx-spinner';
import {EventManagerService} from '@shared/events/event.type';
import {Router} from '@angular/router';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {filter, map} from 'rxjs/operators';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {EnvironmentService} from '@core/projectservices/environment.service';
import {ServiceDesignService} from '@core/projectservices/service-design.service';


@Component({
  selector: 'virtuan-env-select',
  templateUrl: './env-select.component.html',
  styleUrls: ['./rulechain-page.component.scss'],
  providers: [MessageService],
})
export class EnvSelectComponent implements OnInit {
  keyValPairs: IKeyData[];
  addConfigMapForm: FormGroup;
  isSaving: boolean;
  environments: IEnvironment[];
  @Input() public envuuid;
  sortOptions: any;
  projectUid: string;
  serviceDesignId: string;
  sortKey: string;
  sortField: string;
  sortOrder: number;
  isGenerated: string;

  constructor(
    private fb: FormBuilder,
    private spinnerService: NgxSpinnerService,
    protected environmentService: EnvironmentService,
    protected serviceDesignService: ServiceDesignService,
    private messageService: MessageService,
    public dialogRef: MatDialogRef<EnvSelectComponent>,
    @Inject(MAT_DIALOG_DATA)  public data: any,
    protected eventManager: EventManagerService,
    protected router: Router
  ) {}

  clear() {
    this.dialogRef.close();
  }

  onSortChange(event) {
    const value = event.value;
    if (value.indexOf('!') === 0) {
      this.sortOrder = -1;
      this.sortField = value.substring(1, value.length);
    } else {
      this.sortOrder = value === 'createdAt' ? -1 : 1;
      this.sortField = value;
    }
  }

  ngOnInit() {
    this.sortOrder = -1;
    this.sortField = 'createdAt';
    this.sortOptions = [
      { label: 'Name', value: 'name' },
      { label: 'Namespace', value: 'namespace' },
      { label: 'RecentlyCreated', value: 'createdAt' },
    ];
    this.serviceDesignService
      .getAllEnvs()
      .pipe(
        filter((res: HttpResponse<IEnvironment[]>) => res.ok),
        map((res: HttpResponse<IEnvironment[]>) => res.body)
      )
      .subscribe(
        (res: IEnvironment[]) => {
          this.environments = res;
        },
        (res: HttpErrorResponse) => this.onError(res.message)
      );
    // this.environments = [{name:'env1'} , {name:'env1'} ,{name:'env1'}]
  }

  navigateToSelectEnv(env: any) {
    const envData = { selectedEnv: env };
    // const url = '/design-generator/proj/' + this.projectUid + '/' + this.serviceDesignId;
    // this.router.navigate([url], { queryParams: { env: env.uuid, generated: this.isGenerated } });
    this.dialogRef.close(envData);
  }

  protected onError(errorMessage: string) {
    // this.logger.error(errorMessage);
  }
}
