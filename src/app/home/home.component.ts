import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {format, intervalToDuration} from "date-fns";
import {Statistics} from "../statistics";
import DirectionsStatus = google.maps.DirectionsStatus;
import TravelMode = google.maps.TravelMode;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {

  public pointA: string | undefined;
  public pointB: string | undefined;
  public dateTimeLocal: string = format(new Date(), 'yyyy-MM-dd\'T\'HH:mm');
  public loading: boolean = false
  private map: google.maps.Map | undefined;
  private position: GeolocationPosition | undefined;
  private directionsService: google.maps.DirectionsService | undefined;
  private directionsRenderer: google.maps.DirectionsRenderer | undefined;
  public transitStatistics: Statistics | undefined
  public carStatistics: Statistics | undefined

  @ViewChild('googleMaps') googleMaps: ElementRef | undefined;

  ngAfterViewInit() {
    this.loading = true;
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
    this.directionsRenderer = new google.maps.DirectionsRenderer();
    this.directionsRenderer.setMap(this.map!)
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
          const stats = this.calculateStatistics(response.routes[0].legs[0].departure_time!.value, response.routes[0].legs[0].arrival_time!.value)
          mode === TravelMode.TRANSIT ? this.transitStatistics = stats : this.carStatistics = stats;
          this.directionsRenderer?.setDirections(response)
          //TODO; https://github.com/explooosion/Agm-Direction/issues/46 cant just call renderer twice
        }
      })
    })
  }

  private calculateStatistics(depDate: Date, arrDate: Date,): Statistics {
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
