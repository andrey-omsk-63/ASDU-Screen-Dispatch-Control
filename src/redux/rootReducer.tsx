import { combineReducers } from "redux";
import { mapReducer } from "./mapReducer";
import { coordinatesReducer } from "./coordinatesReducer";
import { statsaveReducer } from "./statsaveReducer";
import { massfazReducer } from "./massfazReducer";
import { massdkReducer } from './massdkReducer';

export const rootReducer = combineReducers({
  mapReducer,
  statsaveReducer,
  coordinatesReducer,
  massfazReducer,
  massdkReducer,
});
