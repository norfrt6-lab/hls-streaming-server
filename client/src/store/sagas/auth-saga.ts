import { put, takeLatest, delay } from "redux-saga/effects";
import { clearAuth } from "@/store/slices/auth-slice";
import { resetSocket } from "@/store/slices/socket-slice";
import { resetChat } from "@/store/slices/chat-slice";
import { resetPlayer } from "@/store/slices/player-slice";
import { SOCKET_DISCONNECT } from "@/types/socket";

const AUTH_LOGOUT = "auth/triggerLogout" as const;

function* handleLogout(): Generator {
  // Disconnect all sockets
  yield put({ type: SOCKET_DISCONNECT });

  // Small delay to let socket cleanup happen
  yield delay(100);

  // Clear all state
  yield put(clearAuth());
  yield put(resetSocket());
  yield put(resetChat());
  yield put(resetPlayer());
}

export default function* authSaga(): Generator {
  yield takeLatest(AUTH_LOGOUT, handleLogout);
}

export { AUTH_LOGOUT };
