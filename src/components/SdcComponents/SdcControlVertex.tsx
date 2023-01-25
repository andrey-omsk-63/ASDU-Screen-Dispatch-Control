import * as React from "react";
import {
  //useDispatch,
  useSelector,
} from "react-redux";

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
//import TextField from '@mui/material/TextField';
//import MenuItem from '@mui/material/MenuItem';

import GsErrorMessage from "./RgsErrorMessage";

//import { SendSocketСreateBindings } from "../RgsSocketFunctions";

// import { TakeAreaId, CheckKey, MakeTflink } from '../SdcServiceFunctions';

import { styleModalEnd } from "../MainMapStyle";

//import { TfLink } from '../../interfaceBindings';

let oldIdx = -1;
let kluchGl = "";
let massFaz = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let soobErr = "";

const SdcControlVertex = (props: { setOpen: Function; idx: number }) => {
  //== Piece of Redux ======================================
  const map = useSelector((state: any) => {
    const { mapReducer } = state;
    return mapReducer.map.dateMap;
  });
  let datestat = useSelector((state: any) => {
    const { statsaveReducer } = state;
    return statsaveReducer.datestat;
  });
  //console.log("datestat", datestat);
  //const debug = datestat.debug;
  //const ws = datestat.ws;
  const homeRegion = datestat.region;
  //let imgFaza = datestat.phSvg;
  // let otlOrKosyk = false;
  // if (!datestat.pictSvg) otlOrKosyk = true;
  //const dispatch = useDispatch();
  //========================================================
  const [openSet, setOpenSet] = React.useState(true);
  const [openSetErr, setOpenSetErr] = React.useState(false);

  const handleCloseSet = () => {
    oldIdx = -1;
    props.setOpen(false);
    setOpenSet(false);
  };

  const handleClose = () => {
    handleCloseSet();
  };

  //=== инициализация ======================================
  if (oldIdx !== props.idx) {
    kluchGl = homeRegion + "-" + map.tflight[props.idx].area.num + "-";
    kluchGl += map.tflight[props.idx].ID + " ";
    kluchGl += map.tflight[props.idx].idevice;
    // maxFaza = map.tflight[props.idx].phases.length;
    for (let i = 0; i < 12; i++) {
      massFaz[i] = map.tflight[props.idx].phases[0];
    }
    oldIdx = props.idx;
  }

  const styleSetControl = {
    outline: "none",
    position: "relative",
    marginTop: "8vh",
    marginLeft: "40vh",
    marginRight: "auto",
    width: "33%",
    bgcolor: "background.paper",
    border: "3px solid #000",
    borderColor: "primary.main",
    borderRadius: 2,
    boxShadow: 24,
  };

  const styleKnop = {
    bgcolor: "background.paper",
    border: "1px solid #000",
    borderColor: "primary.main",
    borderRadius: 2,
    height: "10vh",
    marginBottom: 0.5,
    //backgroundColor: "#E3EBF2",  // светло-серый
    backgroundColor: "#EFF3F8", // светло-серый
  };

  const styleOutputFaza = {
    textAlign: "center",
    transform: "translate(-50%, -50%)",
    position: "relative",
    top: "50%",
    left: "50%",
  };

  const styleModalMenu = {
    //fontSize: 17,
    maxHeight: "9.2vh",
    minHeight: "9.2vh",
    backgroundColor: "#E9F5D8", // светло-салатовый
    color: "black",
    marginRight: 1,
    //marginBottom: 2,
    textTransform: "unset !important",
    textAlign: "center",
  };

  const StrokaFazaKnop = () => {
    let resStr = [];
    if (map.tflight[props.idx].phases.length > 0) {
      for (let i = 0; i < map.tflight[props.idx].phases.length; i++) {
        resStr.push(
          <Grid key={i} item xs={12} sx={styleKnop}>
            <Box sx={styleOutputFaza}>
              <Button
                sx={styleModalMenu}
                variant="contained"
                //onClick={() => handleClose()}
              >
                {OutputFaza(datestat.phSvg[i])}
              </Button>
            </Box>
          </Grid>
        );
      }
    }
    return resStr;
  };

  const OutputFaza = (img: any) => {
    let widthHeight = window.innerHeight / 10;
    if (!img) widthHeight = window.innerHeight / 20;
    return (
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
    );
  };

  return (
    <Modal open={openSet} onClose={handleCloseSet} hideBackdrop>
      <Box sx={styleSetControl}>
        <Button sx={styleModalEnd} onClick={handleCloseSet}>
          &#10006;
        </Button>
        <Box sx={{ fontSize: 17, marginTop: 1, textAlign: "center" }}>
          <b>Перекрёсток {kluchGl} </b>
        </Box>
        <Grid container sx={{ marginTop: 1.5 }}>
          <Grid item xs={8} sx={{ paddingLeft: 1, paddingRight: 0.5 }}>
            <Grid container>{StrokaFazaKnop()} </Grid>
          </Grid>
          <Grid item xs sx={{ paddingRight: 1 }}>
            <Grid container>
              <Grid item xs={12} sx={styleKnop}>
                ЖМ
              </Grid>
              <Grid item xs={12} sx={styleKnop}>
                ОС
              </Grid>
              <Grid item xs={12} sx={styleKnop}>
                ЛР
              </Grid>
              <Grid item xs={12} sx={styleKnop}>
                КУ
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Box sx={{ marginTop: 1, textAlign: "center" }}>
          {/* <Button sx={styleModalMenu} onClick={() => handleClose()}>
            Сохранить изменения
          </Button> */}
        </Box>
        {openSetErr && (
          <GsErrorMessage setOpen={setOpenSetErr} sErr={soobErr} />
        )}
      </Box>
    </Modal>
  );
};

export default SdcControlVertex;
