export const MONTHLY_MEMBERSHIP_FEE = 3500;
export const PERSONAL_TRAINING_FEE = 15000;

export function calculateMonthlyFee(
  type: "NORMAL_MONTHLY" | "PERSONAL_TRAINING"
) {
  if (type === "PERSONAL_TRAINING") {
    return {
      monthlyFee: MONTHLY_MEMBERSHIP_FEE,
      personalTrainingFee: PERSONAL_TRAINING_FEE,
      totalMonthlyFee: MONTHLY_MEMBERSHIP_FEE + PERSONAL_TRAINING_FEE,
    };
  }

  return {
    monthlyFee: MONTHLY_MEMBERSHIP_FEE,
    personalTrainingFee: 0,
    totalMonthlyFee: MONTHLY_MEMBERSHIP_FEE,
  };
}