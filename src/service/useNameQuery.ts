import { useQuery } from "react-query";

const buildUseNameQuery = ({requestName}: { requestName: () => Promise<string> }) =>
function useNameQuery() {
  return useQuery("name", requestName)
}

export const useNameQuery = Object.assign(buildUseNameQuery({
  requestName: async () => "John Doe"
}), {
  fakeGen: buildUseNameQuery
})
