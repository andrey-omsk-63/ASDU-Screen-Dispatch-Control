import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { massfazCreate, statsaveCreate } from "../redux/actions";

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

import { YMaps, Map, FullscreenControl } from "react-yandex-maps";
import { GeolocationControl, YMapsApi } from "react-yandex-maps";
import { RulerControl, SearchControl } from "react-yandex-maps";
import { TrafficControl, TypeSelector, ZoomControl } from "react-yandex-maps";

import SdcDoPlacemarkDo from "./SdcComponents/SdcDoPlacemarkDo";
import SdcControlVertex from "./SdcComponents/SdcControlVertex";
import SdcErrorMessage from "./SdcComponents/SdcErrorMessage";

import { StrokaMenuGlob, CenterCoord } from "./SdcServiceFunctions";
import { CloseInterval, Distance } from "./SdcServiceFunctions";

import { SendSocketGetPhases } from "./SdcSocketFunctions";

import { SendSocketDispatch } from "./SdcSocketFunctions";

import { MyYandexKey, Restart, Aura } from "./MapConst";

import { searchControl } from "./MainMapStyle";

export let DEMO = false;

let flagOpen = false;
const zoomStart = 10;
let zoom = zoomStart;
let pointCenter: any = 0;
let newCenter: any = [];
let funcBound: any = null;
let funcContex: any = null;

let soobErr = "";
let idxObj = -1;
let clicker = 0;
let INT: Array<any> = [];

const MainMapSdc = (props: { trigger: boolean }) => {
  //== Piece of Redux =======================================
  const map = useSelector((state: any) => {
    const { mapReducer } = state;
    return mapReducer.map.dateMap;
  });
  let coordinates = useSelector((state: any) => {
    const { coordinatesReducer } = state;
    return coordinatesReducer.coordinates;
  });
  let massfaz = useSelector((state: any) => {
    const { massfazReducer } = state;
    return massfazReducer.massfaz;
  });
  let datestat = useSelector((state: any) => {
    const { statsaveReducer } = state;
    return statsaveReducer.datestat;
  });
  const debug = datestat.debug;
  const ws = datestat.ws;
  const homeRegion = datestat.region;
  DEMO = datestat.demo;
  const dispatch = useDispatch();
  //===========================================================
  const [control, setControl] = React.useState(false);
  const [flagCenter, setFlagCenter] = React.useState(false);
  const [demoSost, setDemoSost] = React.useState(-1);
  const [openSetErr, setOpenSetErr] = React.useState(false);
  const [click, setClick] = React.useState(false);
  const [clicka, setClicka] = React.useState(-1);
  const [ymaps, setYmaps] = React.useState<YMapsApi | null>(null);
  const mapp = React.useRef<any>(null);

  const StatusQuo = (mode: boolean) => {
    for (let i = 0; i < datestat.timerId.length; i++) {
      if (!DEMO && datestat.timerId[i] !== null) {
        SendSocketDispatch(debug, ws, massfaz[i].idevice, 9, 9); // КУ
        SendSocketDispatch(debug, ws, massfaz[i].idevice, 4, 0); // закрытие id
      }
      mode && CloseInterval(datestat, i);
    }
    if (mode) {
      clearInterval(INT[0]);
      datestat.timerId = [];
      datestat.massInt = [];
      datestat.first = true;
      datestat.working = false;
      datestat.massMem = []; // массив "запущенных" светофоров
      datestat.massСounter.splice(0, datestat.massСounter.length);
      //datestat.massСounter = [], // массив счётчиков отправки КУ на "запущенные" светофоры
      datestat.demoIdx = [];
      datestat.demoTlsost = [];
      datestat.demoLR = [];
      datestat.stopSwitch = [];
      datestat.tekDemoTlsost = [];
      dispatch(statsaveCreate(datestat));
      massfaz = [];
      dispatch(massfazCreate(massfaz));
      INT[0] = setInterval(() => DoTimerRestart(), Restart); // запуск счетчиков отправки КУ
    }
  };

  const OnPlacemarkClickPoint = (index: number) => {
    if (!datestat.working) {
      let nomIn = datestat.massMem.indexOf(index); // запускался ли светофор ранее?
      if (nomIn >= 0) {
        // ранее запускался
        if (window.localStorage.interval === undefined)
          window.localStorage.interval = 0;
        let INTERVAL = Number(window.localStorage.interval);
        if (datestat.massСounter[nomIn] > 0 && INTERVAL) {
          datestat.massСounter[nomIn] = INTERVAL; // перезапуск счётчика
          dispatch(statsaveCreate(datestat));
          return;
        }
      }
      let area = map.tflight[index].area.num;
      let id = map.tflight[index].ID;
      datestat.area = area;
      datestat.id = id;
      if (!debug) datestat.phSvg = Array(8).fill(null);
      SendSocketGetPhases(debug, ws, homeRegion, area, id);
      dispatch(statsaveCreate(datestat));
      idxObj = index;
      setControl(true);
    } else {
      soobErr = "В данный момент происходит управление другим перекрёстком";
      setOpenSetErr(true);
    }
    setClick(!click);
  };
  //=== вывод светофоров ===================================
  const PlacemarkDo = () => {
    return (
      <>
        {flagOpen &&
          coordinates.map((coordinate: any, idx: any) => (
            <SdcDoPlacemarkDo
              key={idx}
              ymaps={ymaps}
              coordinate={coordinate}
              idx={idx}
              OnPlacemarkClickPoint={OnPlacemarkClickPoint}
              click={click}
            />
          ))}
      </>
    );
  };
  //=== обработка instanceRef ==============================
  const FindNearVertex = (coord: Array<number>) => {
    let nomInMass = -1;
    let minDist = 999999;
    //console.log("000Нажали", datestat.massMem, datestat.massСounter);
    for (let i = 0; i < datestat.massMem.length; i++) {
      if (datestat.massMem[i] >= 0) {
        let corFromMap = [massfaz[i].coordinates[0], massfaz[i].coordinates[1]];
        let dister = Distance(coord, corFromMap);
        //console.log("111Нажали на светофор", i, dister, coord, massfaz);
        if (dister <= Aura && minDist > dister) {
          // нажали правой кнопкой на светофор
          minDist = dister;
          nomInMass = i;
        }
      }
    }
    if (nomInMass >= 0) {
      console.log("Нажали правой кнопкой на светофор", nomInMass);
      datestat.massСounter[nomInMass] = 1;
      dispatch(statsaveCreate(datestat));
    }
  };

  const InstanceRefDo = (ref: React.Ref<any>) => {
    if (ref) {
      mapp.current = ref;
      //=== правая кнопка =========
      mapp.current.events.remove("contextmenu", funcContex);
      funcContex = function (e: any) {
        if (mapp.current.hint && !datestat.working)
          FindNearVertex(e.get("coords")); // нажата правая кнопка мыши
      };
      mapp.current.events.add("contextmenu", funcContex);
      //=== колёсико мыши =========
      mapp.current.events.remove("boundschange", funcBound);
      funcBound = function () {
        pointCenter = mapp.current.getCenter();
        zoom = mapp.current.getZoom(); // покрутили колёсико мыши
      };
      mapp.current.events.add("boundschange", funcBound);
      if (flagCenter) {
        pointCenter = newCenter;
        setFlagCenter(false);
      }
    }
  };

  const PressButton = (mode: number) => {
    switch (mode) {
      case 61: // режим управления
        StatusQuo(true);
        datestat.finish = false;
        datestat.demo = false;
        dispatch(statsaveCreate(datestat));
        DEMO = false;
        break;
      case 62: // режим Демо
        StatusQuo(true);
        datestat.finish = false;
        datestat.demo = true;
        dispatch(statsaveCreate(datestat));
        DEMO = true;
        break;
      case 63: // Косяк при работе с меню
        soobErr = "Завершите предыдущий режим нормальным образом";
        setOpenSetErr(true);
    }
  };
  //=== Функции - обработчики ==============================
  const RandomNumber = (min: number, max: number) => {
    let rand = Math.random() * (max - min) + min;
    return Math.floor(rand);
  };

  const ChangeDemoSost = (mode: number) => {
    setDemoSost(RandomNumber(1, 1000) + demoSost); // костыль
  };

  const SetControl = (mode: any) => {
    //console.log("SETCONTROL:", mode);
    setControl(mode);
  };

  const DoTimerRestart = () => {
    let have = 0;
    datestat.needComent = false;
    for (let i = 0; i < datestat.massСounter.length; i++) {
      if (!datestat.massСounter[i]) {
        // смена номерной фазы на ЖМ, ОС или ЛР
        have++;
        datestat.massСounter[i]--;
      }
      if (datestat.massСounter[i] > 0) {
        have++;
        datestat.massСounter[i]--;
        if (!datestat.massСounter[i]) {
          let mF = massfaz[i];
          !DEMO && SendSocketDispatch(debug, ws, mF.idevice, 9, 9);
          massfaz[i].faza = 9;
          datestat.massMem[i] = -1;
          dispatch(massfazCreate(massfaz));
          !DEMO && SendSocketDispatch(debug, ws, mF.idevice, 4, 0);
          CloseInterval(datestat, i);
          datestat.massСounter[i]--;
        } else datestat.needComent = true;
      }
    }
    dispatch(statsaveCreate(datestat));
    let soob = datestat.needComent ? 'нужен' : 'не нужен'
    console.log('Коментарий',soob)
    if (have) {
      clicker++;
      setClicka(clicker);
    }
  };
  //=== инициализация ======================================
  if (!flagOpen && Object.keys(map.tflight).length) {
    pointCenter = CenterCoord(
      map.boxPoint.point0.Y,
      map.boxPoint.point0.X,
      map.boxPoint.point1.Y,
      map.boxPoint.point1.X
    );
    INT[0] = setInterval(() => DoTimerRestart(), Restart); // запуск счетчиков отправки КУ
    flagOpen = true;
    clicker = clicka; // костылик
  }
  //=== Закрытие или перезапуск вкладки ====================
  React.useEffect(() => {
    window.addEventListener("beforeunload", alertUser);
    window.addEventListener("unload", handleTabClosing);

    return () => {
      window.removeEventListener("beforeunload", alertUser);
      window.removeEventListener("unload", handleTabClosing);
    };
  });

  const handleTabClosing = () => {
    console.log("3пришло:");
    removePlayerFromGame();
  };

  const alertUser = (event: any) => {
    console.log("2пришло:", event);
    // ev = JSON.parse(JSON.stringify(event));
    StatusQuo(false);
    //  event.preventDefault();
    //  event.returnValue = "";
  };

  function removePlayerFromGame() {
    throw new Error("Function not implemented.");
  }
  //========================================================
  let mapState: any = {
    center: pointCenter,
    zoom,
  };

  return (
    <Grid container sx={{ height: "99.9vh" }}>
      <Grid item xs={12}>
        {/* главное меню */}
        <Box>{StrokaMenuGlob(PressButton, datestat.working)}</Box>
        {/* Яндекс карта */}
        <Grid container sx={{ height: "96.9vh" }}>
          <Grid item xs>
            {Object.keys(map.tflight).length && (
              <YMaps query={{ apikey: MyYandexKey, lang: "ru_RU" }}>
                <Map
                  modules={["templateLayoutFactory"]}
                  state={mapState}
                  instanceRef={(ref) => InstanceRefDo(ref)}
                  onLoad={(ref) => {
                    ref && setYmaps(ref);
                  }}
                  width={"99.9%"}
                  height={"99.9%"}
                >
                  {/* сервисы Яндекса */}
                  <FullscreenControl />
                  <GeolocationControl options={{ float: "left" }} />
                  <RulerControl options={{ float: "right" }} />
                  <SearchControl options={searchControl} />
                  <TrafficControl options={{ float: "right" }} />
                  <TypeSelector options={{ float: "right" }} />
                  <ZoomControl options={{ float: "right" }} />
                  {/* служебные компоненты */}
                  <PlacemarkDo />
                  {control && datestat.readyFaza && (
                    <SdcControlVertex
                      setOpen={SetControl}
                      idx={idxObj}
                      trigger={props.trigger}
                      change={ChangeDemoSost}
                    />
                  )}
                  {openSetErr && (
                    <SdcErrorMessage setOpen={setOpenSetErr} sErr={soobErr} />
                  )}
                </Map>
              </YMaps>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default MainMapSdc;
