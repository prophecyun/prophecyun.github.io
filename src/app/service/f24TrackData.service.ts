import { Injectable } from '@angular/core';
// import { CesiumService } from '../service/cesium.service';
import { AppConfig } from '../config/app.config';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class F24TrackDataService {


  constructor(private appConfig: AppConfig, private http: HttpClient) {
  }

  updateTracks(dataSource) {
    this.getTrackUpdateFromServer()
      .subscribe((data) => {
        const tracks = data;
        for (let i = 0; i < Object.keys(data).length; i += 1) {
          const key = Object.keys(data)[i];
          if (key === 'full_count' || key === 'version') {
            // ignore
          } else {
            const bfPoint = tracks[key];
            this.plotTrack(dataSource, bfPoint, key);
          }
        }
      });
  }

  private getTrackUpdateFromServer() {
    return this.http.get(this.appConfig.F24_URL + this.appConfig.BOUNDS + this.appConfig.OPTIONS);
  }

  handleSelectedTrack(dataSource: Cesium.DataSource, selectedTrackF24Id) {
    // const xmlHttp = new XMLHttpRequest(); 
    // xmlHttp.open("GET", this.appConfig.F24_SELECTED_FLIGHT_URL + selectedTrackF24Id, true);
    // xmlHttp.send(null);     
    //   xmlHttp.onreadystatechange = () => {
    //     if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
    //       // console.log(xmlHttp.responseText);
    //       if (xmlHttp.responseText == "Not found") {
    //       }
    //       else {
    //         console.log('result', xmlHttp.responseText.valueOf());
    //       }
    //     }
    //   };
    // }

    this.getSelectedTrackFromServer(selectedTrackF24Id).subscribe(
      (res: any) => {
        console.log(res);
        this.plotTrail(dataSource, res.trail);
      },
      (err) => {
        console.log('Error occured', err);
      });
  }

  private getSelectedTrackFromServer(selectedTrackF24Id) {
    return this.http.get(this.appConfig.F24_SELECTED_FLIGHT_URL + selectedTrackF24Id);
  }

  private plotTrack(dataSource: Cesium.DataSource, trackRaw: any, key: any) {
    if (trackRaw) {
      const track = {
        f24id: key,
        id: trackRaw[0],
        lat: trackRaw[1],
        lon: trackRaw[2],
        heading: trackRaw[3],
        alt: trackRaw[4],
        speed: trackRaw[5],
        unknown6: trackRaw[6],
        unknown7: trackRaw[7],
        aircraft: trackRaw[8],
        source: trackRaw[11],
        dest: trackRaw[12],
        callsign: trackRaw[13],
      };

      if (track.lat != null && track.lon != null) {
        // check if entity exists, if true, set entity show label value to that of previous entity
        const showLabel = true;
        let newEntity: any = dataSource.entities.getById(track.id);
        if (newEntity) {
        } else {
          newEntity = dataSource.entities.getOrCreateEntity(track.id);
        }

        newEntity.name = track.id;
        const trackRotationInRadian = (360 - track.heading) * Math.PI / 180;
        newEntity.position = new Cesium.ConstantPositionProperty(
          Cesium.Cartesian3.fromDegrees(track.lon, track.lat, 1),
        );
        newEntity.billboard = new Cesium.BillboardGraphics({
          image: new Cesium.ConstantProperty('../../assets/icons/aircraft.png'),
          height: 30,
          width: 30,
          pixelOffset: new Cesium.Cartesian2(15, 0),
          // translucencyByDistance: new Cesium.NearFarScalar(0.5e4, 1.0, 0.5e4, 0.0),
          color: Cesium.Color.BLUE,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
        });
        newEntity.billboard.rotation = trackRotationInRadian;
        // Custom properties
        newEntity.type = 'Air Track'; // Used as dialog header and to identify that its a Non-Editable entity in
        // 'cesium.service'
        newEntity.data = [
          {
            label: 'F24Id',
            content: track.f24id,
          }, {
            label: 'Id',
            content: track.id,
          },
          {
            label: 'Callsign',
            content: track.callsign,
          },
          {
            label: 'Lat',
            content: track.lat,
          },
          {
            label: 'Lon',
            content: track.lon,
          },
          {
            label: 'Heading',
            content: track.heading,
          },
          {
            label: 'Speed',
            content: track.speed,
          },
          {
            label: 'Aircraft',
            content: track.aircraft,
          },
          {
            label: 'Source',
            content: track.source,
          },
          {
            label: 'Destination',
            content: track.dest,
          },
        ];
      }
    }
  }

  private plotTrail(dataSource: Cesium.DataSource, trailPoints: any[]) {
    // Draw polyline entity
    // console.log('trail points', trailPoints);
    var trailPositions: Cesium.Cartesian3[] = [];
    for (let i = 0; i < trailPoints.length; i += 1) {
      const iLat = trailPoints[i].lat;
      const iLon = trailPoints[i].lng;
      const iTime = trailPoints[i].ts;
      const iAlt = trailPoints[i].alt;

      const iPosition = Cesium.Cartesian3.fromDegrees(iLon, iLat, iAlt);
      trailPositions.push(iPosition);
    }
    // console.log('trail positions', trailPositions);
    const trailId = 'trail';
    var polylineEntity = dataSource.entities.getById(trailId);
    if (polylineEntity) {
      // update
    } else {
      // create
      polylineEntity = dataSource.entities.getOrCreateEntity(trailId);
    }    
    polylineEntity.polyline = new Cesium.PolylineGraphics({
      positions: trailPositions,
      material: Cesium.Color.RED,
      width: 3,
    });
  }

  removeTrail(dataSource: Cesium.DataSource) {
    dataSource.entities.removeById('trail');
    // var polylineEntity = dataSource.entities.getById('trail');
    // if (polylineEntity) {
    //   // remove
    //   dataSource.entities.removeById('trail');
    // }
  }
}
