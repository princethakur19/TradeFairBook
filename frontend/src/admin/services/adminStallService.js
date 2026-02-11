export const generateStallArray = (config) => {
    const { topCount, leftCount, rightCount, domeName } = config;
    const stalls = [];
    
    // Top Row
    if (leftCount > 0) stalls.push({ id: 'L1', side: 'LEFT', price: 5000, status: 'AVAILABLE', dome: domeName });
    for (let i = 1; i <= topCount; i++) {
        stalls.push({ id: `T${i}`, side: 'TOP', price: 7000, status: 'AVAILABLE', dome: domeName });
    }
    if (rightCount > 0) stalls.push({ id: 'R1', side: 'RIGHT', price: 5000, status: 'AVAILABLE', dome: domeName });

    // Middle Rows
    const maxRows = Math.max(leftCount, rightCount);
    for (let r = 2; r <= maxRows; r++) {
        if (r <= leftCount) stalls.push({ id: `L${r}`, side: 'LEFT', price: 5000, status: 'AVAILABLE', dome: domeName });
        if (r <= rightCount) stalls.push({ id: `R${r}`, side: 'RIGHT', price: 5000, status: 'AVAILABLE', dome: domeName });
    }
    return stalls;
};