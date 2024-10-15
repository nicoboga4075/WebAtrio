export interface Job {
  id : number;
  position : string;
  startDate : string; // Format ISO 8601 for date
  endDate : string | null; // Format ISO 8601 for date
  companyId : number;
  personId : number;
}

export function serializeJob(job : Job | null) : { [key: string] : string | number | null} {
  return {
    position : job ? job.position : "",
    startDate: job ? job.startDate : "",
    endDate : job ? job.endDate : null,
    companyId : job ? job.companyId : 0,
    personId : job ? job.personId : 0
  }
}
