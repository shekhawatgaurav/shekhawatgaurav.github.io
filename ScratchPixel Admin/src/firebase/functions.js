export function isFunctionsAvailable() {
  return false;
}

export function getFunctionsDisabledMessage() {
  return "Cloud Functions are disabled in this project. Firebase Blaze plan is required to deploy Cloud Functions.";
}

export async function callCloudFunction(functionName = "") {
  throw new Error(
    `${getFunctionsDisabledMessage()} Requested function: ${
      functionName || "unknown"
    }`
  );
}

export async function callCallableFunction(functionName = "", payload = {}) {
  console.warn("Cloud Function call skipped:", {
    functionName,
    payload,
    reason: getFunctionsDisabledMessage(),
  });

  throw new Error(getFunctionsDisabledMessage());
}