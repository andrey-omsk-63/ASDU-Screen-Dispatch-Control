import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { mapCreate, statsaveCreate } from "./redux/actions";
import { coordinatesCreate, massfazCreate } from "./redux/actions";

import Grid from "@mui/material/Grid";

import MainMapSdc from "./components/MainMapSdc";
//import AppSocketError from "./AppSocketError";

import { dataMap } from "./otladkaMaps";
import { imgFaza } from "./otladkaPicFaza";

import { zoomStart } from "./components/MapConst";

import { DateMAP } from "./interfaceMAP.d";

export let dateMapGl: DateMAP;

export interface Stater {
  ws: any;
  debug: boolean;
  finish: boolean;
  demo: boolean;
  readyFaza: boolean;
  region: string;
  area: string;
  id: string;
  phSvg: Array<any>; // массив картинок фаз у светофора
  first: boolean; // флаг начального запуска на данном режиме работы
  working: boolean;
  massMem: Array<number>; // массив "запущенных" светофоров
  massСounter: Array<number>; // массив счётчиков отправки КУ на "запущенные" светофоры
  demoIdx: Array<number>;
  demoTlsost: Array<number>;
  demoLR: Array<boolean>;
  timerId: Array<any>; // массив времени отправки команд
  massInt: any[][];
  stopSwitch: Array<boolean>;
  tekDemoTlsost: Array<number>;
  needComent: boolean;
  typeVert: number; // тип отображаемых CO на карте: 0 - значки СО 1 - картинка фаз 2 - номер фаз(счётчик)
  counterFaza: boolean; // наличие счётчика длительность фазы ДУ
  intervalFaza: number; // Задаваемая длительность фазы ДУ (сек)
  intervalFazaDop: number; // Увеличениение длительности фазы ДУ (сек)
}

export let dateStat: Stater = {
  ws: null,
  debug: false,
  finish: false,
  demo: false,
  readyFaza: true,
  region: "0",
  area: "0",
  id: "0",
  phSvg: [null, null, null, null, null, null, null, null],
  first: true,
  working: false,
  massMem: [], // массив "запущенных" светофоров
  massСounter: [], // массив счётчиков отправки КУ на "запущенные" светофоры
  demoIdx: [],
  demoTlsost: [],
  demoLR: [],
  timerId: [],
  massInt: [],
  stopSwitch: [],
  tekDemoTlsost: [],
  needComent: false,
  typeVert: 0, // тип отображаемых CO на карте: 0 - значки СО 1 - картинка фаз 2 - номер фаз(счётчик)
  counterFaza: true, // наличие счётчика длительность фазы ДУ
  intervalFaza: 0, // Задаваемая длительность фазы ДУ (сек)
  intervalFazaDop: 0, // Увеличениение длительности фазы ДУ (сек)
};

export interface Fazer {
  idx: number;
  area: number;
  id: number;
  faza: number;
  fazaSist: number;
  fazaSistOld: number;
  fazaZU: number; // 0 - отправлено ЖМ, ОС, ЛР или КУ (10,11,0,9)
  phases: Array<number>;
  idevice: number;
  coordinates: Array<number>;
}

export let massFaz: Fazer[] = [];

export let Coordinates: Array<Array<number>> = []; // массив координат

let flagOpenDebug = true;
let flagOpenWS = true;
let WS: any = null;
let homeRegion: string = "0";
let flagMap = false;

const App = () => {
  //=== Piece of Redux =====================================
  let massfaz = useSelector((state: any) => {
    const { massfazReducer } = state;
    return massfazReducer.massfaz;
  });
  //console.log("APPmassfaz", massfaz);
  let coordinates = useSelector((state: any) => {
    const { coordinatesReducer } = state;
    return coordinatesReducer.coordinates;
  });
  const dispatch = useDispatch();
  //========================================================
  const Initialisation = () => {
    console.log("dateMapGl:", dateMapGl);
    for (let i = 0; i < dateMapGl.tflight.length; i++) {
      let coord = [];
      coord[0] = dateMapGl.tflight[i].points.Y;
      coord[1] = dateMapGl.tflight[i].points.X;
      Coordinates.push(coord);
    }

    // достать тип отображаемых фаз на карте из LocalStorage
    if (window.localStorage.typeVert === undefined)
      window.localStorage.typeVert = 0;
    dateStat.typeVert = Number(window.localStorage.typeVert);

    // достать наличие счётчика длительность фазы ДУ из LocalStorage
    if (window.localStorage.counterFazaD === undefined)
      window.localStorage.counterFazaD = "0";
    dateStat.counterFaza = Number(window.localStorage.counterFazaD)
      ? true
      : false;

    // достать длительность фазы ДУ из LocalStorage
    if (window.localStorage.intervalFazaD === undefined)
      window.localStorage.intervalFazaD = "0";
    dateStat.intervalFaza = Number(window.localStorage.intervalFazaD);

    // достать увеличениение длительности фазы ДУ из LocalStorage
    if (window.localStorage.intervalFazaDopD === undefined)
      window.localStorage.intervalFazaDopD = "0";
    dateStat.intervalFazaDop = !dateStat.intervalFaza
      ? 0
      : Number(window.localStorage.intervalFazaDopD);

    // достать начальный zoom Yandex-карты ДУ из LocalStorage
    if (window.localStorage.ZoomDU === undefined)
      window.localStorage.ZoomDU = zoomStart;

    // достать центр координат [0] Yandex-карты ДУ из LocalStorage
    if (window.localStorage.PointCenterDU0 === undefined)
      window.localStorage.PointCenterDU0 = 0;

    // достать центр координат [1] Yandex-карты ДУ из LocalStorage
    if (window.localStorage.PointCenterDU1 === undefined)
      window.localStorage.PointCenterDU1 = 0;

    dispatch(coordinatesCreate(coordinates));
    dispatch(statsaveCreate(dateStat));
    console.log("dateStat:",window.localStorage.counterFazaD, dateStat,);
  };

  const host =
    "wss://" +
    window.location.host +
    window.location.pathname +
    "W" +
    window.location.search;

  const [openMapInfo, setOpenMapInfo] = React.useState(false);
  const [trigger, setTrigger] = React.useState(false);
  //=== инициализация ======================================
  if (flagOpenWS) {
    WS = new WebSocket(host);
    dateStat.ws = WS;
    console.log("WS.url:", WS.url);
    if (
      WS.url.slice(0, 20) === "wss://localhost:3000" ||
      WS.url.slice(0, 27) === "wss://andrey-omsk-63.github"
    )
      dateStat.debug = true;
    dispatch(statsaveCreate(dateStat));
    flagOpenWS = false;
  }

  React.useEffect(() => {
    WS.onopen = function (event: any) {
      console.log("WS.current.onopen:", event);
    };
    WS.onclose = function (event: any) {
      console.log("WS.current.onclose:", event);
    };
    WS.onerror = function (event: any) {
      console.log("WS.current.onerror:", event);
    };
    WS.onmessage = function (event: any) {
      let allData = JSON.parse(event.data);
      let data = allData.data;
      //console.log("пришло:", allData.type, data);
      switch (allData.type) {
        case "tflight":
          //console.log("Tflight:", data, data.tflight);
          for (let j = 0; j < data.tflight.length; j++) {
            for (let i = 0; i < dateMapGl.tflight.length; i++)
              if (data.tflight[j].idevice === dateMapGl.tflight[i].idevice)
                dateMapGl.tflight[i].tlsost = data.tflight[j].tlsost;
          }
          dispatch(mapCreate(dateMapGl));
          setTrigger(!trigger);
          break;
        case "phases":
          //console.log("0PH:", data.phases, dateStat.massMem, massfaz);
          let flagChange = 0;
          for (let j = 0; j < data.phases.length; j++) {
            for (let i = 0; i < massfaz.length; i++) {
              let mf = massfaz[i];
              if (mf.idevice === data.phases[j].device && !dateStat.demo) {
                if (mf.fazaSist !== 9)
                  mf.fazaSistOld = JSON.parse(JSON.stringify(mf.fazaSist));
                mf.fazaSist = data.phases[j].phase;
                flagChange++;

                console.log("1PH:", i, mf.idevice, mf.fazaSist, mf.fazaSistOld);
              }
            }
          }
          if (flagChange) {
            dispatch(massfazCreate(massfaz));
            setTrigger(!trigger);
          }
          break;
        case "mapInfo":
          dateMapGl = JSON.parse(JSON.stringify(data));
          dispatch(mapCreate(dateMapGl));
          let massRegion = [];
          for (let key in dateMapGl.regionInfo)
            if (!isNaN(Number(key))) massRegion.push(Number(key));
          homeRegion = massRegion[0].toString();
          dateStat.region = homeRegion;
          dispatch(statsaveCreate(dateStat));
          flagMap = true;
          setTrigger(!trigger);
          break;
        case "getPhases":
          console.log("getPhases:", data);
          dateStat.area = data.pos.area;
          dateStat.id = data.pos.id.toString();
          dateStat.phSvg = Array(8).fill(null);
          if (data.phases)
            for (let i = 0; i < data.phases.length; i++)
              dateStat.phSvg[i] = data.phases[i].phase;
          dateStat.readyFaza = true;
          dispatch(statsaveCreate(dateStat));
          setTrigger(!trigger);
          break;
        default:
          console.log("data_default:", data);
      }
    };
  }, [dispatch, massfaz, trigger]);

  if (dateStat.debug && flagOpenDebug) {
    console.log("РЕЖИМ ОТЛАДКИ!!!");
    dateMapGl = JSON.parse(JSON.stringify(dataMap));
    dispatch(mapCreate(dateMapGl));
    let massRegion = [];
    for (let key in dateMapGl.regionInfo)
      if (!isNaN(Number(key))) massRegion.push(Number(key));
    homeRegion = massRegion[0].toString();
    dateStat.region = homeRegion;
    dateStat.phSvg[0] = imgFaza;
    dateStat.phSvg[1] = null;
    dateStat.phSvg[2] = imgFaza;
    dateStat.phSvg[3] = null;
    dateStat.phSvg[4] = imgFaza;
    dispatch(statsaveCreate(dateStat));
    flagMap = true;
    flagOpenDebug = false;
  }

  if (flagMap && !flagOpenWS) {
    Initialisation();
    flagMap = false;
    setOpenMapInfo(true);
  }

  return (
    <Grid container sx={{ height: "100vh", width: "100%", bgcolor: "#E9F5D8" }}>
      <Grid item xs>
        {openMapInfo && <MainMapSdc trigger={trigger} />}
      </Grid>
    </Grid>
  );
};

export default App;
