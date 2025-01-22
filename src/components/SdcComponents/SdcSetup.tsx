import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { statsaveCreate } from "../../redux/actions";

import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

import { BadExit, ExitCross, FooterContent } from "../SdcServiceFunctions";
import { StrTablVert, WaysInput } from "../SdcServiceFunctions";

import { styleSetPK03 } from "../MainMapStyle";
import { styleSetPK01, styleSetPK02 } from "../MainMapStyle";

let flagInput = true;
let HAVE = 0;

let intervalFaza = 0; // Задаваемая длительность фазы ДУ (сек)
let intervalFazaDop = 0; // Увеличениение длительности фазы ДУ (сек)

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
    intervalFaza = datestat.intervalFaza;
    intervalFazaDop = datestat.intervalFazaDop;
    flagInput = false;
  }
  //========================================================
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

  const Haver = () => {
    HAVE++;
    setTrigger(!trigger); // ререндер
  };

  const SetInterval = (valueInp: number) => {
    datestat.intervalFaza = intervalFaza = valueInp; // задаваемая длительность фазы ДУ (сек)
    if (!intervalFaza) intervalFazaDop = 0; // увеличениение длительности фазы ДУ (сек)
    Haver();
  };

  const SetIntervalDop = (valueInp: number) => {
    intervalFazaDop = valueInp; // увеличениение длительности фазы ДУ (сек)
    Haver();
  };
  //========================================================
  const SetupContent = () => {
    return (
      <>
        <Box sx={{ fontSize: 12, marginTop: 0.5, color: "#5B1080" }}>
          Параметры перекрёстков
        </Box>
        {StrTablVert(
          10,
          "Задаваемая длительность фазы ДУ (сек)",
          WaysInput(0, intervalFaza, SetInterval, 0, 1000)
        )}
        {StrTablVert(
          10,
          "Увеличениение длительности фазы ДУ (сек)",
          WaysInput(0, intervalFazaDop, SetIntervalDop, 0, 1000)
        )}
      </>
    );
  };

  return (
    <>
      <Modal open={open} onClose={CloseEnd} hideBackdrop={false}>
        <Box sx={styleSetPK01(444, 209)}>
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
