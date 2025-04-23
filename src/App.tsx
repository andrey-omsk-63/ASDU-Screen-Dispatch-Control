import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { mapCreate, statsaveCreate } from "./redux/actions";
import { coordinatesCreate, massfazCreate } from "./redux/actions";
import { massdkCreate } from "./redux/actions";

import Grid from "@mui/material/Grid";

import MainMapSdc from "./components/MainMapSdc";

import { MasskPoint } from "./components/SdcServiceFunctions";

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
  backlight: boolean; // подсветка запущенных светофоров
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
  backlight: false, // подсветка запущенных светофоров
  counterFaza: true, // наличие счётчика длительность фазы ДУ
  intervalFaza: 0, // Задаваемая длительность фазы ДУ (сек)
  intervalFazaDop: 0, // Увеличениение длительности фазы ДУ (сек)
};

export interface Pointer {
  ID: number;
  idevice: number;
  phSvg: Array<string | null>;
  readIt: boolean;
}

export let massDk: Pointer[] = [];

export interface Fazer {
  idx: number; // номер записи в опорном справочнике MAP
  area: number;
  id: number; // ID в системе
  faza: number;
  fazaSist: number;
  fazaSistOld: number;
  fazaZU: number; // 0 - отправлено ЖМ, ОС, ЛР или КУ (10,11,0,9)
  phases: Array<number>;
  idevice: number;
  coordinates: Array<number>;
  name: string;
  busy: boolean; // светофор занят другим пользователем
}

export let massFaz: Fazer[] = [];

export let Coordinates: Array<Array<number>> = []; // массив координат
export let debug = false;
export let WS: any = null;

let flagOpenDebug = true;
let flagOpenWS = true;
let homeRegion: string = "0";
let flagMap = false;

const App = () => {
  //=== Piece of Redux =====================================
  let massdk = useSelector((state: any) => {
    const { massdkReducer } = state;
    return massdkReducer.massdk;
  });
  let massfaz = useSelector((state: any) => {
    const { massfazReducer } = state;
    return massfazReducer.massfaz;
  });
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
      let masskPoint = MasskPoint(dateMapGl.tflight[i]);
      if (dateStat.debug) masskPoint.phSvg = dateStat.phSvg;
      massdk.push(masskPoint);
    }
    dispatch(massdkCreate(massdk));
    // достать тип отображаемых фаз на карте из LocalStorage
    if (window.localStorage.typeVert === undefined)
      window.localStorage.typeVert = 0;
    dateStat.typeVert = Number(window.localStorage.typeVert);
    // достать наличие подсветки запущенных светофоров из LocalStorage
    if (window.localStorage.backLight === undefined)
      window.localStorage.backLight = "0";
    dateStat.backlight = Number(window.localStorage.backLight) ? true : false;
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
    console.log("dateStat:", window.localStorage.counterFazaD, dateStat);
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
      dateStat.debug = debug = true;
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
          for (let j = 0; j < data.tflight.length; j++) {
            for (let i = 0; i < dateMapGl.tflight.length; i++)
              if (data.tflight[j].idevice === dateMapGl.tflight[i].idevice)
                dateMapGl.tflight[i].tlsost = data.tflight[j].tlsost;
          }
          dispatch(mapCreate(dateMapGl));
          setTrigger(!trigger);
          break;
        case "phases":
          let flagChange = 0;
          for (let j = 0; j < data.phases.length; j++) {
            for (let i = 0; i < massfaz.length; i++) {
              let mf = massfaz[i];
              if (mf.idevice === data.phases[j].device && !dateStat.demo) {
                if (mf.fazaSist !== 9 && mf.fazaSist !== data.phases[j].phase)
                  mf.fazaSistOld = JSON.parse(JSON.stringify(mf.fazaSist));
                if (mf.fazaSist !== data.phases[j].phase) flagChange++;
                mf.fazaSist = data.phases[j].phase;
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
          homeRegion = dateMapGl.tflight[0].region.num;
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
          if (data.phases) {
            for (let i = 0; i < data.phases.length; i++)
              dateStat.phSvg[i] = data.phases[i].phase;
          }
          // else {
          //   dateStat.phSvg[0] = imgFaza; // костыль
          //   dateStat.phSvg[1] = null;
          //   dateStat.phSvg[2] = imgFaza;
          //   dateStat.phSvg[3] = null;
          //   dateStat.phSvg[4] = imgFaza;
          // }

          dateStat.readyFaza = true;
          dispatch(statsaveCreate(dateStat));

          for (let i = 0; i < massdk.length; i++) {
            if (massdk[i].ID === data.pos.id) {
              massdk[i].readIt = true;
              if (data.phases) {
                if (data.phases.length) {
                  for (let j = 0; j < data.phases.length; j++)
                    massdk[i].phSvg[j] = data.phases[j].phase;
                  dispatch(massdkCreate(massdk));
                }
                break;
              }
              // else {
              //   massdk[i].phSvg[0] = imgFaza; // костыль
              //   massdk[i].phSvg[1] = null;
              //   massdk[i].phSvg[2] = imgFaza;
              //   massdk[i].phSvg[3] = null;
              //   massdk[i].phSvg[4] = imgFaza;
              // }
            }
          }
          setTrigger(!trigger);
          break;
        default:
          console.log("data_default:", data);
      }
    };
  }, [dispatch, massfaz, massdk, trigger]);

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
