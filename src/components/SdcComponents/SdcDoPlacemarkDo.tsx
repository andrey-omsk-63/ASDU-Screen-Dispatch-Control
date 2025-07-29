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
  let massdk = useSelector((state: any) => {
    const { massdkReducer } = state;
    return massdkReducer.massdk;
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
  let FAZASIST = -1;
  let fazer: any = 0;

  let haveСounter = nomInMass < 0 ? false : true; // взведён ли счётчик?
  if (nomInMass >= 0) {
    FAZASIST = massfaz[nomInMass].faza;
    let fz = massfaz[nomInMass].faza;
    fazer = JSON.parse(JSON.stringify(massfaz[nomInMass].faza));
    if (fz === 0) fazer = "ЛР";
    if (fz === 10 || fz === 14) fazer = "ЖМ";
    if (fz === 11 || fz === 15) fazer = "ОС";
  }
  let icContent =
    nomInMass < 0 ? "" : datestat.massСounter[nomInMass] + "(" + fazer + ")";

  if (nomInMass >= 0) {
    if (!datestat.typeVert || datestat.massСounter[nomInMass] <= 0)
      haveСounter = false;
  }

  let fazaImg: null | string = null;
  if (nomInMass >= 0 && datestat.typeVert === 1) {
    for (let i = 0; i < massdk.length - 1; i++) {
      if (massdk[i].idevice === massfaz[nomInMass].idevice) {
        fazaImg = massdk[i].phSvg[massfaz[nomInMass].faza - 1];
        if (!fazaImg) fazaImg = null;
      }
    }
  }

  let numer = datestat.typeVert && !fazaImg && nomInMass >= 0;

  let counterFaza = datestat.counterFaza; // наличие счётчика длительность фазы ДУ
  let intervalFaza = datestat.intervalFaza; // Задаваемая длительность фазы ДУ (сек)
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

    if (
      numer &&
      FAZASIST > 0 &&
      FAZASIST !== 10 && // ЖМ
      FAZASIST !== 14 && // ЖМ
      FAZASIST !== 11 && // ОС
      FAZASIST !== 15 // ОС
    ) {
      // картинка с номером фазы
      let hostt =
        window.location.origin.slice(0, 22) === "https://localhost:3000"
          ? "https://localhost:3000/phases/"
          : "./phases/";
      host = debug
        ? hostt + FAZASIST + ".svg"
        : "/file/static/img/buttons/" + FAZASIST + ".svg";
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
    FAZASIST,
    numer,
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

  const GetPointOptions0 = React.useCallback(
    (hoster: any) => {
      let Hoster = hoster;
      let imger = "";
      let hostt = "";

      let iconSize = Hoster ? 50 : 25;
      let iconOffset = Hoster ? -25 : -12.5;
      //  typeVert - тип отображаемых CO на карте 0 - значки СО 1 - номер фаз 2 - картинка фаз
      if (datestat.typeVert) {
        // номер фазы или картнка фазы
        if (Hoster) imger = "data:image/png;base64," + Hoster;
        if (!Hoster) {
          if (FAZASIST > 0) {
            hostt =
              window.location.origin.slice(0, 22) === "https://localhost:3000"
                ? "https://localhost:3000/phases/"
                : "./phases/";
            imger = debug
              ? hostt + FAZASIST + ".svg"
              : "/file/static/img/buttons/" + FAZASIST + ".svg";
          }
          console.log("GetPointOptions0:", datestat.typeVert, imger);
        }
      }

      return {
        // данный тип макета
        iconLayout: "default#image",
        // изображение иконки метки
        iconImageHref: imger,
        // размеры метки
        iconImageSize: [iconSize, iconSize],
        // её "ножки" (точки привязки)
        iconImageOffset: [iconOffset, iconOffset],
      };
    },
    [debug, datestat.typeVert, FAZASIST]
  );

  const getPointOptions1 = React.useCallback(() => {
    return nomInMass < 0 || FAZASIST < 0 || !datestat.typeVert || numer
      ? { iconLayout: createChipsLayout(calculate, mappp.tlsost.num) }
      : GetPointOptions0(fazaImg);
  }, [
    createChipsLayout,
    mappp.tlsost.num,
    FAZASIST,
    GetPointOptions0,
    datestat.typeVert,
    fazaImg,
    nomInMass,
    numer,
  ]);

  const getPointOptions2 = React.useCallback(() => {
    return datestat.typeVert === 2
      ? { preset: "islands#darkOrangeStretchyIcon" }
      : numer
      ? { iconLayout: createChipsLayout(calculate, mappp.tlsost.num) }
      : GetPointOptions0(fazaImg);
  }, [
    GetPointOptions0,
    datestat.typeVert,
    fazaImg,
    createChipsLayout,
    mappp.tlsost.num,
    numer,
  ]);

  const MemoPlacemarkDo = React.useMemo(
    () => (
      <Placemark
        key={idx}
        geometry={props.coordinate}
        properties={GetPointData(idx, map, icContent)}
        options={
          haveСounter && !badCode && counterFaza && intervalFaza
            ? getPointOptions2() // отражение счётчика или картинки фазы
            : getPointOptions1() // отражение метки светофора
        }
        modules={["geoObject.addon.hint", "geoObject.addon.balloon"]}
        onClick={() => props.OnPlacemarkClickPoint(idx)}
      />
    ),
    [
      idx,
      map,
      getPointOptions1,
      getPointOptions2,
      props,
      haveСounter,
      icContent,
      badCode,
      counterFaza,
      intervalFaza,
    ]
  );
  return MemoPlacemarkDo;
};

export default SdcDoPlacemarkDo;
