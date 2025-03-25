// gesture-config.ts
import { Injectable } from '@angular/core';
import {
  HammerGestureConfig,
  HAMMER_GESTURE_CONFIG,
} from '@angular/platform-browser';

@Injectable()
export class MyHammerConfig extends HammerGestureConfig {
  override overrides = {
    swipe: {
      direction: Hammer.DIRECTION_ALL,
      velocity: 0.2,
      threshold: 10,
    },
  };
}
