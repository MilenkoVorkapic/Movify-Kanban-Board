import React, { useEffect } from "react";
import styled from 'styled-components'
import SelectEmployees from "./SelectEmployees"
import { getEmployees } from "../employees/employees.actions"
import { connect } from "react-redux";
import { setEmployeeSelected, getEmployeeAccessibleData } from '../employees/employees.actions'
import { setLoadingYTDConversionCVSent, setKpiLoading, setLoadingYTDTotal, setLoadingYTDAverage, setLoadingYTDConversion, setCvSentIsLoadingWeek, setLoadingYTDNewVacancy, setLoadingYTDConversionNewVacancy, setLoadingYTDCVSent } from '../kpi/kpi.actions'
import { array, bool, func, object, string, number } from "prop-types";
import { path, isEmpty } from "ramda";
import TableData from "./TableData";
import TablePercentage from './TablePercentage'
import Loader from 'react-loader-spinner'
import GaugeComponent from './GaugeComponent'
import { initializeEmployeeSelected } from '../../utils/employees'
import { getGaugeLimit, setCalculatingWeeklySpeed } from '../weeklySpeed/weeklySpeed.action'
import {
    REPORTING_OWNER
} from '../../auth/user.sagas'

const Container = styled.div({
    display: "flex",
    margin: "60px",
    justifyContent: "center"
})

const Reporting = ({ setCalculatingWeeklySpeed, getGaugeLimit, setLoadingYTDConversionCVSent, setLoadingYTDCVSent, getEmployees, employeeSelected, isLoadingKpi, setEmployeeSelected, userConnectedId, userConnectedOccupation, getEmployeeAccessibleData, employeeIdAccess, setKpiLoading, setLoadingYTDTotal, setLoadingYTDAverage, setLoadingYTDConversion, setCvSentIsLoadingWeek, setLoadingYTDConversionNewVacancy }) => {

    useEffect(() => {
        if (!userConnectedOccupation.includes(REPORTING_OWNER)) {
            let initializedEmployeeConnected = initializeEmployeeSelected(userConnectedId, userConnectedOccupation)

            setEmployeeSelected(initializedEmployeeConnected);

            if (!isEmpty(employeeIdAccess)) {
                getEmployeeAccessibleData(employeeIdAccess)
            }
        } else {
            getEmployees();
        }
    }, [])

    useEffect(() => {
        setKpiLoading(true)
        setCvSentIsLoadingWeek(true)
        setLoadingYTDTotal(true)
        setLoadingYTDAverage(true)
        setLoadingYTDConversion(true)
        setLoadingYTDNewVacancy(true)
        setLoadingYTDConversionNewVacancy(true)
        setLoadingYTDCVSent(true)
        setLoadingYTDConversionCVSent(true)
        setCalculatingWeeklySpeed(true)
        getGaugeLimit()
    }, [employeeSelected])

    return (
        <div>
            {
                (userConnectedOccupation.includes(REPORTING_OWNER) || !isEmpty(employeeIdAccess)) && <SelectEmployees />
            }

            <Container>
                {
                    (!isEmpty(employeeSelected) && isLoadingKpi) && (
                        <div>
                            <Loader
                                type="Rings"
                                color="#6BD7DA"
                                height={100}
                                width={100}
                            />
                        </div>
                    )
                }
                {
                    (!isEmpty(employeeSelected) && !isLoadingKpi) && (
                        <>
                            <GaugeComponent />
                            <TableData />
                            <TablePercentage />
                        </>
                    )
                }
            </Container>

        </div >
    )
}

Reporting.propTypes = {
    employeeSelected: object,
    isLoadingKpi: bool,
    userConnectedId: number,
    userConnectedOccupation: string,
    setKpiLoading: func,
    getEmployees: func,
    getEmployeeAccessibleData: func,
    employeeIdAccess: array,
    setEmployeeSelected: func,
    setLoadingYTDTotal: func,
    setLoadingYTDAverage: func,
    setLoadingYTDConversion: func,
    setCvSentIsLoadingWeek: func,
    setLoadingYTDConversionNewVacancy: func,
    setLoadingYTDCVSent: func,
    setLoadingYTDConversionCVSent: func,
    getGaugeLimit: func,
    setCalculatingWeeklySpeed: func
};

export default connect(
    state => ({
        employeeSelected: path(["employees", "employeeSelected"], state),
        isLoadingKpi: path(["kpi", "isLoadingKpi"], state),
        userConnectedOccupation: path(["user", "accessToReportingTab", "occupation"], state),
        userConnectedId: path(["user", "accessToReportingTab", "userId"], state),
        employeeIdAccess: path(["user", "accessToReportingTab", "employeeIdAccess"], state),
    }),
    { setCalculatingWeeklySpeed, getGaugeLimit, setLoadingYTDConversionCVSent, setLoadingYTDCVSent, getEmployees, setEmployeeSelected, setKpiLoading, getEmployeeAccessibleData, setLoadingYTDTotal, setLoadingYTDAverage, setLoadingYTDConversion, setCvSentIsLoadingWeek, setLoadingYTDConversionNewVacancy }
)(Reporting);