import {
  MAP_CREATE,
  STATSAVE_CREATE,
  COORDINATES_CREATE,
  MASSFAZ_CREATE,
} from "./types";

import { DateMAP } from "./../interfaceMAP.d";
import { Stater, Fazer } from "./../App";
//import { Fazer } from "./../App";

export function massfazCreate(massFaza: Fazer[] = []) {
  return {
    type: MASSFAZ_CREATE,
    data: massFaza,
  };
}

export function mapCreate(dateMap: DateMAP) {
  return {
    type: MAP_CREATE,
    data: { dateMap },
  };
}

export function statsaveCreate(dateStat: Stater) {
  return {
    type: STATSAVE_CREATE,
    data: dateStat,
  };
}

export function coordinatesCreate(Coordinates: Array<Array<number>>) {
  return {
    type: COORDINATES_CREATE,
    data: Coordinates,
  };
}
