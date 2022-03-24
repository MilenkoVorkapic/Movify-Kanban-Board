import React, { useState } from "react"
import { compose } from "redux"
import { connect } from "react-redux"
import { func, object } from "prop-types"
import { prop, propOr } from "ramda"
import styled from "styled-components"
import { Route, withRouter } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { DragDropContext } from "react-beautiful-dnd"
import { getColumnData, isFromSameBoard } from "./utils/kanban"
import AuthenticatedRoute from "./components/AuthenticatedRoute"
import Home from "./auth/Home"
import Login from "./auth/Login"
import Kanban from "./kanban/Kanban"
import Recruitment from "./recruitment/Recruitment"
import { updateJobSubmission as updateKanbanJobSubmission } from "./kanban/kanban.actions"
import { updateJobSubmission as updateRecruitmentJobSubmission } from "./recruitment/recruitment.actions"
import { addCandidate, addHotCandidate } from "./transition/transition.actions"
import Header from "./Header"
import Reporting from "./reporting/components/Reporting"
import HotCandidates from "./hotCandidates"
import { useUpdateJobSubmission } from "./hooks"
import Transition from "./transition/Transition"

const Container = styled.div({
  paddingLeft: 25,
  paddingRight: 25,
  paddingTop: 25,
  paddingBottom: 25,
})

const Routes = ({
  addCandidate,
  addHotCandidate,
  location,
  updateKanbanJobSubmission,
  updateRecruitmentJobSubmission,
}) => {
  const [duplicateModalData, setDuplicateModalData] = useState(undefined)
  const [addModalData, setAddModalData] = useState(undefined)
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [updateModalData, setUpdateModalData] = useState(undefined)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [updatedJobSubmission, setUpdatedJobSubmission] = useState()
  const updateJobSubmissionMutation = useUpdateJobSubmission()

  const board = propOr(" ", "pathname", location).substring(1)

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    if (["kanban", "recruitment"].includes(board)) {
      const jobSubmissionId = draggableId
      const src = getColumnData(result?.source?.droppableId)
      const dest = getColumnData(result?.destination?.droppableId)
      const srcStatus = prop("status", src)
      const destStatus = prop("status", dest)
      const jobOrderId = prop("jobOrderId", src)
      const destJobOrderId = prop("jobOrderId", dest)

      if (board === "kanban") {
        onDndKanban(result, jobSubmissionId, src, dest, srcStatus, destStatus, jobOrderId, destJobOrderId)
      } else if (board === "recruitment") {
        onDndRecruitment(result, jobSubmissionId, src, dest, srcStatus, destStatus, jobOrderId, destJobOrderId)
      }
    } else if (board === "hot-candidates") {
      const destinationDroppableId = destination.droppableId
      const isDestinationTransition = destinationDroppableId === "transition"

      const { 0: destinationStatus } = destinationDroppableId.split("@")

      const sourceDroppableId = source.droppableId
      const isSourceTransition = sourceDroppableId === "transition"

      const { 0: oldStatus, 1: candidateId } = sourceDroppableId.split("@")

      if (isSourceTransition) {
        return
      } else if (isDestinationTransition && oldStatus === "NO_STATUS") {
        addHotCandidate("hot-candidates", candidateId)
      } else if (!["NO_STATUS", "Identified", "transition"].includes(destinationStatus)) {
        if (oldStatus !== destinationStatus && draggableId) {
          const updatedJobSubmissionData = { jobSubmissionId: draggableId, status: destinationStatus }
          setUpdatedJobSubmission(updatedJobSubmissionData)
          updateJobSubmissionMutation.mutate(updatedJobSubmissionData)
        }
      }
    }
  }

  const onDndKanban = (result, jobSubmissionId, src, dest, srcStatus, destStatus, jobOrderId, destJobOrderId) => {
    if (result?.destination?.droppableId === "transition") {
      return
    } else if (result?.source?.droppableId === "transition") {
      setIsAddModalOpen(true)
      setAddModalData({
        jobOrderId: destJobOrderId,
        candidateId: jobSubmissionId,
        status: destStatus,
      })
    } else if (isFromSameBoard(src, dest) && src.status !== dest.status) {
      updateKanbanJobSubmission(jobOrderId, srcStatus, jobSubmissionId, destStatus)
    } else if (!isFromSameBoard(src, dest)) {
      setIsDuplicateModalOpen(true)
      setDuplicateModalData({
        jobOrderId: destJobOrderId,
        jobSubmissionId,
        status: destStatus,
      })
    }
  }

  const onCloseKanbanModals = () => {
    setIsDuplicateModalOpen(false)
    setIsAddModalOpen(false)
  }

  const onCloseRecruitmentModal = () => {
    setIsUpdateModalOpen(false)
  }

  const onDndRecruitment = (result, jobSubmissionId, src, dest, srcStatus, destStatus, jobOrderId, destJobOrderId) => {
    if (result?.source?.droppableId === "transition") {
      return
    } else if (result?.destination?.droppableId === "transition") {
      addCandidate("recruitment", jobSubmissionId)
    } else if (isFromSameBoard(src, dest) && src.status !== dest.status) {
      updateRecruitmentJobSubmission(jobOrderId, srcStatus, jobOrderId, jobSubmissionId, destStatus)
    } else if (!isFromSameBoard(src, dest)) {
      setIsUpdateModalOpen(true)
      setUpdateModalData({
        jobOrderId: destJobOrderId,
        jobSubmissionId,
        status: destStatus,
      })
    }
  }

  return (
  <>
    <Header board={board} />
    <DragDropContext onDragEnd={handleDragEnd}>
      <Transition board={board} />
      <Container>
        <Route exact path="/" component={Home} />
        <Route exact path="/login" component={Login} />
        <AuthenticatedRoute
          exact
          path="/kanban"
          component={Kanban}
          duplicateModalData={duplicateModalData}
          addModalData={addModalData}
          isDuplicateModalOpen={isDuplicateModalOpen}
          isAddModalOpen={isAddModalOpen}
          onCloseModals={onCloseKanbanModals}
        />
        <AuthenticatedRoute
          exact
          path="/recruitment"
          component={Recruitment}
          updateModalData={updateModalData}
          isUpdateModalOpen={isUpdateModalOpen}
          onCloseModal={onCloseRecruitmentModal}
        />

        <AuthenticatedRoute
          exact
          path="/hot-candidates"
          component={HotCandidates}
          updatedJobSubmission={updatedJobSubmission}
        />

        <AuthenticatedRoute exact path="/reporting" component={Reporting} />

        <ToastContainer />
      </Container>
    </DragDropContext>
    </>
    )
}

Routes.propTypes = {
  addCandidate: func,
  addHotCandidate: func,
  location: object,
  updateKanbanJobSubmission: func,
  updateRecruitmentJobSubmission: func,
}

export default compose(
  withRouter,
  connect(null, { addCandidate, addHotCandidate, updateKanbanJobSubmission, updateRecruitmentJobSubmission })
)(Routes)
