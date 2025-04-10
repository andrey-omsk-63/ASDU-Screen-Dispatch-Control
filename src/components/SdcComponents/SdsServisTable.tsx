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
import { styleToDo03, styleToDo05 } from "../MainMapStyle";

let takt: any = 0;

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
  const DEMO = datestat.demo;
  const LastEntryRef: any = React.useRef(null);
  //========================================================
  const Сlosing = (idx: number) => {
    const СloseIdx = (i: number) => {
      if (massfaz[i].idx !== -1) {
        CloseInterval(datestat, i);
        if (!DEMO) {
          SendSocketDispatch(massfaz[i].idevice, 9, 9); // КУ
          SendSocketDispatch(massfaz[i].idevice, 4, 0); // закрытие id
        }
        massfaz[i].idx = massfaz[i].idevice = datestat.massMem[i] = -1;
        datestat.massСounter[i] = 0; // массив счётчиков отправки КУ на "запущенные" светофоры
      }
    };

    if (idx < 0) {
      console.log("Принудительный Финиш всех светофоров!!!"); // принудительное закрытие
      for (let i = 0; i < massfaz.length; i++) СloseIdx(i);
    } else СloseIdx(idx);
    dispatch(massfazCreate(massfaz));
    dispatch(statsaveCreate(datestat));
  };
  //====== ИНИЦИАЛИЗАЦИЯ ==================================

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

  const ServisFaza = (faza: string) => {
    takt = "";
    return <Box sx={{ color: "#7620a2", fontSize: 27 }}>{faza}</Box>;
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
      takt = massf.faza;
      let fazaImg: null | string = null;
      for (let i = 0; i < massdk.length - 1; i++) {
        if (massdk[i].idevice === massf.idevice)
          fazaImg = massdk[i].phSvg[takt - 1];
      }

      let pictImg: any = "";
      switch (massf.faza) {
        case 0:
          pictImg = ServisFaza("ЛР");
          break;
        case 10:
          pictImg = ServisFaza("ЖМ");
          break;
        case 11:
          pictImg = ServisFaza("ОС");
          break;
        case 14:
          pictImg = ServisFaza("ЖМ");
          break;
        case 15:
          pictImg = ServisFaza("ОС");
          break;
        default:
          pictImg = OutputFazaImg(fazaImg, massf.faza);
      }

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
              <Grid
                item
                xs={5.9}
                sx={{ fontSize: 14, padding: "3px 2px 3px 0" }}
              >
                {massf.name}
              </Grid>
              <Grid item xs={0.7} sx={{ border: 0 }}>
                <Box sx={styleToDo03}>
                  <Box sx={styleToDo05} onClick={() => Сlosing(id)}>
                    &nbsp;&times;&nbsp;
                  </Box>
                </Box>
              </Grid>
            </>
          )}
        </Grid>
      );
    });
  };

  let kino = DEMO ? "(Демо)" : "";
  // 👇️ scroll to bottom
  LastEntryRef.current && LastEntryRef.current.scrollIntoView();

  return (
    <Box sx={styleServis00}>
      <Box sx={styleToDo02(DEMO)}>Активные светофоры {kino}</Box>
      <Box sx={styleToDo01}>
        {HeaderTabl()}
        <Box sx={styleServis01}>
          {StrokaTabl()}
          <div ref={LastEntryRef} />
        </Box>
      </Box>
      <Box sx={{ marginTop: 0.5, textAlign: "center" }}>
        <Button sx={styleServisMenu} onClick={() => Сlosing(-1)}>
          Закрыть все светофоры
        </Button>
      </Box>
    </Box>
  );
};

export default SdsServisTable;
