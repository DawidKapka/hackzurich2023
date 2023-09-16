import { NgModule } from '@angular/core';
import {ThumbsDown, ArrowLeft, ArrowRight, Clock, DollarSign, Smile, Frown, Crosshair, X} from "angular-feather/icons";
import {FeatherModule} from "angular-feather";

const icons = {
  ThumbsDown,
  ArrowLeft,
  ArrowRight,
  Clock,
  DollarSign,
  Smile,
  Frown,
  Crosshair,
  X
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
