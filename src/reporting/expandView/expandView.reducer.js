import { bindReducer } from "../../utils/reducer";
import { initializeObjectByDatesTable } from '../../utils/reporting'
import {SET_PROSPECTION_DONE} from './expandView.action'

const objectByDates = initializeObjectByDatesTable()

export const initialState = {
  INTERVIEW_SCHEDULED: objectByDates,
  INTERVIEW_DONE:objectByDates,
  LINKEDIN_MAIL:objectByDates,
  PROSPECTION_MEETING_DONE: objectByDates,
  INTAKES: objectByDates
}

const expandView = {
  [SET_PROSPECTION_DONE]: (state, payload) => (
    {
      ...state,
      [payload.TYPE]: {
        ...state[payload.TYPE],
        [payload.WEEK_LABEL]: [...state[payload.TYPE][payload.WEEK_LABEL], payload.DETAIL_STRING]
      }
    }),
}

export default (state, action) =>
  bindReducer(state, action, expandView, initialState);