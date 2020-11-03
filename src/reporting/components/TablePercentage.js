import React from "react";
import { connect } from "react-redux";
import { Table, TableTheadTr, TableContentTh } from "../../style/table_style"
import { pathOr, path } from "ramda"
import { string, bool } from 'prop-types'
import { BUSINESS_MANAGER, SOURCING_OFFICER, TALENT_ACQUISITION } from './EmployeeData'
import TablePercentageTalentAcquisition from './TablePercentageTalentAcquisition'
import TablePercentageBusinessManager from './TablePercentageBusinessManager'
import Loader from 'react-loader-spinner'
import styled from 'styled-components'

const Loading = styled.div({
    paddingTop: "280px",
    paddingLeft: "140px"
    
})


const TablePercentage = ({ occupation, isCalculatingYTD }) => {

    return (
        <div>
            {
                (isCalculatingYTD) && (
                    <Loading>
                        <Loader
                            type="Rings"
                            color="#6BD7DA"
                            height={100}
                            width={100}
                        />
                    </Loading>
                )
            }
            {
                (!isCalculatingYTD) && (
                    <Table>
                        <thead>
                            <TableTheadTr>
                                <TableContentTh>Conversion %</TableContentTh>
                                <TableContentTh>Total YTD</TableContentTh>
                                <TableContentTh>Average</TableContentTh>
                            </TableTheadTr>
                        </thead>
                        <tbody>
                            {
                                occupation === BUSINESS_MANAGER && <TablePercentageBusinessManager />
                            }
                            {
                                (occupation === BUSINESS_MANAGER || occupation === SOURCING_OFFICER || occupation === TALENT_ACQUISITION) && <TablePercentageTalentAcquisition />
                            }
                        </tbody>
                    </Table>
                )
            }
        </div>
    )
}

TablePercentage.propTypes = {
    occupation: string,
    isCalculatingYTD: bool
};

export default connect(
    state => ({
        occupation: pathOr("", ["employees", "employeeSelected", "occupation"], state),
        isCalculatingYTD: path(["kpi", "isCalculatingYTD"], state)
    }),
    {}
)(TablePercentage);