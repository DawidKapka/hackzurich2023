import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {format} from "date-fns";
import {Statistics} from "../statistics";
import DirectionsStatus = google.maps.DirectionsStatus;
import TravelMode = google.maps.TravelMode;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit, OnInit {

  public pointA: string | undefined = 'Current Location';
  public pointB: string | undefined;
  public dateTimeLocal: string = format(new Date(), 'yyyy-MM-dd\'T\'HH:mm');
  public loading: boolean = false
  public transitStatistics: Statistics | undefined
  public carStatistics: Statistics | undefined
  public cyclingStatistics: Statistics | undefined
  public state: 'NO_ROUTE' | 'ROUTE_FOUND' = 'NO_ROUTE'
  public dropdownHidden: boolean = false;
  public from: string = ''
  public to: string = ''
  public originIsCurrent: boolean = true;
  public destinationIsCurrent: boolean = false;
  private map: google.maps.Map | undefined;
  private position: GeolocationPosition | undefined;
  private directionsService: google.maps.DirectionsService | undefined;
  private drivingDirectionsRenderer: google.maps.DirectionsRenderer | undefined;
  private transitDirectionsRenderer: google.maps.DirectionsRenderer | undefined;

  private priceCar = 0;

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

  public async calculateRoute(pointA: string, pointB: string, datetime: string) {
    if (this.validatePoints()) {
        await new Promise<void>(resolve => {
          [TravelMode.DRIVING, TravelMode.TRANSIT].forEach((mode) => {
            const request: google.maps.DirectionsRequest = {
              origin: pointA === 'Current Location' ? new google.maps.LatLng(this.position!.coords.latitude, this.position!.coords.longitude) : pointA,
              destination: pointB === 'Current Location' ? new google.maps.LatLng(this.position!.coords.latitude, this.position!.coords.longitude) : pointB,
              travelMode: mode,
              transitOptions: {
                departureTime: new Date(datetime)
              }
            }
            this.directionsService!.route(request, async (response, status) => {
              if (response!.routes[0]!.legs[0]!.distance!.value <= 5000 && mode === TravelMode.DRIVING) {
                await this.createCyclingOption()
              }
              if (status === DirectionsStatus.OK && response) {
                const leg = response.routes[0].legs[0];
                if (mode === TravelMode.DRIVING) {
                  this.priceCar = Math.round((leg.distance!.value / 1000) * 0.8)
                  this.drivingDirectionsRenderer?.setDirections(response)
                  this.from = response.routes[0].legs[0].start_address
                  this.to = response.routes[0].legs[0].end_address
                  this.carStatistics = {
                    durationMinutes: leg.duration!,
                    price: this.priceCar,
                    kgCo2: Math.round((leg.distance!.value / 1000) * 0.167 * 100) / 100,
                    distance: leg.distance!.value
                  }
                } else {
                  this.transitDirectionsRenderer?.setDirections(response);
                  this.transitStatistics = {
                    durationMinutes: leg.duration!,
                    price: Math.round((this.priceCar > 10 ? this.priceCar * 0.8 : 5.40)*100)/100,
                    kgCo2: Math.round((leg.distance!.value / 1000) * 0.024 * 100) / 100,
                    distance: leg.distance!.value
                  }
                  resolve()
                }
              }
            })
          })
        })
      this.state = 'ROUTE_FOUND'
      this.dropdownHidden = true;
    }
  }

  private validatePoints() {
    return this.pointA !== '' && this.pointB !== ''
  }

  goBack() {
    this.state = 'NO_ROUTE';
    this.dropdownHidden = false;
  }

  setOriginToCurrent() {
    this.pointA = 'Current Location'
    this.originIsCurrent = true;
  }

  setDestinationToCurrent() {
    this.pointB = 'Current Location'
    this.destinationIsCurrent = true;
  }

  resetOrigin() {
    this.pointA = ''
    this.originIsCurrent = false
  }

  resetDestination() {
    this.pointB = ''
    this.destinationIsCurrent = false
  }

  private createCyclingOption() {
    return new Promise<void>(resolve => {
      const request: google.maps.DirectionsRequest = {
        origin: this.pointA === 'Current Location' ? new google.maps.LatLng(this.position!.coords.latitude, this.position!.coords.longitude) : this.pointA!,
        destination: this.pointB === 'Current Location' ? new google.maps.LatLng(this.position!.coords.latitude, this.position!.coords.longitude) : this.pointB!,
        travelMode: TravelMode.BICYCLING,
        transitOptions: {
          departureTime: new Date(this.dateTimeLocal)
        }
      }
      this.directionsService!.route(request, (response, status) => {
        if (status === DirectionsStatus.OK && response) {
          const leg = response.routes[0].legs[0];
          this.cyclingStatistics = {
            durationMinutes: leg.duration!,
            price: 0,
            kgCo2: 0,
            distance: leg.distance!.value
          }
          resolve()
        }
      })
    })
  }
}
