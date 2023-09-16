import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {format, formatDistance, formatRelative, parseISO, subDays} from 'date-fns'
import {HttpClient} from "@angular/common/http";
import {da} from "date-fns/locale";



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'hackzurich2023';

  constructor() {
  }

}
