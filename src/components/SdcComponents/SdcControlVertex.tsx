import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { massfazCreate, statsaveCreate } from "../../redux/actions";

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import { SendSocketDispatch } from "../SdcSocketFunctions";

import { styleModalEnd } from "../MainMapStyle";

import { styleVarKnopNum, styleVarKnop } from "./SdcComponentsStyle";
import { styleConstKnop, styleOutputFaza } from "./SdcComponentsStyle";
import { StyleSetControl, styleControl01 } from "./SdcComponentsStyle";
import { styleTitle, styleTitleDEMO } from "./SdcComponentsStyle";
import { StyleModalMenuVar, StyleModalMenuConst } from "./SdcComponentsStyle";

let oldIdx = -1;
let oldSistFaza = -1;
let timerId: any = null;
let massInt: any[] = [];
let needRend = false;
let kluchGl = "";
let stopSwitch = false;
let tekDemoTlsost = -1;
let shippedKU = false;

const colorNormal = "#E9F5D8"; // светло-салатовый
const colorExtra = "#96CD8F"; // тёмно-салатовый
const colorSent = "#AFDAF3"; // светло-голубой

const SdcControlVertex = (props: {
  setOpen: Function;
  idx: number;
  trigger: boolean;
  change: Function;
}) => {
  //== Piece of Redux ======================================
  const map = useSelector((state: any) => {
    const { mapReducer } = state;
    return mapReducer.map.dateMap;
  });
  console.log("MAP:", map);
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
  const DEMO = datestat.demo;
  const dispatch = useDispatch();
  let timer = debug || DEMO ? 10000 : 60000;
  //========================================================
  const [sentParam, setSentParam] = React.useState(-1);
  const [flagPusk, setFlagPusk] = React.useState(false);

  //=== инициализация ======================================
  if (oldIdx !== props.idx) {
    datestat.working = true; // занато
    //kluchGl = map.tflight[props.idx].area.num + "-";
    kluchGl = map.tflight[props.idx].ID + " ";
    let massFaz = {
      idx: 0,
      area: 0,
      id: 0,
      faza: 0,
      fazaSist: -1,
      phases: [],
      idevice: map.tflight[props.idx].idevice,
    };
    massfaz = massFaz;
    dispatch(massfazCreate(massfaz));
    oldSistFaza = -1;
    timerId = null;
    massInt = [];
    shippedKU = false;
    !DEMO && SendSocketDispatch(debug, ws, massfaz.idevice, 4, 1);
    setSentParam(-1);
    oldIdx = props.idx;
    stopSwitch = false;
    if (DEMO) {
      datestat.demoIdx = props.idx;
      datestat.demoLR = false;
      datestat.demoTlsost = 1;
      massfaz.fazaSist = 1;
      timerId = setInterval(() => DoTimerId(), timer);
      massInt.push(timerId);
    }
    dispatch(statsaveCreate(datestat));
  } else {
    if (massfaz.fazaSist !== 9 && massfaz.fazaSist !== 12) {
      if (oldSistFaza !== massfaz.fazaSist) {
        setSentParam(-1);
        oldSistFaza = massfaz.fazaSist;
      }
    }
  }

  //========================================================
  const CloseInterval = () => {
    for (let i = 0; i < massInt.length; i++) {
      if (massInt[i]) {
        clearInterval(massInt[i]);
        massInt[i] = null;
      }
    }
    timerId = null;
  };

  const DoTimerId = () => {
    console.log("DoTimerId:", massfaz);
    if (!DEMO) {
      SendSocketDispatch(debug, ws, massfaz.idevice, 9, massfaz.faza);
    } else {
      datestat.demoTlsost = 1;
      if (!stopSwitch) {
        massfaz.fazaSist = massfaz.fazaSist === 2 ? 1 : 2;
      } else {
        massfaz.fazaSist = massfaz.faza;
      }
      dispatch(massfazCreate(massfaz));
      needRend = true;
      setFlagPusk(!flagPusk);
    }
    if (DEMO && massfaz.faza < 9 && massfaz.faza > 0) datestat.demoTlsost = 2; // Передана фаза
    if (DEMO) {
      if (
        (!massfaz.fazaSist && !massfaz.faza) ||
        (massfaz.fazaSist === 9 && massfaz.faza === 9)
      ) {
        console.log("DEMO ЛР или КУ");
        if (!massfaz.fazaSist && !massfaz.faza) datestat.demoTlsost = 5; // ЛР
        if (massfaz.fazaSist === 9 && massfaz.faza === 9)
          datestat.demoTlsost = 1; // КУ
        massfaz.fazaSist = 1;
        dispatch(massfazCreate(massfaz));
        stopSwitch = false;
      }
    }
    if (timerId === null) {
      timerId = setInterval(() => DoTimerId(), timer);
      massInt.push(timerId);
    }
    if (
      (DEMO && massfaz.fazaSist === 10) ||
      (DEMO && massfaz.fazaSist === 11)
    ) {
      console.log("DEMO ЖМ или ОС");
      if (massfaz.fazaSist === 10) datestat.demoTlsost = 7; // ЖМ
      if (massfaz.fazaSist === 11) datestat.demoTlsost = 12; // ОС
    } else {
      if (!DEMO && massfaz.faza && massfaz.faza !== 9) {
        for (let i = 0; i < massInt.length - 1; i++) {
          if (massInt[i]) {
            clearInterval(massInt[i]);
            massInt[i] = null;
          }
        }
        massInt = massInt.filter(function (el: any) {
          return el !== null;
        });
      }
    }
    if (DEMO) {
      dispatch(statsaveCreate(datestat));
      if (tekDemoTlsost !== datestat.demoTlsost) {
        if (datestat.demoLR) {
          props.change(5);
          tekDemoTlsost = 5;
        } else {
          props.change(datestat.demoTlsost);
          tekDemoTlsost = datestat.demoTlsost;
        }
      }
    }
  };

  const handleCloseSet = () => {
    if (timerId) CloseInterval(); // принудительное закрытие
    console.log("Финиш", shippedKU, timerId, massInt);
    oldIdx = -1;
    props.setOpen(false);
    if (!DEMO && shippedKU)
      SendSocketDispatch(debug, ws, massfaz.idevice, 4, 0);
    datestat.working = false; // свободно
    if (DEMO) {
      datestat.demoTlsost = 1;
      props.change(datestat.demoTlsost);
    }
    dispatch(statsaveCreate(datestat));
  };

  const handleClick = (mode: number) => {
    massfaz.faza = mode;
    stopSwitch = true;
    dispatch(massfazCreate(massfaz));
    shippedKU = mode === 9 ? true : false;

    console.log("New_Отправка ", shippedKU, mode, massfaz);

    !DEMO && SendSocketDispatch(debug, ws, massfaz.idevice, 9, mode);
    if (mode < 9 && mode > 0) {
      if (timerId === null) {
        timerId = setInterval(() => DoTimerId(), timer);
        massInt.push(timerId);
      }
      if (DEMO) {
        needRend = true;
        setFlagPusk(!flagPusk);
      }
    } else {
      if (!DEMO) CloseInterval();
    }
    if (DEMO) {
      // проверка режима ЛР
      if (mode === 0) {
        datestat.demoLR = true;
        dispatch(statsaveCreate(datestat));
      } else {
        if (datestat.demoLR) {
          datestat.demoLR = false;
          dispatch(statsaveCreate(datestat));
        }
      }
    }
    setSentParam(mode);
  };

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
        {!img && <Box sx={{ fontSize: 41 }}>{i + 1}</Box>}
      </>
    );
  };

  const StrokaFazaKnop = () => {
    let resStr = [];
    if (map.tflight[props.idx].phases.length > 0) {
      // for (let i = 0; i < map.tflight[props.idx].phases.length; i++) {
      for (let i = 0; i < 8; i++) {
        let colorKnop = colorNormal;
        let bShadow = 4;
        if (sentParam === i + 1) colorKnop = colorSent;
        if (massfaz.fazaSist === i + 1) {
          colorKnop = colorExtra;
          bShadow = 12;
        }
        let styleMenuVar = StyleModalMenuVar(colorKnop, bShadow);

        resStr.push(
          <Grid container key={i}>
            <Grid item xs={0.5} sx={styleVarKnopNum}>
              <b>{i + 1}</b>
            </Grid>
            <Grid item xs={11.5} sx={styleVarKnop}>
              <Box sx={styleOutputFaza}>
                <Button sx={styleMenuVar} onClick={() => handleClick(i + 1)}>
                  {OutputFaza(datestat.phSvg[i], i)}
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
        if (massfaz.fazaSist === 10 || massfaz.fazaSist === 14) {
          colorKnop = colorExtra;
          bShadow = 12;
        }
        break;
      case "ОС":
        handleMode = 11;
        if (sentParam === 11) colorKnop = colorSent;
        if (massfaz.fazaSist === 11 || massfaz.fazaSist === 15) {
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
      <Grid item xs={12} sx={styleConstKnop}>
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

  let titleDEMO = DEMO ? "( Демонстрационный режим )" : "";
  
  return (
    <Box sx={styleSetControl}>
      <Button sx={styleModalEnd} onClick={handleCloseSet}>
        &#10006;
      </Button>
      <Box sx={styleTitleDEMO}>{titleDEMO}</Box>
      <Box sx={styleTitle}>
        <em>
          [id{kluchGl}] <b>{map.tflight[props.idx].description}</b>
        </em>
      </Box>
      <Box sx={styleControl01}>
        <Grid container sx={{}}>
          <Grid item xs={8} sx={{ paddingLeft: 0.1, paddingRight: 0.5 }}>
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
    </Box>
  );
};

export default SdcControlVertex;
