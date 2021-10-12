export const toPercent = (num: number ): string => {
    return num.toLocaleString('en-US', {style: 'percent', minimumFractionDigits:2} )
}