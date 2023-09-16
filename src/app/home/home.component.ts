import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {format, intervalToDuration} from "date-fns";
import {Statistics} from "../statistics";
import DirectionsStatus = google.maps.DirectionsStatus;
import TravelMode = google.maps.TravelMode;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit, OnInit {

  public pointA: string | undefined;
  public pointB: string | undefined;
  public dateTimeLocal: string = format(new Date(), 'yyyy-MM-dd\'T\'HH:mm');
  public loading: boolean = false
  public transitStatistics: Statistics | undefined
  public carStatistics: Statistics | undefined
  public state: 'NO_ROUTE' | 'ROUTE_FOUND' = 'NO_ROUTE'
  public dropdownHidden: boolean = false;
  public from: string = ''
  public to: string = ''
  private map: google.maps.Map | undefined;
  private position: GeolocationPosition | undefined;
  private directionsService: google.maps.DirectionsService | undefined;
  private drivingDirectionsRenderer: google.maps.DirectionsRenderer | undefined;
  private transitDirectionsRenderer: google.maps.DirectionsRenderer | undefined;

  @ViewChild('googleMaps') googleMaps: ElementRef | undefined;

  ngOnInit() {
    this.loading = true
  }

  ngAfterViewInit() {
    this.initGoogleMaps().then(() => {
      setTimeout(() => {
        this.initDirections()
        this.loading = false
      }, 1000)
    })

  }

  private async initGoogleMaps() {
    return new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(position => {
        this.position = position
        const coordinates: google.maps.LatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
        const mapOptions: google.maps.MapOptions = {
          center: coordinates,
          zoom: 14,
          mapTypeId: 'roadmap',
          disableDefaultUI: true
        }
        this.map = new google.maps.Map(this.googleMaps!.nativeElement, mapOptions);
        const positionMarker: google.maps.Marker = new google.maps.Marker({position: coordinates, map: this.map})
        positionMarker.setMap(this.map)
        resolve()
      })
    })
  }

  private initDirections() {
    this.directionsService = new google.maps.DirectionsService()
    this.drivingDirectionsRenderer = new google.maps.DirectionsRenderer();
    this.transitDirectionsRenderer = new google.maps.DirectionsRenderer();
    this.drivingDirectionsRenderer.setMap(this.map!)
    this.drivingDirectionsRenderer.setOptions({
      polylineOptions: {
        strokeColor: '#c62828'
      },
      suppressInfoWindows: true
    })
    this.transitDirectionsRenderer.setMap(this.map!)
    this.transitDirectionsRenderer.setOptions({
      polylineOptions: {
        strokeColor: '#388e3c'
      },
      suppressInfoWindows: true
    })
  }

  public calculateRoute(pointA: string, pointB: string, datetime: string) {
    [TravelMode.TRANSIT, TravelMode.DRIVING].forEach((mode) => {
      const request: google.maps.DirectionsRequest = {
        origin: pointA,
        destination: pointB,
        travelMode: mode,
        transitOptions: {
          departureTime: new Date(datetime)
        }
      }
      this.directionsService!.route(request, (response, status) => {
        if (status === DirectionsStatus.OK && response) {
          if (mode === TravelMode.DRIVING) {
            this.drivingDirectionsRenderer?.setDirections(response)
            const startDate = new Date(Date.now())
            const endDate = new Date(Date.now())
            this.from = response.routes[0].legs[0].start_address
            this.to = response.routes[0].legs[0].end_address
            endDate.setMinutes(endDate.getMinutes() + response.routes[0].legs[0].duration!.value)
            this.carStatistics = HomeComponent.calculateStatistics(startDate, endDate)
          } else {
            this.transitDirectionsRenderer?.setDirections(response);
            this.transitStatistics = HomeComponent.calculateStatistics(response.routes[0].legs[0].departure_time!.value, response.routes[0].legs[0].arrival_time!.value)
          }
          this.state = 'ROUTE_FOUND'
          this.dropdownHidden = true;
        }
      })
    })
  }

  private static calculateStatistics(depDate: Date, arrDate: Date): Statistics {
    return {
      durationMinutes: intervalToDuration(
        {
          start: depDate,
          end: arrDate
        }
      ).minutes!,
      kgCo2: 0,
      price: 0
    }
  }
}
