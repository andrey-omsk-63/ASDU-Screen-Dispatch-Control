import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { massfazCreate, statsaveCreate } from '../redux/actions';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import { YMaps, Map, YMapsApi } from 'react-yandex-maps';

import SdcDoPlacemarkDo from './SdcComponents/SdcDoPlacemarkDo';
import SdcControlVertex from './SdcComponents/SdcControlVertex';
import SdcErrorMessage from './SdcComponents/SdcErrorMessage';
import SdcSetup from './SdcComponents/SdcSetup';
import SdcFragments from './SdcComponents/SdcFragments';
import SdsServisTable from './SdcComponents/SdsServisTable';

import { StrokaMenuGlob, CenterCoordBegin } from './SdcServiceFunctions';
import { CloseInterval, Distance, YandexServices } from './SdcServiceFunctions';
import { SaveZoom } from './SdcServiceFunctions';

import { SendSocketGetPhases } from './SdcSocketFunctions';
import { SendSocketDispatch } from './SdcSocketFunctions';

import { YMapsModul, MyYandexKey, Restart, Aura, zoomStart } from './MapConst';

import { styleHelpMain } from './MainMapStyle';

export let DEMO = false;

let flagOpen = false;
let zoom = zoomStart;
let pointCenter: any = 0;
let funcBound: any = null;
let funcContex: any = null;
let soobErr = '';
let idxObj = -1;
let clicker = 0;
let INT: Array<any> = [];

let helpComment = '';
let resetCounter = 'Нажатием правой кнопкой мыши на счётчик можно его сбросить';

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
  const typeVert = datestat.typeVert;
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

  const SetFragments = (idx: number) => {
    if (idx >= 0 && ymaps) {
      mapp.current.geoObjects.removeAll(); // удаление старой коллекции связей
      let multiRoute: any = [];
      multiRoute = new ymaps.multiRouter.MultiRoute(
        { referencePoints: map.fragments[idx].bounds },
        {
          boundsAutoApply: true, // вписать в границы
          routeActiveStrokeWidth: 0, // толщина линии
          routeStrokeWidth: 0, // толщина линии альтернативного маршрута
          wayPointVisible: false,
        },
      );
      mapp.current.geoObjects.add(multiRoute);
    }
    setFragments(false);
  };

  const OnPlacemarkClickPoint = (index: number) => {
    if (!datestat.working) {
      let nomIn = datestat.massMem.indexOf(index); // запускался ли светофор ранее?
      if (nomIn >= 0) {
        // ранее запускался
        //let INTERVALDOP = Number(window.localStorage.intervalFazaDopD);
        let INTERVALDOP = datestat.intervalFazaDop;
        if (datestat.massСounter[nomIn] > 0 && INTERVALDOP) {
          datestat.massСounter[nomIn] += INTERVALDOP; // подкачка счётчика
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
      soobErr = 'В данный момент происходит управление другим перекрёстком';
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
    for (let i = 0; i < datestat.massMem.length; i++) {
      if (datestat.massMem[i] >= 0) {
        let corFromMap = [massfaz[i].coordinates[0], massfaz[i].coordinates[1]];
        let dister = Distance(coord, corFromMap);
        if (dister <= Aura && minDist > dister) {
          // нажали правой кнопкой на светофор
          minDist = dister;
          nomInMass = i;
        }
      }
    }
    if (nomInMass >= 0) {
      console.log('Нажали правой кнопкой на светофор', nomInMass);
      datestat.massСounter[nomInMass] = 1;
      dispatch(statsaveCreate(datestat));
    }
  };

  const InstanceRefDo = (ref: React.Ref<any>) => {
    if (ref) {
      mapp.current = ref;
      //=== правая кнопка =========
      mapp.current.events.remove('contextmenu', funcContex);
      funcContex = function (e: any) {
        if (mapp.current.hint && !datestat.working) FindNearVertex(e.get('coords')); // нажата правая кнопка мыши
      };
      mapp.current.events.add('contextmenu', funcContex);
      //=== колёсико мыши =========
      mapp.current.events.remove('boundschange', funcBound);
      funcBound = function () {
        pointCenter = mapp.current.getCenter();
        zoom = mapp.current.getZoom(); // покрутили колёсико мыши
        SaveZoom(zoom, pointCenter);
      };
      mapp.current.events.add('boundschange', funcBound);
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
      case 63: // настройки
        setNeedSetup(true);
        break;
      case 64: // фрагменты
        soobErr =
          'Нет фрагментов Яндекс-карты для вашего аккаунта, создайте их на главной странице системы';
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
  const RandomNumber = (min: number, max: number) => {
    let rand = Math.random() * (max - min) + min;
    return Math.floor(rand);
  };

  const ChangeDemoSost = (mode: number) => {
    setDemoSost(RandomNumber(1, 1000) + demoSost); // костыль
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
        if (mF.fazaSist === mF.faza) datestat.massСounter[i]--; // норм запущен счётчик
        if (!datestat.massСounter[i]) {
          !DEMO && SendSocketDispatch(debug, ws, mF.idevice, 9, 9);
          massfaz[i].faza = 9;
          datestat.massMem[i] = massfaz[i].idevice = massfaz[i].idx = -1; // затереть в massfaz и massMem
          dispatch(massfazCreate(massfaz));
          !DEMO && SendSocketDispatch(debug, ws, mF.idevice, 4, 0);
          CloseInterval(datestat, i);
          datestat.massСounter[i]--;
        } else {
          //if (typeVert === 2)
          datestat.needComent = true;
        }
      }
    }
    dispatch(statsaveCreate(datestat));
    helpComment = datestat.needComent ? resetCounter : '';
    if (oldNeedComent !== datestat.needComent) setTrigger(!trigger);
    if (have) {
      clicker++;
      setClicka(clicker);
    }
  };
  //========================================================
  const MainMenu = () => {
    return (
      <Box sx={{ display: 'flex' }}>
        {StrokaMenuGlob(PressButton, datestat.working)}
        <Box sx={styleHelpMain}>
          <em>{helpComment}</em>
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
  React.useEffect(() => {
    window.addEventListener('beforeunload', alertUser);
    window.addEventListener('unload', handleTabClosing);

    return () => {
      window.removeEventListener('beforeunload', alertUser);
      window.removeEventListener('unload', handleTabClosing);
    };
  });

  const handleTabClosing = () => {
    //console.log("3пришло:");
    removePlayerFromGame();
  };

  const alertUser = (event: any) => {
    //console.log("2пришло:", event);
    // ev = JSON.parse(JSON.stringify(event));
    StatusQuo(false);
    //  event.preventDefault();
    //  event.returnValue = "";
  };

  function removePlayerFromGame() {
    throw new Error('Function not implemented.');
  }
  //========================================================
  let mapState: any = {
    center: pointCenter,
    zoom,
  };

  const styleWindPK = {
    outline: 'none',
    position: 'relative',
    marginTop: '-96vh',
    marginLeft: 'auto',
    marginRight: '14px',
    width: 400,
  };

  const HaveActivеVert = () => {
    let have = 0;
    for (let i = 0; i < datestat.massСounter.length; i++) {
      if (datestat.massСounter[i] > 0) have++;
    }
    return have;
  };

  //console.log('typeVert',typeVert,datestat.massСounter)

  return (
    <Grid container sx={{ height: '99.9vh' }}>
      <Grid item xs={12}>
        {MainMenu()}
        {/* Яндекс карта */}
        <Grid container sx={{ height: '95vh' }}>
          <Grid item xs>
            {Object.keys(map.tflight).length && (
              <YMaps query={{ apikey: MyYandexKey, lang: 'ru_RU' }}>
                <Map
                  modules={YMapsModul}
                  state={mapState}
                  instanceRef={(ref) => InstanceRefDo(ref)}
                  onLoad={(ref) => {
                    ref && setYmaps(ref);
                  }}
                  width={'99.9%'}
                  height={'99.9%'}>
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
                  {openSetErr && <SdcErrorMessage setOpen={setOpenSetErr} sErr={soobErr} />}
                </Map>
              </YMaps>
            )}
          </Grid>
        </Grid>
      </Grid>
      {typeVert !== 2 && !!HaveActivеVert() && (
        <Box sx={styleWindPK}>
          <SdsServisTable />
        </Box>
      )}
      {needSetup && <SdcSetup close={setNeedSetup} />}
    </Grid>
  );
};

export default MainMapSdc;
