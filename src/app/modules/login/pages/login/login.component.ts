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
import {NgxSpinnerService} from 'ngx-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'virtuan-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  showNavigationArrows = false;
  showNavigationIndicators = false;
  images = [1, 2].map(n => ` ../../content/images/bgimage${n}.jpeg`);
  imageURL = ''
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
  typeSelected: string;

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
       private eventManager: EventManagerService,
       private router: Router,
       private fb: FormBuilder,

       private loginService: LoginService,
       private stateStorageService: StateStorageService,
       private spinnerService: NgxSpinnerService,
       private snackBar: MatSnackBar,

     //  private messageService: MessageService,
      // private apptypesService: ApptypesService,
      // private cookieService: CookieService,
      // private config: NgbCarouselConfig
  ) {
    this.typeSelected = 'square-jelly-box';
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
    this.spinnerService.hide();
    this.imageURL = 'src/assets/images/logo_primary.png' //'../../../../../assets/images/logo_primary.png'
    // this.accountService.identity().then((account: Account) => {
    //   this.account = account;
    // });
  //   setInterval(() => {
  //     let value = {
  //       notificationMsg: 'Test 1',
  //       duration: 5000,
  //       notificationType: 'info'
  //     }
  //     this.snackBar.open(value.notificationMsg, '', {
  //       duration: value.duration,
  //       panelClass: `snackbar-${value.notificationType}`,
  //       horizontalPosition: 'right',
  //       verticalPosition: 'top'
  //     })
  // }, 25000);
    this.registerAuthenticationSuccess();
  }

  getUrl(){
    return this.imageURL
  }

  registerAuthenticationSuccess() {
    this.eventSubscriber = this.eventManager.on(EventTypes.authenticationSuccess).subscribe(event =>
        this.accountService.identity().then(account => {
          this.account = account;
          this.router.navigate(['dashboard']);
        })
    );
  }

  login() {
    this.spinnerService.show();
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
            this.spinnerService.hide();
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
          this.spinnerService.hide();
          // this.messageService.add({
          //   severity: 'error',
          //   summary: 'Failed to sign in! Please check your credentials and try again.',
          // });
        })
        .finally(() => {
          this.spinnerService.hide();
          this.isLogin = false;
        });
  }

  ngOnDestroy() {
   // this.homeTrackerService.setIsHomePage('no');
 //   this.eventSubscriber.unsubscribe();
  }
}
