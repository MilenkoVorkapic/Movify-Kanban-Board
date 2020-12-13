import React from 'react'
import { connect } from "react-redux";
import { TableContentTd, TableContentTbodyTr, TableContentTdTitle, TableContentTbodyTrNoLine, TableContentTdLabel, TableContentTdBoldClickable, TableContentTdLabelBold, TableContentTdBold } from "../../style/table_style"
import { pathOr } from 'ramda'
import { object, string } from "prop-types"
import { LABEL_HIRED, LABEL_INTERVIEW_DONE, LABEL_INTERVIEW_SCHEDULE, LABEL_CONTACTED_BY_INMAIL } from '../../utils/reporting'
import {
    BUSINESS_MANAGER,
    SOURCING_OFFICER
} from '../../auth/user.sagas'
import {
    LINKED_INMAIL,
    INTERVIEW_SCHEDULED,
    INTERVIEW_DONE
} from '../expandView/expandView.sagas'
import {
    FIRST_WEEK, SECOND_WEEK, FOURTH_WEEK, THIRD_WEEK
} from '../kpi/kpi.sagas'
import ReactTooltip from 'react-tooltip'
import ExpandViewDetailCandidates from './ExpandViewDetailCandidates'

const tableWeek = [FIRST_WEEK, SECOND_WEEK, THIRD_WEEK, FOURTH_WEEK]

const TalentAcquisition = ({ datas, occupation }) => {
    return (
        <>
            <TableContentTbodyTrNoLine>
                <TableContentTdTitle isBM={occupation.includes(BUSINESS_MANAGER)}>Recruitment</TableContentTdTitle>
            </TableContentTbodyTrNoLine>

            {
                Object.keys(datas).map((key, i) => {

                    if (datas[key].TITLE === LABEL_CONTACTED_BY_INMAIL && occupation.includes(SOURCING_OFFICER)) {
                        return (

                            <TableContentTbodyTr key={i}>
                                <TableContentTdLabelBold >{datas[key].TITLE}</TableContentTdLabelBold>
                                {
                                    tableWeek.map((week) => {
                                        if (datas[key][week] === 0) {
                                            return (<TableContentTdBold id={key + week}>0</TableContentTdBold>)
                                        } else {
                                            return (
                                                <TableContentTdBoldClickable key={week} data-for={i + '' + key + '' + week} data-event="click" data-tip>{datas[key][week]}
                                                    <ReactTooltip id={i + '' + key + '' + week} globalEventOff='click' place="right" clickable={true}>
                                                        <ExpandViewDetailCandidates week={week} title={LINKED_INMAIL} />
                                                    </ReactTooltip>
                                                </TableContentTdBoldClickable>
                                            )
                                        }
                                    }


                                    )
                                }

                            </TableContentTbodyTr>
                        )
                    } else if ((datas[key].TITLE === LABEL_INTERVIEW_DONE && !occupation.includes(SOURCING_OFFICER))) {
                        return (
                            <TableContentTbodyTr key={i}>
                                <TableContentTdLabelBold >{datas[key].TITLE}</TableContentTdLabelBold>
                                {
                                    tableWeek.map((week) => {
                                        if (datas[key][week] === 0) {
                                            return (<TableContentTdBold id={key + week}>0</TableContentTdBold>)
                                        } else {
                                            return (
                                                <TableContentTdBoldClickable key={week} data-for={i + '' + key + '' + week} data-event="click" data-tip>{datas[key][week]}
                                                    <ReactTooltip id={i + '' + key + '' + week} globalEventOff='click' place="right" clickable={true}>
                                                        <ExpandViewDetailCandidates week={week} title={INTERVIEW_DONE} />
                                                    </ReactTooltip>
                                                </TableContentTdBoldClickable>
                                            )
                                        }
                                    }
                                    )
                                }

                            </TableContentTbodyTr>
                        )
                    } else if ((datas[key].TITLE === LABEL_INTERVIEW_SCHEDULE && !occupation.includes(BUSINESS_MANAGER))) {
                        return (
                            <TableContentTbodyTr key={i}>
                                <TableContentTdLabelBold >{datas[key].TITLE}</TableContentTdLabelBold>
                                {
                                    tableWeek.map((week) => {
                                        if (datas[key][week] === 0) {
                                            return (<TableContentTdBold id={key + week}>0</TableContentTdBold>)
                                        } else {
                                            return (
                                                <TableContentTdBoldClickable key={week} data-for={i + '' + key + '' + week} data-event="click" data-tip>{datas[key][week]}
                                                    <ReactTooltip id={i + '' + key + '' + week} globalEventOff="click" place="right" clickable={true } >
                                                        <ExpandViewDetailCandidates week={week} title={INTERVIEW_SCHEDULED} />
                                                    </ReactTooltip>
                                                </TableContentTdBoldClickable>
                                            )
                                        }
                                    }
                                    )
                                    
                                }

                            </TableContentTbodyTr>
                        )
                    } else if (datas[key].TITLE === LABEL_HIRED) {
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

TalentAcquisition.propTypes = {
    datas: object,
    occupation: string
};

export default connect(
    state => ({
        datas: pathOr({}, ["kpi", "dataEmployee", "datasRecruitment"], state),
        occupation: pathOr("", ["employees", "employeeSelected", "occupation"], state)
    }),
    {}
)(TalentAcquisition);