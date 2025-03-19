//=== SdcControlVertex ===================================
export const styleTitleDEMO = {
  fontSize: 17,
  marginTop: 1,
  textAlign: "center",
  color: "red",
};

export const styleKnop = {
  height: "75px",
  marginBottom: 0.5,
  textAlign: "center",
  textShadow: "2px 2px 3px rgba(0,0,0,0.3)",
};

export const styleVarKnopNum = {
  marginTop: 4,
  paddingLeft: 0.1,
  fontSize: 12,
  color: "#7F499A", // сиреневый
};

export const styleOutputFaza = {
  textAlign: "center",
  transform: "translate(-50%, -50%)",
  position: "relative",
  top: "50%",
  left: "50%",
};

export const StyleTitle = (fontsize: number) => {
  const styleTitle = {
    fontSize: fontsize,
    color: "#5B1080", // сиреневый
    marginTop: 1,
    textAlign: "center",
  };
  return styleTitle;
};

export const StyleModalMenuVar = (colorKnop: string, bShadow: number) => {
  const styleModalMenuVar = {
    maxHeight: "69px",
    minHeight: "69px",
    width: "208px",
    backgroundColor: colorKnop,
    color: "black",
    textTransform: "unset !important",
    border: "1px solid #d4d4d4", // серый
    borderRadius: 2,
    boxShadow: bShadow,
    lineHeight: 1.7,
    textShadow: "2px 2px 3px rgba(0,0,0,0.3)",
  };
  return styleModalMenuVar;
};

export const StyleModalMenuConst = (colorKnop: string, bShadow: number) => {
  const styleModalMenuConst = {
    fontSize: 40,
    maxHeight: "69px",
    minHeight: "69px",
    width: "100px",
    backgroundColor: colorKnop,
    color: "black",
    textTransform: "unset !important",
    border: "1px solid #d4d4d4", // серый
    borderRadius: 2,
    lineHeight: 1.7,
    boxShadow: bShadow,
    textShadow: "2px 2px 3px rgba(0,0,0,0.3)",
  };
  return styleModalMenuConst;
};

export const StyleSetControl = (DEMO: boolean) => {
  const styleSetControl = {
    outline: "none",
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "340px",
    bgcolor: "background.paper",
    border: "1px solid #FFF",
    borderRadius: 1,
    boxShadow: 24,
    textShadow: "2px 2px 3px rgba(0,0,0,0.3)",
    padding: "1px 10px 12px 10px",
  };
  return styleSetControl;
};

export const styleControl01 = {
  background: "linear-gradient(180deg, #F1F5FB 59%, #DEE8F5 )",
  border: "1px solid #d4d4d4",
  borderRadius: 1,
  marginTop: 1,
  boxShadow: 6,
  padding: "7px 0px 0px 0px",
};

export const styleServis01 = {
  fontSize: 11.0,
  color: "#5B1080",
  height: "69px",
  margin: "9px 0px 5px 2px",
};

export const styleServis03 = {
  width: "50px",
  maxHeight: "1px",
  minHeight: "1px",
  border: "1px solid #d4d4d4", // серый
  borderRadius: 1,
  bgcolor: "#FFFBE5", // топлёное молоко
  boxShadow: 6,
  textAlign: "center",
  p: 1.2,
};

export const styleServis04 = {
  "& > :not(style)": {
    marginTop: "-8px",
    marginLeft: "-9px",
    width: "70px",
  },
};
// убрать
export const styleServis05 = {
  fontSize: 12.05,
  color: "#5B1080",
  padding: "4px 0px 0px 0px",
};
//========================================================
