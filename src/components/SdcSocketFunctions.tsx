import { debug, WS } from "./../App";

//=== GsSetPhase ===================================
export const SendSocketDispatch = (
  // debug: boolean,
  // ws: WebSocket,
  idevice: number,
  cmdd: number,
  faza: number
) => {
  //console.log('Dispatch:', idevice, cmdd, faza);
  const handleSendOpen = () => {
    if (!debug) {
      if (WS.readyState === WebSocket.OPEN) {
        WS.send(
          JSON.stringify({
            type: "dispatch",
            id: idevice,
            cmd: cmdd,
            param: faza,
          })
        );
      } else {
        setTimeout(() => {
          handleSendOpen();
        }, 1000);
      }
    }
  };
  handleSendOpen();
};
//=== App ==========================================
//=== MainMapRgs ====-----==========================
export const SendSocketGetPhases = (
  // debug: boolean,
  // ws: WebSocket,
  region: string,
  area: string,
  id: number
) => {
  //console.log("getPhases:", region, area, id);
  const handleSendOpen = () => {
    if (!debug) {
      if (WS.readyState === WebSocket.OPEN) {
        WS.send(
          JSON.stringify({
            type: "getPhases",
            pos: { region, area, id },
          })
        );
      } else {
        setTimeout(() => {
          handleSendOpen();
        }, 1000);
      }
    }
  };
  handleSendOpen();
};
//==================================================
