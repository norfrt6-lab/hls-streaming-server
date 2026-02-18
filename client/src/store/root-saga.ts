import { all, fork } from "redux-saga/effects";
import socketSaga from "./sagas/socket-saga";
import authSaga from "./sagas/auth-saga";
import chatSaga from "./sagas/chat-saga";

export default function* rootSaga(): Generator {
  yield all([fork(socketSaga), fork(authSaga), fork(chatSaga)]);
}
