import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeTrackerService {
  public static defaultTheme: number;

  public constructor() {}

  public getDefaultTheme() {
    return ThemeTrackerService.defaultTheme;
  }

  public setDefaultTheme(defaultTheme) {
    return (ThemeTrackerService.defaultTheme = defaultTheme);
  }
}
