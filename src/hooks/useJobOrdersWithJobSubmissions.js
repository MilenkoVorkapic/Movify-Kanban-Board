import { useQuery } from "react-query"
import { get } from "../utils/api"

export const IDENTIFIED_COMPANIES_FIELD_KEY = "customText12"

const useJobOrdersWithJobSubmissions = () => {
  return useQuery(["find-job-orders-with-job-submissions"], () =>
    get("query/JobOrder", {
      fields: `id, title, submissions[10](id, candidate(id, firstName, lastName, name, dateAvailable, occupation, category, owner, ${IDENTIFIED_COMPANIES_FIELD_KEY}))`,
      where: "id IN (380, 1180, 1181)",
    })
  )
}

export default useJobOrdersWithJobSubmissions
