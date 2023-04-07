export function getTagList(showHome) {
    if (showHome) {
        return [
            { value: 'Home', label: '<Home>' },
            { value: 'Food', label: 'Food' },
            { value: 'Entertainment', label: 'Entertainment' },
        ]
    }
    else {
        return [
            { value: 'Food', label: 'Food' },
            { value: 'Entertainment', label: 'Entertainment' },
        ]
    }
}