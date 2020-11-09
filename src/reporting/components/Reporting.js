import React, { useEffect } from "react";
import styled from 'styled-components'
import SelectEmployees from "./SelectEmployees"
import { getEmployees } from "../employees/employees.actions"
import { connect } from "react-redux";
import { setEmployeeSelected } from '../employees/employees.actions'
import { setKpiLoading, setCalculationYTD } from '../kpi/kpi.actions'
import { bool, func, object, string, number } from "prop-types";
import { path, isEmpty } from "ramda";
import TableData from "./TableData";
import TablePercentage from './TablePercentage'
import Loader from 'react-loader-spinner'
import GaugeComponent from './GaugeComponent'
import { initializeEmployeeSelected } from '../../utils/employees'
import {
    REPORTING_OWNER
} from '../../auth/user.sagas'

const Container = styled.div({
    display: "flex",
    margin: "60px",
    justifyContent: "center"
})

const Reporting = ({ getEmployees, employeeSelected, isLoadingKpi, setEmployeeSelected, setKpiLoading, setCalculationYTD, userConnectedId, userConnectedOccupation }) => {

    useEffect(() => {
        if (!userConnectedOccupation.includes(REPORTING_OWNER)) {
            let initializedEmployeeConnected = initializeEmployeeSelected(userConnectedId, userConnectedOccupation)
            setEmployeeSelected(initializedEmployeeConnected);
            setKpiLoading(true)
            setCalculationYTD(true)
        } else {
            getEmployees();
        }
    }, [])
    

    return (
        <div>
            {
                (userConnectedOccupation.includes(REPORTING_OWNER)) && <SelectEmployees />
            }

            <Container>
                {
                    ((!isEmpty(employeeSelected) && isLoadingKpi) || (isLoadingKpi)) && (
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
                    ((!userConnectedOccupation.includes(REPORTING_OWNER) && !isLoadingKpi) || (!isEmpty(employeeSelected) && !isLoadingKpi)) && (
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
    setEmployeeSelected: func,
    setKpiLoading: func,
    setCalculationYTD: func,
    getEmployees: func
};

export default connect(
    state => ({
        employeeSelected: path(["employees", "employeeSelected"], state),
        isLoadingKpi: path(["kpi", "isLoadingKpi"], state),
        userConnectedOccupation: path(["user", "accessToReportingTab", "occupation"], state),
        userConnectedId: path(["user", "accessToReportingTab", "userId"], state)
    }),
    { getEmployees, setEmployeeSelected, setKpiLoading, setCalculationYTD }
)(Reporting);