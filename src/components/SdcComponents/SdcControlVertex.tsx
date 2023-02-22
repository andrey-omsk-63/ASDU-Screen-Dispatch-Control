import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { massfazCreate, statsaveCreate } from "../../redux/actions";

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
//import Modal from '@mui/material/Modal';

import { SendSocketDispatch } from "../SdcSocketFunctions";

import { styleModalEnd } from "../MainMapStyle";
import { styleSetControl, styleVarKnop } from "./SdcComponentsStyle";
import { styleVarKnopNum } from "./SdcComponentsStyle";
import { styleConstKnop, styleOutputFaza } from "./SdcComponentsStyle";

let oldIdx = -1;
let oldSistFaza = -1;
let timerId: any = null;
let massInt: any[] = [];

let kluchGl = "";
//let soobErr = "";

const colorNormal = "#E9F5D8"; // светло-салатовый
const colorExtra = "#96CD8F"; // тёмно-салатовый
const colorSent = "#AFDAF3"; // светло-голубой

const SdcControlVertex = (props: {
  setOpen: Function;
  idx: number;
  trigger: boolean;
}) => {
  //== Piece of Redux ======================================
  const map = useSelector((state: any) => {
    const { mapReducer } = state;
    return mapReducer.map.dateMap;
  });
  let massfaz = useSelector((state: any) => {
    const { massfazReducer } = state;
    return massfazReducer.massfaz;
  });
  //console.log("massfaz:", massfaz, map.tflight[props.idx]);
  let datestat = useSelector((state: any) => {
    const { statsaveReducer } = state;
    return statsaveReducer.datestat;
  });
  //console.log("datestat", datestat);
  const debug = datestat.debug;
  const ws = datestat.ws;
  const homeRegion = datestat.region;
  //let imgFaza = datestat.phSvg;
  const dispatch = useDispatch();
  //========================================================
  //const [openSet, setOpenSet] = React.useState(true);
  //const [openSetErr, setOpenSetErr] = React.useState(false);
  const [sentParam, setSentParam] = React.useState(-1);

  //=== инициализация ======================================
  if (oldIdx !== props.idx) {
    datestat.working = true; // занато
    dispatch(statsaveCreate(datestat));
    kluchGl = homeRegion + "-" + map.tflight[props.idx].area.num + "-";
    kluchGl += map.tflight[props.idx].ID + " ";
    massfaz.idevice = map.tflight[props.idx].idevice;
    dispatch(massfazCreate(massfaz));
    oldSistFaza = -1;
    timerId = null;
    massInt = [];
    SendSocketDispatch(debug, ws, massfaz.idevice, 4, 1);
    setSentParam(-1);
    oldIdx = props.idx;
  } else {
    if (massfaz.fazaSist !== 9 && massfaz.fazaSist !== 12) {
      if (oldSistFaza !== massfaz.fazaSist) {
        setSentParam(-1);
        oldSistFaza = massfaz.fazaSist;
      }
    }
  }

  function textWidth(text: string, fontProp: any) {
    let tag = document.createElement("div");
    tag.style.position = "absolute";
    tag.style.left = "-999em";
    tag.style.whiteSpace = "nowrap";
    tag.style.font = fontProp;
    tag.innerHTML = text;

    document.body.appendChild(tag);
    let result = tag.clientWidth;
    document.body.removeChild(tag);
    return result;
  }

  let theCSSprop = window
    .getComputedStyle(document.body, null)
    .getPropertyValue("font-family");
  console.log("theCSSprop", theCSSprop); // output: serif
  let bb = "bold 13px " + theCSSprop;

  let aa = textWidth("🐷 🐷", "bold 13px Segoe UI");

  console.log("AA:", aa);

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
    console.log("Отправка ", massfaz.faza, timerId, massInt);
    SendSocketDispatch(debug, ws, massfaz.idevice, 9, massfaz.faza);
    for (let i = 0; i < massInt.length - 1; i++) {
      if (massInt[i]) {
        clearInterval(massInt[i]);
        massInt[i] = null;
      }
    }
    massInt = massInt.filter(function (el: any) {
      return el !== null;
    });
  };

  const handleCloseSet = () => {
    if (timerId) CloseInterval(); // принудительное закрытие
    console.log("Финиш", timerId, massInt);
    oldIdx = -1;
    props.setOpen(false);
    //setOpenSet(false);
    SendSocketDispatch(debug, ws, massfaz.idevice, 4, 0);
    datestat.working = false; // свободно
    dispatch(statsaveCreate(datestat));
  };

  const handleClick = (mode: number) => {
    console.log("New_Отправка ", mode, timerId, massInt);
    massfaz.faza = mode;
    dispatch(massfazCreate(massfaz));
    SendSocketDispatch(debug, ws, massfaz.idevice, 9, mode);
    if (mode < 9 && mode > 0) {
      timerId = setInterval(() => DoTimerId(), 60000);
      massInt.push(timerId);
    } else {
      CloseInterval();
    }
    setSentParam(mode);
  };

  const StrokaFazaKnop = () => {
    let resStr = [];

    if (map.tflight[props.idx].phases.length > 0) {
      for (let i = 0; i < map.tflight[props.idx].phases.length; i++) {
        //for (let i = 0; i < 8; i++) {
        let colorKnop = colorNormal;
        if (sentParam === i + 1) colorKnop = colorSent;
        if (massfaz.fazaSist === i + 1) colorKnop = colorExtra;

        const styleModalMenuVar = {
          // maxHeight: '9.2vh',
          // minHeight: '9.2vh',
          maxHeight: "69px",
          minHeight: "69px",
          width: "208px",
          backgroundColor: colorKnop,
          color: "black",
          textTransform: "unset !important",
        };

        resStr.push(
          <Grid container key={i}>
            <Grid item xs={0.5} sx={styleVarKnopNum}>
              <b>{i + 1}</b>
            </Grid>
            <Grid item xs={11.5} sx={styleVarKnop}>
              <Box sx={styleOutputFaza}>
                <Button
                  sx={styleModalMenuVar}
                  variant="contained"
                  onClick={() => handleClick(i + 1)}
                >
                  {OutputFaza(datestat.phSvg[i])}
                </Button>
              </Box>
            </Grid>
          </Grid>
        );
      }
    }
    return resStr;
  };

  const OutputFaza = (img: any) => {
    // let widthHeight = window.innerHeight / 10.5;
    // if (!img) widthHeight = window.innerHeight / 21;
    let widthHeight = 70;
    if (!img) widthHeight = 35;
    return (
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
    );
  };

  const OutputConstFaza = (mode: string) => {
    let colorKnop = colorNormal;
    let handleMode = 0;
    switch (mode) {
      case "ЖМ":
        handleMode = 10;
        if (sentParam === 10) colorKnop = colorSent;
        if (massfaz.fazaSist === 10 || massfaz.fazaSist === 14)
          colorKnop = colorExtra;
        break;
      case "ОС":
        handleMode = 11;
        if (sentParam === 11) colorKnop = colorSent;
        if (massfaz.fazaSist === 11 || massfaz.fazaSist === 15)
          colorKnop = colorExtra;
        break;
      case "ЛР":
        handleMode = 0;
        break;
      case "КУ":
        handleMode = 9;
    }

    const styleModalMenuConst = {
      fontSize: 40,
      // maxHeight: '9.2vh',
      // minHeight: '9.2vh',
      maxHeight: "69px",
      minHeight: "69px",
      width: "100px",
      backgroundColor: colorKnop,
      color: "black",
      textTransform: "unset !important",
    };

    return (
      <Grid item xs={12} sx={styleConstKnop}>
        <Box sx={styleOutputFaza}>
          <Button
            sx={styleModalMenuConst}
            variant="contained"
            onClick={() => handleClick(handleMode)}
          >
            <b>{mode}</b>
          </Button>
        </Box>
      </Grid>
    );
  };

  return (
    // <Modal open={openSet} onClose={handleCloseSet} hideBackdrop>
    <Box sx={styleSetControl}>
      <Button sx={styleModalEnd} onClick={handleCloseSet}>
        &#10006;
      </Button>
      <Box sx={{ fontSize: 17, marginTop: 1, textAlign: "center" }}>
        <b>Перекрёсток {kluchGl}</b>[<b>{massfaz.idevice}</b>]
      </Box>
      <Grid container sx={{ marginTop: 1.5 }}>
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
      {/* {openSetErr && (
          <GsErrorMessage setOpen={setOpenSetErr} sErr={soobErr} />
        )} */}
    </Box>
    // </Modal>
  );
};

export default SdcControlVertex;
