export interface Company {
  id : number,
  name : string,
  persons : any
}

export function serializeCompany(company: Company | null) : { [key: string] : string } {
  return {
    name : company ? company.name : ""
  }
}
