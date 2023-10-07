export type SpecialCost = {
    costDate: string
    entries: SpecialCostEntry[]
}

export type SpecialCostEntry = {
    amount: number
    description: string
}
