import React, { useCallback, useMemo, useState } from "react"
import {
  isPast,
  isToday,
  isWithinInterval,
  addWeeks,
  addDays,
  addMonths,
  intlFormat,
  formatDistanceToNow,
} from "date-fns"
import styled from "styled-components"
import PropTypes from "prop-types"
import { useFindWFP, useJobOrdersWithJobSubmissions, useJobSubmissions, useAddJobSubmission, IDENTIFIED_COMPANIES_FIELD_KEY } from "../hooks"
import theme from "../style/theme"
import Bm from "../kanban/BmHotCandidates"
import {
  STATUS_IDENTIFIED,
  STATUS_INTAKE,
  STATUS_TO_SEND,
  STATUS_WF_FEEDBACK_2,
  STATUS_WF_RESPONSE,
} from "../utils/kanban"
import AddCandidateModal from "./AddCandidateModal"
import DeleteCandidateModal from "./DeleteCandidateModal"
import AddCompanyModal from "./AddCompanyModal"
import { ADD, ADD_COMPANY } from "./utils"
import transformToArrayIfNecessary from "../utils/transformToArrayIfNecessary"
import getMapValue from "../utils/getMapValue"

const Main = styled.main`
  display: grid;
  gap: 2rem;
`

export const JOB_SUBMISSION_STATUSES_MAP = new Map([
  [STATUS_TO_SEND, "toSend"],
  [STATUS_WF_RESPONSE, "wfResponse"],
  [STATUS_INTAKE, "intake"],
  [STATUS_WF_FEEDBACK_2, "wfFeedback"],
  [STATUS_IDENTIFIED, "identified"],
])

const BENCH_TITLE = "Bench"
const BENCH_TYPE = "Bench"
const BENCH_ID = 380
const PROJECT_ROTATIONS_TITLE = "Project Rotations"
const PROJECT_ROTATIONS_TYPE = "Project Rotations"
const PROJECT_ROTATIONS_ID = 1180
const WFP_TITLE = "WFP++"
const WFP_TYPE = "WFP++"
const WFP_ID = 1181

const PANEL_DATA_MAP = new Map([
  [
    BENCH_ID,
    {
      id: BENCH_ID,
      title: BENCH_TITLE,
      type: BENCH_TYPE,
    },
  ],
  [
    PROJECT_ROTATIONS_ID,
    {
      id: PROJECT_ROTATIONS_ID,
      title: PROJECT_ROTATIONS_TITLE,
      type: PROJECT_ROTATIONS_TYPE,
    },
  ],
  [
    WFP_ID,
    {
      id: WFP_ID,
      title: WFP_TITLE,
      type: WFP_TYPE,
    },
  ],
])

const initialModalState = {
  delete: {
    isOpen: false,
    title: BENCH_TITLE,
    candidateId: null,
    jobOrderId: null,
    jobSubmissionId: null,
    identified: null,
  },
  add: {
    isOpen: false,
    title: BENCH_TITLE,
    candidateId: null,
    jobOrderId: null,
    jobSubmissionId: null,
    identified: null,
  },
  addCompany: {
    isOpen: false,
    title: BENCH_TITLE,
    candidateId: null,
    jobOrderId: null,
    jobSubmissionId: null,
    identified: null,
  },
}

const formatDate = (dateAvailable) => {
  const relativeDate = formatDistanceToNow(dateAvailable)
  const exactDate = intlFormat(
    dateAvailable,
    {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    },
    {
      locale: "nl-BE",
    }
  )

  return { exactDate, relativeDate }
}

const getDateAvailableAndDateColorCode = (candidate) => {
  let dateAvailable = candidate?.dateAvailable
  let dateColorCode = theme.dateAvailableStatusColors.noData

  if (dateAvailable) {
    const now = new Date()
    const tomorrow = addDays(now, 1)
    const inTwoWeeks = addWeeks(now, 2)
    const inOneMonth = addMonths(now, 1)
    const inTwoMonths = addMonths(now, 2)

    // Available now
    if (isToday(dateAvailable) || isPast(dateAvailable)) {
      dateAvailable = formatDate(dateAvailable)
      dateAvailable = { ...dateAvailable, relativeDate: "now" }
      dateColorCode = theme.dateAvailableStatusColors.now

      // Between tomorrow and 2 weeks
    } else if (isWithinInterval(dateAvailable, { start: tomorrow, end: inTwoWeeks })) {
      dateAvailable = formatDate(dateAvailable)
      dateColorCode = theme.dateAvailableStatusColors.betweenTomorrorowAndTwoWeeks

      // Between 2 weeks and 1 month
    } else if (isWithinInterval(dateAvailable, { start: inTwoWeeks, end: inOneMonth })) {
      dateAvailable = formatDate(dateAvailable)
      dateColorCode = theme.dateAvailableStatusColors.betweenTwoWeeksAndOneMonth

      // Between 1 and 2 months
    } else if (isWithinInterval(dateAvailable, { start: inOneMonth, end: inTwoMonths })) {
      dateAvailable = formatDate(dateAvailable)
      dateColorCode = theme.dateAvailableStatusColors.betweenOneAndTwoMonths

      // Should always be longer than 2 months
    } else {
      dateAvailable = formatDate(dateAvailable)
      dateColorCode = theme.dateAvailableStatusColors.twoMonthsOrLonger
    }
  } else {
    dateAvailable = {
      relativeDate: "unknown",
      exactDate: "unknown",
    }
  }

  return {
    dateAvailable,
    dateColorCode,
  }
}

const HotCandidatesPage = ({ updatedJobSubmission }) => {
  const [modalState, setModalState] = useState(initialModalState)

  const jobOrdersWithJobSubmission = useJobOrdersWithJobSubmissions()
  const addJobSubmission = useAddJobSubmission()

  const findWFP = useFindWFP()

  const candidateIds = [
    ...new Set(
      jobOrdersWithJobSubmission?.data?.data?.flatMap(({ submissions }) =>
        submissions?.data?.map(({ candidate }) => candidate.id)
      )
    ),
  ]

  const jobSubmissionsCandidates = useJobSubmissions(candidateIds ?? [])

  const getJobSubmissionsCandidatePerStatus = useCallback(
    (jobSubmissionsCandidatesData, candidate) => {
      let jobSubmissionsCandidatePerStatus = {
        toSend: [],
        wfResponse: [],
        intake: [],
        wfFeedback: [],
        identified: [],
      }

      for (const jobSubmissionCandidate of jobSubmissionsCandidatesData) {
        const isJobSubmissionFromCurrentCandidate = jobSubmissionCandidate?.candidate?.id === candidate?.id

        if (isJobSubmissionFromCurrentCandidate) {
          let currentStatusKey = getMapValue(JOB_SUBMISSION_STATUSES_MAP, jobSubmissionCandidate.status)
          const jobOrderId = jobSubmissionCandidate?.jobOrder?.id ? String(jobSubmissionCandidate.jobOrder.id) : ""
          const jobTitle = jobSubmissionCandidate?.jobOrder?.title
          const company = jobSubmissionCandidate?.jobOrder?.clientCorporation?.name
          const owner = jobSubmissionCandidate?.jobOrder?.owner
          const jobSubmissionId = String(jobSubmissionCandidate.id)

          if (jobSubmissionId === updatedJobSubmission?.jobSubmissionId) {
            currentStatusKey = getMapValue(JOB_SUBMISSION_STATUSES_MAP, updatedJobSubmission.status)
          }

          jobSubmissionsCandidatePerStatus = {
            ...jobSubmissionsCandidatePerStatus,
            [currentStatusKey]: [
              ...jobSubmissionsCandidatePerStatus[currentStatusKey],
              {
                jobTitle,
                company,
                jobOrderId,
                jobSubmissionId,
                owner,
              },
            ],
          }
        }
      }

      if (candidate?.[IDENTIFIED_COMPANIES_FIELD_KEY]) {
        jobSubmissionsCandidatePerStatus = {
          ...jobSubmissionsCandidatePerStatus,
          identified: candidate?.[IDENTIFIED_COMPANIES_FIELD_KEY],
        }
      }

      return jobSubmissionsCandidatePerStatus
    },
    [updatedJobSubmission]
  )


  const getPerPanelData = useCallback(
    (bullhornId) => {
      const data = jobOrdersWithJobSubmission?.data?.data?.find(({ id }) => id === bullhornId)?.submissions?.data
      let jobSubmissionsCandidatesData = jobSubmissionsCandidates?.data?.data ?? []
      jobSubmissionsCandidatesData = transformToArrayIfNecessary(jobSubmissionsCandidatesData)

      const candidates = []

      for (const { id, candidate } of data) {
        const { dateAvailable, dateColorCode } = getDateAvailableAndDateColorCode(candidate)

        const jobSubmissionsCandidatePerStatus = getJobSubmissionsCandidatePerStatus(
          jobSubmissionsCandidatesData,
          candidate
        )

        const updatedCandidate = {
          id: candidate.id,
          jobSubmissionId: id,
          name: candidate.name,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          dateAvailable,
          dateColorCode,
          role: candidate.occupation,
          type: PANEL_DATA_MAP.get(bullhornId).type,
          ...jobSubmissionsCandidatePerStatus,
        }

        candidates.push(updatedCandidate)
      }

      return candidates
    },
    [getJobSubmissionsCandidatePerStatus, jobOrdersWithJobSubmission, jobSubmissionsCandidates]
  )

  const data = useMemo(() => {
    let bench = []
    let wfp = []
    let projectRotations = []

    if (jobOrdersWithJobSubmission.isSuccess && jobSubmissionsCandidates.isSuccess) {
      bench = getPerPanelData(BENCH_ID)
      wfp = getPerPanelData(WFP_ID)
      projectRotations = getPerPanelData(PROJECT_ROTATIONS_ID)
    }
    return {
      bench,
      wfp,
      projectRotations,
    }
  }, [getPerPanelData, jobOrdersWithJobSubmission.isSuccess, jobSubmissionsCandidates.isSuccess])

  const handleCloseModal = () => {
    setModalState(initialModalState)
  }

  const handleOpenModal = ({
    title,
    modalType,
    candidateId = null,
    jobOrderId = null,
    jobSubmissionId = null,
    identified,
  }) => {
    let newModalState = {}
    if (modalType === ADD_COMPANY) {
      newModalState = {
        ...initialModalState,
        addCompany: {
          isOpen: true,
          title,
          candidateId,
          identified,
        },
      }
    } else if (modalType === ADD) {
      newModalState = {
        ...initialModalState,
        add: {
          isOpen: true,
          title,
          jobOrderId,
        },
      }
    } else {
      newModalState = {
        ...initialModalState,
        delete: {
          isOpen: true,
          title,
          jobSubmissionId,
        },
      }
    }

    setModalState(newModalState)
  }


const wfpIDFront =  data?.wfp?.map((i) => i.id)
const wfpIDBack =  findWFP?.data?.data?.map((i) => i.id)

const handleUpdateQuery = () => {
  if (wfpIDBack?.length > 0 && wfpIDFront?.length > 0) {
    let wfpToAdd = wfpIDBack.filter(x => !wfpIDFront.includes(x));
      if ((wfpToAdd?.length > 0) ) {
        for (let i = 0; i < wfpToAdd?.length; i++) {
          addJobSubmission.mutate({ jobOrderId:WFP_ID, candidateId: wfpToAdd[i] });
        }
      }
  }
}
  return (
    <>
      <Main>
        <Bm
          color={theme.hotCandidateStatusColors.green}
          kanbanType="HOT_CANDIDATES"
          data={data.bench}
          title={BENCH_TITLE}
          onOpenModal={handleOpenModal}
          jobOrderId={BENCH_ID}
        />
        <Bm
          color={theme.hotCandidateStatusColors.blue}
          kanbanType="HOT_CANDIDATES"
          data={data.projectRotations}
          title={PROJECT_ROTATIONS_TITLE}
          onOpenModal={handleOpenModal}
          jobOrderId={PROJECT_ROTATIONS_ID}
        />
        <Bm
          color={theme.hotCandidateStatusColors.grey}
          kanbanType="HOT_CANDIDATES"
          data={data.wfp}
          title={WFP_TITLE}
          onOpenModal={handleOpenModal}
          jobOrderId={WFP_ID}
          updateData={true}
          handleUpdateQuery={handleUpdateQuery}
        />
      </Main>
      <AddCandidateModal
        isOpen={modalState.add.isOpen}
        title={modalState.add.title}
        onClose={handleCloseModal}
        jobOrderId={modalState.add.jobOrderId}
      />
      <DeleteCandidateModal
        isOpen={modalState.delete.isOpen}
        title={modalState.delete.title}
        onClose={handleCloseModal}
        jobSubmissionId={modalState.delete.jobSubmissionId}
      />
      <AddCompanyModal
        isOpen={modalState.addCompany.isOpen}
        title={modalState.addCompany.title}
        candidateId={modalState.addCompany.candidateId}
        identified={modalState.addCompany.identified}
        onClose={handleCloseModal}
      />
    </>
  )
}

HotCandidatesPage.propTypes = {
  updatedJobSubmission: PropTypes.shape({
    jobSubmissionId: PropTypes.string,
    status: PropTypes.string,
  }),
}

export default HotCandidatesPage
