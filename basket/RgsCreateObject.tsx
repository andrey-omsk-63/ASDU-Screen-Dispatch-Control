import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addobjCreate, coordinatesCreate } from '../src/redux/actions';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

import GsErrorMessage from './RgsErrorMessage';

import { NameMode } from '../src/components/SdcServiceFunctions';

import { SendSocket–°reateAddObj } from '../src/components/SdcSocketFunctions';

import { styleSetAdress, styleBoxForm, styleInpKnop } from '../src/components/MainMapStyle';
import { styleSet } from '../src/components/MainMapStyle';
import { styleSetAdrArea, styleSetAdrID } from '../src/components/MainMapStyle';
import { styleSetArea, styleSetID } from '../src/components/MainMapStyle';
import { styleBoxFormArea, styleBoxFormID } from '../src/components/MainMapStyle';

//let chNewCoord = 1;
let soobErr = '';
let valueName = '';
let valueID = 0;
let freeId = 0;

const RgsCreateObject = (props: { setOpen: Function; coord: any; funcMode: Function }) => {
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
    //return addobjReducer.addobj.addObjects;
  });
  console.log('RgsCreateObject', addobj);
  let coordinates = useSelector((state: any) => {
    const { coordinatesReducer } = state;
    return coordinatesReducer.coordinates;
  });
  const debug = datestat.debug;
  const ws = datestat.ws;
  const dispatch = useDispatch();
  //========================================================
  let homeRegion = map.regionInfo[datestat.region];
  let dat = map.areaInfo[homeRegion];
  let massKey = [];
  let massDat = [];
  const currencies: any = [];
  for (let key in dat) {
    massKey.push(key);
    massDat.push(dat[key]);
  }
  for (let i = 0; i < massKey.length; i++) {
    let maskCurrencies = {
      value: '',
      label: '',
    };
    maskCurrencies.value = massKey[i];
    maskCurrencies.label = massDat[i];
    currencies.push(maskCurrencies);
  }
  for (let i = 0; i < 1000; i++) {
    freeId = 10001 + i; // –Ņ–ĺ–ł—Ā–ļ –Ņ–Ķ—Ä–≤–ĺ–≥–ĺ —Ā–≤–ĺ–Ī–ĺ–ī–Ĺ–ĺ–≥–ĺ ID
    let have = false;
    for (let j = 0; j < addobj.addObjects.length; j++) {
      if (addobj.addObjects[j].id === freeId) have = true;
    }
    if (!have) break;
  }
  //========================================================

  const [openSetAdress, setOpenSetAdress] = React.useState(true);
  const [currency, setCurrency] = React.useState(massKey[0]);
  const [openSetErr, setOpenSetErr] = React.useState(false);

  const handleKey = (event: any) => {
    if (event.key === 'Enter') event.preventDefault();
  };

  const handleChangeArea = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrency(event.target.value);
    setOpenSetAdress(true);
  };

  const handleCloseSet = () => {
    props.setOpen(false);
    props.funcMode(0);
    setOpenSetAdress(false);
  };

  const InputName = () => {
    const [value, setValue] = React.useState('–ě–Ī—ä–Ķ–ļ—ā' + NameMode()); //"–ě–Ī—ä–Ķ–ļ—ā 1000" + String(chNewCoord)
    valueName = value;

    const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.value) {
        let val = event.target.value.trimStart(); // —É–ī–į–Ľ–Ķ–Ĺ–ł–Ķ –Ņ—Ä–ĺ–Ī–Ķ–Ľ–ĺ–≤ –≤ –Ĺ–į—á–į–Ľ–Ķ —Ā—ā—Ä–ĺ–ļ–ł
        setValue(val);
        valueName = val;
      } else {
        valueName = value;
      }
    };

    return (
      <Box sx={styleSet}>
        <Box component="form" sx={styleBoxForm}>
          <TextField
            size="small"
            onKeyPress={handleKey} //–ĺ—ā–ļ–Ľ—é—á–Ķ–Ĺ–ł–Ķ Enter
            inputProps={{ style: { fontSize: 13.3 } }}
            value={value}
            onChange={handleChangeName}
            variant="standard"
            helperText="–í–≤–Ķ–ī–ł—ā–Ķ –Ĺ–į–ł–ľ–Ķ–Ĺ–ĺ–≤–į–Ĺ–ł–Ķ –ĺ–Ī—ä–Ķ–ļ—ā–į"
            color="secondary"
          />
        </Box>
      </Box>
    );
  };

  const InputArea = () => {
    return (
      <Box sx={styleSetArea}>
        <Box component="form" sx={styleBoxFormArea}>
          <TextField
            select
            size="small"
            onKeyPress={handleKey} //–ĺ—ā–ļ–Ľ—é—á–Ķ–Ĺ–ł–Ķ Enter
            value={currency}
            onChange={handleChangeArea}
            InputProps={{ style: { fontSize: 13.4 } }}
            variant="standard"
            helperText="–í–≤–Ķ–ī–ł—ā–Ķ —Ä–į–Ļ–ĺ–Ĺ"
            color="secondary">
            {currencies.map((option: any) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>
    );
  };

  const InputID = () => {
    const [value, setValue] = React.useState(freeId);
    valueID = value;

    const handleChangeID = (event: any) => {
      if (event.target.value) {
        let valueInp = event.target.value.replace(/^0+/, '');
        if (Number(valueInp) < freeId) valueInp = freeId;
        if (valueInp === '') valueInp = 0;
        valueInp = Math.trunc(Number(valueInp)).toString();
        valueID = valueInp;
        setValue(valueInp);
      } else {
        valueID = value;
      }
    };

    return (
      <Box sx={styleSetID}>
        <Box component="form" sx={styleBoxFormID}>
          <TextField
            size="small"
            onKeyPress={handleKey} //–ĺ—ā–ļ–Ľ—é—á–Ķ–Ĺ–ł–Ķ Enter
            type="number"
            inputProps={{ style: { fontSize: 13.3 } }}
            value={value}
            onChange={handleChangeID}
            variant="standard"
            helperText="–í–≤–Ķ–ī–ł—ā–Ķ ID"
            color="secondary"
          />
        </Box>
      </Box>
    );
  };

  const handleClose = () => {
    let have = false;
    for (let i = 0; i < addobj.addObjects.length; i++) {
      if (
        addobj.addObjects[i].region === Number(datestat.region) &&
        addobj.addObjects[i].area === Number(currency) &&
        addobj.addObjects[i].id === Number(valueID)
      )
        have = true;
    }
    if (have) {
      soobErr = 'O–Ī—ä–Ķ–ļ—ā —Ā –ļ–Ľ—é—á–ĺ–ľ [' + datestat.region + ', ' + currency + ', ';
      soobErr += valueID + '] —É–∂–Ķ —Ā—É—Č–Ķ—Ā—ā–≤—É–Ķ—ā';
      setOpenSetErr(true);
    } else {
      let dater = {
        region: Number(datestat.region),
        area: Number(currency),
        id: Number(valueID),
        description: valueName,
        dgis: props.coord,
      };

      addobj.addObjects.push(dater);
      coordinates.push(props.coord);
      dispatch(coordinatesCreate(coordinates));
      dispatch(addobjCreate(addobj));
      SendSocket–°reateAddObj(debug, ws, dater);
      handleCloseSet();
    }
  };

  return (
    <Modal open={openSetAdress} onClose={handleCloseSet} hideBackdrop>
      <Grid item container sx={styleSetAdress}>
        <Grid item xs={9.5} sx={{ border: 0 }}>
          <InputName />
        </Grid>
        <Grid item sx={styleSetAdrArea} xs={9.5}>
          <InputArea />
        </Grid>
        <Grid item xs={9.7} sx={styleSetAdrID}>
          <InputID />
        </Grid>
        <Grid item xs={2.3}>
          <Box sx={{ border: 1, borderColor: '#FFDB4D' }}>
            <Button sx={styleInpKnop} onClick={handleClose}>
              –í–≤–ĺ–ī
            </Button>
          </Box>
        </Grid>
        {openSetErr && <GsErrorMessage setOpen={setOpenSetErr} sErr={soobErr} />}
      </Grid>
    </Modal>
  );
};

export default RgsCreateObject;
