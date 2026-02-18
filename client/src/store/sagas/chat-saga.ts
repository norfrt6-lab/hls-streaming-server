import { put, takeEvery, takeLatest, delay, select } from "redux-saga/effects";
import { setSendingMessage, setRateLimited } from "@/store/slices/chat-slice";
import { SOCKET_SEND_CHAT_MESSAGE } from "@/types/socket";
import type { RootState } from "@/store";

function* handleSendMessage(): Generator {
  yield put(setSendingMessage(true));

  // Brief delay to prevent UI flicker
  yield delay(50);

  yield put(setSendingMessage(false));
}

function* handleRateLimitCooldown(): Generator {
  const limited = (yield select((s: RootState) => s.chat.rateLimited)) as boolean;

  // Only run cooldown when rate limit is activated, not when cleared
  if (!limited) return;

  const retryAfter = (yield select((s: RootState) => s.chat.rateLimitRetryAfter)) as number | null;

  if (retryAfter) {
    yield delay(retryAfter * 1000);
    yield put(setRateLimited({ limited: false, retryAfter: null }));
  }
}

export default function* chatSaga(): Generator {
  yield takeEvery(SOCKET_SEND_CHAT_MESSAGE, handleSendMessage);
  yield takeLatest(setRateLimited.type, handleRateLimitCooldown);
}
