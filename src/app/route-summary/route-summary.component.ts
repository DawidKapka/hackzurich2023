import {AfterViewInit, Component, Input } from '@angular/core';
import {Statistics} from "../statistics";

@Component({
  selector: 'app-route-summary',
  templateUrl: './route-summary.component.html',
  styleUrls: ['./route-summary.component.scss']
})
export class RouteSummaryComponent implements AfterViewInit{
  private static HOUR = 60;
  private static DAY = 1440

  @Input('from') from: string = '';
  @Input('to') to: string = '';
  @Input('drivingStatistics') drivingStatistics: Statistics | undefined;
  @Input('transitStatistics') transitStatistics: Statistics | undefined;
  @Input('cyclingStatistics') cyclingStatistics: Statistics | undefined;


  public transitCo2Difference: number = 0;
  public transitPriceDifference: number = 0;
  public transitTimeDifference: number = 0;
  public transitTimeDifferenceText: string = '';
  public loading: boolean = false;

  public get timeDifferenceTooBig(): boolean {
    const percentageCondition = this.transitTimeDifference >= this.drivingStatistics!.durationMinutes!.value
    const twoHourCondition = this.transitTimeDifference / 3600 > 2
    const tenKilometerCondition = this.drivingStatistics!.distance >= 10000
    const fiveHoursCondition = (this.transitStatistics!.durationMinutes.value / 3600) < 5;
    return (percentageCondition || twoHourCondition) && tenKilometerCondition && fiveHoursCondition
  }

  ngAfterViewInit() {
    this.loading = true
    setTimeout(() => {
      this.createTransitToDrivingDifference()
      this.loading = false;
    }, 1000)
  }

  private createTransitToDrivingDifference() {
    this.transitCo2Difference = (100 - ((100 / this.drivingStatistics!.kgCo2) * this.transitStatistics!.kgCo2)) * -1
    this.transitPriceDifference = this.transitStatistics!.price - this.drivingStatistics!.price;
    this.transitTimeDifference = this.transitStatistics!.durationMinutes.value - this.drivingStatistics!.durationMinutes.value;
    this.transitTimeDifferenceText = this.calculateTimeText()
  }

  private calculateTimeText(): string {
    let days = 0;
    let hours = 0;
    let minutesTotal = Math.round(this.transitTimeDifference / 60)
    let timeText = '';
    while (minutesTotal >= RouteSummaryComponent.DAY) {
      days++;
      minutesTotal -= RouteSummaryComponent.DAY;
    }
    while (minutesTotal >= RouteSummaryComponent.HOUR) {
      hours++;
      minutesTotal -= RouteSummaryComponent.HOUR
    }
    let minutes = Math.round(minutesTotal);
    if (days > 0) {
      timeText += `${days} days, `
    }
    if (hours > 0) {
      timeText += `${hours} hours, `
    }
    return timeText + `${minutes} mins`;
  }
}
