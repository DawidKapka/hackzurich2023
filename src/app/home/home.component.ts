import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import DirectionsStatus = google.maps.DirectionsStatus;
import {format} from "date-fns";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit{

  public pointA: string | undefined;
  public pointB: string | undefined;
  public dateTimeLocal: string = format(new Date(), 'yyyy-MM-dd\'T\'HH:mm');
  public loading: boolean = false
  private map: google.maps.Map | undefined;
  private position: GeolocationPosition | undefined;
  private directionsService: google.maps.DirectionsService | undefined;
  private directionsRenderer: google.maps.DirectionsRenderer | undefined;

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
        const positionMarker: google.maps.Marker = new google.maps.Marker({ position: coordinates, map: this.map})
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
    const request: google.maps.DirectionsRequest = {
        origin: pointA,
        destination: pointB,
        travelMode: google.maps.TravelMode.TRANSIT,
        transitOptions: {
          departureTime: new Date(datetime)
        }
    }
    this.directionsService!.route(request, (response, status) => {
      if (status === DirectionsStatus.OK && response) {
        this.directionsRenderer?.setDirections(response)
      }
    })
  }
}
