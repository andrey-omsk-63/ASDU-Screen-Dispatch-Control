import * as React from "react";

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";

import { FullscreenControl, GeolocationControl } from "react-yandex-maps";
import { RulerControl, SearchControl } from "react-yandex-maps";
import { TrafficControl, TypeSelector, ZoomControl } from "react-yandex-maps";

import { DEMO } from "./MainMapSdc";
//import { CLINCH } from "./MapConst";

import { styleServis03, StyleTitle } from "./SdcComponents/SdcComponentsStyle";
import { styleServis04 } from "./SdcComponents/SdcComponentsStyle";
import { searchControl, styleModalEnd } from "./MainMapStyle";

export const handleKey = (event: any) => {
  if (event.key === "Enter") event.preventDefault();
};

export const CenterCoord = (aY: number, aX: number, bY: number, bX: number) => {
  let coord0 = (aY - bY) / 2 + bY;
  if (aY < bY) coord0 = (bY - aY) / 2 + aY;
  let coord1 = (aX - bX) / 2 + bX;
  if (aX < bX) coord1 = (bX - aX) / 2 + aX;
  return [coord0, coord1];
};

export const CenterCoordBegin = (map: any) => {
  let mapp = map.tflight;
  let min = 999;
  let max = 0;
  let nomMin = -1;
  let nomMax = -1;
  for (let i = 0; i < mapp.length; i++) {
    if (mapp[i].points.X < min) {
      nomMin = i;
      min = mapp[i].points.X;
    }
    if (mapp[i].points.X > max) {
      nomMax = i;
      max = mapp[i].points.X;
    }
  }

  return CenterCoord(
    mapp[nomMin].points.Y,
    mapp[nomMin].points.X,
    mapp[nomMax].points.Y,
    mapp[nomMax].points.X
  );

  // return CenterCoord(
  //   map.dateMap.boxPoint.point0.Y,
  //   map.dateMap.boxPoint.point0.X,
  //   map.dateMap.boxPoint.point1.Y,
  //   map.dateMap.boxPoint.point1.X
  // );
};

export const SaveZoom = (zoom: number, pointCenter: Array<number>) => {
  window.localStorage.ZoomDU = zoom;
  window.localStorage.PointCenterDU0 = pointCenter[0];
  window.localStorage.PointCenterDU1 = pointCenter[1];
  //console.log('SaveZoom:',window.localStorage.ZoomDU)
};

export const CloseInterval = (datestat: any, nominmass: number) => {
  if (datestat.massInt[nominmass]) {
    clearInterval(datestat.massInt[nominmass]);
    datestat.massInt[nominmass] = null;
  }
  datestat.timerId[nominmass] = null;
};

export const Distance = (coord1: Array<number>, coord2: Array<number>) => {
  if (coord1[0] === coord2[0] && coord1[1] === coord2[1]) {
    return 0;
  } else {
    let radlat1 = (Math.PI * coord1[0]) / 180;
    let radlat2 = (Math.PI * coord2[0]) / 180;
    let theta = coord1[1] - coord2[1];
    let radtheta = (Math.PI * theta) / 180;
    let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) dist = 1;
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515 * 1609.344;
    return dist;
  }
};

export const YandexServices = () => {
  return (
    <>
      <FullscreenControl />
      <GeolocationControl options={{ float: "left" }} />
      <RulerControl options={{ float: "right" }} />
      <SearchControl options={searchControl} />
      <TrafficControl options={{ float: "right" }} />
      <TypeSelector options={{ float: "right" }} />
      <ZoomControl options={{ float: "right" }} />
    </>
  );
};
//=== Placemark =====================================
export const GetPointData = (index: number, map: any, icContent: string) => {
  let cont1 = "";
  let cont2 = "";
  let cont3 = "";
  cont1 = map.tflight[index].description + "<br/>";
  cont3 = map.tflight[index].tlsost.description + "<br/>";
  cont2 = "[";
  cont2 += map.tflight[index].ID + ", " + map.tflight[index].idevice + "]";

  return { hintContent: cont1 + cont3 + cont2, iconContent: icContent };
};

export const GetPointOptions1 = (Hoster: any) => {
  return {
    // данный тип макета
    iconLayout: "default#image",
    // изображение иконки метки
    iconImageHref: Hoster(),
    // размеры метки
    iconImageSize: [30, 38],
    // её "ножки" (точки привязки)
    iconImageOffset: [-15, -38],
    //iconCaption: "подсказка",
  };
};

//=== Разное =======================================
export const InputDirect = (func: any, otherWork: boolean) => {
  const styleSetNapr = {
    width: "160px",
    maxHeight: "2px",
    minHeight: "2px",
    bgcolor: "#BAE186", // салатовый
    border: "1px solid #93D145", // тёмно салатовый
    borderRadius: 1,
    p: 1.25,
    textAlign: "center",
    boxShadow: 6,
  };

  const styleBoxFormNapr = {
    "& > :not(style)": {
      marginTop: "-10px",
      marginLeft: "-12px",
      width: "185px",
    },
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!otherWork) {
      //setCurrency(Number(event.target.value));
      switch (Number(event.target.value)) {
        case 0: // заголовок
          func(61);
          setCurrency(1);
          break;
        case 1: // режим управления
          setCurrency(Number(event.target.value));
          func(61);
          break;
        case 2: // настройки
          func(63);
          //setCurrency(oldMode === 61 ? 1 : 3); // встать пункт меню из которого вызвана настройка
          break;
        case 3: // режим Demo
          setCurrency(Number(event.target.value));
          func(62);
          break;
      case 4: // Фрагменты
        func(64);
        setCurrency(1);
      }
    }
  };

  let dat = [
    "Режимы работы:",
    "● Режим управления",
    "● Настройки",
    "● Режим Демо",
    "● Фрагменты",
  ];
  let massKey = [];
  let massDat: any[] = [];
  const currencies: any = [];
  for (let key in dat) {
    massKey.push(key);
    massDat.push(dat[key]);
  }
  for (let i = 0; i < massKey.length; i++)
    currencies.push({ value: massKey[i], label: massDat[i] });

  const [currency, setCurrency] = React.useState(1);

  return (
    <Box sx={styleSetNapr}>
      <Box component="form" sx={styleBoxFormNapr}>
        <TextField
          select
          size="small"
          onKeyPress={handleKey} //отключение Enter
          value={currency}
          onChange={handleChange}
          InputProps={{
            disableUnderline: true,
            style: {
              fontSize: 15,
              fontWeight: 500,
              color: currency === 3 ? "red" : "black",
            },
          }}
          variant="standard"
          color="secondary"
        >
          {currencies.map((option: any) => (
            <MenuItem
              key={option.value}
              value={option.value}
              sx={{
                fontSize: 15,
                color:
                  option.label === "● Режим Демо"
                    ? "red"
                    : option.label === "Режимы работы:"
                    ? "blue"
                    : "black",
                cursor: option.label === "Режимы работы:" ? "none" : "pointer",
                fontWeight: option.label === "Режимы работы:" ? 800 : 350,
              }}
            >
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>
    </Box>
  );
};

export const StrokaMenuGlob = (func: any, otherWork: boolean) => {
  const styleApp01 = {
    fontSize: 14,
    marginRight: 0.1,
    marginLeft: 0.5,
    width: 185,
    paddingBottom: 0.5,
  };

  return <Box sx={styleApp01}>{InputDirect(func, otherWork)}</Box>;
};

export const Inputer = (value: any, handleChange: any) => {
  return (
    <Box sx={styleServis03}>
      <Box component="form" sx={styleServis04}>
        <TextField
          size="small"
          onKeyPress={handleKey} //отключение Enter
          type="number"
          InputProps={{ disableUnderline: true }}
          inputProps={{ style: { fontSize: 12, cursor: "pointer" } }}
          value={value}
          onChange={handleChange}
          variant="standard"
          color="secondary"
        />
      </Box>
    </Box>
  );
};
//nline
export const OutputFaza = (img: any, i: number) => {
  let widthHeight = 70;
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

export const StatusLine = (statusName: string, clinch: boolean) => {
  let coler = clinch ? "red" : "#5B1080"; // красный/сиреневый
  return (
    <>
      {!DEMO && (
        <Box sx={{ padding: "2px 0px 0px 0px" }}>
          <Box sx={StyleTitle(12.1)}>
            cостояние:{" "}
            <Box sx={{ display: "inline-block", color: coler }}>
              <em>
                <b>{statusName}</b>
              </em>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};
//=== SdcSetup =====================================
export const BadExit = (badExit: boolean, handleCloseEnd: Function) => {
  const styleSetPoint = {
    outline: "none",
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "1px solid #fff", // белый
    borderRadius: 1,
    textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
    boxShadow: 24,
    textAlign: "center",
    p: 1,
  };

  const styleModalMenu = {
    marginTop: 0.5,
    maxHeight: "24px",
    minHeight: "24px",
    backgroundColor: "#E6F5D6",
    border: "1px solid #d4d4d4", // серый
    borderRadius: 1,
    boxShadow: 6,
    textTransform: "unset !important",
    color: "black",
  };

  const styleModalEndAttent = {
    position: "absolute",
    top: "0%",
    left: "auto",
    right: "-0%",
    maxHeight: "21px",
    minHeight: "21px",
    maxWidth: "2%",
    minWidth: "2%",
    color: "red",
  };

  const handleClose = (mode: boolean) => handleCloseEnd(mode);

  return (
    <Modal open={badExit} onClose={() => handleClose(false)}>
      <Box sx={styleSetPoint}>
        <Button sx={styleModalEndAttent} onClick={() => handleClose(false)}>
          <b>&#10006;</b>
        </Button>
        <Typography variant="h6" sx={{ color: "red" }}>
          ⚠️Предупреждение
        </Typography>
        <Box sx={{ marginTop: 0.5 }}>
          <Box sx={{ marginBottom: 1.2 }}>
            <b>Будет произведён выход без сохранения. Продолжать?</b>
          </Box>
          <Button sx={styleModalMenu} onClick={() => handleClose(true)}>
            Да
          </Button>
          &nbsp;
          <Button sx={styleModalMenu} onClick={() => handleClose(false)}>
            Нет
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export const ExitCross = (func: any) => {
  return (
    <Button sx={styleModalEnd} onClick={() => func()}>
      <b>&#10006;</b>
    </Button>
  );
};

export const FooterContent = (SaveForm: Function) => {
  const styleFormPK03 = {
    maxHeight: "24px",
    minHeight: "24px",
    backgroundColor: "#E6F5D6", // светло салатовый
    border: "1px solid #d4d4d4", // серый
    borderRadius: 1,
    textTransform: "unset !important",
    boxShadow: 6,
    textShadow: "2px 2px 3px rgba(0,0,0,0.3)",
    color: "black",
    padding: "2px 8px 0px 8px",
  };

  const styleSetPK04 = {
    marginTop: 1.2,
    display: "flex",
    justifyContent: "center",
  };

  return (
    <Box sx={styleSetPK04}>
      <Box sx={{ display: "inline-block", margin: "0px 5px 0px 0px" }}>
        <Button sx={styleFormPK03} onClick={() => SaveForm(0)}>
          Выйти без сохранения
        </Button>
      </Box>
      <Box sx={{ display: "inline-block", margin: "0px 5px 0px 5px" }}>
        <Button sx={styleFormPK03} onClick={() => SaveForm(1)}>
          Сохранить изменения
        </Button>
      </Box>
    </Box>
  );
};

export const StrTablVert = (xss: number, recLeft: string, recRight: any) => {
  return (
    <>
      <Grid container sx={{ marginTop: 1 }}>
        <Grid item xs={0.25}></Grid>
        <Grid item xs={xss} sx={{ border: 0 }}>
          <b>{recLeft}</b>
        </Grid>
        {typeof recRight === "object" ? (
          <Grid item xs>
            {recRight}
          </Grid>
        ) : (
          <Grid item xs sx={{ fontSize: 15, color: "#5B1080", border: 0 }}>
            <b>{recRight}</b>
          </Grid>
        )}
      </Grid>
    </>
  );
};

export const WaysInput = (
  idx: number,
  VALUE: any,
  SetValue: Function,
  MIN: number,
  MAX: number
) => {
  let value = VALUE;

  const styleSetID = {
    width: "33px",
    maxHeight: "1px",
    minHeight: "1px",
    border: "1px solid #d4d4d4", // серый
    borderRadius: 1,
    bgcolor: "#FFFBE5", // топлёное молоко
    boxShadow: 6,
    textAlign: "center",
    p: 1.5,
  };

  const styleBoxFormID = {
    "& > :not(style)": {
      marginTop: "3px",
      marginLeft: "-9px",
      width: "53px",
    },
  };

  const handleChange = (event: any) => {
    let valueInp = event.target.value.replace(/^0+/, "");
    if (Number(valueInp) < MIN) valueInp = MIN;
    if (valueInp === "") valueInp = MIN;
    valueInp = Math.trunc(Number(valueInp));
    if (valueInp <= MAX) {
      value = valueInp.toString();
      SetValue(valueInp, idx);
    }
  };

  return (
    <Box sx={styleSetID}>
      <Box component="form" sx={styleBoxFormID}>
        <TextField
          size="small"
          onKeyPress={handleKey} //отключение Enter
          type="number"
          InputProps={{ disableUnderline: true }}
          inputProps={{
            style: {
              marginTop: "-16px",
              padding: "4px 0px 0px 0px",
              fontSize: 14,
              backgroundColor: "#FFFBE5", // топлёное молоко
              cursor: "pointer",
            },
          }}
          value={value}
          onChange={handleChange}
          variant="standard"
          color="secondary"
        />
      </Box>
    </Box>
  );
};
//=====================================================================
