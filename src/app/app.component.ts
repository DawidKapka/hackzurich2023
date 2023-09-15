import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'hackzurich2023';

  @ViewChild('googleMaps') googleMaps: ElementRef | undefined;

  ngAfterViewInit() {
    this.initGoogleMaps()
  }

  private initGoogleMaps() {

  }
}
