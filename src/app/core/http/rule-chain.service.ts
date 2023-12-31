///
///
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import { ComponentFactory, Injectable } from '@angular/core';
import { defaultHttpOptionsFromConfig, RequestConfig } from './http-utils';
import { forkJoin, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { PageLink } from '@shared/models/page/page-link';
import { PageData } from '@shared/models/page/page-data';
import {
  ResolvedRuleChainMetaData,
  RuleChain,
  ConnectionPropertyTemplate,
  RuleChainConnectionInfo,
  RuleChainMetaData,
  ruleChainNodeComponent,
  ruleNodeTypeComponentTypes,
  // ruleNodeDesignComponent,
  unknownNodeComponent
} from '@shared/models/rule-chain.models';
import { ComponentDescriptorService } from './component-descriptor.service';
import {
  FcRuleNode,
  IRuleNodeConfigurationComponent,
  LinkLabel,
  RuleNodeComponentDescriptor,
  TestScriptInputParams,
  TestScriptResult
} from '@app/shared/models/rule-node.models';
import { ResourcesService } from '../services/resources.service';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { EntityType } from '@shared/models/entity-type.models';
import { deepClone, snakeCase } from '@core/utils';
import { DebugRuleNodeEventBody } from '@app/shared/models/event.models';
import {ComponentType} from '@shared/models/component-descriptor.models';

@Injectable({
  providedIn: 'root'
})
export class RuleChainService {

  private ruleNodeComponents: Array<RuleNodeComponentDescriptor>;
  private ruleNodeConfigFactories: {[directive: string]: ComponentFactory<IRuleNodeConfigurationComponent>} = {};

  constructor(
    private http: HttpClient,
    private componentDescriptorService: ComponentDescriptorService,
    private resourcesService: ResourcesService,
    private translate: TranslateService
  ) { }

  public getRuleChains(pageLink: PageLink, config?: RequestConfig): Observable<PageData<RuleChain>> {
    return this.http.get<PageData<RuleChain>>(`/api/ruleChains${pageLink.toQuery()}`,
      defaultHttpOptionsFromConfig(config));
  }

  public getRuleChain(ruleChainId: string, config?: RequestConfig): Observable<RuleChain> {
    return this.http.get<RuleChain>(`/api/ruleChain/${ruleChainId}`, defaultHttpOptionsFromConfig(config));
  }

  public getRuleChainWithUsernameAndUID(ruleChainId: string, username: string, uid: string, config?: RequestConfig): Observable<RuleChain> {
    return this.http.get<RuleChain>(`/api/ruleChain/${ruleChainId}/${username}/${uid}`, defaultHttpOptionsFromConfig(config));
  }
  public getStoryRuleChainWithUsernameAndUID(ruleChainId: string, username: string, uid: string, config?: RequestConfig): Observable<RuleChain> {
    return this.http.get<RuleChain>(`/api/ruleChain/story/${ruleChainId}/${username}/${uid}`, defaultHttpOptionsFromConfig(config));
  }

  public getConnectionPropertyTemplates(config?: RequestConfig): Observable<ConnectionPropertyTemplate[]> {
    return this.http.get<ConnectionPropertyTemplate[]>(`/api/ruleChain/connection-property-templates`, defaultHttpOptionsFromConfig(config));
  }
  public saveRuleChain(ruleChain: RuleChain, config?: RequestConfig): Observable<RuleChain> {
    return this.http.post<RuleChain>('/api/ruleChain', ruleChain, defaultHttpOptionsFromConfig(config));
  }

  public getRuleChainMicroserviceData(username, config?: RequestConfig): Observable<any> {
    return this.http.get<any>(`/api/ruleChain/microservices/${username}`, defaultHttpOptionsFromConfig(config));
  }

  public deleteRuleChain(ruleChainId: string, config?: RequestConfig) {
    return this.http.delete(`/api/ruleChain/${ruleChainId}`, defaultHttpOptionsFromConfig(config));
  }

  public setRootRuleChain(ruleChainId: string, config?: RequestConfig): Observable<RuleChain> {
    return this.http.post<RuleChain>(`/api/ruleChain/${ruleChainId}/root`, null, defaultHttpOptionsFromConfig(config));
  }

  public getRuleChainMetadata(ruleChainId: string, username: string, uid: string, config?: RequestConfig): Observable<RuleChainMetaData> {
    return this.http.get<RuleChainMetaData>(`/api/ruleChain/${ruleChainId}/${username}/${uid}/metadata`, defaultHttpOptionsFromConfig(config));
  }

  public getStoryRuleChainMetadata(ruleChainId: string, username: string, uid: string, config?: RequestConfig): Observable<RuleChainMetaData> {
    return this.http.get<RuleChainMetaData>(`/api/ruleChain/story/${ruleChainId}/${username}/${uid}/metadata`, defaultHttpOptionsFromConfig(config));
  }

  public getResolvedRuleChainMetadata(ruleChainId: string,username: string, uid: string, config?: RequestConfig): Observable<ResolvedRuleChainMetaData> {
    return this.getRuleChainMetadata(ruleChainId, username, uid, config).pipe(
      mergeMap((ruleChainMetaData) => this.resolveRuleChainMetadata(ruleChainMetaData))
    );
  }

  public getResolvedStoryRuleChainMetadata(ruleChainId: string,username: string, uid: string, config?: RequestConfig): Observable<ResolvedRuleChainMetaData> {
    return this.getStoryRuleChainMetadata(ruleChainId, username, uid, config).pipe(
      mergeMap((ruleChainMetaData) => this.resolveRuleChainMetadata(ruleChainMetaData))
    );
  }

  public saveRuleChainMetadata(ruleChainMetaData: RuleChainMetaData, username: string, uid: string,config?: RequestConfig): Observable<RuleChainMetaData> {
   console.log("-----------------------------------");
        console.log(username);
        console.log( uid);

        let url: string = '/api/ruleChain/metadata/' + username + '/'+ uid;
    return this.http.post<RuleChainMetaData>(url, ruleChainMetaData, defaultHttpOptionsFromConfig(config));
  }

  public saveStoryRuleChainMetadata(ruleChainMetaData: RuleChainMetaData, username: string, uid: string, storyuid: string,config?: RequestConfig): Observable<RuleChainMetaData> {
   console.log("-----------------------------------");
        console.log(username);
        console.log( uid);

        let url: string = '/api/ruleChain/metadata/story/' + username + '/'+ uid + '/' + storyuid;
    return this.http.post<RuleChainMetaData>(url, ruleChainMetaData, defaultHttpOptionsFromConfig(config));
  }

  public saveAndGetResolvedRuleChainMetadata(ruleChainMetaData: RuleChainMetaData, username: string, uid: string,
                                             config?: RequestConfig): Observable<ResolvedRuleChainMetaData> {

    return this.saveRuleChainMetadata(ruleChainMetaData, username, uid, config).pipe(
      mergeMap((savedRuleChainMetaData) => this.resolveRuleChainMetadata(savedRuleChainMetaData))
    );
  }
  public saveAndGetResolvedStoryRuleChainMetadata(ruleChainMetaData: RuleChainMetaData, username: string, uid: string, storyuid: string,
                                             config?: RequestConfig): Observable<ResolvedRuleChainMetaData> {

    return this.saveStoryRuleChainMetadata(ruleChainMetaData, username, uid, storyuid, config).pipe(
      mergeMap((savedRuleChainMetaData) => this.resolveRuleChainMetadata(savedRuleChainMetaData))
    );
  }

  public resolveRuleChainMetadata(ruleChainMetaData: RuleChainMetaData): Observable<ResolvedRuleChainMetaData> {
    return this.resolveTargetRuleChains(ruleChainMetaData.ruleChainConnections).pipe(
      map((targetRuleChainsMap) => {
        const resolvedRuleChainMetadata: ResolvedRuleChainMetaData = {...ruleChainMetaData, targetRuleChainsMap};
        return resolvedRuleChainMetadata;
      })
    );
  }

  public getRuleNodeComponents(ruleNodeConfigResourcesModulesMap: {[key: string]: any}, uid : string, editorType: string, config?: RequestConfig):
    Observable<Array<RuleNodeComponentDescriptor>> {
     // if (this.ruleNodeComponents) {
     //   return of(this.ruleNodeComponents);
     // } else {
      return this.loadRuleNodeComponents(uid, editorType, config).pipe(
        mergeMap((components) => {
          return this.resolveRuleNodeComponentsUiResources(components, ruleNodeConfigResourcesModulesMap).pipe(
            map((ruleNodeComponents) => {
              this.ruleNodeComponents = ruleNodeComponents;
              //this.ruleNodeComponents.push(ruleChainNodeComponent);
              this.ruleNodeComponents.sort(
                (comp1, comp2) => {
                  let result = comp1.type.toString().localeCompare(comp2.type.toString());
                  if (result === 0) {
                    result = comp1.name.localeCompare(comp2.name);
                  }
                  return result;
                }
              );
              return this.ruleNodeComponents;
            })
          );
        })
      );
    // }
  }

  public getRuleNodeConfigFactory(directive: string): ComponentFactory<IRuleNodeConfigurationComponent> {
    return this.ruleNodeConfigFactories[directive];
  }

  public getRuleNodeComponentByClazz(clazz: string): RuleNodeComponentDescriptor {
    const found = this.ruleNodeComponents.filter((component) => component.name === clazz);
    if (found && found.length) {
      return found[0];
    } else {
      const unknownComponent = deepClone(unknownNodeComponent);
      unknownComponent.clazz = clazz;
      unknownComponent.configurationDescriptor.nodeDefinition.details = 'Unknown Rule Node class: ' + clazz;
      return unknownComponent;
    }
  }

/*
  public getRuleNodeSupportedLinks(component: RuleNodeComponentDescriptor): {[label: string]: LinkLabel} {
    const relationTypes = component.configurationDescriptor.nodeDefinition.relationTypes;
    const linkLabels: {[label: string]: LinkLabel} = {};
    relationTypes.forEach((label) => {
      linkLabels[label] = {
        name: label,
        value: label
      };
    });
    return linkLabels;
  }
  */

  public getRuleNodeSupportedLinks(sourceNode: FcRuleNode): {[label: string]: LinkLabel} {
    let component: RuleNodeComponentDescriptor = sourceNode.component;

    if(component.clazz == 'xiSwitchNode' && component.configurationDescriptor.nodeDefinition.relationTypes.length == 0){

      let switchrelationTypes: string[] = [];

      for (let j = 0; j < sourceNode.configuration.switchCases.length; j++) {
        switchrelationTypes.push(sourceNode.configuration.switchCases[j].name);
      }

      let nextlabel = 'Next';

      switchrelationTypes.push('Default');
      switchrelationTypes.push(nextlabel);

      const switchlinkLabels: {[label: string]: LinkLabel} = {};

      for (let a=0; a < switchrelationTypes.length; a++) {
        let switchlabel = switchrelationTypes[a];
        switchlinkLabels[switchlabel] = {
          name: switchlabel,
          value: switchlabel
        };
      }
      return switchlinkLabels;
    } else if (component.clazz == 'xiScreenNode' && component.configurationDescriptor.nodeDefinition.relationTypes.length == 0){

      let switchrelationTypes: string[] = [];

      for (let j = 0; j < sourceNode.configuration.screeActions.length; j++) {
        switchrelationTypes.push(sourceNode.configuration.screeActions[j]);
      }

      const switchlinkLabels: {[label: string]: LinkLabel} = {};

      for (let a=0; a < switchrelationTypes.length; a++) {
        let switchlabel = switchrelationTypes[a];
        switchlinkLabels[switchlabel] = {
          name: switchlabel,
          value: switchlabel
        };
      }

      return switchlinkLabels;
    }
    /*
    else if(component.clazz == 'xiFilterNode' && component.configurationDescriptor.nodeDefinition.relationTypes.length == 0){
      let filterrelationTypes: string[] = [];
      let successlabel = sourceNode.name.replace(/\s/g, "") + '_SUCCESS';
      let failurelabel = sourceNode.name.replace(/\s/g, "") + '_FAILURE';
      let nextlabel = '';
      filterrelationTypes.push(successlabel);
      filterrelationTypes.push(failurelabel);
      filterrelationTypes.push(nextlabel);
      const switchlinkLabels: {[label: string]: LinkLabel} = {};

      for (let a=0; a < filterrelationTypes.length; a++) {
        let switchlabel = filterrelationTypes[a];
        switchlinkLabels[switchlabel] = {
          name: switchlabel,
          value: switchlabel
        };
      }

      return switchlinkLabels;
    }
    */
    else {
      const relationTypes = component.configurationDescriptor.nodeDefinition.relationTypes;
      const linkLabels: {[label: string]: LinkLabel} = {};
      relationTypes.forEach((label) => {
        linkLabels[label] = {
          name: label,
          value: label
        };
      });
      return linkLabels;
    }
  }

  public ruleNodeAllowCustomLinks(component: RuleNodeComponentDescriptor): boolean {
    return component.configurationDescriptor.nodeDefinition.customRelations;
  }

  public getLatestRuleNodeDebugInput(ruleNodeId: string, config?: RequestConfig): Observable<DebugRuleNodeEventBody> {
    return this.http.get<DebugRuleNodeEventBody>(`/api/ruleNode/${ruleNodeId}/debugIn`, defaultHttpOptionsFromConfig(config));
  }

  public testScript(inputParams: TestScriptInputParams, config?: RequestConfig): Observable<TestScriptResult> {
    return this.http.post<TestScriptResult>('/api/ruleChain/testScript', inputParams, defaultHttpOptionsFromConfig(config));
  }

  private resolveTargetRuleChains(ruleChainConnections: Array<RuleChainConnectionInfo>): Observable<{[ruleChainId: string]: RuleChain}> {
    if (ruleChainConnections && ruleChainConnections.length) {
      const tasks: Observable<RuleChain>[] = [];
      ruleChainConnections.forEach((connection) => {
        tasks.push(this.resolveRuleChain(connection.targetRuleChainId.id));
      });
      return forkJoin(tasks).pipe(
        map((ruleChains) => {
          const ruleChainsMap: {[ruleChainId: string]: RuleChain} = {};
          ruleChains.forEach((ruleChain) => {
            ruleChainsMap[ruleChain.id.id] = ruleChain;
          });
          return ruleChainsMap;
        })
      );
    } else {
      return of({} as {[ruleChainId: string]: RuleChain});
    }
  }

  private loadRuleNodeComponents(uid : string, editorType : string, config?: RequestConfig): Observable<Array<RuleNodeComponentDescriptor>> {

    if(editorType === 'design') {
      const ruleNodeDesignComponent: ComponentType[] = [ComponentType.DESIGN];
      return this.componentDescriptorService.getComponentDescriptorsByTypes(ruleNodeDesignComponent, uid, editorType, config).pipe(
          map((components) => {
            const ruleNodeComponents: RuleNodeComponentDescriptor[] = [];
            components.forEach((component) => {
              ruleNodeComponents.push(component as RuleNodeComponentDescriptor);
            });
            return ruleNodeComponents;
          })
      );
    } else if(editorType === 'uib') {
      const ruleNodeDesignComponent: ComponentType[] = [ComponentType.UIB];
      return this.componentDescriptorService.getComponentDescriptorsByTypes(ruleNodeDesignComponent, uid, editorType, config).pipe(
          map((components) => {
            const ruleNodeComponents: RuleNodeComponentDescriptor[] = [];
            components.forEach((component) => {
              ruleNodeComponents.push(component as RuleNodeComponentDescriptor);
            });
            return ruleNodeComponents;
          })
      );
    } else {
      return this.componentDescriptorService.getComponentDescriptorsByTypes(ruleNodeTypeComponentTypes, uid, editorType, config).pipe(
          map((components) => {
            const ruleNodeComponents: RuleNodeComponentDescriptor[] = [];
            components.forEach((component) => {
              ruleNodeComponents.push(component as RuleNodeComponentDescriptor);
            });
            return ruleNodeComponents;
          })
      );
    }
  }

  private resolveRuleNodeComponentsUiResources(components: Array<RuleNodeComponentDescriptor>,
                                               ruleNodeConfigResourcesModulesMap: {[key: string]: any}):
    Observable<Array<RuleNodeComponentDescriptor>> {
    const tasks: Observable<RuleNodeComponentDescriptor>[] = [];
    components.forEach((component) => {
      tasks.push(this.resolveRuleNodeComponentUiResources(component, ruleNodeConfigResourcesModulesMap));
    });
    return forkJoin(tasks).pipe(
      catchError((err) => {
        return of(components);
      })
    );
  }

  private resolveRuleNodeComponentUiResources(component: RuleNodeComponentDescriptor,
                                              ruleNodeConfigResourcesModulesMap: {[key: string]: any}):
    Observable<RuleNodeComponentDescriptor> {
    const nodeDefinition = component.configurationDescriptor.nodeDefinition;
    const uiResources = nodeDefinition.uiResources;
    if (uiResources && uiResources.length) {
      const commonResources = uiResources.filter((resource) => !resource.endsWith('.js'));
      const moduleResource = uiResources.find((resource) => resource.endsWith('.js'));
      const tasks: Observable<any>[] = [];
      if (commonResources && commonResources.length) {
        commonResources.forEach((resource) => {
          tasks.push(this.resourcesService.loadResource(resource));
        });
      }
      if (moduleResource) {
        tasks.push(this.resourcesService.loadModule(moduleResource, ruleNodeConfigResourcesModulesMap).pipe(
          map((res) => {
            if (nodeDefinition.configDirective && nodeDefinition.configDirective.length) {
              const selector = snakeCase(nodeDefinition.configDirective, '-');
              const componentFactory = res.find((factory) =>
              factory.selector === selector);
              if (componentFactory) {
                this.ruleNodeConfigFactories[nodeDefinition.configDirective] = componentFactory;
              } else {
                component.configurationDescriptor.nodeDefinition.uiResourceLoadError =
                  this.translate.instant('rulenode.directive-is-not-loaded',
                    {directiveName: nodeDefinition.configDirective});
              }
            }
            return of(component);
          })
        ));
      }
      return forkJoin(tasks).pipe(
        map((res) => {
          return component;
        }),
        catchError(() => {
          component.configurationDescriptor.nodeDefinition.uiResourceLoadError = this.translate.instant('rulenode.ui-resources-load-error');
          return of(component);
        })
      );
    } else {
      return of(component);
    }
  }

  private resolveRuleChain(ruleChainId: string): Observable<RuleChain> {
    return this.getRuleChain(ruleChainId, {ignoreErrors: true}).pipe(
      map(ruleChain => ruleChain),
      catchError((err) => {
        const ruleChain = {
         id: {
            entityType: EntityType.RULE_CHAIN,
            id: ruleChainId
          }
        } as RuleChain;
        return of(ruleChain);
      })
    );
  }

}
