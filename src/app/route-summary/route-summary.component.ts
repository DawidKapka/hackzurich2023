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

  public transitCo2Difference: number = 0;
  public transitPriceDifference: number = 0;

  ngAfterViewInit() {
    this.createTransitToDrivingDifference()
  }

  private createTransitToDrivingDifference() {
    this.transitCo2Difference = this.transitStatistics!.kgCo2 - this.drivingStatistics!.kgCo2
    this.transitPriceDifference = this.transitStatistics!.price - this.drivingStatistics!.price
  }
}
