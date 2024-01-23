import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { massfazCreate,statsaveCreate } from "../redux/actions";

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

import { SendSocketGetPhases } from "./SdcSocketFunctions";
import { SendSocketDispatch } from "./SdcSocketFunctions";

import { MyYandexKey } from "./MapConst";

import { searchControl } from "./MainMapStyle";

let flagOpen = false;
const zoomStart = 10;
let zoom = zoomStart;
let pointCenter: any = 0;
let newCenter: any = [];
let funcBound: any = null;

let soobErr = "";

let control = false;
let present = -1;

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
  const DEMO = datestat.demo;
  const dispatch = useDispatch();
  //===========================================================
  //const [control, setControl] = React.useState(false);
  const [idxObj, setIdxObj] = React.useState(-1);
  const [flagCenter, setFlagCenter] = React.useState(false);
  const [demoSost, setDemoSost] = React.useState(-1);
  const [openSetErr, setOpenSetErr] = React.useState(false);
  const [ymaps, setYmaps] = React.useState<YMapsApi | null>(null);
  const mapp = React.useRef<any>(null);

  const OnPlacemarkClickPoint = (index: number) => {
    console.log("OnPlacemarkClickPoint:", index, datestat.working);
    if (!datestat.working) {
      let area = map.tflight[index].area.num;
      let id = map.tflight[index].ID;
      datestat.area = area;
      datestat.id = id;
      if (!debug) datestat.phSvg = Array(8).fill(null);
      SendSocketGetPhases(debug, ws, homeRegion, area, id);
      dispatch(statsaveCreate(datestat));
      //setControl(true);
      control = true;
      setIdxObj(index);
    } else {
      soobErr = "В данный момент происходит управление другим перекрёстком";
      setOpenSetErr(true);
    }
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
            />
          ))}
      </>
    );
  };

  const InstanceRefDo = (ref: React.Ref<any>) => {
    if (ref) {
      mapp.current = ref;
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
        datestat.finish = false;
        datestat.demo = false;
        dispatch(statsaveCreate(datestat));
        break;
      case 62: // режим Демо
        datestat.finish = false;
        datestat.demo = true;
        dispatch(statsaveCreate(datestat));
        break;
      case 63: // Косяк при работе с меню
        soobErr = "Завершите предыдущий режим нормальным образом";
        setOpenSetErr(true);
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
    flagOpen = true;
  }
  //========================================================
  const DoTimerId = () => {
    let ch = 0; // проверка массива timerId на заполненость
    for (let i = 0; i < datestat.timerId.length; i++)
      if (datestat.timerId[i] !== null) ch++;
    !ch && console.log("Нет запущенных светофоров!!!");
    if (!ch) return;

    let mass = JSON.parse(JSON.stringify(datestat.timerId));
    for (let i = 0; i < datestat.timerId.length; i++)
      mass.push(datestat.timerId[i]);
    let begin = mass.indexOf(present);
    if (begin < 0) begin = 0; // первый проход
    for (let i = 0; i < mass.length; i++) {
      present++;
      if (mass[present] !== null) {
        if (present >= mass.length / 2) present = present - mass.length / 2;
        break;
      }
    }
    console.log("!!!!!!:", present, mass[present], mass);

    let mF = massfaz[present];
    console.log(
      "Отправка с",
      mF,
      present,
      datestat.timerId[present],
      datestat.timerId
    );
    console.log("datestat:", datestat.stopSwitch, datestat);

    if (!DEMO) {
      SendSocketDispatch(debug, ws, mF.idevice, 9, mF.faza);
    } else {
      datestat.demoTlsost[present] = 1;
      if (!datestat.stopSwitch[present]) {
        mF.fazaSist = mF.fazaSist === 2 ? 1 : 2;
      } else {
        mF.fazaSist = mF.faza;
      }
      dispatch(massfazCreate(massfaz));
      //needRend = true;
      //setFlagPusk(!flagPusk);
    }

    if (DEMO && mF.faza < 9 && mF.faza > 0) datestat.demoTlsost[present] = 2; // Передана фаза
    
    if (DEMO) {
      if ((!mF.fazaSist && !mF.faza) || (mF.fazaSist === 9 && mF.faza === 9)) {
        console.log("DEMO ЛР или КУ");
        if (!mF.fazaSist && !mF.faza) datestat.demoTlsost[present] = 5; // ЛР
        if (mF.fazaSist === 9 && mF.faza === 9)
          datestat.demoTlsost[present] = 1; // КУ
        mF.fazaSist = 1;
        dispatch(massfazCreate(massfaz));
        datestat.stopSwitch[present] = false;
        dispatch(statsaveCreate(datestat));
      }
    }

    // if (datestat.timerId[nomInMass] === null) {
    //   datestat.timerId[nomInMass] = setInterval(
    //     () => DoTimerId(nomInMass, timerId[nomInMass]),
    //     timer
    //   );
    //   massInt.push(timerId[nomInMass]);
    // }

    if ((DEMO && mF.fazaSist === 10) || (DEMO && mF.fazaSist === 11)) {
      console.log("DEMO ЖМ или ОС");
      if (mF.fazaSist === 10) datestat.demoTlsost[present] = 7; // ЖМ
      if (mF.fazaSist === 11) datestat.demoTlsost[present] = 12; // ОС
    } else {
      if (!DEMO && mF.faza && mF.faza !== 9) {
        for (let i = 0; i < datestat.massInt.length - 1; i++) {
          if (datestat.massInt[present][i]) {
            clearInterval(datestat.massInt[present][i]);
            datestat.massInt[present][i] = null;
          }
        }

        console.log("$$$$$$:", present, datestat.massInt);

        // datestat.massInt[present] = datestat.massInt[present].filter(function (el: any) {
        //   return el !== null;
        // });
      }
    }

    //if (DEMO) {
      
      if (datestat.tekDemoTlsost[present] !== datestat.demoTlsost[present]) {
        if (datestat.demoLR[present]) {
          //props.change(5);
          datestat.tekDemoTlsost[present] = 5;
        } else {
          //props.change(datestat.demoTlsost[present]);
          datestat.tekDemoTlsost[present] = datestat.demoTlsost[present];
        }
      }
      dispatch(statsaveCreate(datestat));
    //}
  };
  //========================================================
  let mapState: any = {
    center: pointCenter,
    zoom,
  };

  const ChangeDemoSost = (mode: number) => setDemoSost(mode + demoSost); // костыль

  const SetControl = (mode: any) => {
    console.log("SETCONTROL:", mode);
    //setControl(mode)
    control = false;
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
                      interval={DoTimerId}
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
