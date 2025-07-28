import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { massfazCreate, statsaveCreate } from "../redux/actions";

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

import { YMaps, Map, YMapsApi } from "react-yandex-maps";

import SdcDoPlacemarkDo from "./SdcComponents/SdcDoPlacemarkDo";
import SdcControlVertex from "./SdcComponents/SdcControlVertex";
import SdcErrorMessage from "./SdcComponents/SdcErrorMessage";
import SdcSetup from "./SdcComponents/SdcSetup";
import SdcFragments from "./SdcComponents/SdcFragments";
import SdsServisTable from "./SdcComponents/SdsServisTable";

import { StrokaMenuGlob, CenterCoordBegin } from "./SdcServiceFunctions";
import { CloseInterval, Distance, YandexServices } from "./SdcServiceFunctions";
import { SaveZoom, HaveActivеVert, DrawCircle } from "./SdcServiceFunctions";
import { CompareArrays, UseFragments } from "./SdcServiceFunctions";
import { RandomNumber } from "./SdcServiceFunctions";

import { SendSocketGetPhases } from "./SdcSocketFunctions";
import { SendSocketDispatch } from "./SdcSocketFunctions";

import { YMapsModul, MyYandexKey, Restart, Aura, zoomStart } from "./MapConst";
import { GoodCODE, BadCODE } from "./MapConst";

import { styleHelpMain, styleServisTable } from "./MainMapStyle";

export let DEMO = false; // режим Демо

let flagOpen = false;
let zoom = zoomStart;
let zoomOld = 0;
let pointCenter: any = 0;
let funcBound: any = null;
let funcContex: any = null;
let soobErr = "";
let idxObj = -1;
let clicker = 0;
let INT: Array<any> = [];
let massMemOld: Array<number> = [];
let needDrawCircle = false; // нужно перерисовать окружности вокруг светофора

const colerCommentMain = "#E6761B"; // оранж
let colerComment = "";
let helpComment = "";
const resetCounter1 =
  "Нажатием правой кнопкой мыши на счётчик можно его сбросить";
const resetCounter2 =
  "Нажатием правой кнопкой на метку светофора можно сбросить счётчик";

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
  let massdk = useSelector((state: any) => {
    const { massdkReducer } = state;
    return massdkReducer.massdk;
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
  const homeRegion = datestat.region;
  DEMO = datestat.demo;
  const typeVert = datestat.typeVert; // тип отображаемых CO на карте: 0 - значки СО 1 - картинка фаз 2 - номер фаз(счётчик)
  const backlight = datestat.backlight; // подсветка запущенных светофоров
  const dispatch = useDispatch();
  //===========================================================
  const [control, setControl] = React.useState(false);
  const [demoSost, setDemoSost] = React.useState(-1);
  const [needSetup, setNeedSetup] = React.useState(false);
  const [fragments, setFragments] = React.useState(false);
  const [openSetErr, setOpenSetErr] = React.useState(false);
  const [click, setClick] = React.useState(false);
  const [clicka, setClicka] = React.useState(-1);
  const [trigger, setTrigger] = React.useState(false);
  const [ymaps, setYmaps] = React.useState<YMapsApi | null>(null);
  const mapp = React.useRef<any>(null);

  const StatusQuo = (mode: boolean) => {
    for (let i = 0; i < datestat.timerId.length; i++) {
      let mf = massfaz[i];
      if (!DEMO && datestat.timerId[i] !== null && mf.idevice > 0 && !mf.busy) {
        SendSocketDispatch(massfaz[i].idevice, 9, 9); // КУ
        SendSocketDispatch(massfaz[i].idevice, 4, 0); // закрытие id
      }
      mode && CloseInterval(datestat, i);
    }
    if (mode) {
      clearInterval(INT[0]);
      datestat.timerId = [];
      datestat.massInt = [];
      datestat.first = true;
      datestat.working = false;
      datestat.massMem = []; // массив "запущенных"
      massMemOld = [];
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
      mapp.current.geoObjects.removeAll(); // удаление старой коллекции связей и окружностей
      needDrawCircle = true; // нужно перерисовать окружности вокруг светофора
    }
  };

  const SetFragments = (idx: number) => {
    UseFragments(ymaps, mapp, map, idx);
    setFragments(false);
  };

  const OnPlacemarkClickPoint = (index: number) => {
    const SoobBusy = () => {
      if (!DEMO) {
        datestat.busy = true;
        soobErr =
          "⚠️Предупреждение\xa0\xa0\xa0Перекрёсток ID" +
          map.tflight[index].ID +
          " управляется другим пользователем. Работа с ним возможна только после того как он освободится...";
        setOpenSetErr(true);
      }
    };

    let statusVertex = map.tflight[index].tlsost.num;
    let badCode = BadCODE.indexOf(statusVertex) < 0 ? false : true;
    let nomIn = datestat.massMem.indexOf(index); // запускался ли светофор ранее?
    let goodCode = GoodCODE.indexOf(statusVertex) < 0 ? false : true; // светофор занят другим пользователем?
    if (DEMO) goodCode = false;
    if (nomIn >= 0) {
      // ранее запускался
      if (massfaz[nomIn].busy) {
        if (!goodCode) {
          massfaz[nomIn].busy = false;
        } else SoobBusy();
      } else {
        let INTERVALDOP = datestat.intervalFazaDop;
        if (datestat.massСounter[nomIn] > 0 && INTERVALDOP && !badCode) {
          datestat.massСounter[nomIn] += INTERVALDOP; // подкачка счётчика
          dispatch(statsaveCreate(datestat));
          return;
        }
      }
    } else goodCode && SoobBusy();
    // проверка наличия картинок фаз
    let area = (datestat.area = map.tflight[index].area.num);
    let id = (datestat.id = map.tflight[index].ID);
    if (!debug) datestat.phSvg = Array(8).fill(null);
    let have = 0;
    for (let i = 0; i < massdk.length; i++) {
      if (massdk[i].ID === id && massdk[i].readIt) {
        datestat.phSvg = massdk[i].phSvg; // картинки фаз уже были присланы
        have++;
      }
    }
    !have && SendSocketGetPhases(homeRegion, area, id);
    dispatch(statsaveCreate(datestat));
    idxObj = index;
    setControl(true);
    setClick(!click);
  };

  const CloseCounter = (IDX: number) => {
    !DEMO && SendSocketDispatch(massfaz[IDX].idevice, 9, 9);
    !DEMO && SendSocketDispatch(massfaz[IDX].idevice, 4, 0);
    massfaz[IDX].faza = 9;
    datestat.massMem[IDX] = massfaz[IDX].idevice = massfaz[IDX].idx = -1; // затереть в massfaz и massMem
    dispatch(massfazCreate(massfaz));
    CloseInterval(datestat, IDX);
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
    for (let i = 0; i < datestat.massMem.length; i++) {
      if (datestat.massMem[i] >= 0) {
        let corFromMap = [massfaz[i].coordinates[0], massfaz[i].coordinates[1]];
        let dister = Distance(coord, corFromMap);
        if (dister <= Aura && minDist > dister) {
          minDist = dister; // нажали правой кнопкой на светофор
          nomInMass = i;
        }
      }
    }
    if (nomInMass >= 0) {
      console.log("Нажали правой кнопкой на светофор", nomInMass);
      datestat.massСounter[nomInMass] = 1;
      let index = massfaz[nomInMass].idx;
      if (BadCODE.indexOf(map.tflight[index].tlsost.num) >= 0) {
        CloseCounter(nomInMass);
        datestat.massСounter[nomInMass] = -1;
      }
      dispatch(statsaveCreate(datestat));
    }
  };

  const InstanceRefDo = (ref: React.Ref<any>) => {
    if (ref) {
      mapp.current = ref;
      mapp.current.events.remove("contextmenu", funcContex); //=== правая кнопка =========
      funcContex = function (e: any) {
        if (mapp.current.hint && !datestat.working)
          FindNearVertex(e.get("coords")); // нажата правая кнопка мыши
      };
      mapp.current.events.add("contextmenu", funcContex);
      mapp.current.events.remove("boundschange", funcBound); //=== колёсико мыши =========
      funcBound = function () {
        pointCenter = mapp.current.getCenter();
        zoom = mapp.current.getZoom(); // покрутили колёсико мыши
        if (zoomOld !== zoom) {
          needDrawCircle = true;
          zoomOld = zoom;
          setTrigger(!trigger);
        }
        SaveZoom(zoom, pointCenter);
      };
      mapp.current.events.add("boundschange", funcBound);
    }
  };

  const PressButton = (mode: number) => {
    switch (mode) {
      case 61: // режим управления
        StatusQuo(true);
        datestat.finish = datestat.demo = false;
        dispatch(statsaveCreate(datestat));
        DEMO = false;
        break;
      case 62: // режим Демо
        StatusQuo((datestat.demo = DEMO = true));
        datestat.finish = false;
        dispatch(statsaveCreate(datestat));
        break;
      case 63: // настройки
        setNeedSetup(true);
        break;
      case 64: // фрагменты
        soobErr =
          "Нет фрагментов Яндекс-карты для вашего аккаунта, создайте их на главной странице системы";
        if (!map.fragments) {
          setOpenSetErr(true);
        } else {
          if (!map.fragments.length) {
            setOpenSetErr(true);
          } else setFragments(true);
        }
    }
  };
  //=== Функции - обработчики ==============================
  const ChangeDemoSost = (mode: number) => {
    needDrawCircle = true; // перерисовать окружности
    setDemoSost(RandomNumber(1, 1000) + demoSost); // костыль
  };

  const SetNeedSetup = (mode: boolean) => {
    needDrawCircle = true; // перерисовать окружности
    setNeedSetup(false);
  };

  const DoTimerRestart = () => {
    let have = 0;
    let oldNeedComent = { ...datestat.needComent };
    datestat.needComent = false;
    for (let i = 0; i < datestat.massСounter.length; i++) {
      if (!datestat.massСounter[i]) {
        // смена номерной фазы на ЖМ, ОС или ЛР
        have++;
        datestat.massСounter[i]--;
      }
      if (datestat.massСounter[i] > 0) {
        let mF = massfaz[i];
        have++;
        if (mF.fazaSist === mF.faza || !mF.fazaZU) datestat.massСounter[i]--; // норм запущен счётчик
        if (!datestat.massСounter[i]) {
          CloseCounter(i);
          datestat.massСounter[i]--;
        } else datestat.needComent = true;
      }
    }
    dispatch(statsaveCreate(datestat));
    helpComment = "";
    if (datestat.needComent) {
      colerComment = colerCommentMain;
      helpComment = datestat.typeVert === 2 ? resetCounter1 : resetCounter2;
      for (let i = 0; i < massfaz.length; i++) {
        if (massfaz[i].idx > 0) {
          let idx = massfaz[i].idx;
          if (BadCODE.indexOf(map.tflight[idx].tlsost.num) >= 0) {
            helpComment = "⚠️Предупреждение! [id" + map.tflight[idx].ID + "] ";
            helpComment += map.tflight[idx].tlsost.description;
            colerComment = "red";
            break;
          }
        }
      }
    }
    if (oldNeedComent !== datestat.needComent) setTrigger(!trigger);
    if (have) {
      clicker++;
      setClicka(clicker);
    }
  };
  //========================================================
  const MainMenu = () => {
    return (
      <Box sx={{ display: "flex" }}>
        {StrokaMenuGlob(PressButton, datestat.working)}
        <Box sx={styleHelpMain}>
          <Box sx={{ color: colerComment }}>
            <em>{helpComment}</em>
          </Box>
        </Box>
      </Box>
    );
  };
  //=== инициализация ======================================
  if (!flagOpen && Object.keys(map.tflight).length) {
    let point0 = window.localStorage.PointCenterDU0;
    let point1 = window.localStorage.PointCenterDU1;
    if (!Number(point0) || !Number(point1)) {
      pointCenter = CenterCoordBegin(map); // начальные координаты центра отоброжаемой карты
    } else pointCenter = [Number(point0), Number(point1)];
    zoom = Number(window.localStorage.ZoomDU); // начальный zoom Yandex-карты ДУ
    INT[0] = setInterval(() => DoTimerRestart(), Restart); // запуск счетчиков отправки КУ
    flagOpen = true;
    clicker = clicka; // костылик
  }
  //=== Закрытие или перезапуск вкладки ====================
  const handleTabClosing = () => {
    for (let i = 0; i < massfaz.length; i++) {
      let mf = massfaz[i];
      if (!DEMO && mf.idevice > 0 && mf.fazaSistOld > 0 && !mf.busy) {
        SendSocketDispatch(massfaz[i].idevice, 9, 9); // КУ
        SendSocketDispatch(massfaz[i].idevice, 4, 0); // закрытие id
      }
    }
  };

  const alertUser = (event: any) => handleTabClosing();

  React.useEffect(() => {
    window.addEventListener("beforeunload", alertUser);
    window.addEventListener("unload", handleTabClosing);
    return () => {
      window.removeEventListener("beforeunload", alertUser);
      window.removeEventListener("unload", handleTabClosing);
    };
  });
  //========================================================
  let mapState: any = {
    center: pointCenter,
    zoom,
  };

  if (!CompareArrays(datestat.massMem, massMemOld) || needDrawCircle) {
    massMemOld = JSON.parse(JSON.stringify(datestat.massMem));
    needDrawCircle = false;
    mapp.current.geoObjects.removeAll(); // удаление старой коллекции связей и окружностей
    backlight && DrawCircle(ymaps, mapp, massfaz, datestat.demoLR); // нарисовать окружности на запущенных светофорах
  }

  console.log("map.tflight:", map.tflight);

  return (
    <Grid container sx={{ height: "99.9vh" }}>
      <Grid item xs={12}>
        {MainMenu()}
        <Grid container sx={{ height: "96.9vh" }}>
          {/* <Grid item xs> */}
            {Object.keys(map.tflight).length && flagOpen && (
              <YMaps query={{ apikey: MyYandexKey, lang: "ru_RU" }}>
                <Map
                  modules={YMapsModul}
                  state={mapState}
                  instanceRef={(ref) => InstanceRefDo(ref)}
                  onLoad={(ref) => {
                    ref && setYmaps(ref);
                  }}
                  width={"99.9%"}
                  height={"99.9%"}
                >
                  {YandexServices()}
                  <PlacemarkDo />
                  {control && datestat.readyFaza && (
                    <SdcControlVertex
                      setOpen={setControl}
                      idx={idxObj}
                      trigger={props.trigger}
                      change={ChangeDemoSost}
                    />
                  )}
                  {fragments && <SdcFragments close={SetFragments} />}
                  {openSetErr && (
                    <SdcErrorMessage setOpen={setOpenSetErr} sErr={soobErr} />
                  )}
                </Map>
              </YMaps>
            )}
          {/* </Grid> */}
        </Grid>
      </Grid>
      {typeVert !== 2 && !!HaveActivеVert(datestat) && clicker && (
        <Box sx={styleServisTable}>
          <SdsServisTable />
        </Box>
      )}
      {needSetup && <SdcSetup close={SetNeedSetup} />}
    </Grid>
  );
};

export default MainMapSdc;
