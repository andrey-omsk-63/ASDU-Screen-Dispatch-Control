export const styleHelpMain = {
  width: "77%",
  textAlign: "center",
  // color: "#E6761B", // оранж
  fontWeight: 500,
  textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
};

export const searchControl = {
  float: "left",
  provider: "yandex#search",
  size: "large",
};

export const styleModalEnd = {
  position: "absolute",
  top: "0%",
  left: "auto",
  right: "0%",
  height: "21px",
  maxWidth: "2%",
  minWidth: "2%",
  color: "#7F499A", // сиреневый
  textShadow: "2px 2px 3px rgba(0,0,0,0.3)",
};
//=====================================================================
export const styleSetPK01 = (wdth: number, hdth: number) => {
  const styleSetPK01 = {
    outline: "none",
    position: "absolute",
    left: "50%",
    top: "45%",
    transform: "translate(-50%, -50%)",
    width: wdth,
    height: hdth,
    bgcolor: "background.paper",
    border: "1px solid #FFFFFF",
    borderRadius: 1,
    boxShadow: 24,
    textAlign: "center",
    padding: "1px 10px 10px 10px",
    cursor: "default",
  };

  const styleSetPK02 = {
    outline: "none",
    position: "absolute",
    left: "50%",
    top: "45%",
    transform: "translate(-50%, -50%)",
    width: wdth,
    bgcolor: "background.paper",
    border: "1px solid #FFFFFF",
    borderRadius: 1,
    boxShadow: 24,
    textAlign: "center",
    padding: "1px 10px 10px 10px",
    cursor: "default",
  };
  return hdth ? styleSetPK01 : styleSetPK02;
};

export const styleSetPK02 = {
  fontSize: 20,
  textAlign: "center",
  color: "#5B1080", // сиреневый
  margin: "15px 0 10px 0",
  textShadow: "2px 2px 3px rgba(0,0,0,0.3)",
};

export const styleSetPK03 = {
  fontSize: 15,
  textAlign: "left",
  background: "linear-gradient(180deg, #F1F5FB 59%, #DEE8F5 )",
  border: "1px solid #d4d4d4",
  borderRadius: 1,
  color: "black",
  boxShadow: 3,
  margin: "3px 0 1px 0",
  padding: "12px 5px 20px 5px",
  textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
};

export const styleSetPK05 = {
  overflowX: "auto",
  minHeight: "1vh",
  maxHeight: "69vh",
  width: 321,
  textAlign: "left",
  background: "linear-gradient(180deg, #F1F5FB 59%, #DEE8F5 )",
  border: "1px solid #d4d4d4",
  borderRadius: 1,
  color: "black",
  boxShadow: 3,
  margin: "3px 0 1px 0",
  padding: "4px 5px 14px 5px",
  textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
};

export const styleSetPK06 = {
  fontSize: 15.0,
  marginTop: 1,
  bgcolor: "#E6F5D6",
  width: 315,
  maxHeight: "24px",
  minHeight: "24px",
  border: "1px solid #d4d4d4", // серый
  borderRadius: 1,
  color: "black",
  textTransform: "unset !important",
  boxShadow: 4,
};
//=== SdsServisTable ==================================================
export const styleServisTable = {
  outline: "none",
  position: "relative",
  marginTop: "-96vh",
  marginLeft: "auto",
  marginRight: "14px",
  width: 400,
};

export const styleServisMenu = {
  marginTop: 0.5,
  marginRight: 1,
  maxHeight: "24px",
  minHeight: "24px",
  padding: "3px 8px 0px 8px",
  backgroundColor: "#E6F5D6",
  textTransform: "unset !important",
  color: "black",
  boxShadow: 2,
};

export const styleServis00 = {
  position: "relative",
  marginLeft: "auto",
  marginRight: 1,
  width: "96%",
  bgcolor: "background.paper",
  border: "3px solid #fff",
  borderRadius: 1,
  boxShadow: 24,
  padding: "0 9px 5px 10px",
  cursor: "default",
};

export const styleServis01 = {
  overflowX: "auto",
  maxHeight: "83vh",
  minHeight: "83vh",
  textShadow: "2px 2px 3px rgba(0,0,0,0.3)",
};

export const styleToDo01 = {
  background: "linear-gradient(180deg, #F1F5FB 59%, #DEE8F5 )",
  border: "1px solid #d4d4d4",
  borderRadius: 1,
  marginTop: 1,
  boxShadow: 6,
};

export const styleToDo02 = (DEMO: boolean) => {
  const styleToDo = {
    fontSize: 16,
    fontWeight: 500,
    textAlign: "center",
    color: DEMO ? "red" : "#5B1080", // красный/сиреневый
    margin: "3px 0 5px 0",
    textShadow: "2px 2px 3px rgba(0,0,0,0.3)",
  };
  return styleToDo;
};

export const styleToDo03 = {
  marginTop: "3px",
  background: "red",
  height: "18px",
  width: "18px",
  border: "1px solid #d4d4d4", // серый
  borderRadius: "50%",
  cursor: "pointer",
  color: "#fff", // белый
  boxShadow: 3,
};

export const styleToDo05 = {
  fontSize: 15,
  marginTop: "-3px",
};
//=====================================================================
