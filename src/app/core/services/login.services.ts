import { Injectable } from '@angular/core';
import { AccountService } from '@core/auth/account.service';
import { AuthServerProvider } from '@core/auth/auth-jwt.service';
import { AppEvent } from '@shared/events/app.event.class';
import { EventTypes } from '@shared/events/event.queue';
import { EventManagerService } from '@shared/events/event.type';

@Injectable({ providedIn: 'root' })
export class LoginService {
    constructor(
        private eventManager: EventManagerService,
        private accountService: AccountService,
        private authServerProvider: AuthServerProvider
    ) {}

    login(credentials, callback?) {
        const cb = callback || function() {};

        return new Promise((resolve, reject) => {
            this.authServerProvider.login(credentials).subscribe(
                data => {
                    this.accountService.identity(true).then(account => {
                        resolve(data);
                        this.eventManager.dispatch(
                            new AppEvent(EventTypes.loggedIntoApp, {
                                name: 'loggedIntoApp',
                                content: 'LoggedInSuccess'
                            })
                        );
                    });
                    return cb();
                },
                err => {
                    this.logout();
                    reject(err);
                    return cb(err);
                }
            );
        });
    }

    loginWithToken(jwt, rememberMe) {
        return this.authServerProvider.loginWithToken(jwt, rememberMe);
    }

    logout() {
        this.authServerProvider.logout().subscribe(null, null, () => this.accountService.authenticate(null));
    }
}
