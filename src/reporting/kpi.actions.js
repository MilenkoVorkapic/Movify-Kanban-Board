export const KPI_DATA_EMPLOYEE_ACTION = "KPI_DATA_EMPLOYEE_ACTION"
export const KPI_SET_DATA_EMPLOYEE_ACTION = "KPI_SET_DATA_EMPLOYEE_ACTION"
export const KPI_RESET_DATA = "KPI_RESET_DATA"

export const getKpiDataEmployee = (idEmployeeSelected, dateStart, dateEnd) => ({ type: KPI_DATA_EMPLOYEE_ACTION, payload: { id: idEmployeeSelected, dateStart: dateStart, dateEnd: dateEnd } });
export const setKpiDataEmployee = (date, noteWeekEmployee) => ({ type: KPI_SET_DATA_EMPLOYEE_ACTION, payload: { date: date, notesEmployee: noteWeekEmployee } })
export const kpiResetData = () => ({ type: KPI_RESET_DATA, payload: [] })