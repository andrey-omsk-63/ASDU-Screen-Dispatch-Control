import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addobjCreate, coordinatesCreate } from '../../redux/actions';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';

import RgsEditName from './RgsEditName';

import { SendSocketDeleteAddObj } from '../RgsSocketFunctions';

import { styleModalEnd } from '../MainMapStyle';
import { styleModalMenu, styleSetProcess } from '../MainMapStyle';

const RgsProcessObject = (props: { setOpen: Function; idx: number }) => {
  //== Piece of Redux ======================================
  const map = useSelector((state: any) => {
    const { mapReducer } = state;
    return mapReducer.map.dateMap;
  });
  let datestat = useSelector((state: any) => {
    const { statsaveReducer } = state;
    return statsaveReducer.datestat;
  });
  let addobj = useSelector((state: any) => {
    const { addobjReducer } = state;
    return addobjReducer.addobj.dateAdd;
  });
  console.log('RgsProcessObject', addobj);
  let coordinates = useSelector((state: any) => {
    const { coordinatesReducer } = state;
    return coordinatesReducer.coordinates;
  });
  const debug = datestat.debug;
  const ws = datestat.ws;
  const dispatch = useDispatch();
  //========================================================
  const [openSet, setOpenSet] = React.useState(true);
  const [openProcess, setOpenProcess] = React.useState(false);
  let idxObj = props.idx - map.tflight.length;

  const handleCloseSet = () => {
    props.setOpen(false);
    setOpenSet(false);
  };

  const handleClose = (mode: number) => {
    if (mode) {
      let dater = addobj.addObjects[idxObj];
      addobj.addObjects.splice(idxObj, 1); // удаление самой точки
      coordinates.splice(props.idx, 1);
      dispatch(coordinatesCreate(coordinates));
      dispatch(addobjCreate(addobj));
      SendSocketDeleteAddObj(debug, ws, dater);
      handleCloseSet();
    } else {
      //console.log("Здесь будет редактирование имени");
      setOpenProcess(true);
    }
  };

  const StrokaBalloon = (soob: string, mode: number) => {
    return (
      <Button sx={styleModalMenu} onClick={() => handleClose(mode)}>
        {soob}
      </Button>
    );
  };

  return (
    <Modal open={openSet} onClose={handleCloseSet} hideBackdrop>
      <Box sx={styleSetProcess}>
        <Button sx={styleModalEnd} onClick={handleCloseSet}>
          &#10006;
        </Button>
        <Box sx={{ fontSize: 17, textAlign: 'center' }}>
          <em>
            {'"'}
            {addobj.addObjects[idxObj].description.slice(0, 33)}
            {'"'}
          </em>
        </Box>
        <Box sx={{ marginTop: 1.5, textAlign: 'center' }}>
          {StrokaBalloon('Редактирование названия', 0)}
          {StrokaBalloon('Удаление', 1)}
        </Box>
        {openProcess && <RgsEditName setOpen={setOpenProcess} idx={props.idx} />}
      </Box>
    </Modal>
  );
};

export default RgsProcessObject;
