declare module Outreach {

    class LayerOptions {
        show: boolean;
        hue: number;
        saturation: number;
        gamma: number;
    }

    class Color {
        r: number;
        g: number;
        b: number;
        a: number;
    }

    class Style {
        stroke: Cesium.Color;
        fill: Cesium.Color;
        strokeWidth: number;
        markerSymbol: string;
    }

    class Location {
        lat: number;
        lon: number;
        height: number;
    }

    class Orientation {
        heading: number;
        pitch: number;
        roll: number;
    }

    class BFT {
        
    }

}
