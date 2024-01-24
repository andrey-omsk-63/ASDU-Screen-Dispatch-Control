import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { massfazCreate, statsaveCreate } from "../../redux/actions";

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import { SendSocketDispatch } from "../SdcSocketFunctions";

import { MaxFaz, CLINCH } from "./../MapConst";

import { DEMO } from "./../MainMapSdc";

import { styleModalEnd } from "../MainMapStyle";

import { styleVarKnopNum } from "./SdcComponentsStyle";
import { styleKnop, styleOutputFaza } from "./SdcComponentsStyle";
import { StyleSetControl, styleControl01 } from "./SdcComponentsStyle";
import { StyleTitle, styleTitleDEMO } from "./SdcComponentsStyle";
import { StyleModalMenuVar, StyleModalMenuConst } from "./SdcComponentsStyle";

let oldIdx = -1;
let needRend = false;
let kluchGl = "";

let oldSistFaza: Array<number> = [];
let shippedKU: Array<boolean> = [];

export let massMem: Array<number> = []; // массив "запущенных" светофоров
let nomInMass = -1; // номер в массиве "запущенных" светофоров

let kolFaz = 0;
let needDopKnop = false;
let statusVertex = 0;
let statusName = 0;
let mF: any = null;
let present = -1;

const colorNormal = "#E9F5D8"; // светло-салатовый
const colorExtra = "#96CD8F"; // тёмно-салатовый
const colorSent = "#AFDAF3"; // светло-голубой
const colorBad = "#bec6ce"; // серый

const SdcControlVertex = (props: {
  setOpen: Function;
  idx: number;
  trigger: boolean;
  change: Function;
  //interval: any;
  //pusk: boolean; // служебный параметр для повторного подряд запуска светофора
}) => {
  //== Piece of Redux ======================================
  const map = useSelector((state: any) => {
    const { mapReducer } = state;
    return mapReducer.map.dateMap;
  });
  //console.log("MAP:", map);
  let massfaz = useSelector((state: any) => {
    const { massfazReducer } = state;
    return massfazReducer.massfaz;
  });
  //console.log("0massfaz:", massfaz);
  let datestat = useSelector((state: any) => {
    const { statsaveReducer } = state;
    return statsaveReducer.datestat;
  });
  const debug = datestat.debug;
  const ws = datestat.ws;
  //const DEMO = datestat.demo;
  const dispatch = useDispatch();
  let timer = debug || DEMO ? 10000 : 60000;

  console.log("MAP:", props.idx, map.tflight[props.idx]);

  statusVertex = map.tflight[props.idx].tlsost.num;
  statusName = map.tflight[props.idx].tlsost.description;
  let clinch = CLINCH.indexOf(statusVertex) < 0 ? false : true;
  //========================================================
  const [sentParam, setSentParam] = React.useState(-1);
  const [flagPusk, setFlagPusk] = React.useState(false);
  const [trigger, setTrigger] = React.useState(false);

  //=== инициализация ======================================
  console.log("OldIDX:", oldIdx, props.idx, !datestat.working);
  if (oldIdx !== props.idx && !datestat.working) {
    let massFaz = {
      idx: props.idx,
      area: Number(datestat.area),
      id: datestat.id,
      faza: -1,
      fazaSist: -1,
      fazaZU: 0,
      phases: [],
      idevice: map.tflight[props.idx].idevice,
    };
    let sumFaz = map.tflight[props.idx].phases.length;
    kolFaz = sumFaz < MaxFaz ? sumFaz + 1 : MaxFaz;
    needDopKnop = sumFaz === MaxFaz ? false : true;
    kluchGl = map.tflight[props.idx].ID + " ";

    let nomIn = massMem.indexOf(props.idx); // запускался ли светофор ранее?
    console.log("1!!!nomIn < 0", nomIn, massMem);
    if (nomIn < 0) {
      massfaz.push(massFaz);
      massMem.push(props.idx); // светофор ранее не запускался
      datestat.timerId.push(null);
      nomInMass = massMem.length - 1;
      datestat.massInt.push([]);
      massfaz[nomInMass].idx = props.idx;
      datestat.stopSwitch.push(false);
      shippedKU.push(false);
      datestat.tekDemoTlsost.push(-1);
      oldSistFaza.push(-1);
      console.log("2!!!nomIn < 0", nomInMass, massMem);
    } else {
      nomInMass = nomIn;
    }
    mF = massfaz[nomInMass];
    dispatch(massfazCreate(massfaz));
    !DEMO && SendSocketDispatch(debug, ws, mF.idevice, 4, 1);
    setSentParam(-1);

    //if (DEMO && nomIn < 0) {
    if (nomIn < 0) {
      datestat.demoIdx.push(props.idx);
      datestat.demoLR.push(false);
      datestat.demoTlsost.push(1);
      mF.fazaSist = 1;
      datestat.timerId[nomInMass] = setInterval(() => DoTimerId(), timer);
      datestat.massInt[nomInMass] = datestat.timerId[nomInMass];
    }

    datestat.working = true; // занято
    dispatch(statsaveCreate(datestat));
    oldIdx = props.idx;
  } else {
    if (mF.fazaSist !== 9 && mF.fazaSist !== 12) {
      if (oldSistFaza[nomInMass] !== mF.fazaSist) {
        setSentParam(-1);
        oldSistFaza[nomInMass] = mF.fazaSist;
      }
    }
  }

  //========================================================
  const CloseInterval = (nominmass: number) => {
    console.log("CloseInt:", nominmass, datestat.massInt[nominmass]);
    if (datestat.massInt[nominmass]) {
      clearInterval(datestat.massInt[nominmass]);
      datestat.massInt[nominmass] = null;
    }
    datestat.timerId[nominmass] = null;
  };

  const handleCloseSet = React.useCallback(() => {
    if (!DEMO && shippedKU[nomInMass])
      SendSocketDispatch(debug, ws, mF.idevice, 4, 0);
    datestat.working = false; // свободно
    // if (DEMO) {
    //   datestat.demoTlsost[nomInMass] = 1;
    //   props.change(datestat.demoTlsost[nomInMass]);
    // }
    dispatch(statsaveCreate(datestat));
    oldIdx = -1;

    console.log("1Финиш:", shippedKU[nomInMass]);
    console.log("2Финиш:", datestat.timerId, datestat.massInt);

    props.setOpen(false);
  }, [datestat, debug, ws, props, dispatch]);
  //========================================================
  const handleClick = (mode: number) => {
    if (needDopKnop && mode === kolFaz) {
      kolFaz = MaxFaz; // Развернуть кнопки
      needDopKnop = false;
      setTrigger(!trigger); // ререндер
    } else {
      mF.faza = mode;
      datestat.stopSwitch[nomInMass] = true;
      dispatch(massfazCreate(massfaz));
      shippedKU[nomInMass] = mode === 9 ? true : false;

      console.log(nomInMass, "New_Отправка ", mode, shippedKU[nomInMass], mF);

      !DEMO && SendSocketDispatch(debug, ws, mF.idevice, 9, mode);

      if (mode > 8 || !mode) mF.fazaZU = 0; // ЖМ, ОС, ЛР или КУ (10,11,0,9)
      if (mode < 9 && mode > 0) {
        // передана фаза
        if (datestat.timerId[nomInMass] === null) {
          datestat.timerId[nomInMass] = setInterval(() => DoTimerId(), timer);
          datestat.massInt = datestat.timerId[nomInMass];
        }
        console.log("Отпр:", nomInMass, datestat.timerId, datestat.massInt);
        if (DEMO) {
          needRend = true;
          setFlagPusk(!flagPusk);
        }
      } else {
        if (mode === 9) {
          console.log("1Пришло КУ", datestat.massInt, datestat.timerId);
          console.log("2Пришло КУ", props.idx, nomInMass, massMem);
          let nomIn = massMem.indexOf(props.idx);
          if (nomIn >= 0) massMem[nomIn] = -1;
          CloseInterval(nomInMass);
          console.log("Почистили", mode, datestat.massInt, datestat.timerId);
          handleCloseSet();
          return;
        }
      }
      if (DEMO) {
        // проверка режима ЛР
        if (mode === 0) {
          datestat.demoLR[nomInMass] = true;
          dispatch(statsaveCreate(datestat));
        } else {
          if (datestat.demoLR[nomInMass]) {
            datestat.demoLR[nomInMass] = false;
          }
        }
      }
      dispatch(statsaveCreate(datestat));
      setSentParam(mode);
    }
  };
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
    let mF = massfaz[present];
    //console.log("Отправка с", DEMO, present, datestat.timerId[present], mF);
    if (!DEMO) {
      if (mF.fazaZU) {
        console.log("Отправлена фаза c id", mF.id, mF.faza);
        SendSocketDispatch(debug, ws, mF.idevice, 9, mF.faza);
      } else console.log("Пустышка!!! c id", mF.id);
    } else {
      datestat.demoTlsost[present] = 1;
      if (!datestat.stopSwitch[present]) {
        mF.fazaSist = mF.fazaSist === 2 ? 1 : 2;
      } else {
        mF.fazaSist = mF.faza;
      }
      dispatch(massfazCreate(massfaz));
      console.log("datestat!!!", mF.fazaSist, datestat.stopSwitch[present]);
      needRend = true;
      setFlagPusk(!flagPusk);
    }

    if (DEMO && mF.faza < 9 && mF.faza > 0) datestat.demoTlsost[present] = 2; // Передана фаза

    if (DEMO) {
      if ((!mF.fazaSist && !mF.faza) || (mF.fazaSist === 9 && mF.faza === 9)) {
        console.log("DEMO ЛР или КУ");
        if (!mF.fazaSist && !mF.faza) datestat.demoTlsost[present] = 5; // ЛР
        if (mF.fazaSist === 9 && mF.faza === 9)
          datestat.demoTlsost[present] = 1; // КУ
        mF.fazaSist = 1;

        needRend = true;
        setFlagPusk(!flagPusk);

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
        // console.log("1massInt[present][i]",datestat.massInt);
        // for (let i = 0; i < datestat.massInt.length - 1; i++) {
        //   console.log("2massInt[present][i]", i, datestat.massInt[present][i]);
        //   if (datestat.massInt[present][i]) {
        //     clearInterval(datestat.massInt[present][i]);
        //     datestat.massInt[present][i] = null;
        //   }
        // }

        console.log("$$$$$$:", present, datestat.massInt);

        // datestat.massInt[present] = datestat.massInt[present].filter(function (el: any) {
        //   return el !== null;
        // });
      }
    }

    if (datestat.tekDemoTlsost[present] !== datestat.demoTlsost[present]) {
      if (datestat.demoLR[present]) {
        props.change(5);
        datestat.tekDemoTlsost[present] = 5;
      } else {
        props.change(datestat.demoTlsost[present]);
        datestat.tekDemoTlsost[present] = datestat.demoTlsost[present];
      }
    }
    dispatch(statsaveCreate(datestat));
  };
  //========================================================
  const OutputFaza = (img: any, i: number) => {
    let widthHeight = 70;
    //if (!img) widthHeight = 35;
    return (
      <>
        {img && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            style={{ width: window.innerHeight / 5.5, height: widthHeight }}
          >
            <image
              width={"95%"}
              height={"100%"}
              xlinkHref={"data:image/png;base64," + img}
            />
          </svg>
        )}
        {!img && i >= 0 && <Box sx={{ fontSize: 41 }}>{i + 1}</Box>}
        {!img && i < 0 && <Box sx={{ fontSize: 33 }}>Фазы ЗУ</Box>}
      </>
    );
  };

  const StrokaFazaKnop = () => {
    let resStr = [];
    if (map.tflight[props.idx].phases.length > 0) {
      for (let i = 0; i < kolFaz; i++) {
        //console.log('StrokaFazaKnop:',i,mF.fazaSist)
        let colorKnop = clinch ? colorBad : colorNormal;
        let bShadow = 4;
        if (sentParam === i + 1) colorKnop = colorSent;
        if (mF.fazaSist === i + 1) {
          colorKnop = colorExtra;
          bShadow = 12;
        }
        if (needDopKnop && i === kolFaz - 1) colorKnop = colorNormal;
        let styleMenuVar = StyleModalMenuVar(colorKnop, bShadow);
        let contentKnop1 =
          needDopKnop && i === kolFaz - 1 ? null : datestat.phSvg[i];
        let contentKnop2 = needDopKnop && i === kolFaz - 1 ? -1 : i;
        let num = needDopKnop && i === kolFaz - 1 ? "" : (i + 1).toString();

        resStr.push(
          <Grid container key={i}>
            <Grid item xs={0.5} sx={styleVarKnopNum}>
              <b>{num}</b>
            </Grid>
            <Grid item xs={11.5} sx={styleKnop}>
              <Box sx={styleOutputFaza}>
                <Button sx={styleMenuVar} onClick={() => handleClick(i + 1)}>
                  {OutputFaza(contentKnop1, contentKnop2)}
                </Button>
              </Box>
            </Grid>
          </Grid>
        );
      }
    }
    return resStr;
  };

  const OutputConstFaza = (mode: string) => {
    let colorKnop = colorNormal;
    let bShadow = 4;
    let handleMode = 0;
    switch (mode) {
      case "ЖМ":
        handleMode = 10;
        if (sentParam === 10) colorKnop = colorSent;
        if (mF.fazaSist === 10 || mF.fazaSist === 14) {
          colorKnop = colorExtra;
          bShadow = 12;
        }
        break;
      case "ОС":
        handleMode = 11;
        if (sentParam === 11) colorKnop = colorSent;
        if (mF === 11 || mF.fazaSist === 15) {
          colorKnop = colorExtra;
          bShadow = 12;
        }
        break;
      case "ЛР":
        if (DEMO && sentParam === 0) colorKnop = colorSent;
        handleMode = 0;
        break;
      case "КУ":
        if (DEMO && sentParam === 9) colorKnop = colorSent;
        handleMode = 9;
    }
    let styleMenuConst = StyleModalMenuConst(colorKnop, bShadow);

    return (
      <Grid item xs={12} sx={styleKnop}>
        <Box sx={styleOutputFaza}>
          <Button sx={styleMenuConst} onClick={() => handleClick(handleMode)}>
            <b>{mode}</b>
          </Button>
        </Box>
      </Grid>
    );
  };

  let styleSetControl = StyleSetControl(DEMO);

  if (needRend) {
    needRend = false;
    setFlagPusk(!flagPusk);
  }

  //=== отслеживания клика мышом за пределами рамки ========
  const boxer = React.useRef(null);

  const Clicker = (ref: any) => {
    const handleClickOutside = React.useCallback(
      (event: any) => {
        if (ref.current && !ref.current.contains(event.target))
          handleCloseSet();
      },
      [ref]
    );

    React.useEffect(() => {
      document.addEventListener("click", handleClickOutside, true);
      return () => {
        document.removeEventListener("click", handleClickOutside, true);
      };
    }, [handleClickOutside]);
  };

  Clicker(boxer);
  //========================================================
  let titleDEMO = DEMO ? "( Демонстрационный режим )" : "";

  return (
    <Box ref={boxer} sx={styleSetControl}>
      <Button sx={styleModalEnd} onClick={handleCloseSet}>
        &#10006;
      </Button>
      <Box sx={styleTitleDEMO}>{titleDEMO}</Box>
      <Box sx={StyleTitle(17)}>
        <em>
          [id{kluchGl}] <b>{map.tflight[props.idx].description}</b>
        </em>
      </Box>
      <Box sx={styleControl01}>
        <Grid container sx={{}}>
          <Grid item xs={8} sx={{ padding: "0px 6px 0px 1px" }}>
            <Grid container>{StrokaFazaKnop()} </Grid>
          </Grid>
          <Grid item xs sx={{ paddingRight: 1 }}>
            <Grid container>
              {OutputConstFaza("ЖМ")}
              {OutputConstFaza("ОС")}
              {OutputConstFaza("ЛР")}
              {OutputConstFaza("КУ")}
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <Box sx={StyleTitle(12.1)}>
        cостояние:{" "}
        <em>
          <b>{statusName}</b>
        </em>
      </Box>
    </Box>
  );
};

export default SdcControlVertex;
