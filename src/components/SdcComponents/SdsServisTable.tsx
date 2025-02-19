import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { massfazCreate, statsaveCreate } from "../../redux/actions";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import SdcFieldOfMiracles from "./SdcFieldOfMiracles";

import { CloseInterval, HeaderTabl } from "../SdcServiceFunctions";

import { SendSocketDispatch } from "../SdcSocketFunctions";

import { styleServisMenu, styleServis00 } from "../MainMapStyle";
import { styleToDo01, styleToDo02, styleServis01 } from "../MainMapStyle";

const SdsServisTable = (props: {}) => {
  //== Piece of Redux ======================================
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
  const dispatch = useDispatch();
  const debug = datestat.debug;
  const ws = datestat.ws;
  const DEMO = datestat.demo;
  //========================================================
  const Сlosing = () => {
    console.log("Принудительный Финиш!!!"); // принудительное закрытие

    for (let i = 0; i < massfaz.length; i++) {
      if (massfaz[i].idx !== -1) {
        CloseInterval(datestat, i);
        if (!DEMO) {
          SendSocketDispatch(debug, ws, massfaz[i].idevice, 9, 9); // КУ
          SendSocketDispatch(debug, ws, massfaz[i].idevice, 4, 0); // закрытие id
        }
        massfaz[i].idx = massfaz[i].idevice = datestat.massMem[i] = -1;
        datestat.massСounter[i] = 0; // массив счётчиков отправки КУ на "запущенные" светофоры
      }
    }
    dispatch(massfazCreate(massfaz));
    dispatch(statsaveCreate(datestat));
  };
  //====== ИНИЦИАЛИЗАЦИЯ ====================================================================

  //====== Компоненты =====================================
  const OutputFazaImg = (img: any, i: number) => {
    let widthHeight = 60;
    if (!img) widthHeight = 30;
    return (
      <>
        {img && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            style={{ width: widthHeight, height: widthHeight }}
          >
            <image
              width={"100%"}
              height={"100%"}
              xlinkHref={"data:image/png;base64," + img}
            />
          </svg>
        )}
        {!img && <Box sx={{ color: "#7620a2", fontSize: 33 }}>{i}</Box>}
      </>
    );
  };

  const StrokaTabl = () => {
    const ClickAddition = (idx: number) => {
      let INTERVALDOP = datestat.intervalFazaDop;
      if (datestat.massСounter[idx] > 0 && INTERVALDOP) {
        datestat.massСounter[idx] += INTERVALDOP; // подкачка счётчика
        dispatch(statsaveCreate(datestat));
      }
    };

    return massfaz.map((massf: any, id: number) => {
      let takt: any = massf.faza;
      let fazaImg: null | string = null;
      for (let i = 0; i < massdk.length - 1; i++) {
        if (massdk[i].idevice === massf.idevice) {
          fazaImg = massdk[i].phSvg[takt - 1];
        }
      }
      let pictImg: any = "";
      if (massf.faza) pictImg = OutputFazaImg(fazaImg, massf.faza);

      return (
        <Grid key={id} container sx={{ fontSize: 14 }}>
          {datestat.massСounter[id] > 0 && massf.idx >= 0 && (
            <>
              <Grid item xs={0.8} sx={{ paddingTop: 0.3, textAlign: "center" }}>
                {massf.id}
              </Grid>
              <SdcFieldOfMiracles idx={id} func={ClickAddition} />
              <Grid
                item
                xs={0.5}
                sx={{ textAlign: "right", padding: "3px 0 0 0" }}
              >
                {takt}
              </Grid>
              <Grid item xs={2} sx={{ border: 0, textAlign: "center" }}>
                {pictImg}
              </Grid>
              <Grid item xs sx={{ fontSize: 14, padding: "3px 2px 3px 0px" }}>
                {massf.name}
              </Grid>
            </>
          )}
        </Grid>
      );
    });
  };

  let kino = DEMO ? "(Демо)" : "";

  return (
    <Box sx={styleServis00}>
      <Box sx={styleToDo02(DEMO)}>Активные светофоры {kino}</Box>
      <Box sx={styleToDo01}>
        {HeaderTabl()}
        <Box sx={styleServis01}>{StrokaTabl()}</Box>
      </Box>
      <Box sx={{ marginTop: 0.5, textAlign: "center" }}>
        <Button sx={styleServisMenu} onClick={() => Сlosing()}>
          Закрыть все светофоры
        </Button>
      </Box>
    </Box>
  );
};

export default SdsServisTable;
