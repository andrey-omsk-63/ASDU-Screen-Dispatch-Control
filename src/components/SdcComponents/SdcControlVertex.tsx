import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { massfazCreate, statsaveCreate } from "../../redux/actions";

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
//import TextField from "@mui/material/TextField";

import { CloseInterval, Inputer, OutputFaza } from "../SdcServiceFunctions";
import { StatusLine } from "../SdcServiceFunctions";

import { SendSocketDispatch } from "../SdcSocketFunctions";

import { MaxFaz, CLINCH } from "./../MapConst";

import { DEMO } from "./../MainMapSdc";

import { styleModalEnd } from "../MainMapStyle";

import { styleVarKnopNum, styleServis05 } from "./SdcComponentsStyle";
import { styleKnop, styleOutputFaza } from "./SdcComponentsStyle";
import { StyleSetControl, styleControl01 } from "./SdcComponentsStyle";
import { StyleTitle, styleTitleDEMO } from "./SdcComponentsStyle";
import { StyleModalMenuVar, StyleModalMenuConst } from "./SdcComponentsStyle";
import { styleServis01, StyleServis02 } from "./SdcComponentsStyle";

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
let modeOk = false;
let INTERVAL = 0;

const colorNormal = "#E9F5D8"; // светло-салатовый
const colorExtra = "#96CD8F"; // тёмно-салатовый
const colorSent = "#AFDAF3"; // светло-голубой
const colorBad = "#bec6ce"; // серый

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

  if (window.localStorage.interval === undefined)
    window.localStorage.interval = 0;
  INTERVAL = Number(window.localStorage.interval);
  //========================================================
  const [sentParam, setSentParam] = React.useState(-1);
  const [flagPusk, setFlagPusk] = React.useState(false);
  const [modeKnopZone, setModeKnopZone] = React.useState(
    INTERVAL ? true : false
  );
  const [value, setValue] = React.useState(INTERVAL);
  const [trigger, setTrigger] = React.useState(false);
  //========================================================
  const handleCloseSet = React.useCallback(() => {
    if (!DEMO && shippedKU[nomInMass])
      SendSocketDispatch(debug, ws, mF.idevice, 4, 0);
    datestat.working = false; // свободно
    dispatch(statsaveCreate(datestat));
    oldIdx = -1;
    // console.log("1Финиш:", shippedKU[nomInMass], datestat.massMem);
    // console.log("2Финиш:", datestat.timerId, datestat.massInt);
    props.setOpen(false);
  }, [datestat, debug, ws, props, dispatch]);
  //=== инициализация ======================================
  if (datestat.first) {
    // первый вход в новом режиме управления - очистка внутренних массивов
    oldIdx = -1;
    needRend = modeOk = false;
    oldSistFaza = [];
    needDopKnop = []; // нужны ли доп.кнопки на id
    kolFaz = []; // количестово доступных фаз на id
    nomInMass = -1; // номер в массиве "запущенных" светофоров
    present = -1;
    datestat.first = false;
    dispatch(statsaveCreate(datestat));
  }
  if (oldIdx !== props.idx && !datestat.working) {
    let massFaz = {
      idx: props.idx,
      area: Number(datestat.area),
      id: datestat.id,
      faza: -1,
      fazaSist: -1,
      fazaZU: 0, // 0 - отправлено ЖМ, ОС, ЛР или КУ (10,11,0,9)
      phases: [],
      idevice: map.tflight[props.idx].idevice,
      coordinates: [
        map.tflight[props.idx].points.Y,
        map.tflight[props.idx].points.X,
      ],
    };
    let sumFaz = map.tflight[props.idx].phases.length;
    kluchGl = map.tflight[props.idx].ID + " ";
    let nomIn = datestat.massMem.indexOf(props.idx); // запускался ли светофор ранее?
    console.log("запускался ли светофор ранее?", nomIn, datestat.massMem); //============= потом убрать ===
    if (nomIn < 0) {
      // светофор ранее не запускался
      massfaz.push(massFaz);
      console.log("MASSFAZ:", massfaz);
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
    !DEMO && SendSocketDispatch(debug, ws, mF.idevice, 4, 1);
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
    modeOk = false;
  } else {
    if (mF.faza === 9) {
      CloseInterval(datestat, nomInMass);
      handleCloseSet();
    } else {
      if (mF.fazaSist !== 9 && mF.fazaSist !== 12) {
        if (oldSistFaza[nomInMass] !== mF.fazaSist) {
          setSentParam(-1);
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

      console.log(nomInMass, "New_Отправка ", mode, shippedKU[nomInMass], mF);

      !DEMO && SendSocketDispatch(debug, ws, mF.idevice, 9, mode);
      if (mode > 8 || !mode) mF.fazaZU = 0; // ЖМ, ОС, ЛР или КУ (10,11,0,9)
      if (mode < 9 && mode > 0) {
        datestat.massСounter[nomInMass] = INTERVAL; // массив счётчиков отправки КУ на "запущенные" светофоры
        // передана фаза
        if (datestat.timerId[nomInMass] === null) {
          datestat.timerId[nomInMass] = setInterval(() => DoTimerId(), timer);
          datestat.massInt = datestat.timerId[nomInMass];
        }
        console.log("Отпр:", nomInMass, datestat.timerId, datestat.massСounter); //============= потом убрать ===
        if (DEMO) {
          needRend = true;
          setFlagPusk(!flagPusk);
        }
      } else {
        datestat.massСounter[nomInMass] = 0; // массив счётчиков отправки КУ на "запущенные" светофоры
        // передана КУ
        if (mode === 9) {
          //console.log("1Пришло КУ", datestat.massInt, datestat.timerId); //============= потом убрать ===
          //console.log("2Пришло КУ", props.idx, nomInMass, datestat.massMem); //============= потом убрать ===
          let nomIn = datestat.massMem.indexOf(props.idx);
          if (nomIn >= 0) datestat.massMem[nomIn] = -1;
          CloseInterval(datestat, nomInMass);
          console.log("Почистили", mode, datestat.massInt, datestat.timerId); //============= потом убрать ===
          handleCloseSet();
          return;
        }
      }
      if (DEMO) {
        // проверка режима ЛР
        if (mode === 0) {
          datestat.demoLR[nomInMass] = true;
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
    !ch && console.log("Нет запущенных светофоров!!!"); //============= потом убрать ===
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
    if (!DEMO) {
      if (mF.fazaZU) {
        //============================ мёртвое место?
        console.log("Отправлена фаза c id", mF.id, mF.faza);
        SendSocketDispatch(debug, ws, mF.idevice, 9, mF.faza);
      }
      //else console.log("Отправлена пустышка c id", mF.id);
    } else {
      datestat.demoTlsost[present] = 1;
      if (!datestat.stopSwitch[present]) {
        mF.fazaSist = mF.fazaSist === 2 ? 1 : 2;
      } else {
        mF.fazaSist = mF.faza;
      }
      dispatch(massfazCreate(massfaz));
      //console.log("Отпр id", mF.id, mF.fazaSist, datestat.stopSwitch[present]); //============= потом убрать ===
      needRend = true;
      setFlagPusk(!flagPusk);
    }

    if (DEMO && mF.faza < 9 && mF.faza > 0) datestat.demoTlsost[present] = 2; // Передана фаза
    if (DEMO) {
      if ((!mF.fazaSist && !mF.faza) || (mF.fazaSist === 9 && mF.faza === 9)) {
        console.log("id:", mF.id, "DEMO ЛР или КУ", mF.faza); //============= потом убрать ===
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
  const StrokaFazaKnop = () => {
    let resStr = [];
    if (map.tflight[props.idx].phases.length > 0) {
      let ii = kolFaz[nomInMass] < 5 ? 5 : kolFaz[nomInMass];
      for (let i = 0; i < ii; i++) {
        let colorKnop = clinch ? colorBad : colorNormal;
        let bShadow = 4;
        if (sentParam === i + 1) colorKnop = colorSent;
        if (mF.fazaSist === i + 1) {
          colorKnop = colorExtra;
          bShadow = 12;
        }
        let contentKnop1 =
          needDopKnop[nomInMass] && i >= kolFaz[nomInMass] - 1
            ? null
            : datestat.phSvg[i];
        let contentKnop2 = i;
        if (
          needDopKnop[nomInMass] &&
          i >= kolFaz[nomInMass] - 1 &&
          i + 1 === ii
        )
          contentKnop2 = -1;
        if (needDopKnop[nomInMass] && i >= kolFaz[nomInMass] - 1 && i + 1 < ii)
          contentKnop2 = -2;
        if (needDopKnop[nomInMass] && contentKnop2 === -1)
          colorKnop = colorNormal;
        let styleMenuVar = StyleModalMenuVar(colorKnop, bShadow);
        let num =
          needDopKnop[nomInMass] && i >= kolFaz[nomInMass] - 1
            ? ""
            : (i + 1).toString();

        resStr.push(
          <Grid container key={i}>
            <Grid item xs={0.5} sx={styleVarKnopNum}>
              <b>{num}</b>
            </Grid>
            <Grid item xs={11.5} sx={styleKnop}>
              {contentKnop2 !== -2 && (
                <Box sx={styleOutputFaza}>
                  <Button
                    sx={styleMenuVar}
                    onClick={() => handleClick(i + 1, contentKnop2)}
                  >
                    {OutputFaza(contentKnop1, contentKnop2)}
                  </Button>
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
          <Button
            sx={styleMenuConst}
            onClick={() => handleClick(handleMode, 0)}
          >
            <b>{mode}</b>
          </Button>
        </Box>
      </Grid>
    );
  };

  const IntInput = () => {
    const handleChange = (event: any) => {
      let valueInp = event.target.value.replace(/^0+/, "");
      if (Number(valueInp) < 0) valueInp = 0;
      if (valueInp === "") valueInp = 0;
      valueInp = Math.trunc(Number(valueInp));
      modeOk = true;
      setValue(valueInp);
    };

    return <>{Inputer(value, handleChange)} </>;
  };

  const ServisZone = () => {
    const ClickZone = () => {
      modeOk = false;
      if (modeKnopZone) {
        // обнулить интервал
        window.localStorage.interval = 0;
        INTERVAL = Number(window.localStorage.interval);
        for (let i = 0; i < datestat.massСounter.length; i++)
          if (datestat.massСounter[i]) datestat.massСounter[i] = 1;
        dispatch(statsaveCreate(datestat));
        setValue(0);
      }
      setModeKnopZone(!modeKnopZone);
    };

    const ClickOk = () => {
      modeOk = false;
      let newInterval = Number(value);
      //let difference = INTERVAL - newInterval;
      //if (!INTERVAL) {
      for (let i = 0; i < datestat.massСounter.length; i++) {
        // задать интервал
        if (massfaz[i].faza < 9 && massfaz[i].faza > 0) {
          datestat.massСounter[i] = newInterval;
          dispatch(statsaveCreate(datestat));
        }
      }
      console.log("1ClickOk:", datestat.massСounter, massfaz);
      //} else {
      // корректировать интервал
      //   for (let i = 0; i < datestat.massСounter.length; i++) {
      //     if (datestat.massСounter[i]) {
      //       datestat.massСounter[i] = difference - datestat.massСounter[i];
      //       if (datestat.massСounter[i] < 0) datestat.massСounter[i] = 1;
      //     }
      //   }
      // }
      dispatch(statsaveCreate(datestat));
      window.localStorage.interval = newInterval;
      INTERVAL = newInterval;
      setTrigger(!trigger);
    };

    let nameKnop = modeKnopZone ? "Отм.интервала" : "Интервал ДУ";

    return (
      <Grid item xs={12} sx={styleServis01}>
        <Button sx={StyleServis02("100px")} onClick={() => ClickZone()}>
          {nameKnop}
        </Button>
        {modeKnopZone && (
          <Box sx={{ width: "98px", textAlign: "center" }}>
            <Box sx={{ fontSize: 11.0, color: "#5B1080" }}>
              Интервал фазы ДУ:
            </Box>
            <Box sx={{ display: "flex", padding: "5px 0px 0px 0px" }}>
              {IntInput()}
              {modeOk ? (
                <Button sx={StyleServis02("27px")} onClick={() => ClickOk()}>
                  Да
                </Button>
              ) : (
                <>
                  <Box sx={{ color: "#DFE2E7" }}>.</Box>
                  <Box sx={styleServis05}>сек</Box>
                </>
              )}
            </Box>
          </Box>
        )}
      </Grid>
    );
  };
  //=== отслеживания клика мышом за пределами рамки ========
  const boxer = React.useRef(null);

  const ClickLeftKnop = (ref: any) => {
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

  const ClickRightKnop = (ref: any) => {
    const handleClickRight = React.useCallback(
      (event: any) => {
        if (ref.current && !ref.current.contains(event.target))
          handleCloseSet();
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
              {ServisZone()}
            </Grid>
          </Grid>
        </Grid>
      </Box>
      {StatusLine(statusName)}
    </Box>
  );
};

export default SdcControlVertex;
