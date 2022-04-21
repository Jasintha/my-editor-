import { Component, OnInit } from '@angular/core';
import {IProject} from '@shared/models/model/project.model';
import {ITask} from '@shared/models/model/task.model';
import {IAggregate} from '@shared/models/model/aggregate.model';
import {ICustomObject} from '@shared/models/model/custom-object.model';
import {APIInput} from '@shared/models/model/api-input.model';
interface Item {
  value: any;
  label: string;
}
@Component({
  selector: 'virtuan-create-task',
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.scss']
})
export class CreateTaskComponent implements OnInit {

  // isSaving: boolean;
  // project: IProject;
  // currentTask: ITask;
  // events: IEvent[];
  // eventItems: SelectItem[];
  // apiParams: APIInput[];
  // customObjects: ICustomObject[];
  // aggregates: IAggregate[];
  // subruleItems: SelectItem[];
  // workflowInputItems: SelectItem[];
  // mappedApiInputItems: SelectItem[];
  // worlflowMappings: IWorkflowMapping[];
  // allSubRules: ISubrule[];
  //
  // frequencyItems: SelectItem[] = [
  //   { label: 'Single', value: 'SINGLE' },
  //   { label: 'Multiple', value: 'MULTIPLE' },
  // ];
  // categoryItems: SelectItem[] = [
  //   { label: 'Subscriber', value: 'SUBSCRIBER' },
  //   { label: 'Periodic', value: 'PERIODIC' },
  // ];
  // operationItems: SelectItem[] = [
  //   { label: 'General', value: 'GENERAL' },
  //   { label: 'File Reader', value: 'FILE_READER' },
  //   { label: 'Message Subscriber', value: 'MESSAGE_SUBSCRIBER' },
  //   { label: 'Service Call', value: 'SERVICE_CALL' },
  // ];
  // timeUnitItems: SelectItem[] = [
  //   { label: 'Seconds', value: 's' },
  //   { label: 'Minutes', value: 'min' },
  //   { label: 'Hours', value: 'h' },
  // ];
  // fileTypeItems: SelectItem[] = [
  //   { label: 'Image', value: 'IMAGE' },
  //   { label: 'Pdf', value: 'PDF' },
  // ];
  // serviceCallTypeItems: SelectItem[] = [
  //   { label: 'REST', value: 'REST' },
  //   { label: 'RPC', value: 'RPC' },
  // ];
  //
  // paramitems: SelectItem[] = [
  //   { label: 'Query', value: 'QUERY' },
  //   { label: 'Path', value: 'PATH' },
  // ];
  // paramDataTypeItems: SelectItem[] = [
  //   { label: 'TEXT', value: 'TEXT' },
  //   { label: 'NUMBER', value: 'NUMBER' },
  //   { label: 'FLOAT', value: 'FLOAT' },
  //   { label: 'TRUE_OR_FALSE', value: 'TRUE_OR_FALSE' },
  //   { label: 'DATE', value: 'DATE' },
  // ];
  //
  // actionItems: SelectItem[] = [
  //   { label: 'CREATE', value: 'CREATE' },
  //   { label: 'UPDATE', value: 'UPDATE' },
  //   { label: 'DELETE', value: 'DELETE' },
  //   { label: 'FIND', value: 'FIND' },
  // ];
  // items: SelectItem[];
  // returnItems: SelectItem[];
  // viewmodels: IViewmodel[];
  // filetargetItems: SelectItem[];
  // editForm: FormGroup;
  // projectUid: string;

  constructor() { }

  ngOnInit(): void {
  }

}
