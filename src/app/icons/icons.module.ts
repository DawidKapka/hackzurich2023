import { NgModule } from '@angular/core';
import {ThumbsDown, ArrowLeft, ArrowRight, Clock, DollarSign, Smile, Frown} from "angular-feather/icons";
import {FeatherModule} from "angular-feather";

const icons = {
  ThumbsDown,
  ArrowLeft,
  ArrowRight,
  Clock,
  DollarSign,
  Smile,
  Frown
};

@NgModule({
  imports: [
    FeatherModule.pick(icons)
  ],
  exports: [
    FeatherModule
  ]
})
export class IconsModule { }
