let toInt = (int: number): number => {
    return parseInt(int.toString());
};

let sortObjectByKey = (obj) => {
    if (typeof obj !== "object" || obj === null)
        return obj;

    if (Array.isArray(obj))
        return obj.map((e) => sortObjectByKey(e)).sort();

    return Object.keys(obj).sort().reduce((sorted, k) => {
        sorted[k] = sortObjectByKey(obj[k]);
        return sorted;
    }, {});
};

export {toInt, sortObjectByKey}