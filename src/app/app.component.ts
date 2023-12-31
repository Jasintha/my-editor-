

import 'hammerjs';

import { Component, OnInit } from '@angular/core';

import { environment as env } from '@env/environment';

import { TranslateService } from '@ngx-translate/core';
import { select, Store } from '@ngrx/store';
import { AppState } from '@core/core.state';
// import { LocalStorageService } from '@core/local-storage/local-storage.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { combineLatest } from 'rxjs';
import { selectIsAuthenticated, selectIsUserLoaded } from '@core/auth/auth.selectors';
import { distinctUntilChanged, filter, map, skip } from 'rxjs/operators';
// import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'virtuan-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private store: Store<AppState>,
              // private storageService: LocalStorageService,
              private translate: TranslateService,
              private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer,
  ) {

    console.log(`Virtuan Version: ${env.virtuanVersion}`);

    this.matIconRegistry.addSvgIconSetInNamespace('mdi',
      this.domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi.svg'));

    this.matIconRegistry.addSvgIconLiteral(
      'alpha-a-circle-outline',
      this.domSanitizer.bypassSecurityTrustHtml(
        '<svg viewBox="0 0 24 24"><path d="M11,7H13A2,2 0 0,1 15,9V17H13V13H11V17H9V9A2,2 0 0,' +
        '1 11,7M11,9V11H13V9H11M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 ' +
        '0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A1' +
        '0,10 0 0,1 2,12A10,10 0 0,1 12,2Z" /></svg>'
      )
    );
    this.matIconRegistry.addSvgIconLiteral(
      'alpha-e-circle-outline',
      this.domSanitizer.bypassSecurityTrustHtml(
        '<svg viewBox="0 0 24 24"><path d="M9,7H15V9H11V11H15V13H11V15H15V17H9V7M12,2A10,10 0 0,'+
        '1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 ' +
        '0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" /></svg>'
      )
    );

    // this.storageService.testLocalStorage();

    this.setupTranslate();
    this.setupAuth();
  }

  setupTranslate() {
    if (!env.production) {
      console.log(`Supported Langs: ${env.supportedLangs}`);
    }
    this.translate.addLangs(env.supportedLangs);
    if (!env.production) {
      console.log(`Default Lang: ${env.defaultLang}`);
    }
    this.translate.setDefaultLang(env.defaultLang);
  }

  setupAuth() {
    combineLatest([
      this.store.pipe(select(selectIsAuthenticated)),
      this.store.pipe(select(selectIsUserLoaded))]
    ).pipe(
      map(results => ({isAuthenticated: results[0], isUserLoaded: results[1]})),
      distinctUntilChanged(),
      filter((data) => data.isUserLoaded ),
      skip(1),
    ).subscribe((data) => {
    });
  }

  ngOnInit() {
  }

}

