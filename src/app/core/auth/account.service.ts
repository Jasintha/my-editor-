import { Injectable } from '@angular/core';
// import { JhiLanguageService } from 'ng-jhipster';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, Subject, from } from 'rxjs';

import { Account } from '@shared/models/user/account.model';
import { ToolbarTrackerService } from '../tracker/toolbar-tracker.service';
import { WebsocketService } from '../tracker/websocket.service';
import { BreakpointTrackerService } from '../tracker/breakpoint.service';
import { ThemeTrackerService } from '../tracker/theme.service';
import { BuildWebsocketService } from '../tracker/buildWebSocket.service';
import {Router} from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private userIdentity: any;
  private authenticated = false;
  private authenticationState = new Subject<any>();

  constructor(
    //  private languageService: JhiLanguageService,
    private http: HttpClient,
    private ws: WebsocketService,
    private bws: BuildWebsocketService,
    private ts: ToolbarTrackerService,
    private ps: BreakpointTrackerService,
    private themeService: ThemeTrackerService,
  ) {}

  fetch(): Observable<HttpResponse<Account>> {
    return this.http.get<Account>('/api/account', { observe: 'response' });
  }

  save(account: any): Observable<HttpResponse<any>> {
    return this.http.post( '/api/account', account, { observe: 'response' });
  }

  authenticate(identity) {
    this.userIdentity = identity;
    this.authenticated = identity !== null;
    this.authenticationState.next(this.userIdentity);
  }

  hasAnyAuthority(authorities: string[]): boolean {
    if (!this.authenticated || !this.userIdentity || !this.userIdentity.authorities) {
      return false;
    }

    for (let i = 0; i < authorities.length; i++) {
      if (this.userIdentity.authorities.includes(authorities[i])) {
        return true;
      }
    }

    return false;
  }

  hasAuthority(authority: string): Promise<boolean> {
    if (!this.authenticated) {
      return Promise.resolve(false);
    }

    return this.identity().then(
      id => {
        return Promise.resolve(id.authorities && id.authorities.includes(authority));
      },
      () => {
        return Promise.resolve(false);
      }
    );
  }

  identity(force?: boolean): Promise<Account> {
    if (force) {
      this.userIdentity = undefined;
    }

    // check and see if we have retrieved the userIdentity data from the server.
    // if we have, reuse it by immediately resolving
    if (this.userIdentity) {
      return Promise.resolve(this.userIdentity);
    }

    // retrieve the userIdentity data from the server, update the identity object, and then resolve.
    return this.fetch()
      .toPromise()
      .then(response => {
        const account: Account = response.body;
        if (account) {
          this.userIdentity = account;
          this.authenticated = true;
          this.themeService.setDefaultTheme(1);
          this.ws.connect(account.email);
          this.ps.setBreakpoint(-1);
        } else {
          this.userIdentity = null;
          this.authenticated = false;
        }
        this.authenticationState.next(this.userIdentity);
        return this.userIdentity;
      })
      .catch(err => {
        this.userIdentity = null;
        this.authenticated = false;
        this.authenticationState.next(this.userIdentity);
        return null;
      });
  }

  isAuthenticated(): boolean {
    return this.authenticated;
  }

  isIdentityResolved(): boolean {
    return this.userIdentity !== undefined;
  }

  getAuthenticationState(): Observable<any> {
    return this.authenticationState.asObservable();
  }

  getImageUrl(): string {
    return this.isIdentityResolved() ? this.userIdentity.imageUrl : null;
  }
}
