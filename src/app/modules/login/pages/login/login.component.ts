import { Component, OnInit } from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {Router} from '@angular/router';
import {EventManagerService} from '@shared/events/event.type';
import {LoginService} from '@core/services/login.services';
import {AppEvent} from '@shared/events/app.event.class';
import {EventTypes} from '@shared/events/event.queue';
import {StateStorageService} from '@core/auth/state-storage.service';
import {AccountService} from '@core/auth/account.service';
import {Subscription} from 'rxjs';
import { Account } from '@shared/models/user/account.model';
@Component({
  selector: 'virtuan-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  showNavigationArrows = false;
  showNavigationIndicators = false;
  images = [1, 2].map(n => ` ../../content/images/bgimage${n}.jpeg`);
  responsiveOptions;
  // apptypes: IApptypes[];
  // eventSubscriber: Subscription;

  auth: boolean;
  version = '';
  eventSubscriber: Subscription;
  account: Account;
  // modalRef: NgbModalRef;
  // jhiAlertService: any;

  // sortOptions: SelectItem[];

  sortOrder: number;

  sortField: string;
  showCookieConsent: boolean;

  loginForm = this.fb.group({
    username: [''],
    password: [''],
    rememberMe: [false],
  });
  isLogin: boolean;
  authenticationError: boolean;

  constructor(
       private accountService: AccountService,
      // protected navbarService: NavbarService,
      // private loginModalService: LoginModalService,
       private eventManager: EventManagerService,
      // protected homeTrackerService: HomeTrackerService,
       private router: Router,
       private fb: FormBuilder,

       private loginService: LoginService,
       private stateStorageService: StateStorageService,
     //  private messageService: MessageService,
      // private apptypesService: ApptypesService,
      // private cookieService: CookieService,
      // private config: NgbCarouselConfig
  ) {
  //  this.homeTrackerService.setIsHomePage('yes');
  //  config.showNavigationArrows = true;
 //   config.showNavigationIndicators = true;
  }

  isAuthenticated() {
    const auth: boolean = this.accountService.isAuthenticated();
    this.auth = auth;
    return auth;
  }
  ngOnInit() {
    this.isLogin = false;
    // this.navbarService
    //     .findVersion()
    //     .pipe(
    //         filter((res: HttpResponse<string>) => res.ok),
    //         map((res: HttpResponse<string>) => res.body)
    //     )
    //     .subscribe(
    //         (res: string) => {
    //           this.version = res;
    //         },
    //         (res: HttpErrorResponse) => this.onError(res.message)
    //     );
    //
    // this.auth = this.accountService.isAuthenticated();
    //
    // this.sortOptions = [
    //   { label: 'Price High to Low', value: '!price' },
    //   { label: 'Price Low to High', value: 'price' },
    // ];

    // this.primengConfig.ripple = true;

    // if(this.auth){

    //   this.apptypesService
    //   .query()
    //   .pipe(
    //     filter((mayBeOk: HttpResponse<IApptypes[]>) => mayBeOk.ok),
    //     map((response: HttpResponse<IApptypes[]>) => response.body)
    //   )
    //   .subscribe(
    //     (res: IApptypes[]) => {
    //       this.apptypes = res;
    //     },
    //     (res: HttpErrorResponse) => this.onError(res.message)
    //   );
    // }
    //
    this.accountService.identity().then((account: Account) => {
      this.account = account;
    });
    this.registerAuthenticationSuccess();
    // this.displayCookieConsent();
  }

  // displayCookieConsent() {
  //   const cookiePlicy = this.cookieService.check('virtuanCookiePolicy');
  //   if (!cookiePlicy) {
  //     setTimeout(() => {
  //       this.showCookieConsent = true;
  //     }, 2000);
  //   }
  // }

  setAcceptCookiePolicy() {
  //  this.cookieService.set('virtuanCookiePolicy', 'accepted', 1000);
    this.showCookieConsent = false;
  }

  // onSortChange(event) {
  //   const value = event.value;
  //
  //   if (value.indexOf('!') === 0) {
  //     this.sortOrder = -1;
  //     this.sortField = value.substring(1, value.length);
  //   } else {
  //     this.sortOrder = 1;
  //     this.sortField = value;
  //   }
  // }
  //
  // protected onError(errorMessage: string) {
  //   this.version = '';
  // }

  registerAuthenticationSuccess() {
    this.eventSubscriber = this.eventManager.on(EventTypes.authenticationSuccess).subscribe(event =>
        this.accountService.identity().then(account => {
          this.account = account;
        })
    );
  }

  // isAuthenticated() {
  //   let auth: boolean = this.accountService.isAuthenticated();
  //   this.auth = auth;
  //   return auth;
  // }

  // loadAppTypes() {
  //   if (this.apptypes === null || this.apptypes === undefined || this.apptypes.length === 0) {
  //     this.apptypesService
  //         .query()
  //         .pipe(
  //             filter((mayBeOk: HttpResponse<IApptypes[]>) => mayBeOk.ok),
  //             map((response: HttpResponse<IApptypes[]>) => response.body)
  //         )
  //         .subscribe(
  //             (res: IApptypes[]) => {
  //               this.apptypes = res;
  //               return this.apptypes;
  //             },
  //             (res: HttpErrorResponse) => this.onError(res.message)
  //         );
  //   }
  //
  //   return this.apptypes;
  // }

  login() {
    this.isLogin = true;
    this.loginService
        .login({
          username: this.loginForm.get('username').value,
          password: this.loginForm.get('password').value,
          rememberMe: this.loginForm.get('rememberMe').value,
        })
        .then(() => {
          this.authenticationError = false;
          this.loginForm.patchValue({
            username: '',
            password: '',
          });

          if (this.router.url === '/register' || /^\/activate\//.test(this.router.url) || /^\/reset\//.test(this.router.url)) {
            this.router.navigate(['']);
          }

          this.eventManager.dispatch(
              new AppEvent(EventTypes.authenticationSuccess, {
                name: 'authenticationSuccess',
                content: 'Sending Authentication Success',
              })
          );

          // previousState was set in the authExpiredInterceptor before being redirected to login modal.
          // since login is successful, go to stored previousState and clear previousState
          const redirect = this.stateStorageService.getUrl();
          console.log(redirect);

          if (redirect) {
            this.stateStorageService.storeUrl(null);
            this.router.navigateByUrl(redirect);
          }
        })
        .catch(() => {
          console.log('login failed');
          this.authenticationError = true;
          // this.messageService.add({
          //   severity: 'error',
          //   summary: 'Failed to sign in! Please check your credentials and try again.',
          // });
        })
        .finally(() => {
          this.isLogin = false;
        });
  }

  ngOnDestroy() {
   // this.homeTrackerService.setIsHomePage('no');
 //   this.eventSubscriber.unsubscribe();
  }
}
