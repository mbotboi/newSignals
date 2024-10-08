import { CallData } from "../types";

export function calculateWeightedAverageCPW(
  callData: CallData | undefined
): number {
  if (!callData || !callData.calls || callData.calls.length === 0) {
    return 0;
  }

  const totalWeightedCPW = callData.calls.reduce((sum: number, call: any) => {
    return sum + (call.cpw || 0);
  }, 0);

  return (
    (totalWeightedCPW / callData.numberCalls) *
    Math.log(callData.numberCalls + 1)
  );
}
