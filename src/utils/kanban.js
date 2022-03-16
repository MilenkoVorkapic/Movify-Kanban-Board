import React from "react";
import {
  is,
  isEmpty,
  isNil,
  flatten,
  path,
  pathOr,
  prop,
  propOr,
  union
} from "ramda";
import { isOverDiff, DIFF_5_DAYS, DIFF_10_DAYS } from "./date";
import { Hourglass, HourglassFull } from "../components/svgs";

export const DECISION_HIPO = "Hipo";
export const DECISION_WFP = "WFP";
export const DECISION_NO_GO = "NO GO";

export const STATUS_ITV1 = "ITV1";
export const STATUS_ITV2 = "ITV2";
export const STATUS_TO_SEND = "To Send";
export const STATUS_WF_RESPONSE = "WF Response";
export const STATUS_OFFER = "Offer";
export const STATUS_INTAKE = "Intake";
export const STATUS_WF_FEEDBACK = "WFF";
export const STATUS_WF_FEEDBACK_2 = "WF Feedback";
export const STATUS_NO_GO = "NO GO";
export const STATUS_IDENTIFIED = "Identified"

export const HOT_CANDIDATE_STATUSES = [
  STATUS_IDENTIFIED,
  STATUS_TO_SEND,
  STATUS_WF_RESPONSE,
  STATUS_INTAKE,
  STATUS_WF_FEEDBACK_2,
  STATUS_NO_GO
];

export const AVAILABLE_STATUSES = [
  STATUS_ITV1,
  STATUS_ITV2,
  STATUS_TO_SEND,
  STATUS_WF_RESPONSE,
  STATUS_INTAKE,
  STATUS_WF_FEEDBACK,
  STATUS_NO_GO
];

export const RECRUITMENT_STATUSES = [
  STATUS_ITV1,
  STATUS_ITV2,
  STATUS_OFFER,
  STATUS_WF_FEEDBACK,
  STATUS_NO_GO
];

export const getFilterStatusRequest = statuses =>
  statuses.map(status => `status:"${status}"`).join(" OR ");

export const createColumnId = (bmId, clientCorporationId, jobOrderId, status) =>
  `${bmId}.${clientCorporationId}.${jobOrderId}.${status}`;

export const getColumnData = droppableId => {
  const splits = droppableId.split(".");
  return {
    bmId: prop("0", splits),
    clientCorporationId: prop("1", splits),
    jobOrderId: prop("2", splits),
    status: prop("3", splits)
  };
};

export const isFromSameBoard = (src, dest) =>
  prop("bmId", src) === prop("bmId", dest) &&
  prop("clientCorporationId", src) === prop("clientCorporationId", dest) &&
  prop("jobOrderId", src) === prop("jobOrderId", dest);

export const getCandidateUpdatedComponent = dateLastModified => {
  if (!dateLastModified) return undefined;
  if (isOverDiff(dateLastModified, DIFF_10_DAYS)) return <HourglassFull size={14} style={{ padding: 4 }} />;
  if (isOverDiff(dateLastModified, DIFF_5_DAYS)) return <Hourglass size={14} style={{ padding: 4 }} />;
  return undefined;
};

export const formatBmName = ({ firstName, lastName = "" }) => {
  const secondLastName = lastName.split(" ");
  return `${propOr("", "0", firstName)}${propOr("", "0", lastName)}${pathOr(
    propOr("", "1", lastName),
    ["1", "0"],
    secondLastName
  )}`.toUpperCase();
};

export const getCandidateName = candidate =>
  `${propOr("", "firstName", candidate)} ${propOr("", "lastName", candidate)}`;

export const getCandidateNameQuery = query => {
  if (isNil(query) || isEmpty(query)) return undefined;
  const nameParts = query.split(" ").filter(part => !isEmpty(part));
  const queryParts = flatten(nameParts.map(part => createItemFilter(part)));
  const namePart = `name:${query}*`;
  const queries =
    prop("length", nameParts) > 1 ? queryParts.concat(namePart) : queryParts;
  return queries.join(" OR ");
};

export const createItemFilter = item => [
  `name:${item}*`,
  `firstName:${item}*`,
  `lastName:${item}*`
];

export const unionArrays = (l, r) =>
  is(Array, l) && is(Array, r) ? union(l, r) : r;

export const getColumnWidth = numberColumns => `${100 / numberColumns}%`;

export const getDecisionFromClient = (clientName = "") => {
  if (clientName.toLowerCase().includes("hipo")) return DECISION_HIPO;
  if (clientName.toLowerCase().includes("wfp")) return DECISION_WFP;
  return null;
};

export const isFreelance = (candidate = {}) => {
  const employmentPreference = path(["employmentPreference", 0], candidate);
  return employmentPreference === "Freelance";
}
