import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HomeTrackerService {
  public static isHomePage: string;

  public constructor() {}

  public getHomePage() {
    return HomeTrackerService.isHomePage;
  }

  public setIsHomePage(isHome) {
    return (HomeTrackerService.isHomePage = isHome);
  }
}
