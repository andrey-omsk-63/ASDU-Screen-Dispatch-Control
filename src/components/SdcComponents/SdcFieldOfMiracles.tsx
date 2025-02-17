import * as React from "react";
import { useSelector } from "react-redux";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { AiTwotoneRightCircle } from "react-icons/ai";

//import { hTabl } from "./RgsToDoMode";

const SdcFieldOfMiracles = (props: {
  //finish: boolean;
  idx: number;
  func: Function;
}) => {
  //== Piece of Redux =======================================
  let massfaz = useSelector((state: any) => {
    const { massfazReducer } = state;
    return massfazReducer.massfaz;
  });
  let datestat = useSelector((state: any) => {
    const { statsaveReducer } = state;
    return statsaveReducer.datestat;
  });
  //========================================================
  //const DEMO = datestat.demo;
  const intervalFazaDop = datestat.intervalFazaDop; // Увеличениение длительности фазы ДУ (сек)
  const [hint, setHint] = React.useState(false);

  console.log("###:", props.idx, datestat.massСounter);

  let intervalfaza = datestat.massСounter[props.idx]; // Задаваемая длительность фазы ДУ (сек)

  const styleField01 = {
    fontSize: 12,
    color: "#7620A2",
    //padding: "1px 0 0 0",
    //border:1,
  };

  const styleField02 = {
    position: "absolute",
    left: "5px",
    marginTop: "-3px",
    width: 121,
    fontSize: 12.5,
    color: "#E67641", // оранж
    textShadow: "0px 0px 0px rgba(0,0,0,0.3)",
    //border: 1,
  };

  return (
    <Grid item xs={2.1} sx={styleField01}>
      {massfaz[props.idx].id <= 10000 && intervalfaza > 0 && (
        <Grid
          container
          sx={{ cursor: "pointer" }}
          onClick={() => props.func(props.idx)}
          onMouseEnter={() => setHint(true)}
          onMouseLeave={() => setHint(false)}
        >
          <Grid item xs={5} sx={{ textAlign: "right" }}>
            {intervalFazaDop > 0 && (
              <>
                <Box sx={{ fontSize: 21 }}>
                  <AiTwotoneRightCircle />
                </Box>
                {hint && (
                  <Box sx={styleField02}>Увеличить на {intervalFazaDop}сек</Box>
                )}
              </>
            )}
          </Grid>
          <Grid
            item
            xs
            sx={{
              padding: "5px 0 0 0",
              textAlign: "center",
              cursor: "default",
            }}
          >
            {intervalfaza}
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default SdcFieldOfMiracles;
