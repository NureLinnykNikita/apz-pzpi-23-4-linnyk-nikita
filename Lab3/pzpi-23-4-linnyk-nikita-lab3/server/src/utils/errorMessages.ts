// Error messages for validation
export const lengthError = (
    field: string,
    type: "max" | "min",
    n: number
) => (
    type === "min" ? `${field} must be at least ${n} characters.`
                   : `${field} must be no longer than ${n} characters.`
)