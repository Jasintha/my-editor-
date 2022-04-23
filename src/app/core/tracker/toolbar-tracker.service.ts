import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToolbarTrackerService {
  public static isEntityPage: string;
  public static isLoginPageAvailable: string;
  public static isRegisterPageAvailable: string;
  public static isPageLayout: string;
  public static projectId: number;
  public static projectUUID: string;
  public static pageID: string;
  public static widgetID: string;

  public constructor() {}

  public getEntityPage() {
    return ToolbarTrackerService.isEntityPage;
  }

  public isPageLayout() {
    return ToolbarTrackerService.isPageLayout;
  }

  public setIsEntityPage(isEntity) {
    return (ToolbarTrackerService.isEntityPage = isEntity);
  }

  public setIsPageLayout(isIsPageLayout) {
    return (ToolbarTrackerService.isPageLayout = isIsPageLayout);
  }

  public getProjectId() {
    return ToolbarTrackerService.projectId;
  }

  public setProjectId(id) {
    return (ToolbarTrackerService.projectId = id);
  }

  public getProjectUUID() {
    return ToolbarTrackerService.projectUUID;
  }

  public setProjectUUID(id) {
    return (ToolbarTrackerService.projectUUID = id);
  }

  public getPageID() {
    return ToolbarTrackerService.pageID;
  }

  public setPageID(id) {
    return (ToolbarTrackerService.pageID = id);
  }

  public getWidgetID() {
    return ToolbarTrackerService.widgetID;
  }

  public setWidgetID(id) {
    return (ToolbarTrackerService.widgetID = id);
  }

  public getIsLoginPageExist() {
    return ToolbarTrackerService.isLoginPageAvailable;
  }

  public setIsLoginPageExist(isExist) {
    return (ToolbarTrackerService.isLoginPageAvailable = isExist);
  }

  public getIsRegisterPageExist() {
    return ToolbarTrackerService.isLoginPageAvailable;
  }

  public setIsRegisterPageExist(isExist) {
    return (ToolbarTrackerService.isRegisterPageAvailable = isExist);
  }
}
