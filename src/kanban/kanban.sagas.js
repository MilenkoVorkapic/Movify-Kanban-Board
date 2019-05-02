import {
  all,
  call,
  put,
  select,
  takeEvery,
  takeLatest
} from "redux-saga/effects";
import {
  concat,
  dissoc,
  mergeDeepWith,
  path,
  pathOr,
  prop,
  propOr
} from "ramda";
import { toast } from "react-toastify";
import {
  GET_KANBAN,
  GET_JOB_ORDERS,
  GET_JOB_SUBMISSIONS,
  UPDATE_JOB_SUBMISSION,
  CREATE_JOB_SUBMISSION,
  setBms,
  setClientCorporations,
  getJobOrders as getJobOrdersAction,
  setJobOrders,
  getJobSubmissions as getJobSubmissionsAction,
  setJobSubmissions
} from "./kanban.actions";
import {
  getBusinessManagers,
  getJobOrders as getJobOrdersService,
  getJobSubmissions as getJobSubmissionsService,
  updateJobSubmissionStatus as updateJobSubmissionStatusService,
  createJobSubmission as createJobSubmissionService,
  getJobSubmission
} from "./kanban.service";

export const getKanban = state => pathOr([], ["kanban", "kanban"], state);
export const getStateBms = state => pathOr([], ["kanban", "bms"], state);
export const getStateClientCorporations = state =>
  pathOr([], ["kanban", "clientCorporations"], state);
export const getStateJobOrder = (state, joId) =>
  pathOr({}, ["kanban", "jobOrders", joId], state);
export const getStateJobOrders = state =>
  pathOr([], ["kanban", "jobOrders"], state);
export const getStateJobSubmissions = state =>
  pathOr([], ["kanban", "jobSubmissions"], state);

export function* getKanbanBoard() {
  try {
    const bmsResponse = yield call(getBusinessManagers);
    const bmList = yield call(propOr, [], "data", bmsResponse);
    const bms = yield all(
      bmList.reduce(
        (acc, bm) => ({ ...acc, [bm.id]: { ...bm, clientCorporations: [] } }),
        {}
      )
    );
    yield put(setBms(bms));
    yield all(bmList.map(bm => put(getJobOrdersAction(prop("id", bm)))));
  } catch (e) {
    //
  }
}

function* getClientCorporations(bmId, jobOrders) {
  const bms = {};
  const joClientCorporations = yield all(
    jobOrders.map(jo => prop("clientCorporation", jo))
  );

  const clientCorporations = yield all(
    joClientCorporations.reduce((acc, jocc) => {
      const joccId = prop("id", jocc);

      if (
        !pathOr([], [bmId, "clientCorporations"], bms).find(
          ccId => ccId === joccId
        )
      ) {
        const bmcc = pathOr([], [bmId, "clientCorporations"], bms).concat([
          joccId
        ]);
        bms[bmId] = { clientCorporations: bmcc };
      }

      const clientCorporation = prop(joccId, acc);
      if (!clientCorporation) {
        acc[joccId] = { ...jocc, bmIds: { [bmId]: [] } };
      }
      return acc;
    }, {})
  );

  const stateClientCorporations = yield select(getStateClientCorporations);
  yield put(
    setClientCorporations(
      mergeDeepWith(concat, stateClientCorporations, clientCorporations)
    )
  );
  const stateBms = yield select(getStateBms);
  yield put(setBms(mergeDeepWith(concat, stateBms, bms)));
}

export function* getJobOrders(action) {
  const bmId = action.payload;
  try {
    const jobOrdersResponse = yield call(getJobOrdersService, bmId);
    const jobOrderList = yield call(propOr, [], "data", jobOrdersResponse);

    yield getClientCorporations(bmId, jobOrderList);

    const clientCorporations = {};

    const jobOrders = yield all(
      jobOrderList.reduce((acc, jobOrder) => {
        const ccId = path(["clientCorporation", "id"], jobOrder);

        const ccjos = pathOr(
          [],
          [ccId, "bmIds", bmId],
          clientCorporations
        ).concat([jobOrder.id]);
        clientCorporations[ccId] = {
          bmIds: {
            [bmId]: ccjos
          }
        };

        acc[jobOrder.id] = {
          ...jobOrder,
          bmId,
          clientCorporationId: ccId,
          jobSubmissions: {}
        };
        return acc;
      }, {})
    );

    const stateJobOrders = yield select(getStateJobOrders);
    yield put(setJobOrders(mergeDeepWith(concat, stateJobOrders, jobOrders)));
    const stateClientCorporations = yield select(getStateClientCorporations);
    yield put(
      setClientCorporations(
        mergeDeepWith(concat, stateClientCorporations, clientCorporations)
      )
    );

    yield all(
      jobOrderList.map(jobOrder =>
        put(
          getJobSubmissionsAction(
            bmId,
            path(["clientCorporation", "id"], jobOrder),
            prop("id", jobOrder)
          )
        )
      )
    );
  } catch (e) {
    //
  }
}

export function* getJobSubmissions(action) {
  const {
    payload: { bmId, clientCorporationId, jobOrderId }
  } = action;
  try {
    const jobOrders = {};
    const jobSubmissionsResponse = yield call(
      getJobSubmissionsService,
      jobOrderId
    );

    const jobSubmissions = yield all(
      propOr([], "data", jobSubmissionsResponse).reduce((acc, js) => {
        const jojss = pathOr(
          [],
          [jobOrderId, "jobSubmissions", js.status],
          jobOrders
        ).concat([js.id]);
        jobOrders[jobOrderId] = {
          jobSubmissions: {
            [js.status]: jojss
          }
        };

        acc[js.id] = {
          ...js,
          bmId,
          clientCorporationId,
          jobOrderId
        };

        return acc;
      }, {})
    );

    const stateJobSubmissions = yield select(getStateJobSubmissions);
    yield put(
      setJobSubmissions(
        mergeDeepWith(concat, stateJobSubmissions, jobSubmissions)
      )
    );
    const stateJobOrders = yield select(getStateJobOrders);
    yield put(setJobOrders(mergeDeepWith(concat, stateJobOrders, jobOrders)));
  } catch (e) {
    //
  }
}

export function* updateJobSubmission(action) {
  const {
    payload: { prevStatus, jobSubmissionId, status }
  } = action;
  try {
    yield updateJobSubmissionStatus(action);
    yield call(updateJobSubmissionStatusService, jobSubmissionId, status);
    toast.success("The job submission status was correctly updated.");
  } catch (e) {
    yield updateJobSubmissionStatus({
      ...action,
      payload: { ...action.payload, status: prevStatus, prevStatus: status }
    });
    toast.error(
      "There was an issue with the update. Please retry again later."
    );
  }
}

function* updateJobSubmissionStatus(action) {
  const {
    payload: { jobOrderId, prevStatus, jobSubmissionId, status }
  } = action;

  const stateJobSubmissions = yield select(getStateJobSubmissions);
  const jobSubmission = stateJobSubmissions[jobSubmissionId];
  const jobSubmissions = {
    ...stateJobSubmissions,
    [jobSubmissionId]: {
      ...jobSubmission,
      status
    }
  };

  yield put(setJobSubmissions(jobSubmissions));

  const stateJobOrder = yield select(getStateJobOrder, jobOrderId);
  const jojss = {
    ...prop("jobSubmissions", stateJobOrder),
    [prevStatus]: pathOr(
      [],
      ["jobSubmissions", prevStatus],
      stateJobOrder
    ).filter(jsId => jsId !== jobSubmissionId),
    [status]: pathOr([], ["jobSubmissions", status], stateJobOrder).concat([
      jobSubmissionId
    ])
  };
  const jobOrder = {
    [jobOrderId]: {
      ...stateJobOrder,
      jobSubmissions: jojss
    }
  };

  const stateJobOrders = yield select(getStateJobOrders);
  yield put(setJobOrders({ ...stateJobOrders, ...jobOrder }));
}

const createTempId = (jobOrder, jobSubmission) =>
  `temp${prop("id", jobOrder)}${path(["candidate", "id"], jobSubmission)}`;

export function* createJobSubmission(action) {
  const {
    payload: { jobOrder, jobSubmission, status }
  } = action;

  const tempJs = {
    id: createTempId(jobOrder, jobSubmission),
    candidate: prop("candidate", jobSubmission),
    jobOrder,
    sendingUser: { id: prop("bmId", jobOrder) },
    status,
    bmId: prop("bmId", jobOrder),
    clientCorporationId: prop("clientCorporationId", jobOrder),
    jobOrderId: prop("id", jobOrder)
  };

  try {
    yield addJobSubmission(tempJs);

    const js = {
      candidate: { id: path(["candidate", "id"], jobSubmission) },
      jobOrder: { id: prop("id", jobOrder) },
      sendingUser: { id: prop("bmId", jobOrder) },
      status
    };

    const putJobSubmissionResponse = yield call(createJobSubmissionService, js);
    const createdId = prop("changedEntityId", putJobSubmissionResponse);
    const jobSubmissionResponse = yield call(getJobSubmission, createdId);
    const newJobSubmission = {
      ...propOr({}, "data", jobSubmissionResponse),
      bmId: prop("bmId", jobOrder),
      clientCorporationId: prop("clientCorporationId", jobOrder),
      jobOrderId: prop("id", jobOrder)
    };
    yield addJobSubmission(newJobSubmission);
    toast.success("The job submission was correctly created.");
  } catch (e) {
    yield removeTempJobSubmission(prop("id", tempJs));
    toast.error(
      "There was an issue with the creation. Please retry again later."
    );
  }
}

function* addJobSubmission(jobSubmission) {
  const jobSubmissionId = propOr("", "id", jobSubmission);
  const tempId = createTempId(prop("jobOrder", jobSubmission), jobSubmission);
  const stateJobSubmissions = yield select(getStateJobSubmissions);
  var jobSubmissions = {
    ...stateJobSubmissions,
    [jobSubmissionId]: jobSubmission
  };

  if (!jobSubmissionId.toString().includes("temp"))
    jobSubmissions = dissoc(tempId, jobSubmissions);

  yield put(setJobSubmissions(jobSubmissions));

  const jobOrderId = path(["jobOrder", "id"], jobSubmission);
  const stateJobOrder = yield select(getStateJobOrder, jobOrderId);
  const status = prop("status", jobSubmission);
  const jojss = {
    ...prop("jobSubmissions", stateJobOrder),
    [status]: pathOr([], ["jobSubmissions", status], stateJobOrder)
      .filter(joId => joId !== tempId)
      .concat([jobSubmissionId])
  };
  const jobOrder = {
    [jobOrderId]: {
      ...stateJobOrder,
      jobSubmissions: jojss
    }
  };

  const stateJobOrders = yield select(getStateJobOrders);
  yield put(setJobOrders({ ...stateJobOrders, ...jobOrder }));
}

function* removeTempJobSubmission(jobSubmission) {
  const jobSubmissionId = prop("id", jobSubmission);
  const stateJobSubmissions = yield select(getStateJobSubmissions);
  const jobSubmissions = dissoc(jobSubmissionId, stateJobSubmissions);

  yield put(setJobSubmissions(jobSubmissions));

  const jobOrderId = path(["jobOrder", "id"], jobSubmission);
  const stateJobOrder = yield select(getStateJobOrder, jobOrderId);
  const status = prop("status", jobSubmission);
  const jojss = {
    ...prop("jobSubmissions", stateJobOrder),
    [status]: pathOr([], ["jobSubmissions", status], stateJobOrder).filter(
      jsId => jsId !== jobSubmissionId
    )
  };
  const jobOrder = {
    [jobOrderId]: {
      ...stateJobOrder,
      jobSubmissions: jojss
    }
  };

  const stateJobOrders = yield select(getStateJobOrders);
  yield put(setJobOrders({ ...stateJobOrders, ...jobOrder }));
}

export default function kanbanSagas() {
  return [
    takeLatest(GET_KANBAN, getKanbanBoard),
    takeEvery(GET_JOB_ORDERS, getJobOrders),
    takeEvery(GET_JOB_SUBMISSIONS, getJobSubmissions),
    takeEvery(UPDATE_JOB_SUBMISSION, updateJobSubmission),
    takeEvery(CREATE_JOB_SUBMISSION, createJobSubmission)
  ];
}
