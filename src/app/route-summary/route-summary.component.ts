import {AfterViewInit, Component, Input } from '@angular/core';
import {Statistics} from "../statistics";

@Component({
  selector: 'app-route-summary',
  templateUrl: './route-summary.component.html',
  styleUrls: ['./route-summary.component.scss']
})
export class RouteSummaryComponent implements AfterViewInit{

  @Input('from') from: string = '';
  @Input('to') to: string = '';
  @Input('drivingStatistics') drivingStatistics: Statistics | undefined;
  @Input('transitStatistics') transitStatistics: Statistics | undefined;

  ngAfterViewInit() {
    console.log(this.drivingStatistics);
    console.log(this.transitStatistics);
  }
}
