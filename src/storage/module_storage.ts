






const modules = {} as Indexable<string>

function get(key : string) {
    return modules[key]
}

function set(key : string, graphCode : string) {
    modules[key] = graphCode
}

function list() {
    return Object.keys(modules)
}

export const ModuleStorage = { set, get, list }