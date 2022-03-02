import React from "react";
import { connect } from "react-redux";
import { TableContentTd, TableContentTdTitle, TableContentTbodyTr, TableContentTdBold, TableContentTbodyTrNoLine, TableContentTdLabel, TableContentTdLabelBold } from "../../style/table_style"
import { path, pathOr } from 'ramda'
import { object, bool } from "prop-types"
import Loader from 'react-loader-spinner'
import {
    LABEL_CV_SENT,
    LABEL_MEETING_DONE,
    LABEL_INTAKE,
    LABEL_PROSPECTION_MEETING_SCHEDULE,
    LABEL_INTERVIEW_SCHEDULED,
    LABEL_NEW_VACANCY,
    LABEL_PROJECT_START,
} from "../../utils/reporting";
import {
    INTAKES,
    PROSPECTION_MEETING_DONE,
    PROSPECTION_MEETING_SCHEDULED,
    INTERVIEW_SCHEDULED,
    NEW_VACANCY,
    CV_SENT,
} from '../expandView/expandView.sagas'
import TableCellWithTooltip, { BOLD, REGULAR } from './TableCellWithTooltip'
import {
    FIRST_WEEK, SECOND_WEEK, FOURTH_WEEK, THIRD_WEEK
} from '../kpi/kpi.sagas'

const tableWeek = [FIRST_WEEK, SECOND_WEEK, THIRD_WEEK, FOURTH_WEEK]

const BusinessManager = ({ datas, isCvSentWeekLoading }) => {
    return (
        <>
            <TableContentTbodyTrNoLine>
                <TableContentTdTitle>Business Development</TableContentTdTitle>
            </TableContentTbodyTrNoLine>
            {
                Object.keys(datas).map((key, i) => {
                    if (!datas[key].TITLE) return null
                    if (datas[key].TITLE === LABEL_CV_SENT) {
                        if (isCvSentWeekLoading) {
                            return (
                                <TableContentTbodyTr key={i}>
                                    <TableContentTdLabelBold>{datas[key].TITLE}</TableContentTdLabelBold>
                                    <TableContentTd><Loader type="ThreeDots" color="#00BFFF" height={15} width={20} /></TableContentTd>
                                    <TableContentTd><Loader type="ThreeDots" color="#00BFFF" height={15} width={20} /></TableContentTd>
                                    <TableContentTd><Loader type="ThreeDots" color="#00BFFF" height={15} width={20} /></TableContentTd>
                                    <TableContentTd><Loader type="ThreeDots" color="#00BFFF" height={15} width={20} /></TableContentTd>
                                </TableContentTbodyTr>
                            )
                        } else {
                            return (
                                <TableContentTbodyTr key={i}>
                                    <TableContentTdLabelBold>{datas[key].TITLE}</TableContentTdLabelBold>
                                    {
                                        tableWeek.map((week) => {
                                            if (datas[key][week] === 0) {
                                                return (<TableContentTdBold key={week}>0</TableContentTdBold>)
                                            } else {
                                                return (
                                                    <TableCellWithTooltip fontWeight={BOLD} key={week} week={week} title={CV_SENT} text={datas[key][week]} />
                                                )
                                            }
                                        }
                                        )
                                    }
                                </TableContentTbodyTr>
                            )
                        }
                    } else if (datas[key].TITLE === LABEL_INTAKE) {
                        return (
                            <TableContentTbodyTr key={i}>
                                <TableContentTdLabelBold >{datas[key].TITLE}</TableContentTdLabelBold>
                                {
                                    tableWeek.map((week) => {
                                        if (datas[key][week] === 0) {
                                            return (<TableContentTdBold key={week}>0</TableContentTdBold>)
                                        } else {
                                            return (
                                                <TableCellWithTooltip key={week} week={week} title={INTAKES} text={datas[key][week]} />
                                            )
                                        }
                                    }
                                    )
                                }

                            </TableContentTbodyTr>
                        )
                    } else if (datas[key].TITLE === LABEL_MEETING_DONE) {
                        return (
                            <TableContentTbodyTr key={i}>
                                <TableContentTdLabelBold >{datas[key].TITLE}</TableContentTdLabelBold>
                                {
                                    tableWeek.map((week) => {
                                        if (datas[key][week] === 0) {
                                            return (<TableContentTdBold key={week}>0</TableContentTdBold>)
                                        } else {
                                            return (
                                                <TableCellWithTooltip key={week} week={week} title={PROSPECTION_MEETING_DONE} text={datas[key][week]} />
                                            )
                                        }
                                    }
                                    )
                                }

                            </TableContentTbodyTr>
                        )
                    } else if (datas[key].TITLE === LABEL_PROSPECTION_MEETING_SCHEDULE) {
                        return (
                            <TableContentTbodyTr key={i}>
                                <TableContentTdLabel>{datas[key].TITLE}</TableContentTdLabel>
                                {
                                    tableWeek.map((week) => {
                                        if (datas[key][week] === 0) {
                                            return (<TableContentTd key={week}>0</TableContentTd>)
                                        } else {
                                            return (
                                                <TableCellWithTooltip fontWeight={REGULAR} key={week} week={week} title={PROSPECTION_MEETING_SCHEDULED} text={datas[key][week]} />
                                            )
                                        }
                                    }
                                    )
                                }

                            </TableContentTbodyTr>
                        )
                    } else if (datas[key].TITLE === LABEL_INTERVIEW_SCHEDULED) {
                        return (
                            <TableContentTbodyTr key={i}>
                                <TableContentTdLabelBold>{datas[key].TITLE}</TableContentTdLabelBold>
                                {
                                    tableWeek.map((week) => {
                                        if (datas[key][week] === 0) {
                                            return (<TableContentTdBold key={week}>0</TableContentTdBold>)
                                        } else {
                                            return (
                                                <TableCellWithTooltip key={week} week={week} title={INTERVIEW_SCHEDULED} text={datas[key][week]} />
                                            )
                                        }
                                    }
                                    )
                                }

                            </TableContentTbodyTr>
                        )
                    } else if (datas[key].TITLE === LABEL_NEW_VACANCY) {
                        return (
                            <TableContentTbodyTr key={i}>
                                <TableContentTdLabel>{datas[key].TITLE}</TableContentTdLabel>
                                {
                                    tableWeek.map((week) => {
                                        if (datas[key][week] === 0) {
                                            return (<TableContentTd key={week}>0</TableContentTd>)
                                        } else {
                                            return (
                                                <TableCellWithTooltip fontWeight={REGULAR} key={week} week={week} title={NEW_VACANCY} text={datas[key][week]} />
                                            )
                                        }
                                    }
                                    )
                                }

                            </TableContentTbodyTr>
                        )
                    } else if (datas[key].TITLE === LABEL_PROJECT_START) {
                        return (
                            <tr key={i}>
                                <TableContentTdLabel>{datas[key].TITLE}</TableContentTdLabel>
                                <TableContentTd>{datas[key].FIRST_WEEK}</TableContentTd>
                                <TableContentTd>{datas[key].SECOND_WEEK}</TableContentTd>
                                <TableContentTd>{datas[key].THIRD_WEEK}</TableContentTd>
                                <TableContentTd>{datas[key].FOURTH_WEEK}</TableContentTd>
                            </tr>
                        )
                    } else {
                        return (
                            <TableContentTbodyTr key={i}>
                                <TableContentTdLabel>{datas[key].TITLE}</TableContentTdLabel>
                                <TableContentTd>{datas[key].FIRST_WEEK}</TableContentTd>
                                <TableContentTd>{datas[key].SECOND_WEEK}</TableContentTd>
                                <TableContentTd>{datas[key].THIRD_WEEK}</TableContentTd>
                                <TableContentTd>{datas[key].FOURTH_WEEK}</TableContentTd>
                            </TableContentTbodyTr>
                        )
                    }
                })
            }
        </>
    )
}

BusinessManager.propTypes = {
    datas: object,
    isCvSentWeekLoading: bool
};

export default connect(
    state => ({
        datas: pathOr({}, ["kpi", "dataEmployee", "datasBusinessManager"], state),
        isCvSentWeekLoading: path(["kpi", "isCvSentWeekLoading"], state)
    }),
    {}
)(BusinessManager);
