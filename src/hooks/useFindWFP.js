import { useQuery } from "react-query"
import { get } from "../utils/api"

const useFindWFP = () => {
  return useQuery(["find-candidate"],() =>
    get( "search/Candidate", {
      query: "middleName:WFP%2B%2B",
      fields: `id`,
      // the "middleName" field corresponds to the "decision" field in Bullhorn
  })  )
}

export default useFindWFP
