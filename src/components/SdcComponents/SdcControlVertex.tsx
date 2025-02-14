import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { massfazCreate, statsaveCreate } from "../../redux/actions";

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import { CloseInterval, OutputFaza } from "../SdcServiceFunctions";
import { StatusLine, MakeMassFaz } from "../SdcServiceFunctions";

import { SendSocketDispatch } from "../SdcSocketFunctions";

import { MaxFaz, CLINCH } from "./../MapConst";

import { DEMO } from "./../MainMapSdc";

import { styleModalEnd } from "../MainMapStyle";

import { styleVarKnopNum, styleServis01 } from "./SdcComponentsStyle";
import { styleKnop, styleOutputFaza } from "./SdcComponentsStyle";
import { StyleSetControl, styleControl01 } from "./SdcComponentsStyle";
import { StyleTitle, styleTitleDEMO } from "./SdcComponentsStyle";
import { StyleModalMenuVar, StyleModalMenuConst } from "./SdcComponentsStyle";

//import { DateMAP } from "./../../interfaceMAP.d";
import { Fazer } from "./../../App";

let oldIdx = -1;
let needRend = false;
let oldSistFaza: Array<number> = [];
let shippedKU: Array<boolean> = [];
let needDopKnop: Array<boolean> = []; // нужны ли доп.кнопки на id
let kolFaz: Array<number> = []; // количестово доступных фаз на id
let nomInMass = -1; // номер в массиве "запущенных" светофоров
let present = -1;
let statusVertex = 0;
let statusName = "";
let kluchGl = "";
let mF: any = null;
let INTERVAL = 0;
let INTERVALDOP = 0;

const colorNormal = "#E9F5D8"; // светло-салатовый
//const colorExtra = "#96CD8F"; // тёмно-салатовый
//const colorExtra = "#76ff03"; // светлый лайм
const colorExtra = "#82e94a"; // средний лайм
const colorSent = "#AFDAF3"; // светло-голубой
//const colorBad = "#bec6ce"; // серый
const colorBad = "#FDFEFA"; // бледно-салатовый
//const colorGolden = "#FFFAC6"; // бледно-золотистый
//const colorGolden = "#FDF6BA"; // золотистый
const colorGolden = "#fefe3d"; // ярко-золотистый

let colorKnop = colorBad;
let bShadow = 4;

const SdcControlVertex = (props: {
  setOpen: Function;
  idx: number;
  trigger: boolean;
  change: Function;
}) => {
  //=== Piece of Redux =====================================
  const map = useSelector((state: any) => {
    const { mapReducer } = state;
    return mapReducer.map.dateMap;
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
  const ws = datestat.ws;
  const dispatch = useDispatch();
  let timer = debug || DEMO ? 10000 : 60000;

  statusVertex = map.tflight[props.idx].tlsost.num;
  statusName = map.tflight[props.idx].tlsost.description;
  let clinch = CLINCH.indexOf(statusVertex) < 0 ? false : true;

  // if (window.localStorage.intervalFazaD === undefined)
  //   window.localStorage.intervalFazaD = 0;
  // INTERVAL = Number(window.localStorage.intervalFazaD);

  // if (window.localStorage.intervalFazaDopD === undefined)
  //   window.localStorage.intervalFazaDopD = 0;
  // INTERVALDOP = Number(window.localStorage.intervalFazaDopD);
  INTERVAL = datestat.intervalFaza;
  INTERVALDOP = datestat.intervalFazaDop;
  //========================================================
  const [sentParam, setSentParam] = React.useState(-1);
  const [flagPusk, setFlagPusk] = React.useState(false);
  const [trigger, setTrigger] = React.useState(false);
  //========================================================
  const handleCloseSet = React.useCallback(
    (mode: number) => {
      if (!DEMO && !clinch && shippedKU[nomInMass]) {
        SendSocketDispatch(debug, ws, mF.idevice, 9, 9); // КУ
        SendSocketDispatch(debug, ws, mF.idevice, 4, 0); // закрытие id
      }
      if (mode) datestat.massMem[nomInMass] = mF.idevice = mF.idx = -1;
      datestat.working = false; // свободно
      dispatch(statsaveCreate(datestat));
      dispatch(massfazCreate(massfaz));
      oldIdx = -1;
      props.setOpen(false);
    },
    [datestat, clinch, debug, ws, props, massfaz, dispatch]
  );
  //=== инициализация ======================================
  if (datestat.first) {
    // первый вход в новом режиме управления - очистка внутренних массивов
    oldIdx = -1;
    needRend = false;
    oldSistFaza = [];
    needDopKnop = []; // нужны ли доп.кнопки на id
    kolFaz = []; // количестово доступных фаз на id
    nomInMass = -1; // номер в массиве "запущенных" светофоров
    present = -1;
    datestat.first = false;
    dispatch(statsaveCreate(datestat));
  }
  if (oldIdx !== props.idx && !datestat.working) {
    // открытие светофора (нового или уже ранее запущенного)
    let massFaz: Fazer = MakeMassFaz(props.idx, datestat, map);
    let sumFaz = map.tflight[props.idx].phases.length;
    kluchGl = map.tflight[props.idx].ID + " ";
    let nomIn = datestat.massMem.indexOf(props.idx); // запускался ли светофор ранее?
    if (nomIn < 0) {
      // светофор ранее не запускался
      massfaz.push(massFaz);
      datestat.massMem.push(props.idx); // запись нового id в массив "запущенных" светофоров
      nomInMass = datestat.massMem.length - 1;
      massfaz[nomInMass].idx = props.idx;
      datestat.timerId.push(null); // массив времени отправки команд
      datestat.massInt.push([]);
      datestat.massСounter.push(0); // массив счётчиков отправки КУ на "запущенные" светофоры
      datestat.stopSwitch.push(false);
      shippedKU.push(false);
      datestat.tekDemoTlsost.push(-1);
      oldSistFaza.push(-1);
      kolFaz.push(sumFaz < MaxFaz ? sumFaz + 1 : MaxFaz);
      needDopKnop.push(sumFaz === MaxFaz ? false : true);
    } else nomInMass = nomIn; // повторное открытие

    mF = massfaz[nomInMass];

    console.log("0MASSDK:", massdk);

    if (!DEMO && !clinch) {
      for (let i = 0; i < massdk.length; i++) {
        if (massdk[i].idevice === mF.idevice && mF.idx !== -1) {
          console.log("1MASSDK:",i, massdk[i].phSvg);

          if (massdk[i].phSvg[0]) {
            datestat.phSvg = massdk[i].phSvg; // картинки были присланы ранее
          } else SendSocketDispatch(debug, ws, mF.idevice, 4, 1); // запрос на получение картинок фаз
        }
      }
    }
    setSentParam(-1);
    if (nomIn < 0) {
      // светофор ранее не запускался
      if (DEMO) {
        datestat.demoIdx.push(props.idx);
        datestat.demoLR.push(false);
        datestat.demoTlsost.push(1);
        mF.fazaSist = 1;
      }
      datestat.timerId[nomInMass] = setInterval(() => DoTimerId(), timer);
      datestat.massInt[nomInMass] = datestat.timerId[nomInMass];
    }
    datestat.working = true; // занято
    dispatch(statsaveCreate(datestat));
    dispatch(massfazCreate(massfaz));
    oldIdx = props.idx;
  } else {
    // пришла фаза
    if (mF.faza === 9) {
      // передана КУ
      shippedKU[nomInMass] = true;
      CloseInterval(datestat, nomInMass);
      handleCloseSet(9);
    } else {
      if (mF.fazaSist !== 9 && mF.fazaSist !== 12) {
        if (oldSistFaza[nomInMass] !== mF.fazaSist) {
          if (mF.fazaSist !== 9 && mF.fazaSist === sentParam) setSentParam(-1);
          oldSistFaza[nomInMass] = mF.fazaSist;
        }
      }
    }
  }
  //========================================================
  const handleClick = (mode: number, dopKnop: number) => {
    if (needDopKnop[nomInMass] && dopKnop === -1) {
      kolFaz[nomInMass] = MaxFaz; // Развернуть кнопки
      needDopKnop[nomInMass] = false;
      setTrigger(!trigger); // ререндер
    } else {
      mF.faza = mode;
      datestat.stopSwitch[nomInMass] = true;
      dispatch(massfazCreate(massfaz));
      shippedKU[nomInMass] = mode === 9 ? true : false;
      !DEMO &&
        !clinch &&
        mode !== 9 &&
        SendSocketDispatch(debug, ws, mF.idevice, 9, mode);
      if (mode > 8 || !mode) mF.fazaZU = 0; // ЖМ, ОС, ЛР или КУ (10,11,0,9)
      if (mode < 9 && mode > 0) {
        if (datestat.counterFaza) datestat.massСounter[nomInMass] = INTERVAL; // массив счётчиков отправки КУ на "запущенные" светофоры
        // передана фаза
        if (datestat.timerId[nomInMass] === null) {
          datestat.timerId[nomInMass] = setInterval(() => DoTimerId(), timer);
          datestat.massInt = datestat.timerId[nomInMass];
        }
        if (DEMO) {
          needRend = true;
          setFlagPusk(!flagPusk);
        }
      } else {
        datestat.massСounter[nomInMass] = 0; // массив счётчиков отправки КУ на "запущенные" светофоры
        // передана КУ
        if (mode === 9) {
          let nomIn = datestat.massMem.indexOf(props.idx);
          if (nomIn >= 0) datestat.massMem[nomIn] = -1;
          CloseInterval(datestat, nomInMass);
          handleCloseSet(9);
          return;
        }
      }
      if (DEMO) {
        // проверка режима ЛР
        if (mode === 0) {
          datestat.demoLR[nomInMass] = true;
        } else if (datestat.demoLR[nomInMass])
          datestat.demoLR[nomInMass] = false;
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
    if (!ch) return; // Нет запущенных светофоров!!!

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
    if (!DEMO) {
      if (mF.fazaZU) {
        //============================ мёртвое место?
        console.log("Отправлена фаза c id", mF.id, mF.faza);
        !clinch && SendSocketDispatch(debug, ws, mF.idevice, 9, mF.faza);
      }
      //else console.log("Отправлена пустышка c id", mF.id);
    } else {
      datestat.demoTlsost[present] = 1;
      if (!datestat.stopSwitch[present]) {
        mF.fazaSist = mF.fazaSist === 2 ? 1 : 2;
      } else mF.fazaSist = mF.faza;
      dispatch(massfazCreate(massfaz));
      needRend = true;
      setFlagPusk(!flagPusk);
    }

    if (DEMO && mF.faza < 9 && mF.faza > 0) datestat.demoTlsost[present] = 2; // Передана фаза
    if (DEMO) {
      if ((!mF.fazaSist && !mF.faza) || (mF.fazaSist === 9 && mF.faza === 9)) {
        if (!mF.fazaSist && !mF.faza) datestat.demoTlsost[present] = 5; // ЛР
        if (mF.fazaSist === 9 && mF.faza === 9)
          datestat.demoTlsost[present] = 1; // КУ
        mF.fazaSist = 1;
        needRend = true;
        datestat.stopSwitch[present] = false;
        setFlagPusk(!flagPusk);
        dispatch(massfazCreate(massfaz));
        dispatch(statsaveCreate(datestat));
      }
    }

    if ((DEMO && mF.fazaSist === 10) || (DEMO && mF.fazaSist === 11)) {
      console.log("id:", mF.id, "DEMO ЖМ или ОС");
      if (mF.fazaSist === 10) datestat.demoTlsost[present] = 7; // ЖМ
      if (mF.fazaSist === 11) datestat.demoTlsost[present] = 12; // ОС
      // } else {
      //   if (!DEMO && mF.faza && mF.faza !== 9) {
      //     // console.log("1massInt[present][i]",datestat.massInt);
      //     // for (let i = 0; i < datestat.massInt.length - 1; i++) {
      //     //   console.log("2massInt[present][i]", i, datestat.massInt[present][i]);
      //     //   if (datestat.massInt[present][i]) {
      //     //     clearInterval(datestat.massInt[present][i]);
      //     //     datestat.massInt[present][i] = null;
      //     //   }
      //     // }
      //     console.log(":", present, datestat.massInt);
      //     // datestat.massInt[present] = datestat.massInt[present].filter(function (el: any) {
      //     //   return el !== null;
      //     // });
      //   }
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
  //=== Компоненты =========================================
  const OnColorSent = () => {
    colorKnop = colorSent;
    bShadow = 12;
  };

  const StrokaFazaKnop = () => {
    let resStr = [];
    if (map.tflight[props.idx].phases.length > 0) {
      let ii = kolFaz[nomInMass] < 5 ? 5 : kolFaz[nomInMass];
      for (let i = 0; i < ii; i++) {
        colorKnop = !clinch || DEMO ? colorNormal : colorBad;
        bShadow = 4;
        if (sentParam === i + 1) OnColorSent();
        if (mF.fazaSist === i + 1) {
          // пришедшая фаза
          colorKnop = colorExtra;
          bShadow = 12;
        }
        if (mF.fazaSist === 9 && mF.fazaSistOld === i + 1) {
          // промтакт
          colorKnop = colorGolden;
          bShadow = 12;
        }
        let Knop1 =
          needDopKnop[nomInMass] && i >= kolFaz[nomInMass] - 1
            ? null
            : datestat.phSvg[i];
        let Knop2 = i;
        if (
          needDopKnop[nomInMass] &&
          i >= kolFaz[nomInMass] - 1 &&
          i + 1 === ii
        )
          Knop2 = -1;
        if (needDopKnop[nomInMass] && i >= kolFaz[nomInMass] - 1 && i + 1 < ii)
          Knop2 = -2;
        if (needDopKnop[nomInMass] && Knop2 === -1)
          colorKnop = !clinch || DEMO ? colorNormal : colorBad;
        bShadow = !clinch || DEMO ? bShadow : 0;
        let styleMenu = StyleModalMenuVar(colorKnop, bShadow);
        let num =
          needDopKnop[nomInMass] && i >= kolFaz[nomInMass] - 1
            ? ""
            : (i + 1).toString();
        let I = i + 1;

        resStr.push(
          <Grid container key={i}>
            <Grid item xs={0.5} sx={styleVarKnopNum}>
              <b>{num}</b>
            </Grid>
            <Grid item xs={11.5} justifyContent="center" sx={styleKnop}>
              {Knop2 !== -2 && (
                <Box sx={styleOutputFaza}>
                  {!clinch || DEMO ? (
                    <Button
                      sx={styleMenu}
                      onClick={() => handleClick(I, Knop2)}
                    >
                      {OutputFaza(Knop1, Knop2)}
                    </Button>
                  ) : (
                    <Box sx={styleMenu}>{OutputFaza(Knop1, Knop2)}</Box>
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
        );
      }
    }
    return resStr;
  };

  const OutputConstFaza = (mode: string) => {
    colorKnop = !clinch || DEMO ? colorNormal : colorBad;
    bShadow = 4;
    let handleMode = 0;

    switch (mode) {
      case "ЖМ":
        handleMode = 10;
        if (sentParam === 10) OnColorSent();
        if (mF.fazaSist === 10 || mF.fazaSist === 14) {
          colorKnop = colorExtra;
          bShadow = 12;
        }
        break;
      case "ОС":
        handleMode = 11;
        if (sentParam === 11) OnColorSent();
        if (mF === 11 || mF.fazaSist === 15) {
          colorKnop = colorExtra;
          bShadow = 12;
        }
        break;
      case "ЛР":
        if (DEMO && sentParam === 0) OnColorSent();
        handleMode = 0;
        break;
      case "КУ":
        if (DEMO && sentParam === 9) OnColorSent();
        handleMode = 9;
    }
    bShadow = !clinch || DEMO ? bShadow : 0;

    let styleMenu = StyleModalMenuConst(colorKnop, bShadow);

    return (
      <Grid item xs={12} sx={styleKnop}>
        <Box sx={styleOutputFaza}>
          {!clinch || DEMO ? (
            <Button sx={styleMenu} onClick={() => handleClick(handleMode, 0)}>
              <b>{mode}</b>
            </Button>
          ) : (
            <Box sx={styleMenu}>
              <b>{mode}</b>
            </Box>
          )}
        </Box>
      </Grid>
    );
  };

  const ServisZone = () => {
    return (
      <Grid item xs={12} sx={styleServis01}>
        <Box sx={{ width: "98px", textAlign: "center" }}>
          {!!INTERVAL && (
            <>
              <Box sx={{}}>Интервал фазы ДУ:</Box>
              <Box sx={{ textShadow: "3px 2px 3px rgba(0,0,0,0.3)" }}>
                <b>{INTERVAL}</b>
              </Box>
              {!!INTERVALDOP && (
                <>
                  <Box sx={{}}>Увеличение фазы:</Box>
                  <Box sx={{ textShadow: "3px 2px 3px rgba(0,0,0,0.3)" }}>
                    <b>{INTERVALDOP}</b>
                  </Box>
                </>
              )}
            </>
          )}
        </Box>
      </Grid>
    );
  };
  //=== отслеживания клика мышом за пределами рамки ========
  const boxer = React.useRef(null);

  const ClickLeftKnop = (ref: any) => {
    const handleClickOutside = React.useCallback(
      (event: any) => {
        if (ref.current && !ref.current.contains(event.target))
          handleCloseSet(0);
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

  const ClickRightKnop = (ref: any) => {
    const handleClickRight = React.useCallback(
      (event: any) => {
        if (ref.current && !ref.current.contains(event.target))
          handleCloseSet(0);
      },
      [ref]
    );

    React.useEffect(() => {
      document.addEventListener("contextmenu", handleClickRight, true);
      return () => {
        document.removeEventListener("contextmenu", handleClickRight, true);
      };
    }, [handleClickRight]);
  };

  ClickLeftKnop(boxer);
  ClickRightKnop(boxer);
  //========================================================
  let titleDEMO = DEMO ? "( Демонстрационный режим )" : "";
  let styleSetControl = StyleSetControl(DEMO);
  if (needRend) {
    needRend = false;
    setFlagPusk(!flagPusk);
  }

  return (
    <Box ref={boxer} sx={styleSetControl}>
      <Button sx={styleModalEnd} onClick={() => handleCloseSet(0)}>
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
          <Grid item xs={8} sx={{ border: 0, padding: "0px 6px 0px 1px" }}>
            <Grid container>{StrokaFazaKnop()} </Grid>
          </Grid>
          <Grid item xs sx={{ paddingRight: 1 }}>
            <Grid container>
              {OutputConstFaza("ЖМ")}
              {OutputConstFaza("ОС")}
              {OutputConstFaza("ЛР")}
              {OutputConstFaza("КУ")}
              {ServisZone()}
            </Grid>
          </Grid>
        </Grid>
      </Box>
      {StatusLine(statusName, clinch)}
    </Box>
  );
};

export default SdcControlVertex;
