import { useQuery } from "react-query"
import { get } from "../utils/api"

const useJobSubmissions = (candidateIds) => {
  return useQuery(
    ["find-job-submissions-candidates", candidateIds.join()],
    () =>
      get(`query/JobSubmission`, {
        // Might not need everything here
        fields: "id, jobOrder(id, clientCorporation, owner), status, candidate(id)",
        where: `candidate.id IN (${candidateIds?.join()}) AND status IN ('WF Response', 'To Send', 'Intake', 'WF Feedback', 'NO GO') AND jobOrder.isOpen=true`,
        count: 50,
      }),
    {
      enabled: !!candidateIds?.length,
    }
  )
}

export default useJobSubmissions
