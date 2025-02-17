import * as React from "react";
import { useSelector } from "react-redux";

import { Placemark, YMapsApi } from "react-yandex-maps";

import { GetPointData } from "../SdcServiceFunctions";

import { BadCODE } from "../MapConst";

const SdcDoPlacemarkDo = (props: {
  ymaps: YMapsApi | null;
  coordinate: any;
  idx: number;
  OnPlacemarkClickPoint: Function;
  click: boolean;
}) => {
  //== Piece of Redux =======================================
  const map = useSelector((state: any) => {
    const { mapReducer } = state;
    return mapReducer.map.dateMap;
  });
  let datestat = useSelector((state: any) => {
    const { statsaveReducer } = state;
    return statsaveReducer.datestat;
  });
  let massfaz = useSelector((state: any) => {
    const { massfazReducer } = state;
    return massfazReducer.massfaz;
  });
  const debug = datestat.debug;
  const DEMO = datestat.demo;
  //===========================================================
  let idx = props.idx;
  let mapp = map.tflight[0].tlsost.num.toString();
  let mappp = map.tflight[0];
  let nomSvg = -1;
  if (idx < map.tflight.length) {
    mapp = map.tflight[idx].tlsost.num.toString();
    mappp = map.tflight[idx];
  }

  const nomInMass = datestat.massMem.indexOf(props.idx);
  let haveСounter = nomInMass < 0 ? false : true; // взведён ли счётчик?
  let icContent =
    nomInMass < 0
      ? ""
      : datestat.massСounter[nomInMass] + "(" + massfaz[nomInMass].faza + ")";

  if (nomInMass >= 0) {
    if (
      datestat.typeVert !== 2 ||
      !datestat.counterFaza ||
      datestat.massСounter[nomInMass] <= 0
    )
      haveСounter = false;
  }

  let statusVertex = map.tflight[idx].tlsost.num;
  let badCode = BadCODE.indexOf(statusVertex) < 0 ? false : true;

  const Hoster = React.useCallback(() => {
    let hostt =
      window.location.origin.slice(0, 22) === "https://localhost:3000"
        ? "https://localhost:3000/"
        : "./";
    let host = hostt + "18.svg";

    if (!debug) {
      let mpp = mapp;
      if (DEMO) {
        mpp = "1"; // режим Демо
        if (nomInMass >= 0) mpp = datestat.demoTlsost[nomInMass].toString();
      } else if (nomSvg > 0) mpp = nomSvg.toString();
      host = window.location.origin + "/free/img/trafficLights/" + mpp + ".svg";
      if (datestat.demoLR[nomInMass])
        host = window.location.origin + "/free/img/trafficLights/5.svg";
    } else {
      if (DEMO) {
        host = hostt + "1.svg";
        if (nomInMass >= 0) {
          let mpp = datestat.demoTlsost[nomInMass].toString();
          host = hostt + mpp + ".svg";
          if (datestat.demoLR[nomInMass]) host = hostt + "5.svg"; // режим ЛР
        }
      }
    }
    return host;
  }, [
    mapp,
    nomSvg,
    debug,
    DEMO,
    datestat.demoTlsost,
    datestat.demoLR,
    nomInMass,
  ]);

  const createChipsLayout = React.useCallback(
    (calcFunc: Function, currnum: number, rotateDeg?: number) => {
      const Chips = props.ymaps?.templateLayoutFactory.createClass(
        '<div class="placemark"  ' +
          `style="background-image:url(${Hoster()}); ` +
          `background-size: 100%; transform: rotate(${
            rotateDeg ?? 0
          }deg);\n"></div>`,
        {
          build: function () {
            Chips.superclass.build.call(this);
            const map = this.getData().geoObject.getMap();
            if (!this.inited) {
              this.inited = true;
              // Получим текущий уровень зума.
              let zoom = map.getZoom();
              // Подпишемся на событие изменения области просмотра карты.
              map.events.add(
                "boundschange",
                function () {
                  // Запустим перестраивание макета при изменении уровня зума.
                  const currentZoom = map.getZoom();
                  if (currentZoom !== zoom) {
                    zoom = currentZoom;
                    //@ts-ignore
                    this.rebuild();
                  }
                },
                this
              );
            }
            const options = this.getData().options,
              // Получим размер метки в зависимости от уровня зума.
              size = calcFunc(map.getZoom()) + 6,
              element =
                this.getParentElement().getElementsByClassName("placemark")[0],
              // По умолчанию при задании своего HTML макета фигура активной области не задается,
              // и её нужно задать самостоятельно.
              // Создадим фигуру активной области "Круг".
              circleShape = {
                type: "Circle",
                coordinates: [0, 0],
                radius: size / 2,
              };
            // Зададим высоту и ширину метки.
            element.style.width = element.style.height = size + "px";
            // Зададим смещение.
            //element.style.marginLeft = element.style.marginTop =
            //-size / 2 + "px";
            element.style.marginLeft = -size / 2.0 + "px";
            element.style.marginTop = -size / 1.97 + "px";
            // Зададим фигуру активной области.
            options.set("shape", circleShape);
          },
        }
      );
      return Chips;
    },
    [Hoster, props.ymaps?.templateLayoutFactory]
  );

  const calculate = function (zoom: number): number {
    switch (zoom) {
      case 14:
        return 30;
      case 15:
        return 35;
      case 16:
        return 40;
      case 17:
        return 45;
      case 18:
        return 50;
      case 19:
        return 55;
      default:
        return 25;
    }
  };

  const getPointOptions1 = React.useCallback(() => {
    return { iconLayout: createChipsLayout(calculate, mappp.tlsost.num) };
  }, [createChipsLayout, mappp.tlsost.num]);

  const getPointOptions2 = () => {
    return { preset: "islands#darkOrangeStretchyIcon" };
  };

  const MemoPlacemarkDo = React.useMemo(
    () => (
      <Placemark
        key={idx}
        geometry={props.coordinate}
        properties={GetPointData(idx, map, icContent)}
        options={haveСounter && !badCode ? getPointOptions2() : getPointOptions1()}
        modules={["geoObject.addon.hint", "geoObject.addon.balloon"]}
        onClick={() => props.OnPlacemarkClickPoint(idx)}
      />
    ),
    [idx, map, getPointOptions1, props, haveСounter, icContent]
  );
  return MemoPlacemarkDo;
};

export default SdcDoPlacemarkDo;
