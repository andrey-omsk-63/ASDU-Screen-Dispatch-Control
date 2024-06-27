import * as React from "react";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

import { DEMO } from "./MainMapSdc";

import { styleServis03, StyleTitle } from "./SdcComponents/SdcComponentsStyle";
import { styleServis04 } from "./SdcComponents/SdcComponentsStyle";

export const CenterCoord = (aY: number, aX: number, bY: number, bX: number) => {
  let coord0 = (aY - bY) / 2 + bY;
  if (aY < bY) coord0 = (bY - aY) / 2 + aY;
  let coord1 = (aX - bX) / 2 + bX;
  if (aX < bX) coord1 = (bX - aX) / 2 + aX;
  return [coord0, coord1];
};

export const CloseInterval = (datestat: any, nominmass: number) => {
  //console.log("CloseInt:", nominmass, datestat.massInt[nominmass]);
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
//=== Placemark =====================================
export const GetPointData = (index: number, map: any, icContent: string) => {
  let cont1 = "";
  let cont2 = "";
  let cont3 = "";
  cont1 = map.tflight[index].description + "<br/>";
  cont3 = map.tflight[index].tlsost.description + "<br/>";
  cont2 = "[";
  // + map.tflight[index].area.num + ", ";
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
  const handleKey = (event: any) => {
    if (event.key === "Enter") event.preventDefault();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!otherWork) {
      setCurrency(Number(event.target.value));
      switch (Number(event.target.value)) {
        case 0: // заголовок
          func(61);
          setCurrency(1);
          break;
        case 1: // режим управления
          func(61);
          break;
        case 2: // режим Demo
          func(62);
      }
    }
  };

  let dat = ["Режимы работы:", "● Режим управления", "● Режим Демо"];
  let massKey = [];
  let massDat: any[] = [];
  const currencies: any = [];
  for (let key in dat) {
    massKey.push(key);
    massDat.push(dat[key]);
  }
  for (let i = 0; i < massKey.length; i++) {
    let maskCurrencies = {
      value: "",
      label: "",
    };
    maskCurrencies.value = massKey[i];
    maskCurrencies.label = massDat[i];
    currencies.push(maskCurrencies);
  }

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
              fontSize:  15,
              //fontSize: 14,
              fontWeight: 500,
              color: currency === 2 ? "red" : "black",
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
                fontWeight: option.label === "Режимы работы:" ? 800 : 300,
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
  const handleKey = (event: any) => {
    if (event.key === "Enter") event.preventDefault();
  };

  return (
    <Box sx={styleServis03}>
      <Box component="form" sx={styleServis04}>
        <TextField
          size="small"
          onKeyPress={handleKey} //отключение Enter
          type="number"
          InputProps={{ disableUnderline: true }}
          inputProps={{
            style: {
              //maxHeight: "1px",
              //minHeight: "1px",
              fontSize: 12,
              //backgroundColor: "#FFFBE5", // топлёное молоко
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

export const OutputFaza = (img: any, i: number) => {
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

export const StatusLine = (statusName: string) => {
  return (
    <>
      {!DEMO && (
        <Box sx={StyleTitle(12.1)}>
          cостояние:{" "}
          <em>
            <b>{statusName}</b>
          </em>
        </Box>
      )}
    </>
  );
};
