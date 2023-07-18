import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { statsaveCreate } from "../redux/actions";

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
//import { SendSocketGetSvg } from "./SdcSocketFunctions";

import { searchControl } from "./MainMapStyle";

let flagOpen = false;
const zoomStart = 10;
let zoom = zoomStart;
let pointCenter: any = 0;
let newCenter: any = [];
let funcBound: any = null;

let soobErr = "";

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
  const [control, setControl] = React.useState(false);
  const [idxObj, setIdxObj] = React.useState(-1);
  const [flagCenter, setFlagCenter] = React.useState(false);
  const [demoSost, setDemoSost] = React.useState(0);
  const [openSetErr, setOpenSetErr] = React.useState(false);
  const [ymaps, setYmaps] = React.useState<YMapsApi | null>(null);
  const mapp = React.useRef<any>(null);

  const OnPlacemarkClickPoint = (index: number) => {
    if (!datestat.working) {
      setIdxObj(index);
      let area = map.tflight[index].area.num;
      let id = map.tflight[index].ID;
      datestat.area = area;
      datestat.id = id;
      if (!debug) {
        datestat.phSvg = Array(8).fill(null);
        if (!DEMO) datestat.readyFaza = false;
      }
      !DEMO && SendSocketGetPhases(debug, ws, homeRegion, area, id);
      dispatch(statsaveCreate(datestat));
      setControl(true);
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
  let mapState: any = {
    center: pointCenter,
    zoom,
  };

  const ChangeDemoSost = (mode: number) => {
    setDemoSost(mode);
    console.log("ChangeDemoSost:", mode, demoSost);
  };

  const MenuGl = (otherWork: boolean) => {
    return <Box>{StrokaMenuGlob(PressButton, otherWork)}</Box>;
  };

  return (
    <Grid container sx={{ height: "99.9vh" }}>
      <Grid item xs={12}>
        {MenuGl(datestat.working)}
        <Grid container sx={{ border: 0, height: "96.9vh" }}>
          <Grid item xs sx={{ border: 0 }}>
            {Object.keys(map.tflight).length && (
              <YMaps
                query={{
                  apikey: "65162f5f-2d15-41d1-a881-6c1acf34cfa1",
                  lang: "ru_RU",
                }}
              >
                <Map
                  modules={[
                    "multiRouter.MultiRoute",
                    "Polyline",
                    "templateLayoutFactory",
                  ]}
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
                      setOpen={setControl}
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
