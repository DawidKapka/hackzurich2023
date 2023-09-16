import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import DirectionsStatus = google.maps.DirectionsStatus;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit{

  private map: google.maps.Map | undefined;
  private position: GeolocationPosition | undefined;

  @ViewChild('googleMaps') googleMaps: ElementRef | undefined;

  ngAfterViewInit() {
    this.initGoogleMaps().then(() => {
      setTimeout(() => {
        this.initDirections()
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
    const directionsService: google.maps.DirectionsService = new google.maps.DirectionsService()
    const directionsRenderer: google.maps.DirectionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(this.map!)
    this.calculateRoute(directionsService).then(route => {
      console.log(route);
      if (route) {
        directionsRenderer.setDirections(route)
      }
    });
  }

  private calculateRoute(directionsService: google.maps.DirectionsService) {
    return new Promise<google.maps.DirectionsResult | null>((resolve) => {
      const request: google.maps.DirectionsRequest = {
        origin: new google.maps.LatLng(this.position!.coords.latitude, this.position!.coords.longitude),
        destination: 'Luzern',
        travelMode: google.maps.TravelMode.TRANSIT,
        transitOptions: {
          departureTime: new Date('2023-09-16T03:00:00')
        }
      }
      directionsService.route(request, (response, status) => {
        if (status === DirectionsStatus.OK) {
          resolve(response)
        }
      })
    })
  }
}
