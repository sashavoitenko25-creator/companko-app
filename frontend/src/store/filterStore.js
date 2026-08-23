const STORAGE_KEY = 'app_filters_v1';


const defaultFilters = {
    activities: [],          // ['beer','coffee','walk','chat']
    ageFrom: null,           // number | null
    ageTo: null,             // number | null
    relationshipStatuses: [], // ['single','relationship','married','not_specified']
    radiusMeters: null       // number | null  (null = без лимита)
};


let filters = loadFilters();


function loadFilters(){

    try{

        const raw =
            localStorage.getItem(
                STORAGE_KEY
            );


        if(!raw)
            return {
                ...defaultFilters
            };


        const parsed =
            JSON.parse(
                raw
            );


        return {
            ...defaultFilters,
            ...parsed
        };

    }

    catch(error){

        return {
            ...defaultFilters
        };

    }

}


function saveFilters(){

    try{

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                filters
            )
        );

    }

    catch(error){}

}


export function getFilters(){

    return {
        ...filters,
        activities: [
            ...(filters.activities || [])
        ],
        relationshipStatuses: [
            ...(filters.relationshipStatuses || [])
        ]
    };

}


export function setFilters(next){

    filters = {
        ...defaultFilters,
        ...next,
        activities: [
            ...(next.activities || [])
        ],
        relationshipStatuses: [
            ...(next.relationshipStatuses || [])
        ]
    };


    saveFilters();


    window.dispatchEvent(
        new CustomEvent(
            'filters:changed',
            {
                detail: getFilters()
            }
        )
    );


    window.dispatchEvent(
        new Event(
            'live:refresh'
        )
    );

}


export function resetFilters(){

    setFilters({
        ...defaultFilters
    });

}


export function hasActiveFilters(){

    const f =
        getFilters();


    return (
        (f.activities && f.activities.length > 0) ||
        f.ageFrom != null ||
        f.ageTo != null ||
        (f.relationshipStatuses && f.relationshipStatuses.length > 0) ||
        f.radiusMeters != null
    );

}