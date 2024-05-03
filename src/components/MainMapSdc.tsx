import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { massfazCreate, statsaveCreate } from '../redux/actions';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import { YMaps, Map, FullscreenControl } from 'react-yandex-maps';
import { GeolocationControl, YMapsApi } from 'react-yandex-maps';
import { RulerControl, SearchControl } from 'react-yandex-maps';
import { TrafficControl, TypeSelector, ZoomControl } from 'react-yandex-maps';

import SdcDoPlacemarkDo from './SdcComponents/SdcDoPlacemarkDo';
import SdcControlVertex from './SdcComponents/SdcControlVertex';
import SdcErrorMessage from './SdcComponents/SdcErrorMessage';

import { StrokaMenuGlob, CenterCoord } from './SdcServiceFunctions';
import { CloseInterval } from './SdcServiceFunctions';

import { SendSocketGetPhases } from './SdcSocketFunctions';

import { SendSocketDispatch } from './SdcSocketFunctions';

import { MyYandexKey, Restart } from './MapConst';

import { searchControl } from './MainMapStyle';

export let DEMO = false;

let flagOpen = false;
const zoomStart = 10;
let zoom = zoomStart;
let pointCenter: any = 0;
let newCenter: any = [];
let funcBound: any = null;

let soobErr = '';
let idxObj = -1;
let clicker = 0;

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
    }
  };

  const OnPlacemarkClickPoint = (index: number) => {
    if (!datestat.working) {
      let area = map.tflight[index].area.num;
      let id = map.tflight[index].ID;
      console.log('OnPlacemarkClickPoint id:', id);
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

  const InstanceRefDo = (ref: React.Ref<any>) => {
    if (ref) {
      mapp.current = ref;
      mapp.current.events.remove('boundschange', funcBound);
      funcBound = function () {
        pointCenter = mapp.current.getCenter();
        zoom = mapp.current.getZoom(); // покрутили колёсико мыши
      };
      mapp.current.events.add('boundschange', funcBound);
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
        soobErr = 'Завершите предыдущий режим нормальным образом';
        setOpenSetErr(true);
    }
  };
  //=== Функции - обработчики ==============================
  const RandomNumber = (min: number, max: number) => {
    let rand = Math.random() * (max - min) + min;
    return Math.floor(rand);
  };

  const ChangeDemoSost = (mode: number) => {
    //console.log("ChangeDemoSost:", mode);
    //setDemoSost(mode + demoSost);// костыль
    setDemoSost(RandomNumber(1, 1000) + demoSost); // костыль
  };

  const SetControl = (mode: any) => {
    console.log('SETCONTROL:', mode);
    setControl(mode);
  };

  const DoTimerRestart = () => {
    let have = 0;
    for (let i = 0; i < datestat.massСounter.length; i++) {
      if (datestat.massСounter[i]) {
        have++;
        //clicker++;
        //setClicka(clicker);
        datestat.massСounter[i]--;
        dispatch(statsaveCreate(datestat));
        if (!datestat.massСounter[i]) {
          let mF = massfaz[i];
          !DEMO && SendSocketDispatch(debug, ws, mF.idevice, 9, 9);
          massfaz[i].faza = 9;
          datestat.massMem[i] = -1;
          dispatch(statsaveCreate(datestat));
          dispatch(massfazCreate(massfaz));
          !DEMO && SendSocketDispatch(debug, ws, mF.idevice, 4, 0);

          console.log('отправка КУ:', i, datestat.massСounter, datestat.massMem);

          clicker++;
          setClicka(clicker);
        }
      }
    }
    if (have) {
      clicker++;
      //dispatch(statsaveCreate(datestat));
      setClicka(clicker);
      console.log('DoTimerRestart:', have, clicker, datestat.massСounter);
    }
    //datestat.massСounter.length && dispatch(statsaveCreate(datestat));
  };
  //=== инициализация ======================================
  if (!flagOpen && Object.keys(map.tflight).length) {
    pointCenter = CenterCoord(
      map.boxPoint.point0.Y,
      map.boxPoint.point0.X,
      map.boxPoint.point1.Y,
      map.boxPoint.point1.X,
    );
    setInterval(() => DoTimerRestart(), Restart); // запуск счетчиков отправки КУ
    flagOpen = true;
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
    console.log('3пришло:');
    removePlayerFromGame();
  };

  const alertUser = (event: any) => {
    console.log('2пришло:', event);
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

  //console.log("!!!!!!:", click, clicker, clicka, datestat.massСounter);

  return (
    <Grid container sx={{ height: '99.9vh' }}>
      <Grid item xs={12}>
        {/* главное меню */}
        <Box>{StrokaMenuGlob(PressButton, datestat.working)}</Box>
        {/* Яндекс карта */}
        <Grid container sx={{ height: '96.9vh' }}>
          <Grid item xs>
            {Object.keys(map.tflight).length && (
              <YMaps query={{ apikey: MyYandexKey, lang: 'ru_RU' }}>
                <Map
                  modules={['templateLayoutFactory']}
                  state={mapState}
                  instanceRef={(ref) => InstanceRefDo(ref)}
                  onLoad={(ref) => {
                    ref && setYmaps(ref);
                  }}
                  width={'99.9%'}
                  height={'99.9%'}>
                  {/* сервисы Яндекса */}
                  <FullscreenControl />
                  <GeolocationControl options={{ float: 'left' }} />
                  <RulerControl options={{ float: 'right' }} />
                  <SearchControl options={searchControl} />
                  <TrafficControl options={{ float: 'right' }} />
                  <TypeSelector options={{ float: 'right' }} />
                  <ZoomControl options={{ float: 'right' }} />
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
                  {openSetErr && <SdcErrorMessage setOpen={setOpenSetErr} sErr={soobErr} />}
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
