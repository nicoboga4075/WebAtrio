export interface Person {
  id : number;
  firstName : string;
  lastName : string;
  birthDate : string; // Format ISO 8601 for date
  fullName : string;
  age : number;
  jobs : any;
  latestJob : any;
}

export function serializePerson(person : Person | null) : { [key: string] : string } {
  return {
    firstName : person ? person.firstName : "",
    lastName : person ? person.lastName : "",
    birthDate : person ? person.birthDate : ""
  };
}
