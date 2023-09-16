import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {format, formatDistance, formatRelative, parseISO, subDays} from 'date-fns'
import {HttpClient} from "@angular/common/http";
import {da} from "date-fns/locale";



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'hackzurich2023';

  @ViewChild('googleMaps') googleMaps: ElementRef | undefined;

  public pointA: string | undefined;
  public pointB: string | undefined;
  public dateTimeLocal: string = format(new Date(), 'yyyy-MM-dd\'T\'HH:mm');

  ngAfterViewInit() {
    this.initGoogleMaps()
    console.log(format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'))
  }

  private initGoogleMaps() {

  }

  constructor(private httpClient: HttpClient) {
  }


  getConnections(pointA: string | undefined, pointB: string | undefined, dateTimeLocal: string) {
    if(!pointA || !pointB){
      console.error("input empty")
      return
    }
    this.getPublicTransportConnections(pointA!, pointB!, parseISO(dateTimeLocal))

  }

  getPublicTransportConnections(pointA: string, pointB: string, dateTimeLocal: Date) {
    const date = format(dateTimeLocal, 'yyyy-MM-dd');
    const time = format(dateTimeLocal, 'HH:mm')
    this.httpClient.get(`http://transport.opendata.ch/v1/connections?from=${pointA}&to=${pointB}&date=${date}&time=${time}`)
      .subscribe((data: any) =>  {
        // TODO process data
        console.log(data)
    });
  }

}
