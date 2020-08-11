declare module 'utm' {
  function fromLatLon(latitude: number, longitude: number, forceZoneNum?: number): { 
    easting: number,
    northing: number,
    zoneNum: number,
    zoneLetter: string
  }

  function toLatLon(easting: number, northing: number, zoneNum: number, zoneLetter?: string, northern?: boolean, strict?: boolean): { latitude: number, longitude: number }
}