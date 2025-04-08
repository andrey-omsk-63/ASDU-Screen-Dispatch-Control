import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { statsaveCreate } from "../../redux/actions";

import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

import { BadExit, ExitCross, FooterContent } from "../SdcServiceFunctions";
import { StrTablVert, WaysInput, InputFromList } from "../SdcServiceFunctions";
import { PreparCurrenciesDispVert, ShiftOptimal } from "../SdcServiceFunctions";

import { styleSetPK03 } from "../MainMapStyle";
import { styleSetPK01, styleSetPK02 } from "../MainMapStyle";

let flagInput = true;
let HAVE = 0;

let counterFaza = true; // наличие счётчика длительность фазы ДУ
let backlight = false; // подсветка запущенных светофоров
let typeVert = 0; // тип отображаемых CO на карте: 0 - значки СО 1 - картинка фаз 2 - номер фаз(счётчик)
let intervalFaza = 0; // Задаваемая длительность фазы ДУ (сек)
let intervalFazaDop = 0; // Увеличениение длительности фазы ДУ (сек)

let currenciesDV: any = [];

const SdcSetup = (props: { close: Function }) => {
  //== Piece of Redux =======================================
  let datestat = useSelector((state: any) => {
    const { statsaveReducer } = state;
    return statsaveReducer.datestat;
  });
  const dispatch = useDispatch();
  //========================================================
  const [open, setOpen] = React.useState(true);
  const [badExit, setBadExit] = React.useState(false);
  const [trigger, setTrigger] = React.useState(false);
  //=== инициализация ======================================
  if (flagInput) {
    HAVE = 0;
    typeVert = datestat.typeVert;
    backlight = datestat.backlight;
    counterFaza = datestat.counterFaza;
    intervalFaza = datestat.intervalFaza;
    intervalFazaDop = datestat.intervalFazaDop;
    currenciesDV = PreparCurrenciesDispVert();
    flagInput = false;
  }
  //========================================================
  const [currencyDV, setCurrencyDV] = React.useState(
    datestat.typeVert.toString()
  );

  const handleClose = () => {
    flagInput = true;
    setOpen(false);
    props.close(false);
  };

  const handleCloseBad = () => {
    HAVE && setBadExit(true);
    !HAVE && handleClose();
  };

  const CloseEnd = (event: any, reason: string) => {
    if (reason === "escapeKeyDown") handleCloseBad();
  };

  const handleCloseBadExit = (mode: boolean) => {
    setBadExit(false);
    mode && handleClose(); // выход без сохранения
  };
  //=== Функции - обработчики ==============================
  const SaveForm = (mode: number) => {
    if (mode) {
      //записать в LocalStorage и datestat
      window.localStorage.typeVert = datestat.typeVert = typeVert;
      window.localStorage.backLight = backlight ? 1 : 0; // наличие подсветки запущенных светофоро
      datestat.backlight = backlight;
      window.localStorage.counterFazaD = counterFaza ? 1 : 0; // наличие счётчика длительность фазы ДУ
      datestat.counterFaza = counterFaza;
      window.localStorage.intervalFazaD = datestat.intervalFaza = intervalFaza; // задаваемая длительность фазы ДУ (сек)
      window.localStorage.intervalFazaDopD = datestat.intervalFazaDop =
        intervalFazaDop; // увеличениение длительности фазы ДУ (сек)
      dispatch(statsaveCreate(datestat));
      handleClose();
    } else handleCloseBad();
  };

  const handleChangeDV = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrencyDV(event.target.value);
    typeVert = Number(event.target.value);
    Haver();
  };

  const Haver = () => {
    HAVE++;
    setTrigger(!trigger); // ререндер
  };

  const ChangeBacklight = () => {
    backlight = !backlight;
    Haver();
  };

  const ChangeCounter = () => {
    counterFaza = !counterFaza;
    Haver();
  };

  const SetInterval = (valueInp: number) => {
    intervalFaza = valueInp; // задаваемая длительность фазы ДУ (сек)
    if (!intervalFaza) intervalFazaDop = 0; // увеличениение длительности фазы ДУ (сек)
    Haver();
  };

  const SetIntervalDop = (valueInp: number) => {
    if (intervalFaza) {
      intervalFazaDop = valueInp; // увеличениение длительности фазы ДУ (сек)
      Haver();
    }
  };
  //========================================================
  const styleSetID = {
    fontSize: 14,
    width: "53px",
    maxHeight: "22px",
    minHeight: "22px",
    border: "1px solid #d4d4d4", // серый
    borderRadius: 1,
    color: "#A8A8A8", // серый
    padding: "3px 0px 0px 3px",
  };

  let kv = '"'
  let light: string = kv + 'Подсвечивать' + kv + ' запущенные светофоры';

  const SetupContent = () => {
    return (
      <>
        <Box sx={{ fontSize: 12, marginTop: 0.5, color: "#5B1080" }}>
          Отображение светофорных объектов на карте
        </Box>
        {StrTablVert(
          true,
          7.7,
          "Запущенные светофоры отображаются",
          InputFromList(handleChangeDV, currencyDV, currenciesDV)
        )}
        {StrTablVert(
          true,
          7.7,
          light,
          ShiftOptimal(backlight, ChangeBacklight, -0.1)
        )}

        <Box sx={{ fontSize: 12, marginTop: 0.5, color: "#5B1080" }}>
          Параметры перекрёстков
        </Box>
        {StrTablVert(
          true,
          7.7,
          "Задавать счётчик длительность фазы ДУ",
          ShiftOptimal(counterFaza, ChangeCounter, -0.1)
        )}
        {StrTablVert(
          counterFaza,
          7.7,
          "Задаваемая длительность фазы ДУ (сек)",
          counterFaza ? (
            WaysInput(0, intervalFaza, SetInterval, 0, 1000)
          ) : (
            <Box sx={styleSetID}>{intervalFaza}</Box>
          )
        )}
        {StrTablVert(
          counterFaza,
          7.7,
          "Увеличениение длительности фазы ДУ (сек)",
          counterFaza ? (
            WaysInput(0, intervalFazaDop, SetIntervalDop, 0, 1000)
          ) : (
            <Box sx={styleSetID}>{intervalFazaDop}</Box>
          )
        )}
      </>
    );
  };

  return (
    <>
      <Modal open={open} onClose={CloseEnd} hideBackdrop={false}>
        <Box sx={styleSetPK01(580, 337)}>
          {ExitCross(handleCloseBad)}
          <Box sx={styleSetPK02}>
            <b>Системные параметры по умолчанию</b>
          </Box>
          <Box sx={styleSetPK03}>{SetupContent()}</Box>
          {HAVE > 0 && <>{FooterContent(SaveForm)}</>}
        </Box>
      </Modal>
      {badExit && <>{BadExit(badExit, handleCloseBadExit)}</>}
    </>
  );
};

export default SdcSetup;
