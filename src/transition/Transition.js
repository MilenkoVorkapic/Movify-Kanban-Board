import React from "react"
import { prop, path } from "ramda"
import styled, { css } from "styled-components"
import { string, bool } from "prop-types"
import { Draggable, Droppable } from "react-beautiful-dnd"
import CandidateCard from "./CandidateCard"
import { useSelector } from "react-redux"
import { useFindCandidates } from "../hooks"
import { connect } from "react-redux"
import { removeHotCandidate } from "./transition.actions";
import { func } from "prop-types"

const getBackgroundColor = (isNoGo, snapshot, theme) => {
  if (snapshot.isDraggingOver) return theme.colors.transparentRed
  if (snapshot.draggingFromThisWith) return theme.colors.transparentGrey
  return theme.colors.lightGrey
}

const Container = styled.div(({ theme }) => ({
  padding: 8,
  marginBottom: 16,
  backgroundColor: theme.colors.lightGrey,
  borderRadius: theme.dimensions.borderRadius,
}))

const Content = styled.div(({ isNoGo, snapshot, theme }) => ({
  padding: 8,
  backgroundColor: getBackgroundColor(isNoGo, snapshot, theme),
  borderRadius: theme.dimensions.borderRadius,
}))

const Title = styled.div(({ theme }) => ({
  display: "inline-block",
  fontFamily: theme.fonts.fontFamily,
  fontSize: theme.textDimensions.medium,
  fontWeight: 600,
  paddingLeft: 12,
  paddingRight: 12,
  paddingTop: 8,
  textOverflow: "ellipsis",
  overflow: "hidden",
}))

export const HotCandidate = styled.p`
  background-color: #d3d3d340;
  border-radius: 6px;
  margin: 0;
  text-overflow: ellipsis;
  overflow: hidden;
  text-align: center;
  padding: 0.6rem;
  width: max-content;
  height: max-content;
  font-size: 0.875rem;
  line-height: 1.3;
  min-width: 8rem;
  position: relative;
`

const RemoveHotCandidate = styled.button`
  ${({ theme: { colors } }) => css`
    width: 10px;
    height: 10px;
    position: absolute;
    padding: 0;
    border: none;
    background: none;
    right: 0.3rem;
    bottom: 0.3rem;
    &:hover {
      cursor: pointer;
    }
    &::before,
    &::after {
      content: '';
      position: absolute;
      height: 10px;
      width: 2px;
      background-color: ${colors.darkGrey};
      top: 0;
    }
    &::before {
      transform: rotate(45deg);
    }
    &::after {
      transform: rotate(-45deg);
    }
  `}
`

const Transition = ({ board, removeHotCandidate, authenticated }) => {
  const { candidates, hotCandidateIds } = useSelector(({ transition }) => ({
    candidates: transition?.candidates ?? [],
    hotCandidateIds: transition?.hotCandidates ?? [],
  }))

  let hotCandidates = useFindCandidates(hotCandidateIds?.map((id) => ({ id })))

  const doNotRender =
    board === "reporting" || (board === "kanban" && !candidates?.length > 0 && !hotCandidates?.length > 0)

  if (doNotRender) return null

  const queriesFailed = hotCandidates?.some((hotCandidate) => !hotCandidate.isSuccess)

  hotCandidates = hotCandidates?.map((hotCandidate) => hotCandidate?.data?.data) ?? []
  if (!authenticated) return null;

  return (
    <Container>
      <Title>Transition board</Title>
      <Droppable droppableId="transition" direction="horizontal">
        {(provided, snapshot) => (
          <Content snapshot={snapshot}>
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ minHeight: 65, height: "100%", display: "flex" }}
            >
              {hotCandidates?.length > 0 && !queriesFailed
                ? hotCandidates?.map(({ id, firstName, lastName }, index) => (
                    <Draggable draggableId={id} index={index} key={id}>
                      {(provided) => (
                        <HotCandidate
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {`${firstName} ${lastName}`}
                          <RemoveHotCandidate onClick={() => removeHotCandidate(id)} />
                        </HotCandidate>
                      )}
                    </Draggable>
                  ))
                : candidates?.length > 0
                ? candidates.map((candidate, index) => (
                    <CandidateCard index={index} key={`${index}.${prop("id", candidate)}`} candidate={candidate} />
                  ))
                : null}
              {provided.placeholder}
            </div>
          </Content>
        )}
      </Droppable>
    </Container>
  )
}

Transition.propTypes = {
  board: string,
  removeHotCandidate: func,
  authenticated: bool,
}

export default connect((state) => ({
  authenticated: path(["auth", "authenticated"], state),
}), { removeHotCandidate })(Transition)
