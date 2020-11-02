import React from "react";
import Select from 'react-select'
import { setEmployeeSelected } from "../employees/employees.actions"
import { setKpiLoading, setCalculationYTD } from '../kpi/kpi.actions'
import { connect } from "react-redux";
import { pathOr } from "ramda";
import { array } from "prop-types";
import styled from "styled-components"
import { BUSINESS_MANAGER, SOURCING_OFFICER } from "./EmployeeData"

const Container = styled.div({
    width: "30%",
    margin: "0 auto",
    position: "relative",
    zIndex: "1"
})

const SelectCustomized = styled(Select)`
position: relative; z-index: 1000;
`


const SelectEmployees = ({ employees, setEmployeeSelected, setKpiLoading, setCalculationYTD }) => {

    const options = getValuesFromEmployees(employees)

    const onChangeInput = (employeeSelected) => {
        for (let i = 0; i < employees.length; i++) {
            if (parseInt(employeeSelected.value) === employees[i].id) {
                setEmployeeSelected(employees[i]);
                setKpiLoading(true)
                setCalculationYTD(true)
                break;
            }
        }
    }

    return (
        <>
            <Container>
                <SelectCustomized
                    options={options}
                    onChange={onChangeInput}
                />
            </Container>
        </>

    )
}

function getValuesFromEmployees(employees) {
    return employees.map((employee) => {
        let occupationLabel = "";
        switch (employee.occupation) {
            case BUSINESS_MANAGER:
                occupationLabel = "BM";
                break;
            case SOURCING_OFFICER:
                occupationLabel = "TA";
                break;
            default:
                occupationLabel = "";
                break;
        }
        return ({ value: `${employee.id}`, label: occupationLabel + " - " + employee.firstName + " " + employee.lastName })
    })
}

SelectEmployees.propTypes = {
    employees: array
};

export default connect(
    state => ({
        employees: pathOr([], ["employees", "employeesToSet"], state),
    }),
    { setEmployeeSelected, setKpiLoading, setCalculationYTD }
)(SelectEmployees);