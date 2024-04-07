import { useContext } from "react"
import { AppContext } from "../../App"

export const useGlobalState = () => {
  return useContext(AppContext);
}