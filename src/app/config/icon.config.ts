import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Configuration for Material Icons.
 */
@Injectable()
export class IconConfig {

  constructor(private iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    this.registerIcons(iconRegistry, sanitizer);
  }

  /**
   * Registers the material design icon set.
   *
   * @param iconRegistry Registry of material icons
   * @param sanitizer Sanitizer to trust insecure url resources
   */
  registerIcons(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer): void {
    this.iconRegistry
      .addSvgIcon(
        'incident',
        sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/solid/incident-white.svg'))
      .addSvgIcon(
        'calendar',
        sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/solid/calendar-white.svg'))
      .addSvgIcon(
        'opslog',
        sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/solid/opslog-white.svg'))
      .addSvgIcon(
        'map',
        sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/solid/map-alt-white.svg'))
      .addSvgIcon(
        'plus',
        sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/solid/plus-white.svg'))
      .addSvgIcon(
        'marker',
        sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/solid/map-marker-alt-white.svg'))
      .addSvgIcon(
        'user',
        sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/solid/users.svg'));
  }

}
