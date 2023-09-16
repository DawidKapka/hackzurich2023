import {Component, Input} from '@angular/core';
import {Statistics} from "../statistics";

@Component({
  selector: 'app-route-summary',
  templateUrl: './route-summary.component.html',
  styleUrls: ['./route-summary.component.scss']
})
export class RouteSummaryComponent {

  @Input('from') from: string = '';
  @Input('to') to: string = '';
  @Input('drivingStatistics') drivingStatistics: Statistics | undefined;
  @Input('transitStatistics') transitStatistics: Statistics | undefined;
}
