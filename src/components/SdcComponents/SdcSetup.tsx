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

let typeVert = 0; // тип отображаемых CO на карте 0 - значки СО 1 - номер фаз 2 - картинка фаз
let intervalFaza = 0; // Задаваемая длительность фазы ДУ (сек)
let intervalFazaDop = 0; // Увеличениение длительности фазы ДУ (сек)
let currenciesDV: any = [];
let counterFaza = true;

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
    intervalFaza = datestat.intervalFaza;
    intervalFazaDop = datestat.intervalFazaDop;
    currenciesDV = PreparCurrenciesDispVert();
    flagInput = false;
  }
  //========================================================
  const [currencyDV, setCurrencyDV] = React.useState(typeVert.toString());

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
    //marginTop: "0px",
      //marginLeft: "-9px",
    border: "1px solid #d4d4d4", // серый
    borderRadius: 1,
    //bgcolor: "#FFFBE5", // топлёное молоко
    //boxShadow: 6,
    textAlign: "left",
    padding: "3px 0px 0px 3px",
    //p: 1.5,
  };

  const SetupContent = () => {
    return (
      <>
        {/* <Box sx={{ fontSize: 12, color: "#5B1080" }}>
          Тип отображаемых связей
        </Box>
        {StrTablVert(
          7.7,
          "Маршрутизированные (неформальные) связи",
          ShiftOptimal(massForm.typeRoute, ChangeTypeRoute, -0.1)
        )} */}
        <Box sx={{ fontSize: 12, marginTop: 0.5, color: "#5B1080" }}>
          Отображение светофорных объектов на маршруте
        </Box>
        {StrTablVert(
          7.7,
          "Светофоры отображаются",
          InputFromList(handleChangeDV, currencyDV, currenciesDV)
        )}
        <Box sx={{ fontSize: 12, marginTop: 0.5, color: "#5B1080" }}>
          Параметры перекрёстков
        </Box>
        {StrTablVert(
          7.7,
          "Задавать счётчик длительность фазы ДУ",
          ShiftOptimal(counterFaza, ChangeCounter, -0.1)
        )}
        {StrTablVert(
          7.7,
          "Задаваемая длительность фазы ДУ (сек)",
          counterFaza ? (
            WaysInput(0, intervalFaza, SetInterval, 0, 1000)
          ) : (
            <Box sx={styleSetID}>{intervalFaza}</Box>
          )
        )}
        {StrTablVert(
          7.7,
          "Увеличениение длительности фазы ДУ (сек)",
          WaysInput(0, intervalFazaDop, SetIntervalDop, 0, 1000)
        )}
      </>
    );
  };

  return (
    <>
      <Modal open={open} onClose={CloseEnd} hideBackdrop={false}>
        <Box sx={styleSetPK01(580, 319)}>
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
