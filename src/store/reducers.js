import { combineReducers } from "redux";
import { reducer as form } from "redux-form";
import auth from "../auth/auth.reducer";
import kanban from "../kanban/kanban.reducer";
import departmentFilter from "../kanban/departmentFilter/departmentFilter.reducer";

export default combineReducers({ form, auth, kanban, departmentFilter });
