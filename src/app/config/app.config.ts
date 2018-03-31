import { Injectable } from '@angular/core';
import { IconConfig } from './icon.config';

/**
 * Configuration for IOC client application.
 */
@Injectable()
export class AppConfig {

  // SG_BOUNDARY_VECTOR_URL = 'assets/data/SG.geojson';
  FIR_VECTOR_URL = 'assets/data/FIR_ICAO_2009.geojson'; //FIR_ICAO_2009
  RUNWAYS_URL = 'assets/data/runway_l.geojson';
  AIRWAY_URL = 'assets/data/airways_sg.geojson';
  RESTRICTED_AIRSPACE_URL = 'assets/overlays/drone_full.geojson';
  // RESTRICTED_AIRSPACE_URL = '../data/geojson/restrictedAirspace_A.geojson';
  F24_URL = 'https://data-live.flightradar24.com/zones/fcgi/feed.js?';
  BOUNDS = 'bounds=38.67,-14.82,67.30,136.67';
  OPTIONS = '&faa=1&mlat=1&flarm=1&adsb=1&gnd=1&air=1&vehicles=1&estimated=1';
  
  LAYER_NAMES = {
    airTrackLayerName: 'Air Track',
    firLayerName: 'FIR',
    airwayLayerName: 'Airway',
    runwayLayerName: 'Runway',
    droneRestrictionLayerName: 'Drone Restricted Zone',
  };

  constructor(private iconConfig: IconConfig) {
  }

  setBounds(lat1, lat2, lon1, lon2) {
    this.BOUNDS = 'bounds=' + lat1 + ',' + lat2 + ',' + lon1 + ',' + lon2;
    // console.log('update Bounds', this.BOUNDS);
  }

  isNonEditableEntity(pickedEntityType): boolean {
    const keys = Object.keys(this.LAYER_NAMES);
    for (let i = 0; i < keys.length; i += 1) {
      const layerName = this.LAYER_NAMES[keys[i]];
      // if (layerName !== this.LAYER_NAMES.firLayerName)
      if (pickedEntityType.startsWith(layerName)) {
        return true;
      }
    }
    return false;
  }

  isNonPickableEntity(pickedEntityType): boolean {
    return pickedEntityType.startsWith(this.LAYER_NAMES.firLayerName);
  }
}
